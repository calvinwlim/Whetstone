"use client";

import { useEffect, useMemo } from "react";
import type { OrderingQuestion } from "@/content/types";
import { seedFromString, shuffleWithSeed } from "@/lib/shuffle";
import type { QuestionInputProps } from "./shared";

/** Move-up / move-down rather than drag-and-drop, for the same reasons as
 *  matching: touch-friendly, keyboard-operable, nothing to drop in the wrong
 *  place. */
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
    <div className="space-y-2">
      <p className="label">Put these in order</p>
      <ol className="space-y-2">
        {items.map((item, index) => {
          const inPlace = question.items[index] === item;

          return (
            <li
              key={item}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                !locked
                  ? "border-rule bg-raised"
                  : inPlace
                    ? "border-verdigris bg-verdigris-wash"
                    : "border-rust bg-rust-wash"
              }`}
            >
              <span className="font-mono text-xs text-faint">{index + 1}</span>
              <span className="flex-1 text-[0.9375rem] leading-snug">{item}</span>

              {!locked ? (
                /* Each control is a 40px square so it stays comfortably
                   tappable on a phone, where most sessions happen. */
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move "${item}" up`}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-rule text-muted transition-colors hover:border-amber hover:text-amber disabled:opacity-20 disabled:hover:border-rule disabled:hover:text-muted"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move "${item}" down`}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-rule text-muted transition-colors hover:border-amber hover:text-amber disabled:opacity-20 disabled:hover:border-rule disabled:hover:text-muted"
                  >
                    ▼
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {locked ? (
        <div className="pt-2">
          <p className="label">Correct order</p>
          <ol className="mt-1.5 space-y-1">
            {question.items.map((item, index) => (
              <li key={item} className="text-sm text-muted">
                <span className="font-mono text-xs text-faint">{index + 1} </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
