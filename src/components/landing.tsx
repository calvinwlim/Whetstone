"use client";

import Link from "next/link";
import { useState } from "react";
import { QuestionInput, hasAnswer } from "@/components/questions/question-input";
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

const TOPIC_COUNT = TRACKS.reduce((n, track) => n + track.topics.length, 0);

/** The hero's right-hand object. A real question from the bank, on the light
 *  canvas against the dark panel, so the thing being sold is the thing shown.
 *
 *  A specimen, not a test: nothing is scored or saved, and the answer can be
 *  revealed without attempting it, so nobody deciding whether to sign up feels
 *  they have walked into an assessment. */
function SampleQuestion({ question }: { question: Question }) {
  const [response, setResponse] = useState<Response | null>(null);
  const [revealed, setRevealed] = useState(false);

  const attempted = hasAnswer(question, response);
  const correct =
    attempted &&
    gradeResponse(question, response ?? { type: "mcq", optionId: null }).correct;
  const topic = getTopic(question.topic);

  return (
    <div className="rounded-card border border-border-strong bg-bg p-5 shadow-lg sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="label">{topic?.title ?? "Sample"}</p>
        <p className="text-xs text-text-2">Not scored · nothing saved</p>
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-snug">
        {question.prompt}
      </h2>

      <div className="mt-4">
        <QuestionInput
          question={question}
          value={response}
          onChange={setResponse}
          locked={revealed}
        />
      </div>

      {revealed ? (
        <div className="mt-5 border-t border-border pt-4">
          {attempted ? (
            <p
              className={`text-sm font-semibold ${
                correct ? "text-green-deep" : "text-red-deep"
              }`}
            >
              {correct ? "That is the one." : "Not that one — here is why."}
            </p>
          ) : null}

          <p className="mt-2 text-sm leading-relaxed text-text-2">
            {question.explanation}
          </p>

          {question.concepts.length > 0 ? (
            <div className="mt-4">
              <p className="label">Worth reading about</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {question.concepts.map((concept) => (
                  <a
                    key={concept}
                    href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(concept)}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-chip border border-border bg-surface px-2 py-0.5 text-xs font-medium hover:border-border-strong"
                  >
                    {concept}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="btn btn-quiet mt-4 px-3.5 py-2 text-sm"
        >
          {attempted ? "Check my answer" : "Show me the answer"}
        </button>
      )}
    </div>
  );
}

/** The circled arrow from the reference, drawn rather than imported. */
function ArrowBadge() {
  return (
    <span
      aria-hidden
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-shell text-shell-text"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8h9M8.5 4.5 12.5 8l-4 3.5" />
      </svg>
    </span>
  );
}

export function Landing() {
  const question = sampleQuestion();

  return (
    <div>
{/* Spans the whole canvas at any width rather than stopping at the
          content column, which made it read as a box floating in the page.
          100cqw measures the canvas because <main> is the query container.

          The giant word behind it is the reference's device: a backdrop made
          of type rather than an image, which costs no asset and needs no
          photography we do not have. */}
      <section className="shell-scope relative -mt-5 ml-[calc(50%-50cqw)] w-[100cqw] overflow-hidden rounded-t-canvas bg-shell px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 -left-4 select-none whitespace-nowrap text-[7rem] font-bold leading-none tracking-tighter text-shell-text opacity-[0.045] sm:text-[12rem] lg:text-[15rem]"
        >
          PRACTICE
        </span>

        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="label text-shell-text-2">Daily practice for engineers</p>

            {/* Weight does the work, as in the reference: the demand is heavy,
                the qualifier is light. */}
            <h1 className="mt-4 text-4xl leading-[0.95] tracking-tight text-shell-text sm:text-5xl lg:text-6xl">
              <span className="block font-bold">Stay sharp</span>
              <span className="mt-1.5 block font-light">
                on what you actually get asked
              </span>
            </h1>

            <p className="mt-6 max-w-md leading-relaxed text-shell-text-2">
              System design, APIs, SQL and the conversations around them. Ten
              questions a day, scheduled so the ones you get wrong come back
              before you forget them.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/drill"
                className="group inline-flex items-center gap-3 rounded-full bg-shell-text py-1.5 pl-2 pr-6 font-semibold text-shell transition-transform hover:-translate-y-0.5"
              >
                <ArrowBadge />
                Start today&apos;s drill
              </Link>
              <Link
                href="/topics"
                className="text-shell-text-2 underline underline-offset-4 hover:text-shell-text"
              >
                Browse the topics
              </Link>
            </div>
          </div>

          {question ? <SampleQuestion question={question} /> : null}
        </div>
      </section>

      <section className="mt-14 flex flex-wrap items-baseline gap-x-10 gap-y-3 border-b border-border pb-8 sm:mt-16">
        <Stat value={ALL_QUESTIONS.length.toLocaleString()} label="Questions" />
        <Stat value={String(TOPIC_COUNT)} label="Topics" />
        <Stat value={String(TRACKS.length)} label="Tracks" />
        <p className="text-sm text-text-2">
          Free, and it works without an account.
        </p>
      </section>

      <section className="mt-16 sm:mt-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>

        <div className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
          <div>
            <h3 className="text-lg font-semibold">A few minutes a day</h3>
            <p className="mt-2.5 leading-relaxed text-text-2">
              Ten questions, then you are done. Short enough to do before a
              stand-up, and the daily target moves if ten is the wrong number
              for you.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Revision that finds you</h3>
            <p className="mt-2.5 leading-relaxed text-text-2">
              Anything you get wrong returns sooner, anything you know solidly
              gets out of your way. You never have to decide what to revise.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Somewhere to go next</h3>
            <p className="mt-2.5 leading-relaxed text-text-2">
              Every answer names the ideas behind it and links out, and each
              topic has a written explanation you can read on its own.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          What is covered
        </h2>

        <ul className="mt-8 grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {TRACKS.map((track) => (
            <li key={track.id} className="border-b border-border">
              <Link
                href="/topics"
                className="flex items-baseline justify-between gap-6 py-4 hover:text-text"
              >
                <span className="font-medium">{track.title}</span>
                <span className="shrink-0 text-sm text-text-2">
                  {track.topics.length} topics
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 rounded-card bg-shell px-6 py-12 sm:mt-20 sm:px-12">
        <div className="shell-scope flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-shell-text sm:text-3xl">
              Start with today&apos;s ten
            </h2>
            <p className="mt-2 max-w-md text-shell-text-2">
              Signing in only carries your progress between devices.
            </p>
          </div>
          <Link
            href="/drill"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-shell-text py-1.5 pl-2 pr-6 font-semibold text-shell transition-transform hover:-translate-y-0.5"
          >
            <ArrowBadge />
            Start today&apos;s drill
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-2xl font-medium tabular-nums">
        {value}
      </span>
      <span className="label">{label}</span>
    </div>
  );
}
