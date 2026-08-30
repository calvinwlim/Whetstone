"use client";

import { useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { ALL_QUESTIONS, TRACKS } from "@/content";
import type { TrackId } from "@/content/types";

const GOALS = [
  { value: 5, name: "Casual", note: "about 2 minutes" },
  { value: 10, name: "Regular", note: "about 5 minutes" },
  { value: 20, name: "Intense", note: "about 10 minutes" },
] as const;

export default function SettingsPage() {
  const {
    state,
    hydrated,
    setDailyGoal,
    setEnabledTracks,
    resetProgress,
  } = useProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);

  function toggleTrack(trackId: TrackId) {
    const enabled = state.enabledTracks.includes(trackId);
    // Refuse to turn off the last track -- an empty pool means no drill at all.
    if (enabled && state.enabledTracks.length === 1) return;
    setEnabledTracks(
      enabled
        ? state.enabledTracks.filter((id) => id !== trackId)
        : [...state.enabledTracks, trackId],
    );
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-32 rounded-xl bg-sunken" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pt-2">
      <header>
        <h1 className="readout text-3xl">Settings</h1>
      </header>

      <section>
        <p className="label">Daily goal</p>
        <p className="mt-1 text-sm text-muted">
          How many questions count as a day. Hitting it extends your streak.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {GOALS.map((goal) => {
            const active = state.dailyGoal === goal.value;
            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => setDailyGoal(goal.value)}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  active
                    ? "border-amber bg-amber-wash"
                    : "border-rule bg-raised hover:border-amber"
                }`}
              >
                <span className="readout block text-base">{goal.name}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {goal.value} questions · {goal.note}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="label">Tracks</p>
        <p className="mt-1 text-sm text-muted">
          Turn a track off to keep it out of your drills. Lessons stay readable
          either way.
        </p>
        <ul className="mt-3 space-y-2">
          {TRACKS.map((track) => {
            const enabled = state.enabledTracks.includes(track.id);
            const isLast = enabled && state.enabledTracks.length === 1;
            const count = ALL_QUESTIONS.filter(
              (q) => q.track === track.id,
            ).length;

            return (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => toggleTrack(track.id)}
                  disabled={isLast}
                  aria-pressed={enabled}
                  className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                    enabled
                      ? "border-amber bg-amber-wash"
                      : "border-rule bg-raised hover:border-amber"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem]">{track.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {count} questions
                      {isLast ? " · your only active track" : ""}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                      enabled ? "bg-amber" : "bg-sunken"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        enabled ? "translate-x-4" : ""
                      }`}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-rule pt-6">
        <p className="label">Progress</p>
        <p className="mt-1 text-sm text-muted">
          Progress is stored in this browser only, so it does not follow you to
          another device yet.
        </p>

        {confirmingReset ? (
          <div className="mt-3 rounded-lg border border-rust bg-rust-wash p-4">
            <p className="text-sm">
              This erases {state.attempts.length.toLocaleString()} answers, your{" "}
              {state.totalXp.toLocaleString()} XP, and your streak. It cannot be
              undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  setConfirmingReset(false);
                }}
                className="rounded-md bg-rust px-4 py-2 text-sm text-white"
              >
                Erase everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="rounded-md border border-rule px-4 py-2 text-sm"
              >
                Keep my progress
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="mt-3 rounded-md border border-rule px-4 py-2 text-sm text-muted hover:border-rust hover:text-rust"
          >
            Reset progress
          </button>
        )}
      </section>
    </div>
  );
}
