import type { Difficulty } from "@/content/types";

/** The authored 1-5 scale collapses to the three words practice sites have
 *  already taught everyone. "Easy / Medium / Hard" tells a learner what to
 *  expect; "Level 3" tells them nothing. */
export type DifficultyTone = "easy" | "medium" | "hard";

export function difficultyLabel(difficulty: Difficulty): string {
  if (difficulty <= 2) return "Easy";
  if (difficulty === 3) return "Medium";
  return "Hard";
}

export function difficultyTone(difficulty: Difficulty): DifficultyTone {
  if (difficulty <= 2) return "easy";
  if (difficulty === 3) return "medium";
  return "hard";
}
