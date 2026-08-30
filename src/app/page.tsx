"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";
import { ALL_QUESTIONS, getTopic } from "@/content";
import { composeSession } from "@/lib/session";
import { isDue } from "@/lib/srs";

const RECENT_SIGNALS = 30;
const WEAK_TOPIC_THRESHOLD = 0.7;

export default function TodayPage() {
  const {
    state,
    hydrated,
    accuracy,
    byTopic,
    level,
    streak,
    answeredToday,
  } = useProgress();

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
    });
  }, [hydrated, state.srs, state.dailyGoal, state.enabledTracks, accuracy, byTopic]);

  const dueCount = useMemo(() => {
    const now = new Date();
    return session.filter((q) => state.srs[q.id] && isDue(state.srs[q.id], now))
      .length;
  }, [session, state.srs]);

  const recent = useMemo(() => {
    const results = state.attempts.slice(-RECENT_SIGNALS).map((a) => a.correct);
    const padding = Array<null>(Math.max(0, RECENT_SIGNALS - results.length)).fill(
      null,
    );
    return [...padding, ...results];
  }, [state.attempts]);

  const weakTopics = useMemo(
    () =>
      Object.entries(byTopic)
        .filter(([, value]) => value < WEAK_TOPIC_THRESHOLD)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 4),
    [byTopic],
  );

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-6 pt-4">
        <div className="h-24 rounded-xl bg-sunken" />
        <div className="h-20 rounded-xl bg-sunken" />
      </div>
    );
  }

  const goalMet = answeredToday >= state.dailyGoal;
  const isFirstEver = state.attempts.length === 0;

  return (
    <div className="space-y-10 pt-2">
      <section>
        <p className="label">Streak</p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="readout text-6xl leading-none">{streak}</span>
          <span className="text-lg text-muted">
            {streak === 1 ? "day" : "days"}
          </span>
        </div>
        <SignalStrip
          signals={recent}
          label={
            isFirstEver ? "No answers yet" : `Last ${RECENT_SIGNALS} answers`
          }
          className="mt-5"
        />
      </section>

      <section>
        {session.length > 0 ? (
          <Link
            href="/drill"
            className="group block rounded-xl bg-amber px-5 py-5 text-[#0f1720] transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="readout text-2xl">
                  {goalMet ? "Keep going" : "Start today's drill"}
                </p>
                <p className="mt-1 text-sm opacity-80">
                  {session.length}{" "}
                  {session.length === 1 ? "question" : "questions"}
                  {dueCount > 0
                    ? ` · ${dueCount} due for review`
                    : " · all new material"}
                </p>
              </div>
              <span
                aria-hidden
                className="text-2xl transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl border border-rule bg-raised px-5 py-6">
            <p className="readout text-xl">Nothing due right now</p>
            <p className="mt-1.5 text-sm text-muted">
              You have answered everything available in your enabled tracks.
              Reviews will come back as they fall due — or turn on another track
              in <Link href="/settings" className="text-amber underline">Settings</Link>.
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-muted">
          <span>
            {answeredToday} of {state.dailyGoal} answered today
          </span>
          {goalMet ? (
            <span className="text-verdigris">Goal met</span>
          ) : null}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <p className="label">{level.level.title}</p>
          <p className="font-mono text-xs text-faint">
            {state.totalXp.toLocaleString()} XP
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunken">
          <div
            className="h-full rounded-full bg-amber transition-all"
            style={{ width: `${Math.max(2, level.progress * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {level.xpToNext === null
            ? "Top level reached"
            : `${level.xpToNext.toLocaleString()} XP to next level`}
        </p>
      </section>

      {weakTopics.length > 0 ? (
        <section>
          <p className="label">Needs attention</p>
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {weakTopics.map(([topicId, value]) => {
              const topic = getTopic(topicId);
              if (!topic) return null;
              return (
                <li key={topicId}>
                  <Link
                    href={`/topics/${topicId}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm hover:text-amber"
                  >
                    <span>{topic.title}</span>
                    <span className="font-mono text-xs text-muted">
                      {Math.round(value * 100)}%
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
