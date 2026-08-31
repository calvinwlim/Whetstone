"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProgress } from "@/components/progress-provider";
import { SignalStrip, type Signal } from "@/components/signal-strip";
import { DifficultyPill } from "@/components/difficulty-pill";
import {
  QuestionInput,
  hasAnswer,
} from "@/components/questions/question-input";
import { ALL_QUESTIONS, getTopic } from "@/content";
import type { Question, Response } from "@/content/types";
import { gradeResponse } from "@/lib/grading";
import { composeSession } from "@/lib/session";
import { xpForAnswer } from "@/lib/xp";

/** useSearchParams needs a Suspense boundary for this route to keep
 *  prerendering as static HTML. */
export default function DrillPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-40 rounded-lg bg-surface" />
          <div className="h-28 rounded-xl bg-surface" />
        </div>
      }
    >
      <DrillSession />
    </Suspense>
  );
}

function DrillSession() {
  const { state, hydrated, accuracy, byTopic, recordAnswer } = useProgress();

  // /drill?topic=<id> drills one topic instead of the daily mix, which is what
  // the "Drill this topic" action on a topic page means.
  const focusTopicId = useSearchParams().get("topic");
  const focusTopic = focusTopicId ? getTopic(focusTopicId) : undefined;

  // Composed once when the drill opens and then frozen. Recomputing as answers
  // land would reshuffle the questions out from under the learner.
  const [session, setSession] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState<Response | null>(null);
  const [locked, setLocked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  // Deliberate one-shot snapshot: the session must be captured the moment the
  // drill opens and must NOT track later changes to srs, or answering a
  // question would recompose the list the learner is working through. The
  // lint rule cannot express "sync once from an external source", so it is
  // suppressed here rather than worked around with a less readable pattern.
  useEffect(() => {
    if (!hydrated || session !== null) return;

    const pool = focusTopicId
      ? ALL_QUESTIONS.filter((q) => q.topic === focusTopicId)
      : ALL_QUESTIONS;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(
      composeSession({
        questions: pool,
        srs: state.srs,
        goal: state.dailyGoal,
        now: new Date(),
        // A focused drill is an explicit choice, so it ignores the track
        // toggles and the difficulty band -- you asked for this topic.
        enabledTracks: focusTopicId ? undefined : state.enabledTracks,
        accuracy: focusTopicId ? undefined : accuracy,
        topicAccuracy: byTopic,
      }),
    );
  }, [
    hydrated,
    session,
    focusTopicId,
    state.srs,
    state.dailyGoal,
    state.enabledTracks,
    accuracy,
    byTopic,
  ]);

  const question = session?.[index];

  const submit = useCallback(() => {
    if (!question || !response || locked) return;
    const { correct } = gradeResponse(question, response);
    setLocked(true);
    setResults((current) => [...current, correct]);
    recordAnswer(question, correct);
  }, [question, response, locked, recordAnswer]);

  const next = useCallback(() => {
    setIndex((current) => current + 1);
    setResponse(null);
    setLocked(false);
  }, []);

  // Enter submits, then advances. Keeps a desktop session on the keyboard.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "SELECT") return;
      event.preventDefault();
      if (locked) next();
      else if (question && hasAnswer(question, response)) submit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [locked, next, submit, question, response]);

  if (!hydrated || session === null) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-40 rounded-lg bg-surface" />
        <div className="h-28 rounded-xl bg-surface" />
      </div>
    );
  }

  if (session.length === 0) {
    return (
      <div className="rounded-xl border border-border p-5">
        <p className="font-semibold">
          {focusTopic
            ? `Nothing due in ${focusTopic.title}`
            : "Nothing due right now"}
        </p>
        <p className="mt-1 text-sm text-text-2">
          {focusTopic
            ? "You have answered every question in this topic. They return as they fall due for review."
            : "You have answered everything available in your enabled tracks. Reviews return as they fall due."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/" className="key key-plain inline-block px-4 py-2 text-sm">
            Back to today
          </Link>
          {focusTopic ? (
            <Link
              href="/drill"
              className="key key-green inline-block px-4 py-2 text-sm"
            >
              Today&apos;s drill
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  if (index >= session.length) {
    return <SessionSummary results={results} session={session} />;
  }

  if (!question) return null;

  const topic = getTopic(question.topic);
  const resources = question.resources ?? topic?.resources ?? [];
  const correct = locked
    ? gradeResponse(question, response ?? { type: "mcq", optionId: null }).correct
    : false;

  const signals: Signal[] = session.map((_, i) =>
    i < results.length ? results[i] : null,
  );

  return (
    <div className="pb-32 sm:pb-0">
      {focusTopic ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
          <span>
            Drilling <span className="font-semibold">{focusTopic.title}</span>
          </span>
          <Link href="/drill" className="text-text-2 underline hover:text-green">
            Switch to today&apos;s drill
          </Link>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <SignalStrip
          signals={signals}
          activeIndex={locked ? undefined : index}
        />
        <span className="font-mono text-sm tabular-nums text-text-2">
          {index + 1}/{session.length}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {topic ? (
          <Link
            href={`/topics/${topic.id}`}
            className="text-sm font-medium text-text-2 hover:text-green hover:underline"
          >
            {topic.title}
          </Link>
        ) : null}
        <DifficultyPill difficulty={question.difficulty} />
      </div>

      {question.context ? (
        <p className="mt-3 rounded-lg border-l-[3px] border-border-strong bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-text-2">
          {question.context}
        </p>
      ) : null}

      <h1 className="mt-3 text-lg font-semibold leading-snug">
        {question.prompt}
      </h1>

      <div className="mt-4">
        <QuestionInput
          question={question}
          value={response}
          onChange={setResponse}
          locked={locked}
        />
      </div>

      {locked ? (
        <div
          className={`mt-4 rounded-xl border-[1.5px] p-4 ${
            correct
              ? "border-green bg-green-wash"
              : "border-red bg-red-wash"
          }`}
        >
          <div className="flex items-baseline justify-between gap-4">
            <p
              className={`font-semibold ${correct ? "text-green-deep" : "text-red-deep"}`}
            >
              {correct ? "Correct" : "Not quite"}
            </p>
            {correct ? (
              <span className="font-mono text-sm tabular-nums text-green-deep">
                +{xpForAnswer(true, question.difficulty)} XP
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm leading-relaxed">{question.explanation}</p>

          {/* Questions rarely carry their own links, so fall back to the
              topic's -- otherwise this panel would almost never appear. */}
          {resources.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {resources.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm font-medium underline underline-offset-2"
                  >
                    {resource.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Pinned on a phone so the action is always under your thumb. */}
      <div className="fixed inset-x-0 bottom-14 z-10 border-t border-border bg-bg px-4 py-3 sm:static sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto max-w-5xl">
          {locked ? (
            <button
              type="button"
              onClick={next}
              className="key key-green w-full px-5 py-3.5 text-lg"
            >
              {index + 1 === session.length ? "Finish" : "Next"}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!hasAnswer(question, response)}
              className={`key w-full px-5 py-3.5 text-lg ${
                hasAnswer(question, response)
                  ? "key-green"
                  : "bg-surface-2 text-text-2"
              }`}
            >
              Check
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionSummary({
  results,
  session,
}: {
  results: boolean[];
  session: Question[];
}) {
  const correct = results.filter(Boolean).length;
  const missed = session.filter((_, i) => results[i] === false);
  const percent =
    results.length > 0 ? Math.round((correct / results.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border p-5 text-center">
        <p className="text-sm font-medium text-text-2">Session complete</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {correct}
          <span className="text-text-2">/{results.length}</span>
          <span className="ml-2 text-xl font-semibold text-text-2">
            {percent}%
          </span>
        </p>
        <SignalStrip signals={results} className="mt-3 justify-center" />
      </section>

      {missed.length > 0 ? (
        <section className="rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold">Coming back for review</h2>
          <ul className="mt-2 divide-y divide-border">
            {missed.map((question) => {
              const topic = getTopic(question.topic);
              return (
                <li key={question.id} className="py-2.5">
                  <p className="text-sm leading-snug">{question.prompt}</p>
                  {topic ? (
                    <Link
                      href={`/topics/${topic.id}`}
                      className="mt-1 inline-block text-xs font-medium text-text-2 hover:text-green hover:underline"
                    >
                      {topic.title}
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-text-2">
            These return tomorrow, then at widening intervals as you get them
            right.
          </p>
        </section>
      ) : (
        <p className="rounded-xl border border-border p-4 text-sm text-text-2">
          Everything correct. These questions move to a longer review interval.
        </p>
      )}

      <div className="flex gap-2">
        <Link
          href="/"
          className="key key-green flex-1 px-5 py-3 text-center text-base"
        >
          Back to today
        </Link>
      </div>
    </div>
  );
}
