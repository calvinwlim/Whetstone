import { ALL_QUESTIONS, TRACKS } from "../src/content";

console.log("Topics with fewer than 2 easy (band 1-2) questions:");
console.log("");
let thin = 0;
for (const track of TRACKS) {
  const rows: string[] = [];
  for (const topic of track.topics) {
    const qs = ALL_QUESTIONS.filter((q) => q.topic === topic.id);
    const easy = qs.filter((q) => q.difficulty <= 2).length;
    if (easy < 2) {
      rows.push(`    ${topic.id.padEnd(26)} easy=${easy}  total=${qs.length}`);
      thin++;
    }
  }
  if (rows.length > 0) {
    console.log(`  ${track.title}`);
    console.log(rows.join("\n"));
  }
}
console.log("");
console.log(`${thin} topics need easy-band questions`);
const d = ALL_QUESTIONS.reduce<Record<number, number>>((acc, q) => {
  acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
  return acc;
}, {});
console.log("current difficulty spread:", d);
