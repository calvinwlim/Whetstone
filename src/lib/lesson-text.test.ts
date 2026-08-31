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

describe("parseInline code spans", () => {
  test("parses a backtick-delimited code span", () => {
    expect(parseInline("use `SELECT *` here")).toEqual([
      { type: "text", value: "use " },
      { type: "code", value: "SELECT *" },
      { type: "text", value: " here" },
    ]);
  });

  test("parses a code span at the start of a line", () => {
    expect(parseInline("`WHERE` filters rows")).toEqual([
      { type: "code", value: "WHERE" },
      { type: "text", value: " filters rows" },
    ]);
  });

  test("parses several code spans in one line", () => {
    expect(parseInline("`ON` versus `WHERE`")).toEqual([
      { type: "code", value: "ON" },
      { type: "text", value: " versus " },
      { type: "code", value: "WHERE" },
    ]);
  });

  test("does not treat asterisks inside code as emphasis", () => {
    expect(parseInline("`COUNT(*)`")).toEqual([
      { type: "code", value: "COUNT(*)" },
    ]);
  });

  test("leaves an unmatched backtick as literal text", () => {
    expect(parseInline("a ` b")).toEqual([{ type: "text", value: "a ` b" }]);
  });

  test("mixes code with bold and italic", () => {
    expect(parseInline("**Note** the `NULL` in *this* case")).toEqual([
      { type: "bold", value: "Note" },
      { type: "text", value: " the " },
      { type: "code", value: "NULL" },
      { type: "text", value: " in " },
      { type: "italic", value: "this" },
      { type: "text", value: " case" },
    ]);
  });

  test("does not span across a newline", () => {
    expect(parseInline("a `b\nc` d")).toEqual([
      { type: "text", value: "a `b\nc` d" },
    ]);
  });
});
