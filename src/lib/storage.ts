import { emptyProgress, type ProgressState } from "@/lib/progress";

export const STORAGE_KEY = "swe-drill-progress-v1";

/** The seam that keeps accounts a swap rather than a rewrite: when Clerk and
 *  Neon land, a server-backed store implements this same interface and the
 *  rest of the app is unchanged. */
export interface ProgressStore {
  load(): ProgressState;
  save(state: ProgressState): void;
}

/** Narrow structural check. Anything unrecognised is discarded in favour of a
 *  fresh state -- losing local progress is bad, but a crash loop on every page
 *  load is worse, and there is no way to repair an unknown shape. */
export function isProgressState(value: unknown): value is ProgressState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ProgressState>;
  return (
    candidate.version === 1 &&
    typeof candidate.totalXp === "number" &&
    typeof candidate.dailyGoal === "number" &&
    Array.isArray(candidate.attempts) &&
    Array.isArray(candidate.enabledTracks) &&
    typeof candidate.srs === "object" &&
    candidate.srs !== null &&
    typeof candidate.dailyStats === "object" &&
    candidate.dailyStats !== null &&
    typeof candidate.streak === "object" &&
    candidate.streak !== null
  );
}

export function createLocalStore(storage: Storage | undefined): ProgressStore {
  return {
    load() {
      if (!storage) return emptyProgress();
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return emptyProgress();
        const parsed: unknown = JSON.parse(raw);
        return isProgressState(parsed) ? parsed : emptyProgress();
      } catch {
        // Corrupt JSON, blocked site data, or a private-mode accessor that
        // throws. None of these should stop the app rendering.
        return emptyProgress();
      }
    },

    save(state) {
      if (!storage) return;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Quota exceeded or storage denied. A lost write is survivable;
        // an exception mid-drill is not.
      }
    },
  };
}

/** Browser store, safe to call during SSR where window does not exist. */
export function browserStore(): ProgressStore {
  return createLocalStore(
    typeof window === "undefined" ? undefined : window.localStorage,
  );
}
