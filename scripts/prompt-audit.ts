import { ALL_QUESTIONS } from "../src/content";

/** Generic prompts: every word is a function word or a placeholder noun, so
 *  the prompt names no subject and cannot be read away from its context. */
const FILLER = new Set(
  ("what which why how is are was were does do did the a an of in to for you" +
    " it this that these those and or not so happening happened wrong right" +
    " problem cause fix effect move response pattern approach technique" +
    " structure algorithm sequence check missing violated principle best" +
    " likely most efficient natural safest applies fits closes goes here" +
    " should would could must can be being been have has had first next" +
    " with about careful cover trade made cheapest simplest").split(" "),
);

const flagged = ALL_QUESTIONS.filter((q) =>
  q.prompt
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => FILLER.has(w)),
);

for (const q of flagged) {
  console.log(`--- ${q.id}  [${q.topic}]`);
  if (q.context) console.log(`ctx: ${q.context}`);
  console.log(`ask: ${q.prompt}`);
}
console.log(`\n${flagged.length} of ${ALL_QUESTIONS.length} flagged`);
