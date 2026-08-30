"use client";

import { useMemo } from "react";
import type { MatchingQuestion } from "@/content/types";
import { seedFromString, shuffleWithSeed } from "@/lib/shuffle";
import type { QuestionInputProps } from "./shared";

/** A select per row rather than drag-and-drop: it works on touch, works with a
 *  keyboard and a screen reader, and cannot strand an item mid-drag. */
export function MatchingInput({
  question,
  value,
  onChange,
  locked,
}: QuestionInputProps<MatchingQuestion>) {
  const pairs = value?.type === "matching" ? value.pairs : {};

  const rights = useMemo(
    () =>
      shuffleWithSeed(
        question.pairs.map((pair) => pair.right),
        seedFromString(question.id),
      ),
    [question],
  );

  function setPair(left: string, right: string) {
    const next = { ...pairs };
    if (right === "") delete next[left];
    else next[left] = right;
    onChange({ type: "matching", pairs: next });
  }

  return (
    <div className="space-y-2.5">
      {question.pairs.map((pair) => {
        const chosen = pairs[pair.left] ?? "";
        const isCorrect = chosen === pair.right;

        return (
          <div
            key={pair.left}
            className={`rounded-lg border px-4 py-3 transition-colors ${
              !locked
                ? "border-rule bg-raised"
                : isCorrect
                  ? "border-verdigris bg-verdigris-wash"
                  : "border-rust bg-rust-wash"
            }`}
          >
            <label
              htmlFor={`match-${pair.left}`}
              className="block text-[0.9375rem] font-medium leading-snug"
            >
              {pair.left}
            </label>

            <select
              id={`match-${pair.left}`}
              value={chosen}
              disabled={locked}
              onChange={(event) => setPair(pair.left, event.target.value)}
              className="mt-2 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm outline-none focus:border-amber disabled:cursor-default"
            >
              <option value="">Choose…</option>
              {rights.map((right) => (
                <option key={right} value={right}>
                  {right}
                </option>
              ))}
            </select>

            {locked && !isCorrect ? (
              <p className="mt-2 text-xs text-muted">
                Correct: <span className="text-text">{pair.right}</span>
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
