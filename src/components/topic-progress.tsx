"use client";

import { useProgress } from "@/components/progress-provider";
import { SignalStrip } from "@/components/signal-strip";
import { Field } from "@/components/field";

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

  const known = hydrated && accuracy !== undefined;

  return (
    <>
      <Field
        label="Your accuracy"
        value={known ? `${Math.round(accuracy * 100)}%` : "—"}
        tone={known ? (accuracy >= 0.7 ? "good" : "bad") : undefined}
      />

      {history.length > 0 ? (
        <Field label={`Last ${history.length}`}>
          <span className="flex h-6 items-center">
            <SignalStrip signals={history} />
          </span>
        </Field>
      ) : null}
    </>
  );
}
