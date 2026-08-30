/** SM-2 spaced repetition, reduced to a binary correct/incorrect grade.
 *  Chosen over FSRS deliberately: an order of magnitude less code, easy to
 *  reason about, and the accuracy difference is invisible at personal volume. */

const DAY_MS = 86_400_000;
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const EASE_BONUS = 0.1;
const EASE_PENALTY = 0.2;

export interface SrsState {
  /** Multiplier applied to the interval once an item is established. */
  ease: number;
  intervalDays: number;
  /** Consecutive correct answers. Reset to 0 by any lapse. */
  reps: number;
  lapses: number;
  dueAt: string;
}

export function initialSrsState(now: Date): SrsState {
  return {
    ease: DEFAULT_EASE,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueAt: now.toISOString(),
  };
}

function nextInterval(state: SrsState): number {
  if (state.reps === 0) return 1;
  if (state.reps === 1) return 6;
  // Uses the ease from before this review, so the multiplier reflects the
  // learner's track record up to now rather than the answer they just gave.
  return Math.round(state.intervalDays * state.ease);
}

export function scheduleNext(
  state: SrsState,
  correct: boolean,
  now: Date,
): SrsState {
  const intervalDays = correct ? nextInterval(state) : 1;
  const ease = correct
    ? state.ease + EASE_BONUS
    : Math.max(MIN_EASE, state.ease - EASE_PENALTY);

  return {
    ease,
    intervalDays,
    reps: correct ? state.reps + 1 : 0,
    lapses: correct ? state.lapses : state.lapses + 1,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
  };
}

export function isDue(state: SrsState, now: Date): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime();
}
