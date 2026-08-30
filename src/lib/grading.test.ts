import { describe, expect, test } from "vitest";
import { gradeResponse } from "@/lib/grading";
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
  id: "q-mcq",
  type: "mcq",
  options: [
    { id: "a", text: "TTL expiry" },
    { id: "b", text: "Write-through" },
  ],
  answer: "b",
};

const multi: MultiQuestion = {
  ...base,
  id: "q-multi",
  type: "multi",
  options: [
    { id: "a", text: "a" },
    { id: "b", text: "b" },
    { id: "c", text: "c" },
  ],
  answers: ["a", "c"],
};

const short: ShortQuestion = {
  ...base,
  id: "q-short",
  type: "short",
  answers: ["write-through", "write through"],
};

const matching: MatchingQuestion = {
  ...base,
  id: "q-match",
  type: "matching",
  pairs: [
    { left: "Redis", right: "Cache" },
    { left: "Kafka", right: "Queue" },
  ],
};

const ordering: OrderingQuestion = {
  ...base,
  id: "q-order",
  type: "ordering",
  items: ["Scope requirements", "Sketch API", "Pick storage"],
};

describe("mcq grading", () => {
  test("marks the matching option correct", () => {
    expect(gradeResponse(mcq, { type: "mcq", optionId: "b" }).correct).toBe(true);
  });

  test("marks a different option incorrect", () => {
    expect(gradeResponse(mcq, { type: "mcq", optionId: "a" }).correct).toBe(false);
  });

  test("marks an unanswered question incorrect", () => {
    expect(gradeResponse(mcq, { type: "mcq", optionId: null }).correct).toBe(false);
  });
});

describe("multi grading", () => {
  test("accepts the full answer set in any order", () => {
    expect(
      gradeResponse(multi, { type: "multi", optionIds: ["c", "a"] }).correct,
    ).toBe(true);
  });

  test("rejects a partial selection", () => {
    expect(gradeResponse(multi, { type: "multi", optionIds: ["a"] }).correct).toBe(
      false,
    );
  });

  test("rejects a selection with an extra option", () => {
    expect(
      gradeResponse(multi, { type: "multi", optionIds: ["a", "b", "c"] }).correct,
    ).toBe(false);
  });

  test("rejects an empty selection", () => {
    expect(gradeResponse(multi, { type: "multi", optionIds: [] }).correct).toBe(
      false,
    );
  });

  test("ignores duplicate selections of a correct option", () => {
    expect(
      gradeResponse(multi, { type: "multi", optionIds: ["a", "a", "c"] }).correct,
    ).toBe(true);
  });
});

describe("short answer grading", () => {
  test("accepts an exact answer", () => {
    expect(
      gradeResponse(short, { type: "short", text: "write-through" }).correct,
    ).toBe(true);
  });

  test("accepts an alternative accepted answer", () => {
    expect(
      gradeResponse(short, { type: "short", text: "write through" }).correct,
    ).toBe(true);
  });

  test("ignores case and surrounding whitespace", () => {
    expect(
      gradeResponse(short, { type: "short", text: "  Write-Through  " }).correct,
    ).toBe(true);
  });

  test("ignores trailing punctuation", () => {
    expect(
      gradeResponse(short, { type: "short", text: "write-through." }).correct,
    ).toBe(true);
  });

  test("rejects a wrong answer", () => {
    expect(
      gradeResponse(short, { type: "short", text: "write-back" }).correct,
    ).toBe(false);
  });

  test("rejects an empty answer", () => {
    expect(gradeResponse(short, { type: "short", text: "   " }).correct).toBe(
      false,
    );
  });

  test("rejects a single-character typo when tolerance is off", () => {
    expect(
      gradeResponse(short, { type: "short", text: "write-throug" }).correct,
    ).toBe(false);
  });

  test("accepts a single-character typo when tolerance is on", () => {
    const lenient: ShortQuestion = { ...short, typoTolerance: true };
    expect(
      gradeResponse(lenient, { type: "short", text: "write-throug" }).correct,
    ).toBe(true);
  });

  test("still rejects a two-character typo when tolerance is on", () => {
    const lenient: ShortQuestion = { ...short, typoTolerance: true };
    expect(
      gradeResponse(lenient, { type: "short", text: "write-thro" }).correct,
    ).toBe(false);
  });
});

describe("matching grading", () => {
  test("accepts every pair matched correctly", () => {
    expect(
      gradeResponse(matching, {
        type: "matching",
        pairs: { Redis: "Cache", Kafka: "Queue" },
      }).correct,
    ).toBe(true);
  });

  test("rejects a swapped pair", () => {
    expect(
      gradeResponse(matching, {
        type: "matching",
        pairs: { Redis: "Queue", Kafka: "Cache" },
      }).correct,
    ).toBe(false);
  });

  test("rejects an incomplete matching", () => {
    expect(
      gradeResponse(matching, {
        type: "matching",
        pairs: { Redis: "Cache" },
      }).correct,
    ).toBe(false);
  });
});

describe("ordering grading", () => {
  test("accepts the exact correct order", () => {
    expect(
      gradeResponse(ordering, {
        type: "ordering",
        items: ["Scope requirements", "Sketch API", "Pick storage"],
      }).correct,
    ).toBe(true);
  });

  test("rejects a swapped order", () => {
    expect(
      gradeResponse(ordering, {
        type: "ordering",
        items: ["Sketch API", "Scope requirements", "Pick storage"],
      }).correct,
    ).toBe(false);
  });

  test("rejects a short ordering", () => {
    expect(
      gradeResponse(ordering, {
        type: "ordering",
        items: ["Scope requirements", "Sketch API"],
      }).correct,
    ).toBe(false);
  });
});

describe("response/question mismatch", () => {
  test("grades a mismatched response type as incorrect rather than throwing", () => {
    expect(gradeResponse(mcq, { type: "short", text: "b" }).correct).toBe(false);
  });
});
