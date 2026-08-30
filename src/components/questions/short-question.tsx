"use client";

import type { ShortQuestion } from "@/content/types";
import { gradeResponse } from "@/lib/grading";
import type { QuestionInputProps } from "./shared";

export function ShortInput({
  question,
  value,
  onChange,
  locked,
}: QuestionInputProps<ShortQuestion>) {
  const text = value?.type === "short" ? value.text : "";
  const correct =
    locked && gradeResponse(question, { type: "short", text }).correct;

  return (
    <div>
      <label htmlFor="short-answer" className="text-sm font-medium text-text-2">
        Your answer
      </label>
      <input
        id="short-answer"
        type="text"
        value={text}
        onChange={(event) =>
          onChange({ type: "short", text: event.target.value })
        }
        disabled={locked}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Type your answer"
        className={`mt-1.5 w-full rounded-lg border-[1.5px] px-3.5 py-3 text-[0.9375rem] outline-none transition-colors placeholder:text-text-2 disabled:cursor-default ${
          !locked
            ? "border-border bg-bg focus:border-green"
            : correct
              ? "border-green bg-green-wash"
              : "border-red bg-red-wash"
        }`}
      />

      {locked && !correct ? (
        <p className="mt-2 text-sm text-text-2">
          Accepted:{" "}
          <span className="font-mono font-medium text-text">
            {question.answers[0]}
          </span>
          {question.answers.length > 1
            ? ` (and ${question.answers.length - 1} other ${
                question.answers.length === 2 ? "wording" : "wordings"
              })`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
