import { ALL_QUESTIONS, TRACKS } from "../src/content";
import { validateContent } from "../src/content/validate";

const byType: Record<string, number> = {};
const byDifficulty: Record<string, number> = {};
for (const question of ALL_QUESTIONS) {
  byType[question.type] = (byType[question.type] ?? 0) + 1;
  byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] ?? 0) + 1;
}

console.log(`Questions: ${ALL_QUESTIONS.length}`);
console.log(`Topics:    ${TRACKS.flatMap((t) => t.topics).length}`);
console.log("");

for (const track of TRACKS) {
  const count = ALL_QUESTIONS.filter((q) => q.track === track.id).length;
  console.log(`  ${track.title.padEnd(24)} ${String(count).padStart(3)} questions  ${track.topics.length} topics`);
  for (const topic of track.topics) {
    const n = ALL_QUESTIONS.filter((q) => q.topic === topic.id).length;
    console.log(`    - ${topic.title.padEnd(30)} ${n}`);
  }
}

console.log("\nBy type:      ", byType);
console.log("By difficulty:", byDifficulty);

const errors = validateContent(TRACKS, ALL_QUESTIONS);
console.log(`\nValidation: ${errors.length === 0 ? "clean" : `${errors.length} errors`}`);
for (const error of errors) console.log(`  ! ${error}`);
if (errors.length > 0) process.exit(1);
