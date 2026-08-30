import type { Difficulty } from "@/content/types";
import { difficultyLabel, difficultyTone } from "@/lib/difficulty";

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`pill pill-${difficultyTone(difficulty)}`}>
      {difficultyLabel(difficulty)}
    </span>
  );
}

/** Compact Easy / Medium / Hard counts for a set of questions, the way a
 *  problem list summarises what is inside a topic before you open it. */
export function DifficultySpread({
  difficulties,
}: {
  difficulties: Difficulty[];
}) {
  const easy = difficulties.filter((d) => d <= 2).length;
  const medium = difficulties.filter((d) => d === 3).length;
  const hard = difficulties.filter((d) => d >= 4).length;

  return (
    <span className="font-mono text-xs tabular-nums">
      <span className="text-green">{easy}</span>
      <span className="text-text-2">/</span>
      <span className="text-amber">{medium}</span>
      <span className="text-text-2">/</span>
      <span className="text-red">{hard}</span>
    </span>
  );
}
