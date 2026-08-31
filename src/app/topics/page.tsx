"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { DifficultySpread } from "@/components/difficulty-pill";
import { ALL_QUESTIONS, TRACKS } from "@/content";
import type { TrackId } from "@/content/types";

type Filter = "all" | TrackId;

export default function TopicsPage() {
  const { byTopic, state, hydrated } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    return TRACKS.filter((track) => filter === "all" || track.id === filter)
      .flatMap((track) =>
        track.topics.map((topic) => {
          const questions = ALL_QUESTIONS.filter((q) => q.topic === topic.id);
          const seen = state.attempts.some((a) => a.topic === topic.id);
          return {
            topic,
            track,
            questions,
            seen,
            accuracy: byTopic[topic.id],
          };
        }),
      );
  }, [filter, byTopic, state.attempts]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    ...TRACKS.map((track) => ({ id: track.id as Filter, label: track.title })),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">Topics</h1>
        <p className="font-mono text-xs tabular-nums text-text-2">
          {ALL_QUESTIONS.length} questions · {rows.length} topics
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-lg border px-2.5 py-1 text-sm font-medium transition-colors ${
              filter === item.id
                ? "border-green bg-green-wash text-green-deep"
                : "border-border text-text-2 hover:border-border-strong hover:text-text"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th scope="col" className="w-9 px-3 py-2 font-medium text-text-2">
                <span className="sr-only">Attempted</span>
              </th>
              <th scope="col" className="px-2 py-2 font-medium text-text-2">
                Topic
              </th>
              <th
                scope="col"
                className="hidden px-2 py-2 font-medium text-text-2 sm:table-cell"
              >
                Track
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-right font-medium text-text-2"
                title="Easy / Medium / Hard"
              >
                E/M/H
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right font-medium text-text-2"
              >
                Accuracy
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ topic, track, questions, seen, accuracy }) => (
              <tr
                key={topic.id}
                className="border-b border-border last:border-b-0 hover:bg-surface"
              >
                <td className="px-3 py-2.5 align-middle">
                  <span
                    aria-hidden
                    className={`grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold ${
                      hydrated && seen
                        ? "bg-green text-white"
                        : "border border-border"
                    }`}
                  >
                    {hydrated && seen ? "✓" : ""}
                  </span>
                  <span className="sr-only">
                    {hydrated && seen ? "Attempted" : "Not attempted"}
                  </span>
                </td>

                <td className="px-2 py-2.5">
                  <Link
                    href={`/topics/${topic.id}`}
                    className="font-medium hover:text-green hover:underline"
                  >
                    {topic.title}
                  </Link>
                  {topic.depth ? (
                    <span
                      title="Specialist depth — kept out of daily drills unless you opt in"
                      className="ml-2 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-text-2"
                    >
                      Depth
                    </span>
                  ) : null}
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-2 sm:hidden">
                    {track.title}
                  </p>
                </td>

                <td className="hidden px-2 py-2.5 text-text-2 sm:table-cell">
                  {track.title}
                </td>

                <td className="px-2 py-2.5 text-right">
                  <DifficultySpread
                    difficulties={questions.map((q) => q.difficulty)}
                  />
                </td>

                <td className="px-3 py-2.5 text-right">
                  {hydrated && accuracy !== undefined ? (
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        accuracy >= 0.7 ? "text-green" : "text-red"
                      }`}
                    >
                      {Math.round(accuracy * 100)}%
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
