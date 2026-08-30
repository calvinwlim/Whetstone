import { emptyProgress, type ProgressState } from "@/lib/progress";
import { browserStore } from "@/lib/storage";

/** A module-level store read through useSyncExternalStore. This is the React
 *  API built for exactly this situation -- state that lives outside React, in
 *  localStorage -- and it avoids the load-in-an-effect dance along with the
 *  cascading render it causes. */

let snapshot: ProgressState | null = null;
const listeners = new Set<() => void>();

/** Stable across calls so React's Object.is check never sees a false change. */
const SERVER_SNAPSHOT: ProgressState = emptyProgress();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): ProgressState {
  snapshot ??= browserStore().load();
  return snapshot;
}

/** Rendered on the server and during hydration. Real progress swaps in on the
 *  first client render after that, so the markup always matches. */
export function getServerSnapshot(): ProgressState {
  return SERVER_SNAPSHOT;
}

export function setProgress(next: ProgressState): void {
  snapshot = next;
  browserStore().save(next);
  for (const listener of listeners) listener();
}

export function updateProgress(
  change: (current: ProgressState) => ProgressState,
): void {
  setProgress(change(getSnapshot()));
}

/** Test seam: drops the cached snapshot so the next read hits storage again. */
export function resetSnapshotCache(): void {
  snapshot = null;
}
