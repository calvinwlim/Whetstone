import type { Question, Response, ShortQuestion } from "@/content/types";

export interface GradeResult {
  correct: boolean;
}

/** Lowercase, collapse internal whitespace, drop surrounding punctuation.
 *  Internal punctuation is kept so "write-through" and "write through" stay
 *  distinct strings -- questions list both spellings when both are acceptable. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

/** Standard Levenshtein distance, used only for single-typo tolerance. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[b.length];
}

function gradeShort(question: ShortQuestion, text: string): boolean {
  const given = normalize(text);
  if (given === "") return false;
  const accepted = question.answers.map(normalize);
  if (accepted.includes(given)) return true;
  if (!question.typoTolerance) return false;
  return accepted.some((answer) => editDistance(given, answer) <= 1);
}

function sameSet(a: string[], b: string[]): boolean {
  const left = new Set(a);
  const right = new Set(b);
  if (left.size !== right.size) return false;
  for (const value of left) if (!right.has(value)) return false;
  return true;
}

/** Deterministic, synchronous, client-side. No network, no model. */
export function gradeResponse(
  question: Question,
  response: Response,
): GradeResult {
  if (question.type !== response.type) return { correct: false };

  switch (question.type) {
    case "mcq":
      return {
        correct:
          response.type === "mcq" && response.optionId === question.answer,
      };

    case "multi":
      return {
        correct:
          response.type === "multi" &&
          sameSet(response.optionIds, question.answers),
      };

    case "short":
      return {
        correct: response.type === "short" && gradeShort(question, response.text),
      };

    case "matching": {
      if (response.type !== "matching") return { correct: false };
      const given = response.pairs;
      const correct =
        Object.keys(given).length === question.pairs.length &&
        question.pairs.every((pair) => given[pair.left] === pair.right);
      return { correct };
    }

    case "ordering": {
      if (response.type !== "ordering") return { correct: false };
      const correct =
        response.items.length === question.items.length &&
        question.items.every((item, i) => response.items[i] === item);
      return { correct };
    }
  }
}
