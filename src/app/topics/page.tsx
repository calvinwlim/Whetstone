"use client";

import Link from "next/link";
import { useProgress } from "@/components/progress-provider";
import { ALL_QUESTIONS, TRACKS } from "@/content";

export default function TopicsPage() {
  const { byTopic, state, hydrated } = useProgress();

  return (
    <div className="space-y-10 pt-2">
      <header>
        <h1 className="readout text-3xl">Topics</h1>
        <p className="mt-1.5 text-sm text-muted">
          {ALL_QUESTIONS.length} questions across {TRACKS.length} tracks. Read a
          lesson any time — drills pull from every topic you have enabled.
        </p>
      </header>

      {TRACKS.map((track) => {
        const enabled = state.enabledTracks.includes(track.id);

        return (
          <section key={track.id}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="readout text-lg">{track.title}</h2>
              {hydrated && !enabled ? (
                <span className="label text-faint">Off</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted">{track.blurb}</p>

            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {track.topics.map((topic) => {
                const count = ALL_QUESTIONS.filter(
                  (q) => q.topic === topic.id,
                ).length;
                const accuracy = byTopic[topic.id];

                return (
                  <li key={topic.id}>
                    <Link
                      href={`/topics/${topic.id}`}
                      className="group flex items-center justify-between gap-4 py-3.5"
                    >
                      <span className="min-w-0">
                        <span className="block text-[0.9375rem] group-hover:text-amber">
                          {topic.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          {topic.blurb}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        {hydrated && accuracy !== undefined ? (
                          <span
                            className={`block font-mono text-xs ${
                              accuracy >= 0.7 ? "text-verdigris" : "text-rust"
                            }`}
                          >
                            {Math.round(accuracy * 100)}%
                          </span>
                        ) : (
                          <span className="block font-mono text-xs text-faint">
                            new
                          </span>
                        )}
                        <span className="block font-mono text-[0.6875rem] text-faint">
                          {count} q
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
