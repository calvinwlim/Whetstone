"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";
import { Field } from "@/components/field";
import { getTopic, TRACKS } from "@/content";
import { isDue } from "@/lib/srs";

const CHART_HEIGHT = 56;

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
        <div className="h-8 w-32 rounded-control bg-surface" />
        <div className="h-24 rounded-card bg-surface" />
      </div>
    );
  }

  if (state.attempts.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <div className="mt-4 rounded-card border border-border p-5">
          <p className="text-sm text-text-2">
            Nothing to show yet. Answer a few questions and your accuracy, weak
            topics, and review queue appear here.
          </p>
          <Link
            href="/drill"
            className="key key-ink mt-4 inline-block px-4 py-2.5 text-base"
          >
            Start a drill
          </Link>
        </div>
      </div>
    );
  }

  const maxAnswered = Math.max(...last14.map((day) => day.answered), 1);
  const totalCorrect = last14.reduce((sum, day) => sum + day.correct, 0);
  const totalAnswered = last14.reduce((sum, day) => sum + day.answered, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>

      <div className="mt-3 flex flex-wrap items-start gap-x-8 gap-y-3 border-y border-border py-3">
        <Field label="Answered" value={state.attempts.length.toLocaleString()} />
        <Field
          label="Accuracy"
          value={accuracy === undefined ? "—" : `${Math.round(accuracy * 100)}%`}
          tone={
            accuracy === undefined ? undefined : accuracy >= 0.7 ? "good" : "bad"
          }
        />
        <Field label="Day streak" value={String(streak)} />
        <Field label="Due now" value={String(dueNow)} />
      </div>

      <section className="mt-5 rounded-card border border-border p-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold">Last 14 days</h2>
          <span className="font-mono text-xs tabular-nums text-text-2">
            {totalCorrect}/{totalAnswered} correct
          </span>
        </div>

        {/* Bar height is volume; the filled portion is what you got right. The
            neutral remainder is deliberate -- a bar is not "wrong", it is just
            the part that was not correct. */}
        <div
          className="mt-3 flex items-end gap-1"
          role="img"
          aria-label={`Questions answered per day over the last 14 days: ${totalCorrect} correct of ${totalAnswered}`}
        >
          {last14.map((day) => {
            const height = Math.max(
              3,
              (day.answered / maxAnswered) * CHART_HEIGHT,
            );
            const correctFraction =
              day.answered > 0 ? day.correct / day.answered : 0;

            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1.5"
                title={`${day.date}: ${day.correct}/${day.answered} correct`}
              >
                <div
                  className="flex w-full flex-col justify-end overflow-hidden rounded-[3px] bg-surface-2"
                  style={{ height: `${height}px` }}
                >
                  {day.answered > 0 ? (
                    <div
                      className="w-full bg-green"
                      style={{ height: `${correctFraction * 100}%` }}
                    />
                  ) : null}
                </div>
                <span className="font-mono text-[10px] tabular-nums text-text-2">
                  {day.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-card border border-border p-4">
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
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
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

      <section className="mt-4 rounded-card border border-border">
        <div className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Topics you have seen</h2>
          <span className="label">Weakest first</span>
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

      <div className="mt-4 flex items-center gap-3 text-xs text-text-2">
        <span className="shrink-0 font-medium">{level.level.title}</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
          <span
            className="block h-full rounded-full bg-border-strong"
            style={{ width: `${Math.max(1, level.progress * 100)}%` }}
          />
        </span>
        <span className="shrink-0 font-mono tabular-nums">
          {state.totalXp.toLocaleString()} XP
          {level.xpToNext === null
            ? " · top level"
            : ` · ${level.xpToNext.toLocaleString()} to go`}
          {" · longest streak "}
          {state.streak.longest}d
        </span>
      </div>
    </div>
  );
}
