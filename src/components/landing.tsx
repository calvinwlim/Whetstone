"use client";

import Link from "next/link";
import { useState } from "react";
import { QuestionInput, hasAnswer } from "@/components/questions/question-input";
import { DifficultyPill } from "@/components/difficulty-pill";
import { Field } from "@/components/field";
import { ALL_QUESTIONS, TRACKS, getQuestion, getTopic } from "@/content";
import type { Question, Response } from "@/content/types";
import { gradeResponse } from "@/lib/grading";

/** Authentication vs authorisation: short, universally relevant, and it
 *  carries three concepts worth looking up, so one question demonstrates the
 *  whole loop. Falls back to any easy multiple-choice question if that id ever
 *  stops existing, so the front door cannot break on a content edit. */
function sampleQuestion(): Question | undefined {
  return (
    getQuestion("sd-sec-001") ??
    ALL_QUESTIONS.find((q) => q.type === "mcq" && q.difficulty <= 2)
  );
}

function TryOne({ question }: { question: Question }) {
  const [response, setResponse] = useState<Response | null>(null);
  const [locked, setLocked] = useState(false);

  const correct = locked
    ? gradeResponse(question, response ?? { type: "mcq", optionId: null })
        .correct
    : false;
  const topic = getTopic(question.topic);

  return (
    <div className="rounded-card border border-border p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="label">Try one</span>
        {topic ? (
          <span className="text-sm text-text-2">{topic.title}</span>
        ) : null}
        <DifficultyPill difficulty={question.difficulty} />
      </div>

      <h2 className="mt-2.5 text-lg font-semibold leading-snug">
        {question.prompt}
      </h2>

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
          className={`mt-4 rounded-control border-[1.5px] p-3.5 ${
            correct ? "border-green bg-green-wash" : "border-red bg-red-wash"
          }`}
        >
          <p
            className={`font-semibold ${correct ? "text-green-deep" : "text-red-deep"}`}
          >
            {correct ? "Correct" : "Not quite"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            {question.explanation}
          </p>

          {question.concepts.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-text-2">Look up</span>
              {question.concepts.map((concept) => (
                <a
                  key={concept}
                  href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(concept)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-chip border border-border bg-bg px-2 py-0.5 text-xs font-medium hover:border-border-strong"
                >
                  {concept}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        {locked ? (
          <Link
            href="/drill"
            className="key key-ink inline-block px-4 py-2.5 text-[0.9375rem]"
          >
            Start today&apos;s drill
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setLocked(true)}
            disabled={!hasAnswer(question, response)}
            className={`key px-5 py-2.5 text-[0.9375rem] ${
              hasAnswer(question, response)
                ? "key-ink"
                : "bg-surface-2 text-text-2"
            }`}
          >
            Check
          </button>
        )}
      </div>
    </div>
  );
}

/** What someone sees at / before they have answered anything. It is also what
 *  a crawler sees, since progress lives in the browser and the server always
 *  renders the empty state. */
export function Landing() {
  const question = sampleQuestion();

  return (
    <div>
      <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Daily practice for the things you get asked about
      </h1>
      <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed text-text-2">
        System design, APIs, SQL, and the rest of what comes up in interviews
        and design reviews. Answer ten questions a day; the ones you get wrong
        come back sooner.
      </p>

      <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-3 border-y border-border py-3">
        <Field label="Questions" value={ALL_QUESTIONS.length.toLocaleString()} />
        <Field
          label="Topics"
          value={String(TRACKS.reduce((n, t) => n + t.topics.length, 0))}
        />
        <Field label="Tracks" value={String(TRACKS.length)} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href="/drill"
          className="key key-ink px-5 py-3 text-base sm:text-lg"
        >
          Start today&apos;s drill
        </Link>
        <p className="text-sm text-text-2">
          No account needed. Progress saves in this browser; signing in only
          adds syncing between devices.
        </p>
      </div>

      {question ? (
        <div className="mt-8">
          <TryOne question={question} />
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">How it works</h2>
        <dl className="mt-3 divide-y divide-border border-y border-border">
          <div className="grid gap-1 py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
            <dt className="font-medium">Short sessions</dt>
            <dd className="text-sm leading-relaxed text-text-2">
              Ten questions is a few minutes. Hitting your daily goal extends a
              streak, and the goal is adjustable if ten is the wrong number for
              you.
            </dd>
          </div>
          <div className="grid gap-1 py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
            <dt className="font-medium">Wrong answers come back</dt>
            <dd className="text-sm leading-relaxed text-text-2">
              Every question is scheduled by how well you knew it, so revision
              arrives about when you were going to forget it, and questions you
              have solid stop taking up your time.
            </dd>
          </div>
          <div className="grid gap-1 py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
            <dt className="font-medium">Every answer names its concepts</dt>
            <dd className="text-sm leading-relaxed text-text-2">
              The terms behind each question are listed so you can go and read
              about them properly. Often that reading is where the learning
              actually happens.
            </dd>
          </div>
          <div className="grid gap-1 py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
            <dt className="font-medium">Written lessons too</dt>
            <dd className="text-sm leading-relaxed text-text-2">
              Each topic has a short written explanation you can read on its
              own, without answering anything.{" "}
              <Link
                href="/topics"
                className="font-medium text-text underline underline-offset-2"
              >
                Browse all topics
              </Link>
              .
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">What is covered</h2>
        <ul className="mt-3 grid gap-x-8 gap-y-0 sm:grid-cols-2">
          {TRACKS.map((track) => {
            const count = ALL_QUESTIONS.filter(
              (q) => q.track === track.id,
            ).length;
            return (
              <li key={track.id} className="border-b border-border">
                <Link
                  href="/topics"
                  className="flex items-baseline justify-between gap-4 py-2.5 text-sm hover:text-text"
                >
                  <span className="font-medium">{track.title}</span>
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
