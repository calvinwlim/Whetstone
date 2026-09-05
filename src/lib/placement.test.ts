import { describe, expect, test } from "vitest";
import { ALL_QUESTIONS } from "@/content";
import { PATH_STAGES, STARTING_STAGE } from "@/content/path";
import {
  PLACEMENT_LENGTH,
  composePlacement,
  scorePlacement,
} from "@/lib/placement";

const set = composePlacement(ALL_QUESTIONS);

describe("composing a placement check", () => {
  test("asks two questions per stage, in stage order", () => {
    expect(set).toHaveLength(PLACEMENT_LENGTH);
    expect(PLACEMENT_LENGTH).toBe(8);

    set.forEach((question, index) => {
      const stage = PATH_STAGES[Math.floor(index / 2)];
      expect(
        stage.topics,
        `question ${index} is not from stage ${stage.id}`,
      ).toContain(question.topic);
    });
  });

  test("never asks two questions from the same topic", () => {
    const topics = set.map((q) => q.topic);
    expect(new Set(topics).size).toBe(topics.length);
  });

  test("only ever draws from the spine, never a lane or a depth topic", () => {
    const spine = new Set(PATH_STAGES.flatMap((s) => s.topics));
    for (const question of set) {
      expect(spine.has(question.topic)).toBe(true);
    }
  });

  test("is deterministic for a given seed, and varies across seeds", () => {
    expect(composePlacement(ALL_QUESTIONS, 7).map((q) => q.id)).toEqual(
      composePlacement(ALL_QUESTIONS, 7).map((q) => q.id),
    );
    expect(composePlacement(ALL_QUESTIONS, 7).map((q) => q.id)).not.toEqual(
      composePlacement(ALL_QUESTIONS, 8).map((q) => q.id),
    );
  });

  test("gets harder as it goes", () => {
    const stageAverage = PATH_STAGES.map((_, index) => {
      const slice = set.slice(index * 2, (index + 1) * 2);
      return slice.reduce((n, q) => n + q.difficulty, 0) / slice.length;
    });
    expect(stageAverage[0]).toBeLessThanOrEqual(stageAverage[3]);
    expect(stageAverage[3]).toBeGreaterThan(2);
  });
});

describe("scoring a placement check", () => {
  const all = (value: boolean) => Array<boolean>(PLACEMENT_LENGTH).fill(value);

  test("everything right opens the whole path", () => {
    const result = scorePlacement(set, all(true));
    expect(result.level).toBe("staff");
    expect(result.stageIndex).toBe(3);
    expect(result.byStage).toEqual([2, 2, 2, 2]);
  });

  test("everything wrong starts from the beginning", () => {
    const result = scorePlacement(set, all(false));
    expect(result.level).toBe("junior");
    expect(result.stageIndex).toBe(0);
  });

  test("places you where you first stop getting everything right", () => {
    // Stages 1 and 2 clean, then one wrong in stage 3.
    const results = [true, true, true, true, true, false, false, false];
    const result = scorePlacement(set, results);
    expect(result.stageIndex).toBe(2);
    expect(result.level).toBe("senior");
    expect(STARTING_STAGE[result.level]).toBe(2);
  });

  test("one wrong in the first stage places you at the bottom, however well you do later", () => {
    const results = [true, false, true, true, true, true, true, true];
    const result = scorePlacement(set, results);
    expect(result.stageIndex).toBe(0);
    expect(result.level).toBe("junior");
    expect(result.byStage).toEqual([1, 2, 2, 2]);
  });

  test("the level it returns opens exactly the stage it named", () => {
    for (let stumble = 0; stumble < PATH_STAGES.length; stumble++) {
      const results = Array<boolean>(PLACEMENT_LENGTH).fill(true);
      results[stumble * 2] = false;
      const result = scorePlacement(set, results);
      expect(STARTING_STAGE[result.level]).toBe(result.stageIndex);
    }
  });
});
