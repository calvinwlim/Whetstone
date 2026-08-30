import { describe, expect, test } from "vitest";
import { hasAnswer } from "@/components/questions/question-input";
import { choiceState } from "@/components/questions/shared";
import type {
  MatchingQuestion,
  McqQuestion,
  MultiQuestion,
  OrderingQuestion,
  ShortQuestion,
} from "@/content/types";

const base = {
  track: "system-design",
  topic: "caching",
  difficulty: 2,
  prompt: "p",
  explanation: "e",
} as const;

const mcq: McqQuestion = {
  ...base,
  id: "m",
  type: "mcq",
  options: [{ id: "a", text: "a" }],
  answer: "a",
};

const multi: MultiQuestion = {
  ...base,
  id: "mu",
  type: "multi",
  options: [
    { id: "a", text: "a" },
    { id: "b", text: "b" },
  ],
  answers: ["a"],
};

const short: ShortQuestion = { ...base, id: "s", type: "short", answers: ["x"] };

const matching: MatchingQuestion = {
  ...base,
  id: "mt",
  type: "matching",
  pairs: [
    { left: "A", right: "1" },
    { left: "B", right: "2" },
  ],
};

const ordering: OrderingQuestion = {
  ...base,
  id: "o",
  type: "ordering",
  items: ["one", "two"],
};

describe("hasAnswer", () => {
  test("is false with no response at all", () => {
    expect(hasAnswer(mcq, null)).toBe(false);
  });

  test("is false when the response type does not match the question", () => {
    expect(hasAnswer(mcq, { type: "short", text: "a" })).toBe(false);
  });

  test("mcq needs an option chosen", () => {
    expect(hasAnswer(mcq, { type: "mcq", optionId: null })).toBe(false);
    expect(hasAnswer(mcq, { type: "mcq", optionId: "a" })).toBe(true);
  });

  test("multi needs at least one option", () => {
    expect(hasAnswer(multi, { type: "multi", optionIds: [] })).toBe(false);
    expect(hasAnswer(multi, { type: "multi", optionIds: ["a"] })).toBe(true);
  });

  test("short rejects whitespace-only input", () => {
    expect(hasAnswer(short, { type: "short", text: "   " })).toBe(false);
    expect(hasAnswer(short, { type: "short", text: "x" })).toBe(true);
  });

  test("matching requires every row to be filled", () => {
    expect(hasAnswer(matching, { type: "matching", pairs: { A: "1" } })).toBe(
      false,
    );
    expect(
      hasAnswer(matching, { type: "matching", pairs: { A: "1", B: "2" } }),
    ).toBe(true);
  });

  test("ordering is satisfied by any non-empty order", () => {
    expect(hasAnswer(ordering, { type: "ordering", items: [] })).toBe(false);
    expect(
      hasAnswer(ordering, { type: "ordering", items: ["two", "one"] }),
    ).toBe(true);
  });
});

describe("choiceState", () => {
  test("before submitting, only selection matters", () => {
    expect(choiceState(true, false, false)).toBe("selected");
    expect(choiceState(false, true, false)).toBe("idle");
  });

  test("marks a selected correct answer as correct", () => {
    expect(choiceState(true, true, true)).toBe("correct");
  });

  test("marks a selected wrong answer as wrong", () => {
    expect(choiceState(true, false, true)).toBe("wrong");
  });

  test("marks an unselected correct answer as missed", () => {
    expect(choiceState(false, true, true)).toBe("missed");
  });

  test("leaves an unselected wrong answer unmarked", () => {
    expect(choiceState(false, false, true)).toBe("idle");
  });
});
