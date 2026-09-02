"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  fetchRemoteProgress,
  pushRemoteProgress,
} from "@/lib/supabase/progress-remote";
import { reconcileProgress } from "@/lib/supabase/reconcile";
import { refreshMyStats } from "@/lib/supabase/leaderboard-remote";
import { leaderboardStats } from "@/lib/leaderboard";
import { getSnapshot, setProgress, subscribe } from "@/lib/progress-store";

/** Milliseconds of quiet before a change is pushed. Long enough that a burst
 *  of answers becomes one write, short enough to survive closing the tab. */
const PUSH_DEBOUNCE_MS = 1500;

/** Keeps localStorage authoritative during a session and mirrors it to
 *  Supabase in the background.
 *
 *  Deliberately not write-through: a dropped connection mid-drill must never
 *  cost an answer or a streak, and the app has to keep working offline. */
export function ProgressSync() {
  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    let user: User | null = null;
    let pushTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function schedulePush() {
      if (!user || !supabase) return;
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => {
        if (cancelled || !user) return;
        const snapshot = getSnapshot();
        void pushRemoteProgress(supabase, user.id, snapshot);
        // An update, not an upsert: it touches nothing for anyone who has not
        // joined the board, so drilling cannot quietly list you.
        void refreshMyStats(
          supabase,
          user.id,
          leaderboardStats(snapshot, new Date().toISOString().slice(0, 10)),
        );
      }, PUSH_DEBOUNCE_MS);
    }

    async function adoptRemote(signedIn: User) {
      if (!supabase) return;
      const remote = await fetchRemoteProgress(supabase, signedIn.id);
      if (cancelled) return;

      const { state, shouldPush } = reconcileProgress(getSnapshot(), remote);

      // Only touch the store when the remote copy actually won, so signing in
      // never re-renders the app with an identical object.
      if (state !== getSnapshot()) setProgress(state);
      if (shouldPush) await pushRemoteProgress(supabase, signedIn.id, state);
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      user = data.user;
      void adoptRemote(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const next = session?.user ?? null;
        const changed = next?.id !== user?.id;
        user = next;
        if (next && changed) void adoptRemote(next);
      },
    );

    // Mirror every local change while signed in.
    const unsubscribe = subscribe(schedulePush);

    return () => {
      cancelled = true;
      if (pushTimer) clearTimeout(pushTimer);
      listener.subscription.unsubscribe();
      unsubscribe();
    };
  }, []);

  return null;
}
