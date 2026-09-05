"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { ALL_QUESTIONS, ALL_TOPICS } from "@/content";
import { EXPERIENCE_LEVELS } from "@/content/path";
import {
  buildLanes,
  buildStages,
  nextUnit,
  spineProgress,
  type PathUnit,
} from "@/lib/path";

const TOPIC_TITLES: Record<string, string> = Object.fromEntries(
  ALL_TOPICS.map((t) => [t.id, t.title]),
);

/** Achromatic throughout except the completion tick, matching the rest of the
 *  app -- green means correct here and nothing else. */
function StatusMark({ status }: { status: PathUnit["status"] }) {
  if (status === "complete") {
    return (
      <span
        aria-hidden
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-wash text-green-deep"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span
        aria-hidden
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-text-2"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v6h-9z" />
        </svg>
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`h-6 w-6 shrink-0 rounded-full border-2 ${
        status === "in-progress" ? "border-ink" : "border-border"
      }`}
    />
  );
}

function UnitRow({ unit }: { unit: PathUnit }) {
  const body = (
    <>
      <StatusMark status={unit.status} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{unit.title}</span>
        <span className="block text-xs text-text-2">
          {unit.status === "complete"
            ? `Done · ${unit.attempted} of ${unit.total} questions seen`
            : unit.status === "locked"
              ? "Finish the stage above to open this"
              : `${unit.attempted} of ${unit.required} questions to pass`}
        </span>
      </span>
      {unit.accuracy !== undefined ? (
        <span className="shrink-0 text-xs tabular-nums text-text-2">
          {Math.round(unit.accuracy * 100)}%
        </span>
      ) : null}
    </>
  );

  if (unit.status === "locked") {
    return (
      <li className="flex items-center gap-3 rounded-card px-3 py-2.5 opacity-55">
        {body}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/drill?topic=${unit.topicId}&from=path`}
        className="flex items-center gap-3 rounded-card px-3 py-2.5 transition-colors hover:bg-surface"
      >
        {body}
      </Link>
    </li>
  );
}

function Bar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <span
      role="progressbar"
      aria-valuenow={done}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${done} of ${total} complete`}
      className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <span
        className="block h-full rounded-full bg-ink transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

export default function PathPage() {
  const { state, hydrated, setExperienceLevel } = useProgress();

  const { stages, lanes, next, spine } = useMemo(() => {
    const input = {
      questions: ALL_QUESTIONS,
      srs: state.srs,
      byTopic: state.totals.byTopic,
      topicTitles: TOPIC_TITLES,
      experienceLevel: state.experienceLevel,
    };
    const built = buildStages(input);
    return {
      stages: built,
      lanes: buildLanes(input),
      next: nextUnit(built),
      spine: spineProgress(built),
    };
  }, [state.srs, state.totals.byTopic, state.experienceLevel]);

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-44 rounded-lg bg-surface" />
        <div className="h-32 rounded-card bg-surface" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Your path</h1>
        <p className="max-w-prose text-sm text-text-2">
          Twenty-four topics in the order they build on each other, then
          optional lanes for whatever you actually work on. The daily mix keeps
          running alongside this — the path is what to learn next, not
          instead.
        </p>
        <div className="max-w-md space-y-1.5">
          <Bar done={spine.done} total={spine.total} />
          <p className="text-xs text-text-2">
            {spine.done} of {spine.total} core topics complete
          </p>
        </div>
      </header>

      {next ? (
        <section className="rounded-card border border-border p-4">
          <p className="label">Next up</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold">{next.title}</p>
              <p className="text-sm text-text-2">
                {next.attempted} of {next.required} questions answered
              </p>
            </div>
            <Link
              href={`/drill?topic=${next.topicId}&from=path`}
              className="btn btn-primary shrink-0 px-3.5 py-2 text-sm"
            >
              {next.attempted > 0 ? "Continue" : "Start"}
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-card border border-border p-4">
          <p className="text-base font-semibold">The core path is complete.</p>
          <p className="mt-1 text-sm text-text-2">
            Pick a lane below, or keep the daily mix running — the review
            schedule carries on regardless.
          </p>
        </section>
      )}

      {state.experienceLevel === undefined ? (
        <section className="rounded-card border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Where should you start?</h2>
          <p className="mt-1 max-w-prose text-sm text-text-2">
            This opens stages rather than skipping them — everything behind you
            stays available, and nothing is marked done that you have not
            answered.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setExperienceLevel(level.value)}
                className="btn btn-quiet px-3 py-2 text-left"
              >
                <span className="block text-sm font-medium">{level.label}</span>
                <span className="block text-xs text-text-2">{level.note}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h2 className="text-sm font-semibold">
                <span className="text-text-2">Stage {index + 1} · </span>
                {stage.title}
              </h2>
              <span className="text-xs tabular-nums text-text-2">
                {stage.done}/{stage.units.length}
              </span>
            </div>
            <p className="mt-0.5 max-w-prose text-xs text-text-2">
              {stage.blurb}
            </p>
            <ul className="mt-2 -mx-3">
              {stage.units.map((unit) => (
                <UnitRow key={unit.topicId} unit={unit} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="space-y-6 border-t border-border pt-6">
        <div>
          <h2 className="text-sm font-semibold">Lanes</h2>
          <p className="mt-0.5 max-w-prose text-xs text-text-2">
            Never locked, and never required. Pick what matches the work you do
            — this is where the specialist topics live, so they stay out of
            everybody else&apos;s way.
          </p>
        </div>
        {lanes.map((lane) => (
          <div key={lane.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-sm font-semibold">{lane.title}</h3>
              <span className="text-xs tabular-nums text-text-2">
                {lane.done}/{lane.units.length}
              </span>
            </div>
            <p className="mt-0.5 max-w-prose text-xs text-text-2">
              {lane.blurb}
            </p>
            <ul className="mt-2 -mx-3">
              {lane.units.map((unit) => (
                <UnitRow key={unit.topicId} unit={unit} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
