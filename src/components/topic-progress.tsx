"use client";

import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";

const HISTORY_LENGTH = 16;

/** The only part of a topic page that depends on the learner, split out so the
 *  lesson itself can be prerendered as static HTML. */
export function TopicProgress({ topicId }: { topicId: string }) {
  const { state, hydrated, byTopic } = useProgress();

  const accuracy = byTopic[topicId];
  const history = state.attempts
    .filter((attempt) => attempt.topic === topicId)
    .slice(-HISTORY_LENGTH)
    .map((attempt) => attempt.correct);

  return (
    <>
      <span className="flex items-center gap-1.5">
        <span className="text-text-2">Accuracy</span>
        <span
          className={`font-mono tabular-nums ${
            hydrated && accuracy !== undefined
              ? accuracy >= 0.7
                ? "text-green"
                : "text-red"
              : "text-text-2"
          }`}
        >
          {hydrated && accuracy !== undefined
            ? `${Math.round(accuracy * 100)}%`
            : "—"}
        </span>
      </span>

      {history.length > 0 ? <SignalStrip signals={history} /> : null}
    </>
  );
}
