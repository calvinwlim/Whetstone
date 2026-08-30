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
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-24 rounded-xl bg-sunken" />
        <div className="h-40 rounded-xl bg-sunken" />
      </div>
    );
  }

  if (state.attempts.length === 0) {
    return (
      <div className="pt-10">
        <h1 className="readout text-3xl">Stats</h1>
        <p className="mt-2 text-sm text-muted">
          Nothing to show yet. Answer a few questions and your accuracy, weak
          topics, and review queue will appear here.
        </p>
        <Link
          href="/drill"
          className="mt-6 inline-block rounded-xl bg-amber px-5 py-3 text-[#0f1720]"
        >
          <span className="readout">Start a drill</span>
        </Link>
      </div>
    );
  }

  const maxAnswered = Math.max(...last14.map((day) => day.answered), 1);

  return (
    <div className="space-y-10 pt-2">
      <header>
        <h1 className="readout text-3xl">Stats</h1>
      </header>

      <section className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-rule py-5 sm:grid-cols-4">
        <Metric label="Answered" value={state.attempts.length.toLocaleString()} />
        <Metric
          label="Accuracy"
          value={accuracy === undefined ? "—" : `${Math.round(accuracy * 100)}%`}
          tone={
            accuracy === undefined
              ? undefined
              : accuracy >= 0.7
                ? "good"
                : "bad"
          }
        />
        <Metric label="Streak" value={`${streak}d`} />
        <Metric label="Due now" value={String(dueNow)} />
      </section>

      <section>
        <p className="label">Last 14 days</p>
        <div className="mt-3 flex items-end gap-1.5" role="img" aria-label="Questions answered per day over the last 14 days">
          {last14.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-[2px] ${
                  day.answered === 0 ? "bg-sunken" : "bg-amber"
                }`}
                style={{
                  height: `${Math.max(3, (day.answered / maxAnswered) * 56)}px`,
                }}
              />
              <span className="font-mono text-[0.625rem] text-faint">
                {day.date.slice(8)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="label">By track</p>
        <ul className="mt-3 space-y-3">
          {TRACKS.map((track) => {
            const value = byTrack[track.id];
            return (
              <li key={track.id}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span>{track.title}</span>
                  <span className="font-mono text-xs text-muted">
                    {value === undefined ? "—" : `${Math.round(value * 100)}%`}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div
                    className={`h-full rounded-full ${
                      value === undefined
                        ? "bg-transparent"
                        : value >= 0.7
                          ? "bg-verdigris"
                          : "bg-rust"
                    }`}
                    style={{ width: `${(value ?? 0) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <p className="label">Every topic you have seen</p>
        <p className="mt-1 text-xs text-muted">Weakest first.</p>
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {rankedTopics.map(({ id, value, topic }) => {
            const history = state.attempts
              .filter((attempt) => attempt.topic === id)
              .slice(-16)
              .map((attempt) => attempt.correct);

            return (
              <li key={id}>
                <Link
                  href={`/topics/${id}`}
                  className="flex items-center justify-between gap-4 py-3 hover:text-amber"
                >
                  <span className="text-sm">{topic!.title}</span>
                  <span className="flex items-center gap-3">
                    <SignalStrip signals={history} />
                    <span
                      className={`w-10 text-right font-mono text-xs ${
                        value >= 0.7 ? "text-verdigris" : "text-rust"
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

      <section>
        <p className="label">Level</p>
        <p className="readout mt-1 text-xl">{level.level.title}</p>
        <p className="mt-1 text-sm text-muted">
          {state.totalXp.toLocaleString()} XP
          {level.xpToNext === null
            ? " · top level"
            : ` · ${level.xpToNext.toLocaleString()} to next`}
        </p>
        <p className="mt-1 text-xs text-faint">
          Longest streak: {state.streak.longest}{" "}
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
    <div>
      <p className="label">{label}</p>
      <p
        className={`readout mt-0.5 text-2xl ${
          tone === "good"
            ? "text-verdigris"
            : tone === "bad"
              ? "text-rust"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
