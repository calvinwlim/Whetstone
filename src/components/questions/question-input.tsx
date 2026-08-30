"use client";

import type { Question, Response } from "@/content/types";
import { McqInput, MultiInput } from "./choice-questions";
import { ShortInput } from "./short-question";
import { MatchingInput } from "./matching-question";
import { OrderingInput } from "./ordering-question";

interface Props {
  question: Question;
  value: Response | null;
  onChange: (value: Response) => void;
  locked: boolean;
}

export function QuestionInput({ question, value, onChange, locked }: Props) {
  const shared = { value, onChange, locked };

  switch (question.type) {
    case "mcq":
      return <McqInput question={question} {...shared} />;
    case "multi":
      return <MultiInput question={question} {...shared} />;
    case "short":
      return <ShortInput question={question} {...shared} />;
    case "matching":
      return <MatchingInput question={question} {...shared} />;
    case "ordering":
      return <OrderingInput question={question} {...shared} />;
  }
}

/** Whether the learner has supplied enough to submit. Prevents an accidental
 *  empty submission counting as a wrong answer against their SRS record. */
export function hasAnswer(
  question: Question,
  response: Response | null,
): boolean {
  if (!response || response.type !== question.type) return false;

  switch (response.type) {
    case "mcq":
      return response.optionId !== null;
    case "multi":
      return response.optionIds.length > 0;
    case "short":
      return response.text.trim() !== "";
    case "matching":
      return (
        question.type === "matching" &&
        Object.keys(response.pairs).length === question.pairs.length
      );
    case "ordering":
      return response.items.length > 0;
  }
}
