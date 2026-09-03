import { ALL_QUESTIONS, ALL_TOPICS, TRACKS } from "../src/content";

const perTopic = new Map<string, number>();
for (const q of ALL_QUESTIONS) {
  perTopic.set(q.topic, (perTopic.get(q.topic) ?? 0) + 1);
}

const thin = ALL_TOPICS.filter((t) => (perTopic.get(t.id) ?? 0) < 7).sort(
  (a, b) => (perTopic.get(a.id) ?? 0) - (perTopic.get(b.id) ?? 0),
);

const shortLessons = ALL_TOPICS.map((t) => ({
  id: t.id,
  title: t.title,
  words: t.lesson.trim().split(/\s+/).length,
}))
  .sort((a, b) => a.words - b.words)
  .slice(0, 10);

const noResources = ALL_TOPICS.filter(
  (t) => !t.resources || t.resources.length === 0,
);

const types: Record<string, number> = {};
for (const q of ALL_QUESTIONS) types[q.type] = (types[q.type] ?? 0) + 1;

const withContext = ALL_QUESTIONS.filter((q) => q.context).length;
const explLengths = ALL_QUESTIONS.map(
  (q) => q.explanation.trim().split(/\s+/).length,
);
const avgExpl =
  explLengths.reduce((a, b) => a + b, 0) / Math.max(1, explLengths.length);

console.log("questions:", ALL_QUESTIONS.length, "topics:", ALL_TOPICS.length);
console.log("types:", types);
console.log("with a context block:", withContext);
console.log("explanation words — avg:", avgExpl.toFixed(1),
  "min:", Math.min(...explLengths), "max:", Math.max(...explLengths));
console.log("explanations under 25 words:",
  explLengths.filter((n) => n < 25).length);
console.log("\ntopics with fewer than 7 questions:", thin.length);
for (const t of thin.slice(0, 12)) {
  console.log(`  ${perTopic.get(t.id)}  ${t.title}`);
}
console.log("\nshortest lessons (words):");
for (const l of shortLessons) console.log(`  ${l.words}  ${l.title}`);
console.log("\ntopics with no resources:", noResources.length);
console.log("\nper-track question counts:");
for (const track of TRACKS) {
  const n = ALL_QUESTIONS.filter((q) => q.track === track.id).length;
  console.log(`  ${String(n).padStart(4)}  ${track.title} (${track.topics.length} topics)`);
}
