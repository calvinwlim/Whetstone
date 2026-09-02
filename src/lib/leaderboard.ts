import { overallAccuracy, type ProgressState } from "@/lib/progress";
import { streakAsOf } from "@/lib/xp";

/** The only four numbers that ever leave your account for the public board.
 *  Everything else -- which questions, which topics, when -- stays private. */
export interface LeaderboardStats {
  totalXp: number;
  streak: number;
  answered: number;
  /** 0..1, or null when nothing has been answered yet. */
  accuracy: number | null;
}

export const MIN_NAME = 2;
export const MAX_NAME = 24;

export function leaderboardStats(
  state: ProgressState,
  today: string,
): LeaderboardStats {
  return {
    totalXp: state.totalXp,
    // The effective streak. Publishing the stored counter would keep a lapsed
    // streak on the board indefinitely for anyone who stopped drilling.
    streak: streakAsOf(state.streak, today),
    answered: state.totals.answered,
    accuracy: overallAccuracy(state) ?? null,
  };
}

/** Collapses runs of whitespace and drops control characters, so a name
 *  cannot be padded to look longer or smuggle formatting into the table. */
export function normaliseDisplayName(raw: string): string {
  return raw
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Null when the name is usable, otherwise the reason, phrased for display. */
export function displayNameError(raw: string): string | null {
  const name = normaliseDisplayName(raw);
  if (name.length < MIN_NAME) {
    return `Use at least ${MIN_NAME} characters.`;
  }
  if (name.length > MAX_NAME) {
    return `Keep it to ${MAX_NAME} characters or fewer.`;
  }
  return null;
}
