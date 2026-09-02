import { describe, expect, test } from "vitest";
import { emptyProgress, type ProgressState } from "@/lib/progress";
import {
  displayNameError,
  leaderboardStats,
  normaliseDisplayName,
} from "@/lib/leaderboard";
import type { Attempt } from "@/lib/progress";

function attempt(correct: boolean): Attempt {
  return {
    questionId: `q-${Math.random()}`,
    topic: "caching",
    track: "system-design",
    difficulty: 2,
    correct,
    at: "2026-03-10",
  };
}

function stateWith(overrides: Partial<ProgressState>): ProgressState {
  return { ...emptyProgress(), ...overrides };
}

describe("leaderboardStats", () => {
  test("reports totals from progress", () => {
    const stats = leaderboardStats(
      stateWith({
        totalXp: 1240,
        attempts: [attempt(true), attempt(true), attempt(false)],
        streak: { current: 4, longest: 9, lastGoalDate: "2026-03-10" },
      }),
      "2026-03-10",
    );

    expect(stats.totalXp).toBe(1240);
    expect(stats.answered).toBe(3);
    expect(stats.streak).toBe(4);
  });

  test("publishes the effective streak, not the stored counter", () => {
    // Last goal was four days ago, so the streak has lapsed and must not be
    // published as though it were still running.
    const stats = leaderboardStats(
      stateWith({
        streak: { current: 12, longest: 12, lastGoalDate: "2026-03-06" },
      }),
      "2026-03-10",
    );
    expect(stats.streak).toBe(0);
  });

  test("accuracy is null until something has been answered", () => {
    expect(leaderboardStats(emptyProgress(), "2026-03-10").accuracy).toBeNull();
  });

  test("accuracy is a fraction between zero and one", () => {
    const stats = leaderboardStats(
      stateWith({ attempts: [attempt(true), attempt(true), attempt(false)] }),
      "2026-03-10",
    );
    expect(stats.accuracy).toBeGreaterThan(0.66);
    expect(stats.accuracy).toBeLessThan(0.67);
  });
});

describe("display names", () => {
  test("trims and collapses whitespace", () => {
    expect(normaliseDisplayName("  ada   lovelace  ")).toBe("ada lovelace");
  });

  test("strips control characters", () => {
    const withNull = `ada${String.fromCharCode(0)}lovelace`;
    expect(normaliseDisplayName(withNull)).toBe("adalovelace");
  });

  test("accepts an ordinary name", () => {
    expect(displayNameError("Ada Lovelace")).toBeNull();
  });

  test("rejects one that is too short", () => {
    expect(displayNameError("a")).toMatch(/2/);
  });

  test("rejects one that is too long", () => {
    expect(displayNameError("a".repeat(25))).toMatch(/24/);
  });

  test("rejects whitespace pretending to be a name", () => {
    expect(displayNameError("     ")).not.toBeNull();
  });

  test("judges length after normalising, not before", () => {
    // Padding should not be what gets someone over the minimum.
    expect(displayNameError("  a  ")).not.toBeNull();
  });
});
