import { ALL_QUESTIONS } from "../src/content";

const counts = new Map<string, number>();
let untagged = 0;

for (const q of ALL_QUESTIONS) {
  const tags = q.tags ?? [];
  if (tags.length === 0) untagged++;
  for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
console.log("questions:", ALL_QUESTIONS.length);
console.log("distinct tags:", sorted.length);
console.log("questions with no tags:", untagged);
console.log("");
console.log(sorted.map(([t, n]) => `${t}:${n}`).join("  "));
