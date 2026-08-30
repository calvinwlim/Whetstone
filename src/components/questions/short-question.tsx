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
  const correct = locked && gradeResponse(question, { type: "short", text }).correct;

  return (
    <div>
      <label htmlFor="short-answer" className="label">
        Your answer
      </label>
      <input
        id="short-answer"
        type="text"
        value={text}
        onChange={(event) => onChange({ type: "short", text: event.target.value })}
        disabled={locked}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Type your answer"
        className={`mt-2 w-full rounded-lg border bg-raised px-4 py-3 text-[0.9375rem] outline-none transition-colors placeholder:text-faint disabled:cursor-default ${
          !locked
            ? "border-rule focus:border-amber"
            : correct
              ? "border-verdigris bg-verdigris-wash"
              : "border-rust bg-rust-wash"
        }`}
      />

      {locked && !correct ? (
        <p className="mt-3 text-sm text-muted">
          Accepted:{" "}
          <span className="font-mono text-text">{question.answers[0]}</span>
          {question.answers.length > 1 ? (
            <span className="text-faint">
              {" "}
              (and {question.answers.length - 1} other{" "}
              {question.answers.length === 2 ? "wording" : "wordings"})
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
