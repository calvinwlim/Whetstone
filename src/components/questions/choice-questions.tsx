"use client";

import { useMemo } from "react";
import type { McqQuestion, MultiQuestion } from "@/content/types";
import { seedFromString, shuffleWithSeed } from "@/lib/shuffle";
import { Choice, choiceState, type QuestionInputProps } from "./shared";

/** Options are shuffled per question id so the correct answer is not always in
 *  the position it was authored in, but stays put across re-renders. */
function useShuffledOptions<T extends { id: string }>(
  questionId: string,
  options: T[],
): T[] {
  return useMemo(
    () => shuffleWithSeed(options, seedFromString(questionId)),
    [questionId, options],
  );
}

export function McqInput({
  question,
  value,
  onChange,
  locked,
}: QuestionInputProps<McqQuestion>) {
  const options = useShuffledOptions(question.id, question.options);
  const selected = value?.type === "mcq" ? value.optionId : null;

  return (
    <div className="space-y-2.5">
      {options.map((option) => (
        <Choice
          key={option.id}
          state={choiceState(
            selected === option.id,
            option.id === question.answer,
            locked,
          )}
          disabled={locked}
          onClick={() => onChange({ type: "mcq", optionId: option.id })}
        >
          {option.text}
        </Choice>
      ))}
    </div>
  );
}

export function MultiInput({
  question,
  value,
  onChange,
  locked,
}: QuestionInputProps<MultiQuestion>) {
  const options = useShuffledOptions(question.id, question.options);
  const selected = value?.type === "multi" ? value.optionIds : [];

  function toggle(optionId: string) {
    const next = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onChange({ type: "multi", optionIds: next });
  }

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-text-2">Select all that apply</p>
      {options.map((option) => (
        <Choice
          key={option.id}
          multi
          state={choiceState(
            selected.includes(option.id),
            question.answers.includes(option.id),
            locked,
          )}
          disabled={locked}
          onClick={() => toggle(option.id)}
        >
          {option.text}
        </Choice>
      ))}
    </div>
  );
}
