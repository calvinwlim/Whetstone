import { describe, expect, test } from "vitest";
import {
  emptyProgress,
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
