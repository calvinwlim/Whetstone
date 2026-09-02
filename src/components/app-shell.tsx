"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useProgress } from "@/components/progress-provider";
import { AuthChip } from "@/components/auth-chip";
import { Sidebar } from "@/components/sidebar";
import {
  getServerSnapshot,
  getSnapshot,
  setSidebarOpen,
  subscribe,
} from "@/lib/sidebar-store";

const HEADER = "3.5rem";

/** Streak and XP sit in the chrome rather than on a page, so they are visible
 *  everywhere and no screen has to spend a card announcing them. Achromatic:
 *  green, amber and red are reserved for correctness and difficulty. */
function StatusChips() {
  const { streak, state, hydrated } = useProgress();

  return (
    <div className="flex items-center gap-4">
      <span className="flex items-baseline gap-1.5">
        <span className="font-mono text-sm tabular-nums text-shell-text">
          {hydrated ? streak : 0}
        </span>
        <span className="label text-shell-text-2">day streak</span>
      </span>
      <span className="hidden items-baseline gap-1.5 sm:flex">
        <span className="font-mono text-sm tabular-nums text-shell-text">
          {(hydrated ? state.totalXp : 0).toLocaleString()}
        </span>
        <span className="label text-shell-text-2">xp</span>
      </span>
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      {open ? (
        <path d="M2.5 4h11M2.5 8h6M2.5 12h11" />
      ) : (
        <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
      )}
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // The phone drawer is separate state: a stored preference of "expanded"
  // should not mean a drawer covering the content on load.
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="shell-scope flex min-h-dvh flex-col bg-shell">
      <header
        className="sticky top-0 z-30 flex shrink-0 items-center gap-2 px-3"
        style={{ height: HEADER }}
      >
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="Open navigation"
          className="grid h-8 w-8 place-items-center rounded-control text-shell-text-2 transition-colors hover:bg-shell-2 hover:text-shell-text lg:hidden"
        >
          <MenuIcon open={false} />
        </button>

        <button
          type="button"
          onClick={() => setSidebarOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={open}
          className="hidden h-8 w-8 place-items-center rounded-control text-shell-text-2 transition-colors hover:bg-shell-2 hover:text-shell-text lg:grid"
        >
          <MenuIcon open={open} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-[6px] bg-shell-text text-xs font-bold text-shell"
          >
            W
          </span>
          <span className="text-[0.9375rem] font-semibold text-shell-text">
            Whetstone
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <StatusChips />
          <AuthChip />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`sticky hidden shrink-0 transition-[width] duration-150 lg:block ${
            open ? "w-64" : "w-14"
          }`}
          style={{ top: HEADER, height: `calc(100dvh - ${HEADER})` }}
        >
          <Sidebar open={open} />
        </aside>

        {drawer ? (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-shell lg:hidden">
              <Sidebar open onNavigate={() => setDrawer(false)} />
            </aside>
          </>
        ) : null}

        <main
          className="mx-2 mb-2 min-w-0 flex-1 rounded-canvas bg-bg px-4 py-5 sm:px-6 lg:ml-0 lg:mr-3 lg:mb-3"
          style={{ minHeight: `calc(100dvh - ${HEADER} - 0.5rem)` }}
        >
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
