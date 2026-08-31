"use client";

import { useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { ALL_QUESTIONS, TRACKS } from "@/content";
import type { TrackId } from "@/content/types";

const GOALS = [
  { value: 5, name: "Casual", note: "~2 min" },
  { value: 10, name: "Regular", note: "~5 min" },
  { value: 20, name: "Intense", note: "~10 min" },
] as const;

export default function SettingsPage() {
  const {
    state,
    hydrated,
    setDailyGoal,
    setEnabledTracks,
    setIncludeDepth,
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
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-32 rounded-lg bg-surface" />
        <div className="h-28 rounded-xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">Daily goal</h2>
        <p className="mt-1 text-sm text-text-2">
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
                aria-pressed={active}
                className={`tile px-3.5 py-2.5 text-left ${active ? "tile-on" : ""}`}
              >
                <span className="block font-semibold">{goal.name}</span>
                <span className="mt-0.5 block text-xs text-text-2">
                  {goal.value} questions · {goal.note}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">Tracks</h2>
        <p className="mt-1 text-sm text-text-2">
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
                  className={`tile flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-left disabled:cursor-not-allowed ${
                    enabled ? "tile-on" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{track.title}</span>
                    <span className="mt-0.5 block text-xs text-text-2">
                      {count} questions
                      {isLast ? " · your only active track" : ""}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-6 w-10 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                      enabled ? "bg-green" : "bg-surface-2"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
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


      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">Specialist depth</h2>
        <p className="mt-1 text-sm text-text-2">
          Some topics are specialist rather than everyday software engineering
          — DNS, sharding, enterprise identity, product analytics. They stay
          fully readable and drillable on their own; this decides whether they
          also appear in your daily mix.
        </p>
        <button
          type="button"
          onClick={() => setIncludeDepth(!(state.includeDepth ?? false))}
          aria-pressed={state.includeDepth ?? false}
          className={`tile mt-3 flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-left ${
            state.includeDepth ? "tile-on" : ""
          }`}
        >
          <span className="min-w-0">
            <span className="block font-medium">Include depth topics</span>
            <span className="mt-0.5 block text-xs text-text-2">
              {state.includeDepth
                ? "Depth topics appear in daily drills"
                : "Daily drills stay on core engineering topics"}
            </span>
          </span>
          <span
            aria-hidden
            className={`flex h-6 w-10 shrink-0 items-center rounded-full px-0.5 transition-colors ${
              state.includeDepth ? "bg-green" : "bg-surface-2"
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                state.includeDepth ? "translate-x-4" : ""
              }`}
            />
          </span>
        </button>
      </section>
      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">Progress</h2>
        <p className="mt-1 text-sm text-text-2">
          Stored in this browser only, so it does not follow you to another
          device yet.
        </p>

        {confirmingReset ? (
          <div className="mt-3 rounded-lg border-[1.5px] border-red bg-red-wash p-3.5">
            <p className="text-sm">
              This erases {state.attempts.length.toLocaleString()} answers, your{" "}
              {state.totalXp.toLocaleString()} XP, and your streak. It cannot be
              undone.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  setConfirmingReset(false);
                }}
                className="rounded-lg bg-red px-3.5 py-2 text-sm font-semibold text-white"
              >
                Erase everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium"
              >
                Keep my progress
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="mt-3 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-text-2 hover:border-red hover:text-red"
          >
            Reset progress
          </button>
        )}
      </section>
    </div>
  );
}
