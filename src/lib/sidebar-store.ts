/** Whether the sidebar is expanded, read through useSyncExternalStore for the
 *  same reason progress is: it lives in localStorage, outside React, and
 *  loading it in an effect would cost a second render on every page. */

const KEY = "whetstone.sidebar.open";

let snapshot: boolean | null = null;
const listeners = new Set<() => void>();

/** The server and first client render always agree on expanded, so the markup
 *  matches; a stored preference swaps in on the render after hydration. */
const SERVER_SNAPSHOT = true;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): boolean {
  if (snapshot === null) {
    try {
      snapshot = window.localStorage.getItem(KEY) !== "closed";
    } catch {
      // Private mode, or storage disabled. Expanded is the safe default.
      snapshot = true;
    }
  }
  return snapshot;
}

export function getServerSnapshot(): boolean {
  return SERVER_SNAPSHOT;
}

export function setSidebarOpen(open: boolean): void {
  snapshot = open;
  try {
    window.localStorage.setItem(KEY, open ? "open" : "closed");
  } catch {
    // Not being able to remember the choice is not worth breaking the toggle.
  }
  for (const listener of listeners) listener();
}
