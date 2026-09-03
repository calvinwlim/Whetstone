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

/** A specimen, not a test. Nothing is scored, nothing is saved, and the answer
 *  can be revealed without attempting it -- someone deciding whether to sign
 *  up should not feel they have walked into an assessment. */
function SampleQuestion({ question }: { question: Question }) {
  const [response, setResponse] = useState<Response | null>(null);
  const [revealed, setRevealed] = useState(false);

  const attempted = hasAnswer(question, response);
  const correct =
    attempted &&
    gradeResponse(question, response ?? { type: "mcq", optionId: null }).correct;
  const topic = getTopic(question.topic);

  return (
    <div className="rounded-card border border-border bg-surface p-5 sm:p-7">
      <p className="label">{topic?.title ?? "Sample"}</p>

      <h3 className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">
        {question.prompt}
      </h3>

      <div className="mt-6">
        <QuestionInput
          question={question}
          value={response}
          onChange={setResponse}
          locked={revealed}
        />
      </div>

      {revealed ? (
        <div className="mt-6 border-t border-border pt-5">
          {attempted ? (
            <p
              className={`text-sm font-semibold ${
                correct ? "text-green-deep" : "text-red-deep"
              }`}
            >
              {correct ? "That is the one." : "Not that one — here is why."}
            </p>
          ) : null}

          <p className="mt-2 leading-relaxed text-text-2">
            {question.explanation}
          </p>

          {question.concepts.length > 0 ? (
            <div className="mt-5">
              <p className="label">Worth reading about</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {question.concepts.map((concept) => (
                  <a
                    key={concept}
                    href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(concept)}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-chip border border-border bg-bg px-2.5 py-1 text-sm font-medium hover:border-border-strong"
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
          className="btn btn-quiet mt-6 px-4 py-2.5 text-sm"
        >
          {attempted ? "Check my answer" : "Show me the answer"}
        </button>
      )}
    </div>
  );
}

export function Landing() {
  const question = sampleQuestion();

  return (
    <div>
      {/* Bleeds to the canvas edges, cancelling the shell's own padding, so the
          opening is a full panel rather than a paragraph in a column. */}
      <section className="shell-scope -mx-4 -mt-5 rounded-t-canvas bg-shell px-6 py-20 sm:-mx-6 sm:px-12 sm:py-28 lg:py-36">
        <p className="label text-shell-text-2">Daily practice for engineers</p>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-shell-text sm:text-5xl lg:text-6xl">
          Stay sharp on what you actually get asked
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-shell-text-2">
          System design, APIs, SQL and the conversations around them. Ten
          questions a day, scheduled so the ones you get wrong come back before
          you forget them.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href="/drill"
            className="key key-shell px-7 py-3.5 text-base font-semibold"
          >
            Start today&apos;s drill
          </Link>
          <Link
            href="/topics"
            className="text-base text-shell-text-2 underline underline-offset-4 hover:text-shell-text"
          >
            Browse the topics
          </Link>
        </div>

        <p className="mt-10 font-mono text-sm tabular-nums text-shell-text-2">
          {ALL_QUESTIONS.length.toLocaleString()} questions · {TOPIC_COUNT}{" "}
          topics · {TRACKS.length} tracks · no account needed
        </p>
      </section>

      <section className="mt-20 sm:mt-28">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>

        <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
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

      {question ? (
        <section className="mt-20 sm:mt-28">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What a question looks like
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-text-2">
            Nothing here is scored or saved. Pick an answer if you fancy it, or
            skip straight to the explanation.
          </p>

          <div className="mt-8">
            <SampleQuestion question={question} />
          </div>
        </section>
      ) : null}

      <section className="mt-20 sm:mt-28">
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

      <section className="mt-20 rounded-card border border-border px-6 py-12 text-center sm:mt-28 sm:px-12">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Start with today&apos;s ten
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-text-2">
          Free, and it works without an account — signing in only carries your
          progress between devices.
        </p>
        <Link
          href="/drill"
          className="key key-ink mt-8 inline-block px-7 py-3.5 text-base"
        >
          Start today&apos;s drill
        </Link>
      </section>
    </div>
  );
}
