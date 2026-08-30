"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { SignalStrip, type Signal } from "@/components/signal-strip";
import {
  QuestionInput,
  hasAnswer,
} from "@/components/questions/question-input";
import { ALL_QUESTIONS, getTopic } from "@/content";
import type { Question, Response } from "@/content/types";
import { gradeResponse } from "@/lib/grading";
import { composeSession } from "@/lib/session";
import { xpForAnswer } from "@/lib/xp";

export default function DrillPage() {
  const { state, hydrated, accuracy, byTopic, recordAnswer } = useProgress();

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(
      composeSession({
        questions: ALL_QUESTIONS,
        srs: state.srs,
        goal: state.dailyGoal,
        now: new Date(),
        enabledTracks: state.enabledTracks,
        accuracy,
        topicAccuracy: byTopic,
      }),
    );
  }, [hydrated, session, state.srs, state.dailyGoal, state.enabledTracks, accuracy, byTopic]);

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
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-6 w-40 rounded bg-sunken" />
        <div className="h-32 rounded-xl bg-sunken" />
      </div>
    );
  }

  if (session.length === 0) {
    return (
      <EmptyState
        title="Nothing due right now"
        body="You have answered everything available in your enabled tracks. Reviews return as they fall due."
      />
    );
  }

  if (index >= session.length) {
    return <SessionSummary results={results} session={session} />;
  }

  if (!question) return null;

  const topic = getTopic(question.topic);
  const correct = locked
    ? gradeResponse(question, response ?? { type: "mcq", optionId: null }).correct
    : false;

  const signals: Signal[] = session.map((_, i) =>
    i < results.length ? results[i] : null,
  );

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between gap-4">
        {/* Once answered, the tick shows its result rather than staying
            highlighted -- the strip should always read as history. */}
        <SignalStrip signals={signals} activeIndex={locked ? undefined : index} />
        <span className="font-mono text-xs text-faint">
          {index + 1} / {session.length}
        </span>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {topic ? <span className="label">{topic.title}</span> : null}
          <span className="label text-faint">
            Level {question.difficulty}
          </span>
        </div>

        {question.context ? (
          <p className="mt-4 border-l-2 border-rule pl-4 text-[0.9375rem] leading-relaxed text-muted">
            {question.context}
          </p>
        ) : null}

        <h1 className="mt-4 text-xl leading-snug font-medium">
          {question.prompt}
        </h1>
      </div>

      <div className="mt-6">
        <QuestionInput
          question={question}
          value={response}
          onChange={setResponse}
          locked={locked}
        />
      </div>

      {locked ? (
        <div className="mt-6 rounded-xl border border-rule bg-raised p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p
              className={`readout text-lg ${
                correct ? "text-verdigris" : "text-rust"
              }`}
            >
              {correct ? "Correct" : "Not quite"}
            </p>
            {correct ? (
              <span className="font-mono text-xs text-amber">
                +{xpForAnswer(true, question.difficulty)} XP
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
            {question.explanation}
          </p>

          {question.resources && question.resources.length > 0 ? (
            <div className="mt-4 border-t border-rule pt-3">
              <p className="label">Go deeper</p>
              <ul className="mt-2 space-y-1">
                {question.resources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-amber underline underline-offset-2"
                    >
                      {resource.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {topic ? (
            <Link
              href={`/topics/${topic.id}`}
              className="mt-4 inline-block text-sm text-muted underline underline-offset-2 hover:text-text"
            >
              Read the {topic.title} lesson
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6">
        {locked ? (
          <button
            type="button"
            onClick={next}
            className="w-full rounded-xl bg-amber px-5 py-4 text-[#0f1720] transition-transform hover:-translate-y-0.5"
          >
            <span className="readout text-lg">
              {index + 1 === session.length ? "Finish" : "Next"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!hasAnswer(question, response)}
            className="w-full rounded-xl bg-amber px-5 py-4 text-[#0f1720] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-sunken disabled:text-faint"
          >
            <span className="readout text-lg">Check</span>
          </button>
        )}
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
  const accuracy = results.length > 0 ? correct / results.length : 0;

  return (
    <div className="space-y-8 pt-6">
      <section>
        <p className="label">Session complete</p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="readout text-6xl leading-none">
            {correct}
            <span className="text-3xl text-muted">/{results.length}</span>
          </span>
          <span className="text-lg text-muted">
            {Math.round(accuracy * 100)}%
          </span>
        </div>
        <SignalStrip signals={results} className="mt-5" />
      </section>

      {missed.length > 0 ? (
        <section>
          <p className="label">Coming back for review</p>
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {missed.map((question) => {
              const topic = getTopic(question.topic);
              return (
                <li key={question.id} className="py-3">
                  <p className="text-sm leading-snug">{question.prompt}</p>
                  {topic ? (
                    <Link
                      href={`/topics/${topic.id}`}
                      className="mt-1 inline-block font-mono text-xs text-muted hover:text-amber"
                    >
                      {topic.title} →
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Missed questions return tomorrow, then at widening intervals as you
            get them right.
          </p>
        </section>
      ) : (
        <p className="text-sm text-muted">
          Everything correct. These questions move to a longer review interval.
        </p>
      )}

      <Link
        href="/"
        className="block rounded-xl bg-amber px-5 py-4 text-center text-[#0f1720]"
      >
        <span className="readout text-lg">Back to today</span>
      </Link>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="pt-10">
      <p className="readout text-xl">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-amber underline underline-offset-2"
      >
        Back to today
      </Link>
    </div>
  );
}
