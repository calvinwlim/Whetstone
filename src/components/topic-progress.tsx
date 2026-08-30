"use client";

import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";

const HISTORY_LENGTH = 24;

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
      <div>
        <p className="label">Your accuracy</p>
        <p
          className={`readout mt-0.5 text-xl ${
            hydrated && accuracy !== undefined
              ? accuracy >= 0.7
                ? "text-verdigris"
                : "text-rust"
              : "text-faint"
          }`}
        >
          {hydrated && accuracy !== undefined
            ? `${Math.round(accuracy * 100)}%`
            : "—"}
        </p>
      </div>

      {history.length > 0 ? (
        <div>
          <p className="label">History</p>
          <SignalStrip signals={history} className="mt-2" />
        </div>
      ) : null}
    </>
  );
}
