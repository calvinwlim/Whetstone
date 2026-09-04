"use client";

import { useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { ALL_QUESTIONS, TRACKS } from "@/content";
import type { TrackId } from "@/content/types";

const GOALS = [
  { value: 5, name: "Regular", note: "~2 min" },
  { value: 10, name: "Focused", note: "~5 min" },
  { value: 20, name: "Intense", note: "~10 min" },
] as const;

/** The switch used by every toggle row. Achromatic when on, like every other
 *  affirmative control -- green is reserved for correctness. */
function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
        on ? "bg-ink" : "bg-surface-2"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-bg shadow-sm transition-transform ${
          on ? "translate-x-4" : ""
        }`}
      />
    </span>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 max-w-xl text-sm text-text-2">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

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
        <div className="h-8 w-32 rounded-control bg-surface" />
        <div className="h-28 rounded-card bg-surface" />
      </div>
    );
  }

  const depthOn = state.includeDepth ?? false;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Section
        title="Daily goal"
        description="How many questions count as a day. Hitting it extends your streak."
      >
        <div className="inline-flex rounded-control border border-border p-0.5">
          {GOALS.map((goal) => {
            const active = state.dailyGoal === goal.value;
            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => setDailyGoal(goal.value)}
                aria-pressed={active}
                className={`btn rounded-chip px-3 py-1.5 text-sm ${
                  active ? "btn-primary" : "text-text-2 hover:text-text"
                }`}
              >
                {goal.name}
                <span
                  className={`ml-1.5 font-mono text-xs tabular-nums ${
                    active ? "opacity-70" : "opacity-60"
                  }`}
                >
                  {goal.value}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-text-2">
          {GOALS.find((goal) => goal.value === state.dailyGoal)?.note} a day at
          your current pace.
        </p>
      </Section>

      <Section
        title="Tracks"
        description="Turn a track off to keep it out of your drills. Lessons stay readable either way."
      >
        <ul className="divide-y divide-border border-y border-border">
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
                  className="flex w-full items-center justify-between gap-4 py-2.5 text-left transition-colors hover:bg-surface disabled:cursor-not-allowed"
                >
                  <span className="min-w-0 pl-1">
                    <span
                      className={`block text-sm font-medium ${enabled ? "" : "text-text-2"}`}
                    >
                      {track.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-2">
                      <span className="font-mono tabular-nums">{count}</span>{" "}
                      questions
                      {isLast ? " · your only active track" : ""}
                    </span>
                  </span>
                  <span className="pr-1">
                    <Switch on={enabled} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        title="Specialist depth"
        description="Some topics are specialist rather than everyday software engineering — DNS, sharding, enterprise identity, product analytics. They stay fully readable and drillable on their own; this decides whether they also appear in your daily mix."
      >
        <button
          type="button"
          onClick={() => setIncludeDepth(!depthOn)}
          aria-pressed={depthOn}
          className="flex w-full items-center justify-between gap-4 border-y border-border py-2.5 text-left transition-colors hover:bg-surface"
        >
          <span className="min-w-0 pl-1">
            <span className="block text-sm font-medium">
              Include depth topics
            </span>
            <span className="mt-0.5 block text-xs text-text-2">
              {depthOn
                ? "Depth topics appear in daily drills"
                : "Daily drills stay on core engineering topics"}
            </span>
          </span>
          <span className="pr-1">
            <Switch on={depthOn} />
          </span>
        </button>
      </Section>

      <Section
        title="Progress"
        description="Stored in this browser, and synced to your account when you are signed in."
      >
        {confirmingReset ? (
          <div className="rounded-card border-[1.5px] border-red bg-red-wash p-3.5">
            <p className="text-sm">
              This erases {state.totals.answered.toLocaleString()} answers, your{" "}
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
                className="btn bg-red px-3.5 py-2 text-sm text-white"
              >
                Erase everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="btn btn-quiet px-3.5 py-2 text-sm"
              >
                Keep my progress
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="btn btn-quiet px-3.5 py-2 text-sm text-text-2 hover:border-red hover:text-red"
          >
            Reset progress
          </button>
        )}
      </Section>
    </div>
  );
}
