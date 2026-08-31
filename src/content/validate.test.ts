import { describe, expect, test } from "vitest";
import { validateContent } from "@/content/validate";
import { ALL_QUESTIONS, TRACKS } from "@/content";
import type { Question, Track } from "@/content/types";

const track: Track = {
  id: "system-design",
  title: "System Design",
  blurb: "b",
  topics: [
    {
      id: "caching",
      track: "system-design",
      title: "Caching",
      blurb: "b",
      lesson: "l",
    },
  ],
};

function mcq(over: Partial<Question> = {}): Question {
  return {
    id: "q1",
    type: "mcq",
    track: "system-design",
    topic: "caching",
    difficulty: 2,
    prompt: "p",
    explanation: "e",
    concepts: ["Example concept"],
    options: [
      { id: "a", text: "a" },
      { id: "b", text: "b" },
    ],
    answer: "a",
    ...over,
  } as Question;
}

describe("valid content", () => {
  test("reports no errors for a well-formed bank", () => {
    expect(validateContent([track], [mcq()])).toEqual([]);
  });
});

describe("structural checks", () => {
  test("rejects duplicate question ids", () => {
    const errors = validateContent([track], [mcq(), mcq()]);
    expect(errors.join(" ")).toMatch(/duplicate/i);
  });

  test("rejects a question pointing at a topic that does not exist", () => {
    const errors = validateContent([track], [mcq({ topic: "nonexistent" })]);
    expect(errors.join(" ")).toMatch(/topic/i);
  });

  test("rejects a topic whose track field disagrees with its track", () => {
    const broken: Track = {
      ...track,
      topics: [{ ...track.topics[0], track: "workplace" }],
    };
    const errors = validateContent([broken], []);
    expect(errors.join(" ")).toMatch(/track/i);
  });

  test("rejects duplicate topic ids across tracks", () => {
    const other: Track = {
      id: "workplace",
      title: "Workplace",
      blurb: "b",
      topics: [
        {
          id: "caching",
          track: "workplace",
          title: "Caching",
          blurb: "b",
          lesson: "l",
        },
      ],
    };
    const errors = validateContent([track, other], []);
    expect(errors.join(" ")).toMatch(/duplicate topic/i);
  });
});

describe("mcq checks", () => {
  test("rejects an answer that is not one of the options", () => {
    const errors = validateContent([track], [mcq({ answer: "zzz" } as Partial<Question>)]);
    expect(errors.join(" ")).toMatch(/answer/i);
  });

  test("rejects fewer than two options", () => {
    const errors = validateContent(
      [track],
      [mcq({ options: [{ id: "a", text: "a" }] } as Partial<Question>)],
    );
    expect(errors.join(" ")).toMatch(/option/i);
  });

  test("rejects duplicate option ids", () => {
    const errors = validateContent(
      [track],
      [
        mcq({
          options: [
            { id: "a", text: "a" },
            { id: "a", text: "b" },
          ],
        } as Partial<Question>),
      ],
    );
    expect(errors.join(" ")).toMatch(/option/i);
  });
});

describe("multi checks", () => {
  const multi = (over: Record<string, unknown> = {}) =>
    ({
      id: "m1",
      type: "multi",
      track: "system-design",
      topic: "caching",
      difficulty: 2,
      prompt: "p",
      explanation: "e",
    concepts: ["Example concept"],
      options: [
        { id: "a", text: "a" },
        { id: "b", text: "b" },
        { id: "c", text: "c" },
      ],
      answers: ["a", "b"],
      ...over,
    }) as Question;

  test("accepts a well-formed multi question", () => {
    expect(validateContent([track], [multi()])).toEqual([]);
  });

  test("rejects an answer id that is not an option", () => {
    const errors = validateContent([track], [multi({ answers: ["a", "zzz"] })]);
    expect(errors.join(" ")).toMatch(/answer/i);
  });

  test("rejects an empty answer set", () => {
    const errors = validateContent([track], [multi({ answers: [] })]);
    expect(errors.join(" ")).toMatch(/answer/i);
  });

  test("rejects a question where every option is correct", () => {
    const errors = validateContent([track], [multi({ answers: ["a", "b", "c"] })]);
    expect(errors.join(" ")).toMatch(/every option|all options/i);
  });
});

describe("short answer checks", () => {
  const short = (over: Record<string, unknown> = {}) =>
    ({
      id: "s1",
      type: "short",
      track: "system-design",
      topic: "caching",
      difficulty: 2,
      prompt: "p",
      explanation: "e",
    concepts: ["Example concept"],
      answers: ["ttl"],
      ...over,
    }) as Question;

  test("accepts a well-formed short question", () => {
    expect(validateContent([track], [short()])).toEqual([]);
  });

  test("rejects an empty accepted-answer list", () => {
    const errors = validateContent([track], [short({ answers: [] })]);
    expect(errors.join(" ")).toMatch(/answer/i);
  });

  test("rejects a blank accepted answer", () => {
    const errors = validateContent([track], [short({ answers: ["  "] })]);
    expect(errors.join(" ")).toMatch(/blank|empty/i);
  });
});

describe("matching checks", () => {
  const matching = (over: Record<string, unknown> = {}) =>
    ({
      id: "mt1",
      type: "matching",
      track: "system-design",
      topic: "caching",
      difficulty: 2,
      prompt: "p",
      explanation: "e",
    concepts: ["Example concept"],
      pairs: [
        { left: "A", right: "1" },
        { left: "B", right: "2" },
      ],
      ...over,
    }) as Question;

  test("accepts a well-formed matching question", () => {
    expect(validateContent([track], [matching()])).toEqual([]);
  });

  test("rejects fewer than two pairs", () => {
    const errors = validateContent(
      [track],
      [matching({ pairs: [{ left: "A", right: "1" }] })],
    );
    expect(errors.join(" ")).toMatch(/pair/i);
  });

  test("rejects duplicate left values", () => {
    const errors = validateContent(
      [track],
      [
        matching({
          pairs: [
            { left: "A", right: "1" },
            { left: "A", right: "2" },
          ],
        }),
      ],
    );
    expect(errors.join(" ")).toMatch(/duplicate/i);
  });

  test("rejects duplicate right values, which would make an answer ambiguous", () => {
    const errors = validateContent(
      [track],
      [
        matching({
          pairs: [
            { left: "A", right: "1" },
            { left: "B", right: "1" },
          ],
        }),
      ],
    );
    expect(errors.join(" ")).toMatch(/duplicate/i);
  });
});

describe("ordering checks", () => {
  const ordering = (over: Record<string, unknown> = {}) =>
    ({
      id: "o1",
      type: "ordering",
      track: "system-design",
      topic: "caching",
      difficulty: 2,
      prompt: "p",
      explanation: "e",
    concepts: ["Example concept"],
      items: ["one", "two", "three"],
      ...over,
    }) as Question;

  test("accepts a well-formed ordering question", () => {
    expect(validateContent([track], [ordering()])).toEqual([]);
  });

  test("rejects fewer than two items", () => {
    const errors = validateContent([track], [ordering({ items: ["one"] })]);
    expect(errors.join(" ")).toMatch(/item/i);
  });

  test("rejects duplicate items, which would make the order ambiguous", () => {
    const errors = validateContent(
      [track],
      [ordering({ items: ["one", "one", "two"] })],
    );
    expect(errors.join(" ")).toMatch(/duplicate/i);
  });
});

describe("resource checks", () => {
  test("rejects a resource with a non-http url", () => {
    const errors = validateContent(
      [track],
      [mcq({ resources: [{ label: "x", url: "not-a-url" }] })],
    );
    expect(errors.join(" ")).toMatch(/url/i);
  });
});

describe("the real content bank", () => {
  test("passes every validation rule", () => {
    expect(validateContent(TRACKS, ALL_QUESTIONS)).toEqual([]);
  });

  test("has questions in every track", () => {
    for (const track of TRACKS) {
      const count = ALL_QUESTIONS.filter((q) => q.track === track.id).length;
      expect(count, `track ${track.id} has no questions`).toBeGreaterThan(0);
    }
  });

  test("has questions in every topic", () => {
    for (const track of TRACKS) {
      for (const topic of track.topics) {
        const count = ALL_QUESTIONS.filter((q) => q.topic === topic.id).length;
        expect(count, `topic ${topic.id} has no questions`).toBeGreaterThan(0);
      }
    }
  });

  test("covers a spread of difficulties", () => {
    const seen = new Set(ALL_QUESTIONS.map((q) => q.difficulty));
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  test("uses more than one question type", () => {
    const seen = new Set(ALL_QUESTIONS.map((q) => q.type));
    expect(seen.size).toBeGreaterThanOrEqual(4);
  });
});

describe("concept checks", () => {
  test("accepts a question with named concepts", () => {
    const errors = validateContent(
      [track],
      [mcq({ concepts: ["Cache-aside", "TTL"] })],
    );
    expect(errors).toEqual([]);
  });

  test("rejects a blank concept", () => {
    const errors = validateContent([track], [mcq({ concepts: ["TTL", "  "] })]);
    expect(errors.join(" ")).toMatch(/concept/i);
  });

  test("rejects duplicate concepts", () => {
    const errors = validateContent([track], [mcq({ concepts: ["TTL", "TTL"] })]);
    expect(errors.join(" ")).toMatch(/duplicate/i);
  });

  test("rejects an empty concepts array, since it says nothing", () => {
    const errors = validateContent([track], [mcq({ concepts: [] })]);
    expect(errors.join(" ")).toMatch(/concept/i);
  });


});


