"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";
import { getTopic, TRACKS } from "@/content";
import { isDue } from "@/lib/srs";

export default function StatsPage() {
  const { state, hydrated, today, accuracy, byTopic, byTrack, level, streak } =
    useProgress();

  const dueNow = useMemo(() => {
    const now = new Date();
    return Object.values(state.srs).filter((srs) => isDue(srs, now)).length;
  }, [state.srs]);

  const last14 = useMemo(() => {
    // Anchored to the store's day string, so building this list stays pure.
    const base = Date.parse(`${today}T00:00:00Z`);
    if (Number.isNaN(base)) return [];

    const days: { date: string; answered: number; correct: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(base - i * 86_400_000).toISOString().slice(0, 10);
      const stat = state.dailyStats[date];
      days.push({
        date,
        answered: stat?.answered ?? 0,
        correct: stat?.correct ?? 0,
      });
    }
    return days;
  }, [today, state.dailyStats]);

  const rankedTopics = useMemo(
    () =>
      Object.entries(byTopic)
        .map(([id, value]) => ({ id, value, topic: getTopic(id) }))
        .filter((entry) => entry.topic)
        .sort((a, b) => a.value - b.value),
    [byTopic],
  );

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-32 rounded-lg bg-surface" />
        <div className="h-24 rounded-xl bg-surface" />
      </div>
    );
  }

  if (state.attempts.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Stats</h1>
        <div className="mt-3 rounded-xl border border-border p-5">
          <p className="text-sm text-text-2">
            Nothing to show yet. Answer a few questions and your accuracy, weak
            topics, and review queue appear here.
          </p>
          <Link
            href="/drill"
            className="key key-green mt-4 inline-block px-4 py-2.5 text-base"
          >
            Start a drill
          </Link>
        </div>
      </div>
    );
  }

  const maxAnswered = Math.max(...last14.map((day) => day.answered), 1);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Stats</h1>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        <Metric label="Answered" value={state.attempts.length.toLocaleString()} />
        <Metric
          label="Accuracy"
          value={accuracy === undefined ? "—" : `${Math.round(accuracy * 100)}%`}
          tone={
            accuracy === undefined ? undefined : accuracy >= 0.7 ? "good" : "bad"
          }
        />
        <Metric label="Streak" value={`${streak}d`} />
        <Metric label="Due now" value={String(dueNow)} />
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">Last 14 days</h2>
        <div
          className="mt-3 flex items-end gap-1"
          role="img"
          aria-label="Questions answered per day over the last 14 days"
        >
          {last14.map((day) => (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-1.5"
              title={`${day.date}: ${day.answered} answered`}
            >
              <div
                className={`w-full rounded-[3px] ${
                  day.answered === 0 ? "bg-surface-2" : "bg-green"
                }`}
                style={{
                  height: `${Math.max(4, (day.answered / maxAnswered) * 60)}px`,
                }}
              />
              <span className="font-mono text-[10px] tabular-nums text-text-2">
                {day.date.slice(8)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">By track</h2>
        <ul className="mt-3 space-y-2.5">
          {TRACKS.map((track) => {
            const value = byTrack[track.id];
            return (
              <li key={track.id}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span>{track.title}</span>
                  <span className="font-mono text-xs tabular-nums text-text-2">
                    {value === undefined ? "—" : `${Math.round(value * 100)}%`}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full ${
                      value === undefined
                        ? "bg-transparent"
                        : value >= 0.7
                          ? "bg-green"
                          : "bg-red"
                    }`}
                    style={{ width: `${(value ?? 0) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-border">
        <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Topics you have seen</h2>
          <span className="text-xs text-text-2">Weakest first</span>
        </div>
        <ul className="divide-y divide-border">
          {rankedTopics.map(({ id, value, topic }) => {
            const history = state.attempts
              .filter((attempt) => attempt.topic === id)
              .slice(-14)
              .map((attempt) => attempt.correct);

            return (
              <li key={id}>
                <Link
                  href={`/topics/${id}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-surface"
                >
                  <span className="truncate font-medium">{topic!.title}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden sm:block">
                      <SignalStrip signals={history} />
                    </span>
                    <span
                      className={`w-10 text-right font-mono text-xs tabular-nums ${
                        value >= 0.7 ? "text-green" : "text-red"
                      }`}
                    >
                      {Math.round(value * 100)}%
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-border p-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold">{level.level.title}</h2>
          <span className="font-mono text-xs tabular-nums text-text-2">
            {state.totalXp.toLocaleString()} XP
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-green"
            style={{ width: `${Math.max(1, level.progress * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-text-2">
          {level.xpToNext === null
            ? "Top level reached"
            : `${level.xpToNext.toLocaleString()} XP to next level`}{" "}
          · Longest streak {state.streak.longest}{" "}
          {state.streak.longest === 1 ? "day" : "days"}
        </p>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="bg-bg px-4 py-3">
      <p className="text-xs font-medium text-text-2">{label}</p>
      <p
        className={`mt-0.5 text-xl font-semibold tabular-nums ${
          tone === "good" ? "text-green" : tone === "bad" ? "text-red" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
