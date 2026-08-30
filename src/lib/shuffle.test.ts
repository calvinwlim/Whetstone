import { describe, expect, test } from "vitest";
import { shuffleWithSeed, seedFromString } from "@/lib/shuffle";

describe("shuffleWithSeed", () => {
  test("keeps every element", () => {
    const input = [1, 2, 3, 4, 5];
    expect([...shuffleWithSeed(input, 7)].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test("returns the same order for the same seed", () => {
    const input = ["a", "b", "c", "d", "e", "f"];
    expect(shuffleWithSeed(input, 42)).toEqual(shuffleWithSeed(input, 42));
  });

  test("returns a different order for a different seed", () => {
    const input = ["a", "b", "c", "d", "e", "f", "g", "h"];
    expect(shuffleWithSeed(input, 1)).not.toEqual(shuffleWithSeed(input, 2));
  });

  test("does not mutate the input", () => {
    const input = [1, 2, 3, 4];
    shuffleWithSeed(input, 5);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  test("handles an empty array", () => {
    expect(shuffleWithSeed([], 1)).toEqual([]);
  });

  test("handles a single element", () => {
    expect(shuffleWithSeed(["only"], 1)).toEqual(["only"]);
  });
});

describe("seedFromString", () => {
  test("is stable for the same string", () => {
    expect(seedFromString("sd-cache-001")).toBe(seedFromString("sd-cache-001"));
  });

  test("differs for different strings", () => {
    expect(seedFromString("sd-cache-001")).not.toBe(seedFromString("sd-cache-002"));
  });
});
