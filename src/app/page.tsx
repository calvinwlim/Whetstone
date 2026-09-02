"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";
import { DifficultyPill } from "@/components/difficulty-pill";
import { Field } from "@/components/field";
import { ALL_QUESTIONS, DEPTH_TOPIC_IDS, getTopic } from "@/content";
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

  // Everything due, not just what fits in today's session -- the strip is
  // reporting the size of the backlog, which is the useful number.
  const dueTotal = useMemo(() => {
    const now = new Date();
    return Object.values(state.srs).filter((srs) => isDue(srs, now)).length;
  }, [state.srs]);

  const dueInSession = useMemo(() => {
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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Today</h1>

      <div className="mt-3 flex flex-wrap items-start gap-x-8 gap-y-3 border-y border-border py-3">
        <Field
          label="Answered today"
          value={`${hydrated ? answeredToday : 0}/${state.dailyGoal}`}
        />
        <Field label="Day streak" value={String(hydrated ? state.streak.current : 0)} />
        <Field label="Due now" value={String(hydrated ? dueTotal : 0)} />
        <Field label="Level">
          <span className="font-sans text-base font-semibold">
            {level.level.title}
          </span>
        </Field>
      </div>

      <section className="mt-5 rounded-card border border-border p-4">
        <div className="h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-300"
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

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-text-2">
              <span>
                {session.length} question{session.length === 1 ? "" : "s"}
                {dueInSession > 0 ? ` · ${dueInSession} due for review` : ""}
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
          <div className="mt-4">
            <p className="font-medium">Nothing due right now</p>
            <p className="mt-1 text-sm text-text-2">
              You have answered everything available in your enabled tracks.
              Reviews come back as they fall due, or turn on another track in{" "}
              <Link
                href="/settings"
                className="font-medium text-text underline underline-offset-2"
              >
                Settings
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-card border border-border p-4">
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
                      className="flex items-center justify-between gap-3 rounded-control px-2 py-1.5 text-sm hover:bg-surface"
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

        <section className="rounded-card border border-border p-4">
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

      {/* Level was a card of its own for one progress bar. It is a footer. */}
      <div className="mt-4 flex items-center gap-3 text-xs text-text-2">
        <span className="shrink-0 font-medium">{level.level.title}</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
          <span
            className="block h-full rounded-full bg-border-strong"
            style={{
              width: `${hydrated ? Math.max(1, level.progress * 100) : 0}%`,
            }}
          />
        </span>
        <span className="shrink-0 font-mono tabular-nums">
          {level.xpToNext === null
            ? "Top level"
            : `${level.xpToNext.toLocaleString()} XP to go`}
        </span>
      </div>
    </div>
  );
}
