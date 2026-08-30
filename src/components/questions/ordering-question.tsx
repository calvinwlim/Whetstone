"use client";

import { useEffect, useMemo } from "react";
import type { OrderingQuestion } from "@/content/types";
import { seedFromString, shuffleWithSeed } from "@/lib/shuffle";
import type { QuestionInputProps } from "./shared";

/** Move-up / move-down rather than drag-and-drop, for the same reasons as
 *  matching: touch-friendly, keyboard-operable, nothing to drop in the wrong
 *  place. Each control is a 40px square so it stays tappable on a phone. */
export function OrderingInput({
  question,
  value,
  onChange,
  locked,
}: QuestionInputProps<OrderingQuestion>) {
  const initial = useMemo(
    () => shuffleWithSeed(question.items, seedFromString(question.id)),
    [question],
  );

  const items = value?.type === "ordering" ? value.items : initial;

  // Seed the response so submitting without touching anything still records
  // the order the learner was shown rather than an empty answer.
  useEffect(() => {
    if (value?.type !== "ordering") {
      onChange({ type: "ordering", items: initial });
    }
  }, [value, initial, onChange]);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange({ type: "ordering", items: next });
  }

  return (
    <div>
      <p className="text-sm font-medium text-text-2">Put these in order</p>
      <ol className="mt-1.5 space-y-1.5">
        {items.map((item, index) => {
          const inPlace = question.items[index] === item;

          return (
            <li
              key={item}
              className={`flex items-center gap-2.5 rounded-lg border-[1.5px] px-2.5 py-2 transition-colors ${
                !locked
                  ? "border-border bg-bg"
                  : inPlace
                    ? "border-green bg-green-wash"
                    : "border-red bg-red-wash"
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-xs tabular-nums">
                {index + 1}
              </span>
              <span className="flex-1 text-[0.9375rem] leading-snug">
                {item}
              </span>

              {!locked ? (
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move "${item}" up`}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-border text-text-2 transition-colors hover:border-border-strong hover:text-text disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move "${item}" down`}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-border text-text-2 transition-colors hover:border-border-strong hover:text-text disabled:opacity-25"
                  >
                    ↓
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {locked ? (
        <div className="mt-3 rounded-lg border border-border bg-surface p-3">
          <p className="text-sm font-medium">Correct order</p>
          <ol className="mt-1.5 space-y-1">
            {question.items.map((item, index) => (
              <li key={item} className="text-sm text-text-2">
                <span className="font-mono text-xs tabular-nums">
                  {index + 1}.{" "}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
