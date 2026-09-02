import { describe, expect, test } from "vitest";
import {
  ATTEMPT_LOG_LIMIT,
  emptyProgress,
  migrateProgress,
  overallAccuracy,
  recordAnswer,
  topicAccuracy,
  type ProgressState,
} from "@/lib/progress";
import { GOAL_BONUS_XP, xpForAnswer } from "@/lib/xp";
import type { Difficulty, McqQuestion } from "@/content/types";

const NOW = new Date("2026-06-10T09:00:00.000Z");
const day = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

function q(id: string, topic = "caching", difficulty: Difficulty = 2): McqQuestion {
  return {
    id,
    type: "mcq",
    track: "system-design",
    topic,
    difficulty,
    prompt: id,
    explanation: "e",
    concepts: ["Example concept"],
    options: [{ id: "a", text: "a" }],
    answer: "a",
  };
}

function answerMany(
  state: ProgressState,
  count: number,
  correct: boolean,
  at: Date,
): ProgressState {
  let next = state;
  for (let i = 0; i < count; i++) {
    next = recordAnswer(next, q(`q${i}`), correct, at);
  }
  return next;
}

describe("empty progress", () => {
  test("starts with no xp, no attempts and no streak", () => {
    const s = emptyProgress();
    expect(s.totalXp).toBe(0);
    expect(s.attempts).toEqual([]);
    expect(s.streak.current).toBe(0);
  });
});

describe("recording an answer", () => {
  test("appends an attempt", () => {
    const s = recordAnswer(emptyProgress(), q("q1"), true, NOW);
    expect(s.attempts).toHaveLength(1);
    expect(s.attempts[0].questionId).toBe("q1");
    expect(s.attempts[0].correct).toBe(true);
  });

  test("records the topic on the attempt so accuracy can be derived later", () => {
    const s = recordAnswer(emptyProgress(), q("q1", "sharding"), true, NOW);
    expect(s.attempts[0].topic).toBe("sharding");
  });

  test("awards xp for a correct answer", () => {
    const s = recordAnswer(emptyProgress(), q("q1", "caching", 3), true, NOW);
    expect(s.totalXp).toBe(xpForAnswer(true, 3));
  });

  test("awards no xp for a wrong answer", () => {
    const s = recordAnswer(emptyProgress(), q("q1"), false, NOW);
    expect(s.totalXp).toBe(0);
  });

  test("creates srs state for a question seen for the first time", () => {
    const s = recordAnswer(emptyProgress(), q("q1"), true, NOW);
    expect(s.srs.q1).toBeDefined();
    expect(s.srs.q1.reps).toBe(1);
  });

  test("advances existing srs state on a repeat answer", () => {
    let s = recordAnswer(emptyProgress(), q("q1"), true, NOW);
    s = recordAnswer(s, q("q1"), true, day(1));
    expect(s.srs.q1.reps).toBe(2);
    expect(s.srs.q1.intervalDays).toBe(6);
  });

  test("counts a lapse when a previously known question is missed", () => {
    let s = recordAnswer(emptyProgress(), q("q1"), true, NOW);
    s = recordAnswer(s, q("q1"), false, day(1));
    expect(s.srs.q1.lapses).toBe(1);
    expect(s.srs.q1.reps).toBe(0);
  });

  test("does not mutate the state passed in", () => {
    const before = emptyProgress();
    recordAnswer(before, q("q1"), true, NOW);
    expect(before.attempts).toHaveLength(0);
    expect(before.totalXp).toBe(0);
  });
});

describe("daily stats", () => {
  test("counts answers for the day", () => {
    const s = answerMany(emptyProgress(), 3, true, NOW);
    expect(s.dailyStats["2026-06-10"].answered).toBe(3);
    expect(s.dailyStats["2026-06-10"].correct).toBe(3);
  });

  test("separates days", () => {
    let s = answerMany(emptyProgress(), 2, true, NOW);
    s = recordAnswer(s, q("later"), true, day(1));
    expect(s.dailyStats["2026-06-10"].answered).toBe(2);
    expect(s.dailyStats["2026-06-11"].answered).toBe(1);
  });
});

describe("daily goal", () => {
  test("is not met before enough questions are answered", () => {
    const s = answerMany(emptyProgress(), 4, true, NOW);
    expect(s.dailyStats["2026-06-10"].goalMet).toBe(false);
    expect(s.streak.current).toBe(0);
  });

  test("is met once the goal count is answered", () => {
    const base = { ...emptyProgress(), dailyGoal: 5 };
    const s = answerMany(base, 5, true, NOW);
    expect(s.dailyStats["2026-06-10"].goalMet).toBe(true);
  });

  test("counts wrong answers toward the goal", () => {
    const base = { ...emptyProgress(), dailyGoal: 5 };
    const s = answerMany(base, 5, false, NOW);
    expect(s.dailyStats["2026-06-10"].goalMet).toBe(true);
  });

  test("awards the goal bonus exactly once", () => {
    const base = { ...emptyProgress(), dailyGoal: 5 };
    const atGoal = answerMany(base, 5, false, NOW);
    const past = recordAnswer(atGoal, q("extra"), false, NOW);
    expect(atGoal.totalXp).toBe(GOAL_BONUS_XP);
    expect(past.totalXp).toBe(GOAL_BONUS_XP);
  });

  test("starts a streak when the goal is met", () => {
    const base = { ...emptyProgress(), dailyGoal: 5 };
    const s = answerMany(base, 5, true, NOW);
    expect(s.streak.current).toBe(1);
  });

  test("extends the streak on consecutive days", () => {
    const base = { ...emptyProgress(), dailyGoal: 2 };
    let s = answerMany(base, 2, true, NOW);
    s = recordAnswer(s, q("a"), true, day(1));
    s = recordAnswer(s, q("b"), true, day(1));
    expect(s.streak.current).toBe(2);
  });
});

describe("accuracy", () => {
  test("is undefined with no history", () => {
    expect(overallAccuracy(emptyProgress())).toBeUndefined();
  });

  test("reflects the ratio of correct answers", () => {
    let s = answerMany(emptyProgress(), 3, true, NOW);
    s = recordAnswer(s, q("wrong"), false, NOW);
    expect(overallAccuracy(s)).toBeCloseTo(0.75);
  });

  test("breaks down by topic", () => {
    let s = recordAnswer(emptyProgress(), q("a", "caching"), true, NOW);
    s = recordAnswer(s, q("b", "caching"), false, NOW);
    s = recordAnswer(s, q("c", "sharding"), true, NOW);
    const byTopic = topicAccuracy(s);
    expect(byTopic.caching).toBeCloseTo(0.5);
    expect(byTopic.sharding).toBeCloseTo(1);
  });

  test("omits topics with no attempts", () => {
    const s = recordAnswer(emptyProgress(), q("a", "caching"), true, NOW);
    expect(topicAccuracy(s).sharding).toBeUndefined();
  });
});

describe("bounded attempt log", () => {
  test("keeps only the most recent attempts", () => {
    let state = emptyProgress();
    for (let i = 0; i < ATTEMPT_LOG_LIMIT + 25; i++) {
      state = recordAnswer(state, q(`q-${i}`), true, NOW);
    }

    expect(state.attempts).toHaveLength(ATTEMPT_LOG_LIMIT);
    // The newest survives, the oldest is gone.
    expect(state.attempts.at(-1)?.questionId).toBe(
      `q-${ATTEMPT_LOG_LIMIT + 24}`,
    );
    expect(state.attempts.some((a) => a.questionId === "q-0")).toBe(false);
  });

  test("counts every answer ever given, past the cap", () => {
    let state = emptyProgress();
    for (let i = 0; i < ATTEMPT_LOG_LIMIT + 25; i++) {
      state = recordAnswer(state, q(`q-${i}`), i % 2 === 0, NOW);
    }

    expect(state.totals.answered).toBe(ATTEMPT_LOG_LIMIT + 25);
    expect(state.totals.correct).toBe(Math.ceil((ATTEMPT_LOG_LIMIT + 25) / 2));
  });

  test("topic accuracy stays exact after the log is trimmed", () => {
    let state = emptyProgress();
    // 300 correct on caching, then enough on another topic to push them out.
    for (let i = 0; i < 300; i++) {
      state = recordAnswer(state, q(`c-${i}`, "caching"), true, NOW);
    }
    for (let i = 0; i < ATTEMPT_LOG_LIMIT; i++) {
      state = recordAnswer(state, q(`s-${i}`, "sharding"), false, NOW);
    }

    expect(state.attempts.some((a) => a.topic === "caching")).toBe(false);
    // The log has forgotten caching; the totals have not.
    expect(topicAccuracy(state).caching).toBe(1);
    expect(topicAccuracy(state).sharding).toBe(0);
  });
});

describe("migrating stored progress", () => {
  test("derives totals from a version 1 log", () => {
    const v1 = {
      version: 1,
      srs: {},
      attempts: [
        { questionId: "a", topic: "caching", track: "system-design", difficulty: 2, correct: true, at: "2026-06-10" },
        { questionId: "b", topic: "caching", track: "system-design", difficulty: 2, correct: false, at: "2026-06-10" },
        { questionId: "c", topic: "sharding", track: "system-design", difficulty: 3, correct: true, at: "2026-06-10" },
      ],
      totalXp: 30,
      streak: { current: 1, longest: 1, lastGoalDate: null },
      dailyGoal: 10,
      enabledTracks: ["system-design"],
      dailyStats: {},
    };

    const migrated = migrateProgress(v1);
    expect(migrated).not.toBeNull();
    expect(migrated!.version).toBe(2);
    expect(migrated!.totals.answered).toBe(3);
    expect(migrated!.totals.correct).toBe(2);
    expect(migrated!.totals.byTopic.caching).toEqual({ correct: 1, seen: 2 });
    expect(migrated!.totals.byTrack["system-design"]).toEqual({
      correct: 2,
      seen: 3,
    });
    // Nothing else about the save is disturbed.
    expect(migrated!.totalXp).toBe(30);
  });

  test("passes a version 2 save through unchanged", () => {
    const current = recordAnswer(emptyProgress(), q("a"), true, NOW);
    expect(migrateProgress(current)).toEqual(current);
  });

  test("rejects something that is not progress at all", () => {
    expect(migrateProgress({ hello: "world" })).toBeNull();
    expect(migrateProgress(null)).toBeNull();
  });
});
