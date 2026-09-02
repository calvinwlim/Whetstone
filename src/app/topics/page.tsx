"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { DifficultySpread } from "@/components/difficulty-pill";
import { Field } from "@/components/field";
import { ALL_QUESTIONS, TRACKS } from "@/content";
import type { Difficulty, TrackId } from "@/content/types";

type Filter = "all" | TrackId;
type SortKey = "topic" | "track" | "questions" | "accuracy";

interface Row {
  id: string;
  title: string;
  depth: boolean;
  trackTitle: string;
  difficulties: Difficulty[];
  seen: boolean;
  accuracy: number | undefined;
}

/** Sorts descending on first click for the numeric columns, since "most
 *  questions" and "worst accuracy" are what you actually want to see. */
const DESCENDING_FIRST: Record<SortKey, boolean> = {
  topic: false,
  track: false,
  questions: true,
  accuracy: false,
};

export default function TopicsPage() {
  const { byTopic, state, hydrated } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean } | null>(null);

  const rows = useMemo<Row[]>(() => {
    const attempted = new Set(state.attempts.map((a) => a.topic));

    return TRACKS.filter(
      (track) => filter === "all" || track.id === filter,
    ).flatMap((track) =>
      track.topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        depth: Boolean(topic.depth),
        trackTitle: track.title,
        difficulties: ALL_QUESTIONS.filter((q) => q.topic === topic.id).map(
          (q) => q.difficulty,
        ),
        seen: attempted.has(topic.id),
        accuracy: byTopic[topic.id],
      })),
    );
  }, [filter, byTopic, state.attempts]);

  // Unsorted keeps the authored curriculum order, which is itself meaningful.
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const factor = sort.desc ? -1 : 1;

    return [...rows].sort((a, b) => {
      switch (sort.key) {
        case "topic":
          return factor * a.title.localeCompare(b.title);
        case "track":
          return factor * a.trackTitle.localeCompare(b.trackTitle);
        case "questions":
          return factor * (a.difficulties.length - b.difficulties.length);
        case "accuracy": {
          // Untouched topics sort last either way -- they are not "0%".
          if (a.accuracy === undefined && b.accuracy === undefined) return 0;
          if (a.accuracy === undefined) return 1;
          if (b.accuracy === undefined) return -1;
          return factor * (a.accuracy - b.accuracy);
        }
      }
    });
  }, [rows, sort]);

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current?.key === key
        ? { key, desc: !current.desc }
        : { key, desc: DESCENDING_FIRST[key] },
    );
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    ...TRACKS.map((track) => ({ id: track.id as Filter, label: track.title })),
  ];

  const totalQuestions = sorted.reduce(
    (sum, row) => sum + row.difficulties.length,
    0,
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Topics</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Field label="Topics" value={String(sorted.length)} />
        <Field label="Questions" value={totalQuestions.toLocaleString()} />
        <Field
          label="Attempted"
          value={
            hydrated ? String(sorted.filter((row) => row.seen).length) : "—"
          }
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={active}
              className={`btn rounded-chip px-2.5 py-1 text-[0.8125rem] ${
                active
                  ? "btn-primary"
                  : "border border-border text-text-2 hover:border-border-strong hover:text-text"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-strong">
              <SortHeader
                label="Topic"
                sortKey="topic"
                sort={sort}
                onSort={toggleSort}
                className="pl-2"
              />
              <SortHeader
                label="Track"
                sortKey="track"
                sort={sort}
                onSort={toggleSort}
                className="hidden sm:table-cell"
              />
              <SortHeader
                label="Questions"
                sortKey="questions"
                sort={sort}
                onSort={toggleSort}
                align="right"
                className="hidden sm:table-cell"
              />
              <th
                scope="col"
                className="label px-3 py-2 text-right"
                title="Easy / Medium / Hard"
              >
                E/M/H
              </th>
              <SortHeader
                label="Accuracy"
                sortKey="accuracy"
                sort={sort}
                onSort={toggleSort}
                align="right"
                className="pr-2"
              />
            </tr>
          </thead>

          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-surface"
              >
                <td className="py-2.5 pl-2 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        hydrated && row.seen ? "bg-ink" : "bg-border-strong"
                      }`}
                    />
                    <Link
                      href={`/topics/${row.id}`}
                      className="font-medium hover:underline"
                    >
                      {row.title}
                    </Link>
                    {row.depth ? (
                      <span
                        title="Specialist depth — kept out of daily drills unless you opt in"
                        className="rounded-chip border border-border px-1.5 py-0.5 text-[10px] font-semibold text-text-2"
                      >
                        Depth
                      </span>
                    ) : null}
                    <span className="sr-only">
                      {hydrated && row.seen ? "Attempted" : "Not attempted"}
                    </span>
                  </div>
                  <p className="mt-0.5 pl-4 text-xs text-text-2 sm:hidden">
                    {row.trackTitle}
                  </p>
                </td>

                <td className="hidden px-3 py-2.5 text-text-2 sm:table-cell">
                  {row.trackTitle}
                </td>

                <td className="hidden px-3 py-2.5 text-right font-mono text-xs tabular-nums text-text-2 sm:table-cell">
                  {row.difficulties.length}
                </td>

                <td className="px-3 py-2.5 text-right">
                  <DifficultySpread difficulties={row.difficulties} />
                </td>

                <td className="py-2.5 pl-3 pr-2 text-right">
                  {hydrated && row.accuracy !== undefined ? (
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        row.accuracy >= 0.7 ? "text-green" : "text-red"
                      }`}
                    >
                      {Math.round(row.accuracy * 100)}%
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-text-2">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; desc: boolean } | null;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort?.key === sortKey;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"}
      className={`px-3 py-2 ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`label inline-flex items-center gap-1 hover:text-text ${
          active ? "text-text" : ""
        }`}
      >
        {label}
        <span aria-hidden className={active ? "" : "opacity-0"}>
          {active && sort.desc ? "↓" : "↑"}
        </span>
      </button>
    </th>
  );
}
