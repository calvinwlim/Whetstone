import { describe, expect, test } from "vitest";
import { parseInline, splitParagraphs } from "@/lib/lesson-text";

describe("splitParagraphs", () => {
  test("splits on blank lines", () => {
    expect(splitParagraphs("one\n\ntwo")).toEqual(["one", "two"]);
  });

  test("keeps single newlines inside a paragraph", () => {
    expect(splitParagraphs("one\ntwo")).toEqual(["one\ntwo"]);
  });

  test("drops empty trailing paragraphs", () => {
    expect(splitParagraphs("one\n\n\n")).toEqual(["one"]);
  });

  test("handles an empty string", () => {
    expect(splitParagraphs("")).toEqual([]);
  });
});

describe("parseInline", () => {
  test("returns plain text as a single segment", () => {
    expect(parseInline("hello")).toEqual([{ type: "text", value: "hello" }]);
  });

  test("parses bold", () => {
    expect(parseInline("a **b** c")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", value: "b" },
      { type: "text", value: " c" },
    ]);
  });

  test("parses italic", () => {
    expect(parseInline("a *b* c")).toEqual([
      { type: "text", value: "a " },
      { type: "italic", value: "b" },
      { type: "text", value: " c" },
    ]);
  });

  test("prefers bold over italic for double asterisks", () => {
    expect(parseInline("**b**")).toEqual([{ type: "bold", value: "b" }]);
  });

  test("handles bold and italic in one line", () => {
    expect(parseInline("**a** and *b*")).toEqual([
      { type: "bold", value: "a" },
      { type: "text", value: " and " },
      { type: "italic", value: "b" },
    ]);
  });

  test("leaves an unmatched asterisk as literal text", () => {
    expect(parseInline("2 * 3 = 6")).toEqual([
      { type: "text", value: "2 * 3 = 6" },
    ]);
  });

  test("handles an empty string", () => {
    expect(parseInline("")).toEqual([]);
  });
});
