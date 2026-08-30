import { describe, expect, test } from "vitest";
import { difficultyLabel, difficultyTone } from "@/lib/difficulty";

describe("difficultyLabel", () => {
  test("treats levels 1 and 2 as Easy", () => {
    expect(difficultyLabel(1)).toBe("Easy");
    expect(difficultyLabel(2)).toBe("Easy");
  });

  test("treats level 3 as Medium", () => {
    expect(difficultyLabel(3)).toBe("Medium");
  });

  test("treats levels 4 and 5 as Hard", () => {
    expect(difficultyLabel(4)).toBe("Hard");
    expect(difficultyLabel(5)).toBe("Hard");
  });
});

describe("difficultyTone", () => {
  test("gives each band its own tone", () => {
    expect(difficultyTone(1)).toBe("easy");
    expect(difficultyTone(3)).toBe("medium");
    expect(difficultyTone(5)).toBe("hard");
  });

  test("agrees with the label for every level", () => {
    const pairs = [
      [1, "Easy"],
      [2, "Easy"],
      [3, "Medium"],
      [4, "Hard"],
      [5, "Hard"],
    ] as const;
    for (const [level, label] of pairs) {
      expect(difficultyTone(level)).toBe(label.toLowerCase());
    }
  });
});
