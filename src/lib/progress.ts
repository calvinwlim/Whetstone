import type { Difficulty, Question, TrackId } from "@/content/types";
import { TRACK_IDS } from "@/content/types";
import { initialSrsState, scheduleNext, type SrsState } from "@/lib/srs";
import {
  GOAL_BONUS_XP,
  recordGoalMet,
  xpForAnswer,
  type StreakState,
} from "@/lib/xp";

/** How many recent attempts feed the rolling accuracy that sets the
 *  difficulty band. Short enough to track improvement, long enough to be
 *  stable across a single bad session. */
const ROLLING_WINDOW = 50;

export interface Attempt {
  questionId: string;
  topic: string;
  track: TrackId;
  difficulty: Difficulty;
  correct: boolean;
  at: string;
}

export interface DailyStat {
  date: string;
  answered: number;
  correct: number;
  xp: number;
  goalMet: boolean;
}

export interface ProgressState {
  version: 1;
  srs: Record<string, SrsState>;
  attempts: Attempt[];
  totalXp: number;
  streak: StreakState;
  dailyGoal: number;
  enabledTracks: TrackId[];
  dailyStats: Record<string, DailyStat>;
}

export function emptyProgress(): ProgressState {
  return {
    version: 1,
    srs: {},
    attempts: [],
    totalXp: 0,
    streak: { current: 0, longest: 0, lastGoalDate: null },
    dailyGoal: 10,
    enabledTracks: [...TRACK_IDS],
    dailyStats: {},
  };
}

function dateKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Pure reducer -- returns a new state, never mutates the one passed in. */
export function recordAnswer(
  state: ProgressState,
  question: Question,
  correct: boolean,
  now: Date,
): ProgressState {
  const date = dateKey(now);
  const previous = state.srs[question.id] ?? initialSrsState(now);

  const prevStat: DailyStat = state.dailyStats[date] ?? {
    date,
    answered: 0,
    correct: 0,
    xp: 0,
    goalMet: false,
  };

  const answered = prevStat.answered + 1;
  const goalMet = answered >= state.dailyGoal;
  // The bonus and the streak fire on the transition only, so answering past
  // the goal never double-counts.
  const justMetGoal = goalMet && !prevStat.goalMet;

  const earned = xpForAnswer(correct, question.difficulty);
  const bonus = justMetGoal ? GOAL_BONUS_XP : 0;

  const attempt: Attempt = {
    questionId: question.id,
    topic: question.topic,
    track: question.track,
    difficulty: question.difficulty,
    correct,
    at: now.toISOString(),
  };

  return {
    ...state,
    srs: { ...state.srs, [question.id]: scheduleNext(previous, correct, now) },
    attempts: [...state.attempts, attempt],
    totalXp: state.totalXp + earned + bonus,
    streak: justMetGoal ? recordGoalMet(state.streak, date) : state.streak,
    dailyStats: {
      ...state.dailyStats,
      [date]: {
        date,
        answered,
        correct: prevStat.correct + (correct ? 1 : 0),
        xp: prevStat.xp + earned + bonus,
        goalMet,
      },
    },
  };
}

/** Rolling accuracy over recent attempts, or undefined with no history. */
export function overallAccuracy(state: ProgressState): number | undefined {
  const recent = state.attempts.slice(-ROLLING_WINDOW);
  if (recent.length === 0) return undefined;
  const correct = recent.filter((a) => a.correct).length;
  return correct / recent.length;
}

/** Lifetime accuracy per topic. Drives weak-topic weighting and the stats page. */
export function topicAccuracy(state: ProgressState): Record<string, number> {
  const totals: Record<string, { correct: number; seen: number }> = {};
  for (const attempt of state.attempts) {
    const entry = (totals[attempt.topic] ??= { correct: 0, seen: 0 });
    entry.seen += 1;
    if (attempt.correct) entry.correct += 1;
  }

  return Object.fromEntries(
    Object.entries(totals).map(([topic, t]) => [topic, t.correct / t.seen]),
  );
}

export function trackAccuracy(state: ProgressState): Record<string, number> {
  const totals: Record<string, { correct: number; seen: number }> = {};
  for (const attempt of state.attempts) {
    const entry = (totals[attempt.track] ??= { correct: 0, seen: 0 });
    entry.seen += 1;
    if (attempt.correct) entry.correct += 1;
  }

  return Object.fromEntries(
    Object.entries(totals).map(([track, t]) => [track, t.correct / t.seen]),
  );
}
