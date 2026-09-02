import { describe, expect, test } from "vitest";
import {
  LEVELS,
  levelForXp,
  recordGoalMet,
  streakAsOf,
  xpForAnswer,
  canRepairStreak,
  repairStreak,
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

describe("streak repair", () => {
  /** A streak that reached 5 on the 10th, so the 11th is the missed day and
   *  the 12th is the day you come back. */
  const broken: StreakState = {
    current: 5,
    longest: 7,
    lastGoalDate: "2026-03-10",
    lastRepairDate: null,
  };

  test("is offered after exactly one missed day", () => {
    expect(canRepairStreak(broken, "2026-03-12")).toBe(true);
  });

  test("is not offered while the streak is still alive", () => {
    expect(canRepairStreak(broken, "2026-03-10")).toBe(false);
    expect(canRepairStreak(broken, "2026-03-11")).toBe(false);
  });

  test("is not offered once two days have been missed", () => {
    expect(canRepairStreak(broken, "2026-03-13")).toBe(false);
  });

  test("is not offered when there is no streak to save", () => {
    expect(canRepairStreak(fresh, "2026-03-12")).toBe(false);
  });

  test("restores the streak to what it was", () => {
    const repaired = repairStreak(broken, "2026-03-12");
    expect(streakAsOf(broken, "2026-03-12")).toBe(0);
    expect(streakAsOf(repaired, "2026-03-12")).toBe(5);
    expect(repaired.current).toBe(5);
  });

  test("does not itself count as a day -- today's goal still has to be met", () => {
    const repaired = repairStreak(broken, "2026-03-12");
    expect(repaired.current).toBe(5);
    const afterDrilling = recordGoalMet(repaired, "2026-03-12");
    expect(afterDrilling.current).toBe(6);
  });

  test("allows one repair per calendar month", () => {
    const repaired = repairStreak(broken, "2026-03-12");
    const brokenAgain: StreakState = {
      ...repaired,
      current: 8,
      lastGoalDate: "2026-03-20",
    };
    expect(canRepairStreak(brokenAgain, "2026-03-22")).toBe(false);
  });

  test("allows another repair the following month", () => {
    const repaired = repairStreak(broken, "2026-03-12");
    const brokenAgain: StreakState = {
      ...repaired,
      current: 8,
      lastGoalDate: "2026-04-20",
    };
    expect(canRepairStreak(brokenAgain, "2026-04-22")).toBe(true);
  });

  test("is a no-op when it is not available", () => {
    expect(repairStreak(broken, "2026-03-13")).toBe(broken);
  });
});
