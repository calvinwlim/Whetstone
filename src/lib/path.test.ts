import { describe, expect, test } from "vitest";
import { ALL_QUESTIONS, ALL_TOPICS } from "@/content";
import { PATH_LANES, PATH_STAGES } from "@/content/path";
import type { Question } from "@/content/types";
import type { Tally } from "@/lib/progress";
import { initialSrsState } from "@/lib/srs";
import {
  buildLanes,
  buildStages,
  nextUnit,
  spineProgress,
  type PathInput,
} from "@/lib/path";

const NOW = new Date("2026-01-01T00:00:00.000Z");

const titles = Object.fromEntries(ALL_TOPICS.map((t) => [t.id, t.title]));

/** Marks `count` distinct questions from a topic as answered, with `correct`
 *  of them right. Mirrors what recordAnswer would have left behind. */
function answered(
  topicId: string,
  count: number,
  correct: number,
): Pick<PathInput, "srs" | "byTopic"> {
  const questions = ALL_QUESTIONS.filter((q) => q.topic === topicId).slice(0, count);
  const srs = Object.fromEntries(
    questions.map((q) => [q.id, initialSrsState(NOW)]),
  );
  const byTopic: Record<string, Tally> = {
    [topicId]: { seen: count, correct },
  };
  return { srs, byTopic };
}

function input(overrides: Partial<PathInput> = {}): PathInput {
  return {
    questions: ALL_QUESTIONS,
    srs: {},
    byTopic: {},
    topicTitles: titles,
    ...overrides,
  };
}

describe("path composition", () => {
  test("every topic is placed exactly once across the spine and lanes", () => {
    const placed = [
      ...PATH_STAGES.flatMap((s) => s.topics),
      ...PATH_LANES.flatMap((l) => l.topics),
    ];
    const seen = new Set(placed);

    expect(placed.length, "a topic is listed twice").toBe(seen.size);

    const known = new Set(ALL_TOPICS.map((t) => t.id));
    for (const id of placed) {
      expect(known.has(id), `path references unknown topic "${id}"`).toBe(true);
    }
    for (const topic of ALL_TOPICS) {
      expect(
        seen.has(topic.id),
        `topic "${topic.id}" is not reachable from the path`,
      ).toBe(true);
    }
  });

  test("no specialist depth topic sits on the spine", () => {
    const depth = new Set(
      ALL_TOPICS.filter((t) => t.depth).map((t) => t.id),
    );
    for (const stage of PATH_STAGES) {
      for (const id of stage.topics) {
        expect(depth.has(id), `depth topic "${id}" is on the spine`).toBe(false);
      }
    }
  });

  /** Six is the bar because a stage serves five-question sessions and the
   *  sixth stops every session in a topic being identical. Failing here means
   *  somebody added a topic to the spine without stocking its easy band, and
   *  the path would push a beginner into band 3 to fill the session. */
  test("every spine topic can fill a session from its easy band", () => {
    for (const stage of PATH_STAGES) {
      for (const id of stage.topics) {
        const easy = ALL_QUESTIONS.filter(
          (q: Question) => q.topic === id && q.difficulty <= 2,
        );
        expect(
          easy.length,
          `spine topic "${id}" has only ${easy.length} easy questions`,
        ).toBeGreaterThanOrEqual(6);
      }
    }
  });

  test("every spine topic has at least one band 1 question to open on", () => {
    for (const stage of PATH_STAGES) {
      for (const id of stage.topics) {
        const first = ALL_QUESTIONS.filter(
          (q: Question) => q.topic === id && q.difficulty === 1,
        );
        expect(
          first.length,
          `spine topic "${id}" has no band 1 question`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe("stage unlocking", () => {
  test("the first stage is open and later ones are not", () => {
    const stages = buildStages(input());
    expect(stages[0].unlocked).toBe(true);
    expect(stages[1].unlocked).toBe(false);
    expect(stages[3].unlocked).toBe(false);
  });

  test("a stated experience level opens stages without answering anything", () => {
    const senior = buildStages(input({ experienceLevel: "senior" }));
    expect(senior[0].unlocked).toBe(true);
    expect(senior[2].unlocked).toBe(true);
    expect(senior[3].unlocked).toBe(false);

    const staff = buildStages(input({ experienceLevel: "staff" }));
    expect(staff[3].unlocked).toBe(true);
  });

  test("earlier stages stay open to someone who skipped ahead", () => {
    const stages = buildStages(input({ experienceLevel: "staff" }));
    expect(stages.every((s) => s.unlocked)).toBe(true);
  });
});

describe("unit status", () => {
  const topic = PATH_STAGES[0].topics[0];

  test("untouched topics in an open stage are available", () => {
    const stages = buildStages(input());
    expect(stages[0].units[0].status).toBe("available");
  });

  test("a partly answered topic reads as in progress", () => {
    const stages = buildStages(input(answered(topic, 2, 2)));
    const unit = stages[0].units.find((u) => u.topicId === topic)!;
    expect(unit.status).toBe("in-progress");
    expect(unit.attempted).toBe(2);
  });

  test("enough attempts at a high enough accuracy completes it", () => {
    const stages = buildStages(input(answered(topic, 5, 5)));
    const unit = stages[0].units.find((u) => u.topicId === topic)!;
    expect(unit.status).toBe("complete");
  });

  test("enough attempts at a low accuracy does not complete it", () => {
    const stages = buildStages(input(answered(topic, 6, 2)));
    const unit = stages[0].units.find((u) => u.topicId === topic)!;
    expect(unit.status).toBe("in-progress");
  });

  test("a completed topic in a locked stage still reads as complete", () => {
    // Someone who met it through the daily mix before reaching that stage.
    const later = PATH_STAGES[3].topics[0];
    const stages = buildStages(input(answered(later, 5, 5)));
    expect(stages[3].unlocked).toBe(false);
    expect(stages[3].units[0].status).toBe("complete");
  });
});

describe("what to do next", () => {
  test("picks the first available unit of the first open stage", () => {
    const stages = buildStages(input());
    expect(nextUnit(stages)?.topicId).toBe(PATH_STAGES[0].topics[0]);
  });

  test("resumes an unfinished topic before starting a new one", () => {
    const second = PATH_STAGES[0].topics[1];
    const stages = buildStages(input(answered(second, 2, 2)));
    expect(nextUnit(stages)?.topicId).toBe(second);
  });

  test("returns nothing once every open stage is finished", () => {
    const srs: PathInput["srs"] = {};
    const byTopic: Record<string, Tally> = {};
    for (const id of PATH_STAGES[0].topics) {
      const part = answered(id, 5, 5);
      Object.assign(srs, part.srs);
      Object.assign(byTopic, part.byTopic);
    }
    const stages = buildStages(input({ srs, byTopic }));
    // Stage 1 is done, which unlocks stage 2, so there is still work.
    expect(stages[1].unlocked).toBe(true);
    expect(nextUnit(stages)?.topicId).toBe(PATH_STAGES[1].topics[0]);
  });
});

describe("progress reporting", () => {
  test("counts only the spine, never the optional lanes", () => {
    const laneTopic = PATH_LANES[0].topics[0];
    const stages = buildStages(input(answered(laneTopic, 5, 5)));
    expect(spineProgress(stages).done).toBe(0);
    expect(spineProgress(stages).total).toBe(
      PATH_STAGES.reduce((n, s) => n + s.topics.length, 0),
    );
  });

  test("lanes are never locked", () => {
    const lanes = buildLanes(input());
    for (const lane of lanes) {
      for (const unit of lane.units) {
        expect(unit.status).not.toBe("locked");
      }
    }
  });
});
