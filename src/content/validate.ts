import type { Question, Track } from "@/content/types";

/** Structural checks over the authored bank. Run as a test and as a build
 *  gate, so a malformed question fails CI rather than reaching a drill where
 *  it would teach the wrong thing or be impossible to answer. */
export function validateContent(
  tracks: Track[],
  questions: Question[],
): string[] {
  const errors: string[] = [];

  const topicIds = new Set<string>();
  for (const track of tracks) {
    for (const topic of track.topics) {
      if (topicIds.has(topic.id)) {
        errors.push(`Duplicate topic id "${topic.id}"`);
      }
      topicIds.add(topic.id);

      if (topic.track !== track.id) {
        errors.push(
          `Topic "${topic.id}" declares track "${topic.track}" but sits under track "${track.id}"`,
        );
      }
      for (const resource of topic.resources ?? []) {
        if (!isHttpUrl(resource.url)) {
          errors.push(`Topic "${topic.id}" has an invalid resource url`);
        }
      }
    }
  }

  const trackIds = new Set(tracks.map((t) => t.id));
  const seenQuestionIds = new Set<string>();

  for (const question of questions) {
    const at = `Question "${question.id}"`;

    if (seenQuestionIds.has(question.id)) {
      errors.push(`Duplicate question id "${question.id}"`);
    }
    seenQuestionIds.add(question.id);

    if (!trackIds.has(question.track)) {
      errors.push(`${at} references unknown track "${question.track}"`);
    }
    if (!topicIds.has(question.topic)) {
      errors.push(`${at} references unknown topic "${question.topic}"`);
    }
    if (question.prompt.trim() === "") errors.push(`${at} has an empty prompt`);
    if (question.explanation.trim() === "") {
      errors.push(`${at} has an empty explanation`);
    }
    for (const resource of question.resources ?? []) {
      if (!isHttpUrl(resource.url)) {
        errors.push(`${at} has an invalid resource url "${resource.url}"`);
      }
    }

    errors.push(...validateConcepts(question.concepts, at));

    errors.push(...validateByType(question, at));
  }

  return errors;
}

function validateByType(question: Question, at: string): string[] {
  const errors: string[] = [];

  switch (question.type) {
    case "mcq": {
      const ids = question.options.map((o) => o.id);
      if (ids.length < 2) errors.push(`${at} needs at least 2 options`);
      if (new Set(ids).size !== ids.length) {
        errors.push(`${at} has duplicate option ids`);
      }
      if (!ids.includes(question.answer)) {
        errors.push(`${at} answer "${question.answer}" is not one of its options`);
      }
      break;
    }

    case "multi": {
      const ids = question.options.map((o) => o.id);
      if (ids.length < 2) errors.push(`${at} needs at least 2 options`);
      if (new Set(ids).size !== ids.length) {
        errors.push(`${at} has duplicate option ids`);
      }
      if (question.answers.length === 0) {
        errors.push(`${at} has no correct answers`);
      }
      for (const answer of question.answers) {
        if (!ids.includes(answer)) {
          errors.push(`${at} answer "${answer}" is not one of its options`);
        }
      }
      // A question where everything is correct tests nothing.
      if (
        question.answers.length > 0 &&
        question.answers.length === ids.length
      ) {
        errors.push(`${at} marks every option correct`);
      }
      break;
    }

    case "short": {
      if (question.answers.length === 0) {
        errors.push(`${at} has no accepted answers`);
      }
      if (question.answers.some((a) => a.trim() === "")) {
        errors.push(`${at} has a blank accepted answer`);
      }
      break;
    }

    case "matching": {
      if (question.pairs.length < 2) {
        errors.push(`${at} needs at least 2 pairs`);
      }
      const lefts = question.pairs.map((p) => p.left);
      const rights = question.pairs.map((p) => p.right);
      if (new Set(lefts).size !== lefts.length) {
        errors.push(`${at} has duplicate left values`);
      }
      // Identical targets would make more than one arrangement correct.
      if (new Set(rights).size !== rights.length) {
        errors.push(`${at} has duplicate right values, making the answer ambiguous`);
      }
      break;
    }

    case "ordering": {
      if (question.items.length < 2) {
        errors.push(`${at} needs at least 2 items`);
      }
      if (new Set(question.items).size !== question.items.length) {
        errors.push(`${at} has duplicate items, making the order ambiguous`);
      }
      break;
    }
  }

  return errors;
}

/** Concepts are the terms a learner goes and looks up, so they have to read as
 *  names rather than as internal tag slugs. */
function validateConcepts(
  concepts: string[] | undefined,
  at: string,
): string[] {
  if (concepts === undefined) return [];

  const errors: string[] = [];

  if (concepts.length === 0) {
    errors.push(`${at} has an empty concepts list; omit the field instead`);
  }
  if (concepts.some((concept) => concept.trim() === "")) {
    errors.push(`${at} has a blank concept`);
  }

  const seen = new Set(concepts.map((concept) => concept.trim().toLowerCase()));
  if (seen.size !== concepts.length) {
    errors.push(`${at} has duplicate concepts`);
  }

  for (const concept of concepts) {
    // "n+1-query" is a slug; "N+1 query problem" is a name someone can search.
    // Hyphenated names are fine when they carry a capital ("Cache-aside") or
    // sit inside a longer phrase; an all-lowercase hyphenated token with no
    // spaces is a tag that escaped into the wrong field.
    const value = concept.trim();
    // Command flags and options legitimately look like this (--force-with-lease,
    // -Wall) and are exactly the term someone would search for.
    const isFlag = value.startsWith("-");
    const isSlug =
      !isFlag &&
      !value.includes(" ") &&
      value.includes("-") &&
      value === value.toLowerCase();
    if (isSlug) {
      errors.push(
        `${at} concept "${concept}" looks like a slug; write it as a name`,
      );
    }
  }

  return errors;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
