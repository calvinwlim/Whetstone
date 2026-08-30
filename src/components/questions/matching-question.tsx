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
    <div className="space-y-2">
      {question.pairs.map((pair) => {
        const chosen = pairs[pair.left] ?? "";
        const isCorrect = chosen === pair.right;

        return (
          <div
            key={pair.left}
            className={`rounded-lg border-[1.5px] px-3.5 py-2.5 transition-colors ${
              !locked
                ? "border-border bg-bg"
                : isCorrect
                  ? "border-green bg-green-wash"
                  : "border-red bg-red-wash"
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
              className="mt-1.5 w-full rounded-md border border-border bg-bg px-2.5 py-2 text-sm outline-none focus:border-green disabled:cursor-default"
            >
              <option value="">Choose…</option>
              {rights.map((right) => (
                <option key={right} value={right}>
                  {right}
                </option>
              ))}
            </select>

            {locked && !isCorrect ? (
              <p className="mt-1.5 text-xs text-text-2">
                Correct: <span className="font-medium text-text">{pair.right}</span>
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
