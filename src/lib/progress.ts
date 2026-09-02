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

/** How many recent attempts are kept verbatim. The log feeds the signal
 *  strips and the rolling accuracy, both of which look at far fewer than this;
 *  everything that needs to be exact for ever lives in `totals` instead.
 *
 *  Unbounded, this array was the whole cost of syncing: an attempt is about
 *  115 bytes, so a year of ten a day is ~420KB re-uploaded on every debounced
 *  push. Capped, a save stays under about 60KB no matter how long you use it. */
export const ATTEMPT_LOG_LIMIT = 500;

export interface Attempt {
  questionId: string;
  topic: string;
  track: TrackId;
  difficulty: Difficulty;
  correct: boolean;
  at: string;
}

/** Counts that must survive the attempt log being trimmed. */
export interface Tally {
  correct: number;
  seen: number;
}

export interface Totals {
  answered: number;
  correct: number;
  byTopic: Record<string, Tally>;
  byTrack: Record<string, Tally>;
}

export interface DailyStat {
  date: string;
  answered: number;
  correct: number;
  xp: number;
  goalMet: boolean;
}

export interface ProgressState {
  version: 2;
  srs: Record<string, SrsState>;
  /** The most recent answers, capped. For "how many have I ever answered",
   *  and for per-topic accuracy, read `totals` -- this array forgets. */
  attempts: Attempt[];
  totals: Totals;
  totalXp: number;
  streak: StreakState;
  dailyGoal: number;
  enabledTracks: TrackId[];
  /** Opt in to specialist depth topics appearing in the daily mix. */
  includeDepth?: boolean;
  dailyStats: Record<string, DailyStat>;
}

export function emptyProgress(): ProgressState {
  return {
    version: 2,
    srs: {},
    attempts: [],
    totals: { answered: 0, correct: 0, byTopic: {}, byTrack: {} },
    totalXp: 0,
    streak: { current: 0, longest: 0, lastGoalDate: null },
    dailyGoal: 10,
    enabledTracks: [...TRACK_IDS],
    includeDepth: false,
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

  const log = [...state.attempts, attempt];

  return {
    ...state,
    srs: { ...state.srs, [question.id]: scheduleNext(previous, correct, now) },
    attempts: log.length > ATTEMPT_LOG_LIMIT
      ? log.slice(log.length - ATTEMPT_LOG_LIMIT)
      : log,
    totals: addToTotals(state.totals, attempt),
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

function ratios(tallies: Record<string, Tally>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(tallies).map(([key, t]) => [key, t.correct / t.seen]),
  );
}

/** Lifetime accuracy per topic. Read from the counters, so it stays exact
 *  however long ago the answers were given. */
export function topicAccuracy(state: ProgressState): Record<string, number> {
  return ratios(state.totals.byTopic);
}

export function trackAccuracy(state: ProgressState): Record<string, number> {
  return ratios(state.totals.byTrack);
}

/** Topics with any history at all, for the "attempted" marks in the table.
 *  Derived from the counters rather than the log, which forgets. */
export function attemptedTopics(state: ProgressState): Set<string> {
  return new Set(Object.keys(state.totals.byTopic));
}

function bump(tallies: Record<string, Tally>, key: string, correct: boolean) {
  const previous = tallies[key] ?? { correct: 0, seen: 0 };
  return {
    ...tallies,
    [key]: {
      correct: previous.correct + (correct ? 1 : 0),
      seen: previous.seen + 1,
    },
  };
}

function addToTotals(totals: Totals, attempt: Attempt): Totals {
  return {
    answered: totals.answered + 1,
    correct: totals.correct + (attempt.correct ? 1 : 0),
    byTopic: bump(totals.byTopic, attempt.topic, attempt.correct),
    byTrack: bump(totals.byTrack, attempt.track, attempt.correct),
  };
}

function totalsFromLog(attempts: Attempt[]): Totals {
  return attempts.reduce<Totals>(addToTotals, {
    answered: 0,
    correct: 0,
    byTopic: {},
    byTrack: {},
  });
}

/** Reads a stored save of any known version, or null if it is unrecognisable.
 *
 *  Version 1 kept every attempt for ever and derived per-topic accuracy by
 *  replaying them. Upgrading computes the counters from the log it still has
 *  -- which is complete, since nothing ever trimmed it -- and then trims. */
export function migrateProgress(value: unknown): ProgressState | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;

  const looksRight =
    typeof candidate.totalXp === "number" &&
    typeof candidate.dailyGoal === "number" &&
    Array.isArray(candidate.attempts) &&
    Array.isArray(candidate.enabledTracks) &&
    typeof candidate.srs === "object" &&
    candidate.srs !== null &&
    typeof candidate.dailyStats === "object" &&
    candidate.dailyStats !== null &&
    typeof candidate.streak === "object" &&
    candidate.streak !== null;

  if (!looksRight) return null;

  if (candidate.version === 2 && typeof candidate.totals === "object") {
    return candidate as unknown as ProgressState;
  }

  if (candidate.version !== 1) return null;

  const attempts = candidate.attempts as Attempt[];
  return {
    ...(candidate as unknown as ProgressState),
    version: 2,
    totals: totalsFromLog(attempts),
    attempts:
      attempts.length > ATTEMPT_LOG_LIMIT
        ? attempts.slice(attempts.length - ATTEMPT_LOG_LIMIT)
        : attempts,
  };
}
