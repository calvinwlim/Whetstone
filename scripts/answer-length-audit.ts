import { ALL_QUESTIONS } from "../src/content";
import type { McqQuestion } from "../src/content/types";

/** A learner who always picks the longest option should score no better than
 *  chance. Right now they would not: a precisely-worded correct answer next
 *  to lazily short distractors is a tell, not a question, and it teaches
 *  nothing about the material to whoever notices it.
 *
 *  Flags every MCQ where the correct option is strictly the single longest,
 *  by more than IGNORABLE_GAP characters over the next-longest option. A
 *  small gap is not the tell -- a plausible distractor is sometimes going to
 *  come out a little shorter by chance, and forcing every option to the same
 *  length would make prose worse for no real gain. A double-digit gap is
 *  what a skimming reader actually notices.
 *
 *  Run directly for the full worst-first report; run with --check for the
 *  form CI runs, which only prints the summary and fails the build past
 *  MAX_LONGEST_RATE. */
const IGNORABLE_GAP = 15;

/** The rate this settled at once every question over IGNORABLE_GAP had been
 *  rewritten (see git log for the tracks fixed so far). Some legitimate
 *  correct answers will still happen to be the longest option -- eliminating
 *  every last one would mean padding distractors artificially, which is its
 *  own tell. This threshold catches a *systematic* reintroduction of the
 *  pattern, not each individual coincidence. */
const MAX_LONGEST_RATE = 0.3;

interface Flagged {
  id: string;
  track: string;
  topic: string;
  gap: number;
  correctText: string;
  longestOtherText: string;
}

function audit(): { mcqCount: number; longestCount: number; flagged: Flagged[] } {
  const mcqs = ALL_QUESTIONS.filter((q): q is McqQuestion => q.type === "mcq");
  const flagged: Flagged[] = [];
  let longestCount = 0;

  for (const q of mcqs) {
    const correct = q.options.find((o) => o.id === q.answer);
    if (!correct) continue; // validate-content.ts is what catches this; not this script's job.

    const maxLen = Math.max(...q.options.map((o) => o.text.length));
    if (correct.text.length !== maxLen) continue;

    longestCount++;

    const others = q.options.filter((o) => o.id !== q.answer);
    const longestOther = others.reduce((a, b) => (a.text.length >= b.text.length ? a : b));
    const gap = correct.text.length - longestOther.text.length;

    if (gap > IGNORABLE_GAP) {
      flagged.push({
        id: q.id,
        track: q.track,
        topic: q.topic,
        gap,
        correctText: correct.text,
        longestOtherText: longestOther.text,
      });
    }
  }

  return { mcqCount: mcqs.length, longestCount, flagged };
}

const { mcqCount, longestCount, flagged } = audit();
flagged.sort((a, b) => b.gap - a.gap);

const checkOnly = process.argv.includes("--check");
const rate = longestCount / mcqCount;

if (!checkOnly) {
  console.log(`${flagged.length} questions with a gap over ${IGNORABLE_GAP} chars, worst first:\n`);
  for (const f of flagged) {
    console.log(`--- ${f.id}  [${f.track} / ${f.topic}]  gap=${f.gap}`);
    console.log(`  correct: ${f.correctText}`);
    console.log(`  longest other: ${f.longestOtherText}`);
  }
  console.log("");
}

console.log(
  `MCQ: ${mcqCount}  correct-is-longest: ${longestCount} (${(rate * 100).toFixed(1)}%)` +
    `  gap>${IGNORABLE_GAP}: ${flagged.length}`,
);

if (rate > MAX_LONGEST_RATE) {
  console.log(
    `\n! correct-is-longest rate ${(rate * 100).toFixed(1)}% exceeds the ${(MAX_LONGEST_RATE * 100).toFixed(0)}% ceiling`,
  );
  process.exit(1);
}
