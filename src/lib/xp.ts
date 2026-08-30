import type { Difficulty } from "@/content/types";

const DAY_MS = 86_400_000;

/** Correct answers only. Harder questions pay more so the difficulty banding
 *  actually rewards climbing rather than farming easy items. */
export function xpForAnswer(correct: boolean, difficulty: Difficulty): number {
  return correct ? 5 + difficulty * 5 : 0;
}

/** Awarded once per day for clearing the daily goal. */
export const GOAL_BONUS_XP = 25;

export interface Level {
  index: number;
  title: string;
  minXp: number;
}

export const LEVELS: Level[] = [
  { index: 0, title: "Intern", minXp: 0 },
  { index: 1, title: "Junior Dev", minXp: 250 },
  { index: 2, title: "Mid-Level Engineer", minXp: 750 },
  { index: 3, title: "Senior Engineer", minXp: 1750 },
  { index: 4, title: "Staff Engineer", minXp: 3500 },
  { index: 5, title: "Senior Staff Engineer", minXp: 6000 },
  { index: 6, title: "Principal Engineer", minXp: 9500 },
  { index: 7, title: "Distinguished Engineer", minXp: 14000 },
];

export interface LevelProgress {
  level: Level;
  /** XP still needed to promote, or null at the top level. */
  xpToNext: number | null;
  /** 0..1 through the current level; 1 at the top. */
  progress: number;
}

export function levelForXp(totalXp: number): LevelProgress {
  let level = LEVELS[0];
  for (const candidate of LEVELS) {
    if (totalXp >= candidate.minXp) level = candidate;
  }

  const next = LEVELS[level.index + 1];
  if (!next) return { level, xpToNext: null, progress: 1 };

  const span = next.minXp - level.minXp;
  return {
    level,
    xpToNext: next.minXp - totalXp,
    progress: (totalXp - level.minXp) / span,
  };
}

/** Calendar dates as `YYYY-MM-DD`. Parsed as UTC so a late-night session
 *  doesn't land on the wrong day when the clock crosses a timezone boundary. */
export interface StreakState {
  current: number;
  longest: number;
  lastGoalDate: string | null;
}

function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / DAY_MS);
}

export function recordGoalMet(state: StreakState, date: string): StreakState {
  if (state.lastGoalDate === date) return state;

  const consecutive =
    state.lastGoalDate !== null && daysBetween(state.lastGoalDate, date) === 1;
  const current = consecutive ? state.current + 1 : 1;

  return {
    current,
    longest: Math.max(state.longest, current),
    lastGoalDate: date,
  };
}

/** A streak survives the whole of the following day -- you haven't missed a
 *  day until that day is over. Two days of silence breaks it. */
export function streakAsOf(state: StreakState, today: string): number {
  if (state.lastGoalDate === null) return 0;
  return daysBetween(state.lastGoalDate, today) <= 1 ? state.current : 0;
}
