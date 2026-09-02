"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";
import { DifficultyPill } from "@/components/difficulty-pill";
import { ALL_QUESTIONS, DEPTH_TOPIC_IDS, getTopic, getTrack } from "@/content";
import { composeSession } from "@/lib/session";
import { isDue } from "@/lib/srs";

const RECENT_SIGNALS = 20;
const WEAK_THRESHOLD = 0.7;

export default function TodayPage() {
  const { state, hydrated, accuracy, byTopic, level, answeredToday } =
    useProgress();

  const session = useMemo(() => {
    if (!hydrated) return [];
    return composeSession({
      questions: ALL_QUESTIONS,
      srs: state.srs,
      goal: state.dailyGoal,
      now: new Date(),
      enabledTracks: state.enabledTracks,
      accuracy,
      topicAccuracy: byTopic,
      depthTopics: DEPTH_TOPIC_IDS,
      includeDepth: state.includeDepth ?? false,
    });
  }, [
    hydrated,
    state.srs,
    state.dailyGoal,
    state.enabledTracks,
    state.includeDepth,
    accuracy,
    byTopic,
  ]);

  const dueCount = useMemo(() => {
    const now = new Date();
    return session.filter((q) => state.srs[q.id] && isDue(state.srs[q.id], now))
      .length;
  }, [session, state.srs]);

  const recent = useMemo(
    () => state.attempts.slice(-RECENT_SIGNALS).map((a) => a.correct),
    [state.attempts],
  );

  const weak = useMemo(
    () =>
      Object.entries(byTopic)
        .filter(([, value]) => value < WEAK_THRESHOLD)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 5),
    [byTopic],
  );

  const goalMet = answeredToday >= state.dailyGoal;
  const goalPercent = Math.min(
    100,
    (answeredToday / Math.max(1, state.dailyGoal)) * 100,
  );
  const upNext = session[0];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-base font-semibold">Daily goal</h1>
          <span className="font-mono text-sm tabular-nums text-text-2">
            {hydrated ? answeredToday : 0} / {state.dailyGoal}
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${
              goalMet ? "bg-green" : "bg-amber"
            }`}
            style={{ width: `${hydrated ? goalPercent : 0}%` }}
          />
        </div>

        {session.length > 0 ? (
          <>
            <Link
              href="/drill"
              className="key key-ink mt-4 block px-5 py-3.5 text-center text-lg"
            >
              {goalMet
                ? "Keep drilling"
                : answeredToday > 0
                  ? "Continue drill"
                  : "Start drill"}
            </Link>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-sm text-text-2">
              <span>
                {session.length} question{session.length === 1 ? "" : "s"}
                {dueCount > 0 ? ` · ${dueCount} due for review` : ""}
              </span>
              {upNext ? (
                <span className="flex items-center gap-1.5">
                  <span>Up next</span>
                  <span className="font-medium text-text">
                    {getTopic(upNext.topic)?.title}
                  </span>
                  <DifficultyPill difficulty={upNext.difficulty} />
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-lg border border-border bg-bg p-4 text-sm">
            <p className="font-medium">Nothing due right now</p>
            <p className="mt-1 text-text-2">
              You have answered everything available in your enabled tracks.
              Reviews come back as they fall due, or turn on another track in{" "}
              <Link href="/settings" className="font-medium text-green underline">
                Settings
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold">Needs work</h2>
          {weak.length > 0 ? (
            <ul className="mt-2.5 space-y-0.5">
              {weak.map(([topicId, value]) => {
                const topic = getTopic(topicId);
                if (!topic) return null;
                return (
                  <li key={topicId}>
                    <Link
                      href={`/topics/${topicId}`}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-surface"
                    >
                      <span className="truncate">{topic.title}</span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-red">
                        {Math.round(value * 100)}%
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-text-2">
              {state.attempts.length === 0
                ? "Answer a few questions and your weak spots show up here."
                : "Nothing below 70% yet."}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold">Recent answers</h2>
          {recent.length > 0 ? (
            <>
              <SignalStrip signals={recent} className="mt-3" />
              <p className="mt-2.5 font-mono text-xs tabular-nums text-text-2">
                {recent.filter(Boolean).length} of {recent.length} correct
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-2">No answers yet.</p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-border p-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold">{level.level.title}</h2>
          <span className="font-mono text-xs tabular-nums text-text-2">
            {level.xpToNext === null
              ? "Top level"
              : `${level.xpToNext.toLocaleString()} XP to go`}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-green transition-[width] duration-300"
            style={{ width: `${hydrated ? Math.max(1, level.progress * 100) : 0}%` }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold">Tracks</h2>
        <ul className="mt-2.5 grid gap-0.5 sm:grid-cols-2">
          {state.enabledTracks.map((trackId) => {
            const track = getTrack(trackId);
            if (!track) return null;
            const count = ALL_QUESTIONS.filter((q) => q.track === trackId).length;
            return (
              <li key={trackId}>
                <Link
                  href="/topics"
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-surface"
                >
                  <span className="truncate">{track.title}</span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-text-2">
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
