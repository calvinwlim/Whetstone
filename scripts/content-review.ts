import { ALL_QUESTIONS, TRACKS } from "../src/content";
import type { Question } from "../src/content/types";

/** Editorial checks that go beyond validity: balance, coverage, and habits
 *  that creep in when one person authors a whole bank in a sitting. */

const line = (s = "") => console.log(s);
const heading = (s: string) => {
  line();
  line(s);
  line("-".repeat(s.length));
};

const questionsFor = (topicId: string) =>
  ALL_QUESTIONS.filter((q) => q.topic === topicId);

heading("Thin topics (fewer than 5 questions)");
const thin: { topic: string; track: string; count: number }[] = [];
for (const track of TRACKS) {
  for (const topic of track.topics) {
    const count = questionsFor(topic.id).length;
    if (count < 5) {
      thin.push({ topic: topic.title, track: track.title, count });
    }
  }
}
thin.sort((a, b) => a.count - b.count);
for (const entry of thin) {
  line(`  ${String(entry.count).padStart(2)}  ${entry.topic}  (${entry.track})`);
}
line(`  ${thin.length} of ${TRACKS.flatMap((t) => t.topics).length} topics are thin`);

heading("Format mix per track");
for (const track of TRACKS) {
  const qs = ALL_QUESTIONS.filter((q) => q.track === track.id);
  const counts: Record<string, number> = {};
  for (const q of qs) counts[q.type] = (counts[q.type] ?? 0) + 1;
  const mcqShare = Math.round(((counts.mcq ?? 0) / qs.length) * 100);
  line(
    `  ${track.title.padEnd(24)} n=${String(qs.length).padStart(3)}  mcq ${String(mcqShare).padStart(3)}%  ${JSON.stringify(counts)}`,
  );
}
const overallMcq = Math.round(
  (ALL_QUESTIONS.filter((q) => q.type === "mcq").length / ALL_QUESTIONS.length) *
    100,
);
line(`  Overall MCQ share: ${overallMcq}%`);

heading("Answer-key position bias (mcq, as authored)");
const positions: Record<string, number> = {};
for (const q of ALL_QUESTIONS) {
  if (q.type !== "mcq") continue;
  const index = q.options.findIndex((o) => o.id === q.answer);
  const key = String.fromCharCode(97 + index);
  positions[key] = (positions[key] ?? 0) + 1;
}
line(`  ${JSON.stringify(positions)}`);
line("  (options are shuffled per question id at render, so this is cosmetic)");

heading("Difficulty by track");
for (const track of TRACKS) {
  const qs = ALL_QUESTIONS.filter((q) => q.track === track.id);
  const easy = qs.filter((q) => q.difficulty <= 2).length;
  const medium = qs.filter((q) => q.difficulty === 3).length;
  const hard = qs.filter((q) => q.difficulty >= 4).length;
  line(
    `  ${track.title.padEnd(24)} easy ${String(easy).padStart(3)}  medium ${String(medium).padStart(3)}  hard ${String(hard).padStart(3)}`,
  );
}

heading("Possible duplicates (similar prompts)");
function normalise(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}
function overlap(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.max(1, Math.min(a.size, b.size));
}
const bags = ALL_QUESTIONS.map((q) => ({ q, bag: normalise(q.prompt) }));
let pairs = 0;
for (let i = 0; i < bags.length; i++) {
  for (let j = i + 1; j < bags.length; j++) {
    const score = overlap(bags[i].bag, bags[j].bag);
    if (score >= 0.6) {
      pairs += 1;
      line(`  ${Math.round(score * 100)}%  ${bags[i].q.id} / ${bags[j].q.id}`);
      line(`        "${bags[i].q.prompt}"`);
      line(`        "${bags[j].q.prompt}"`);
    }
  }
}
if (pairs === 0) line("  none above 60% word overlap");

heading("Explanation depth");
const shortExplanations = ALL_QUESTIONS.filter(
  (q: Question) => q.explanation.length < 140,
);
line(`  ${shortExplanations.length} explanations under 140 characters`);
for (const q of shortExplanations.slice(0, 10)) {
  line(`    ${q.id} (${q.explanation.length}) ${q.explanation.slice(0, 70)}...`);
}

heading("Coverage: resources");
const withResources = ALL_QUESTIONS.filter(
  (q) => q.resources && q.resources.length > 0,
).length;
const topicsWithResources = TRACKS.flatMap((t) => t.topics).filter(
  (t) => t.resources && t.resources.length > 0,
).length;
line(`  ${withResources}/${ALL_QUESTIONS.length} questions link a resource`);
line(
  `  ${topicsWithResources}/${TRACKS.flatMap((t) => t.topics).length} topics link a resource`,
);
