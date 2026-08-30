import { describe, expect, test } from "vitest";
import {
  LEVELS,
  levelForXp,
  recordGoalMet,
  streakAsOf,
  xpForAnswer,
  type StreakState,
} from "@/lib/xp";

describe("xp awards", () => {
  test("awards nothing for a wrong answer", () => {
    expect(xpForAnswer(false, 3)).toBe(0);
  });

  test("awards xp for a correct answer", () => {
    expect(xpForAnswer(true, 1)).toBeGreaterThan(0);
  });

  test("awards more xp for a harder question", () => {
    expect(xpForAnswer(true, 5)).toBeGreaterThan(xpForAnswer(true, 1));
  });
});

describe("levels", () => {
  test("defines eight levels from Intern to Distinguished Engineer", () => {
    expect(LEVELS).toHaveLength(8);
    expect(LEVELS[0].title).toBe("Intern");
    expect(LEVELS[7].title).toBe("Distinguished Engineer");
  });

  test("thresholds increase monotonically", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXp).toBeGreaterThan(LEVELS[i - 1].minXp);
    }
  });

  test("starts a new learner at Intern", () => {
    expect(levelForXp(0).level.title).toBe("Intern");
    expect(levelForXp(0).level.index).toBe(0);
  });

  test("stays at a level until the next threshold is reached", () => {
    const justBelow = LEVELS[1].minXp - 1;
    expect(levelForXp(justBelow).level.index).toBe(0);
  });

  test("promotes exactly at the threshold", () => {
    expect(levelForXp(LEVELS[1].minXp).level.index).toBe(1);
  });

  test("reports progress toward the next level", () => {
    const midway = Math.floor((LEVELS[0].minXp + LEVELS[1].minXp) / 2);
    const { progress, xpToNext } = levelForXp(midway);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
    expect(xpToNext).toBe(LEVELS[1].minXp - midway);
  });

  test("caps at the top level with no next level to reach", () => {
    const result = levelForXp(LEVELS[7].minXp + 100_000);
    expect(result.level.index).toBe(7);
    expect(result.xpToNext).toBeNull();
    expect(result.progress).toBe(1);
  });
});

const fresh: StreakState = { current: 0, longest: 0, lastGoalDate: null };

describe("streaks", () => {
  test("starts a streak on the first day the goal is met", () => {
    const s = recordGoalMet(fresh, "2026-03-10");
    expect(s.current).toBe(1);
    expect(s.longest).toBe(1);
  });

  test("extends the streak on a consecutive day", () => {
    let s = recordGoalMet(fresh, "2026-03-10");
    s = recordGoalMet(s, "2026-03-11");
    expect(s.current).toBe(2);
  });

  test("is idempotent when the goal is recorded twice in one day", () => {
    let s = recordGoalMet(fresh, "2026-03-10");
    s = recordGoalMet(s, "2026-03-10");
    expect(s.current).toBe(1);
  });

  test("restarts the streak after a missed day", () => {
    let s = recordGoalMet(fresh, "2026-03-10");
    s = recordGoalMet(s, "2026-03-12");
    expect(s.current).toBe(1);
  });

  test("remembers the longest streak after it breaks", () => {
    let s = recordGoalMet(fresh, "2026-03-10");
    s = recordGoalMet(s, "2026-03-11");
    s = recordGoalMet(s, "2026-03-13");
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });

  test("extends a streak across a month boundary", () => {
    let s = recordGoalMet(fresh, "2026-03-31");
    s = recordGoalMet(s, "2026-04-01");
    expect(s.current).toBe(2);
  });

  test("keeps the streak alive on the day after, before the goal is met", () => {
    const s = recordGoalMet(fresh, "2026-03-10");
    expect(streakAsOf(s, "2026-03-11")).toBe(1);
  });

  test("shows the streak as broken once a full day has been missed", () => {
    const s = recordGoalMet(fresh, "2026-03-10");
    expect(streakAsOf(s, "2026-03-12")).toBe(0);
  });

  test("counts the streak on the day it was earned", () => {
    const s = recordGoalMet(fresh, "2026-03-10");
    expect(streakAsOf(s, "2026-03-10")).toBe(1);
  });
});
