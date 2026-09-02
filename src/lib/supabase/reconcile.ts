import type { ProgressState } from "@/lib/progress";

export interface Reconciled {
  state: ProgressState;
  /** True when the winning state is local and the server needs updating. */
  shouldPush: boolean;
}

/** Decides which copy wins when a device signs in and finds existing remote
 *  progress.
 *
 *  `totals.answered` counts every answer ever given, so it is the measure of
 *  "how much history does this copy have". The attempt log itself is capped
 *  and would tie at the limit. The side with more wins, and local wins ties
 *  to avoid pointless writes.
 *
 *  This is deliberately last-writer-style rather than a true merge: if two
 *  devices both drill offline, the one with fewer answers loses its extra
 *  attempts. Merging properly would mean unioning attempts and recomputing
 *  XP, streaks and SRS state from them -- worth doing if that turns out to
 *  happen in practice, and not worth the complexity before then. */
export function reconcileProgress(
  local: ProgressState,
  remote: ProgressState | null,
): Reconciled {
  if (!remote) {
    // First sign-in on an account that has never synced: upload what we have.
    return { state: local, shouldPush: local.totals.answered > 0 };
  }

  if (local.totals.answered > remote.totals.answered) {
    return { state: local, shouldPush: true };
  }

  if (remote.totals.answered > local.totals.answered) {
    return { state: remote, shouldPush: false };
  }

  return { state: local, shouldPush: false };
}
