import type { Difficulty, Question, TrackId } from "@/content/types";
import { isDue, type SrsState } from "@/lib/srs";

export interface ComposeInput {
  questions: Question[];
  /** SRS state keyed by question id. Absent means never seen. */
  srs: Record<string, SrsState>;
  goal: number;
  now: Date;
  enabledTracks?: TrackId[];
  /** Rolling overall accuracy, 0..1. Drives the difficulty band. */
  accuracy?: number;
  /** Per-topic accuracy, 0..1. Weak topics get served more often. */
  topicAccuracy?: Record<string, number>;
  /** Topics marked as specialist depth. Kept out of new material by default
   *  so the daily mix stays close to a software engineer's week. */
  depthTopics?: Set<string>;
  /** Opt in to depth topics appearing in the daily mix. */
  includeDepth?: boolean;
  /** Serve the easiest unseen questions first within the band.
   *
   *  The daily mix deliberately does not do this -- variety is the point
   *  there. A learning path unit is the opposite: it is somebody's first
   *  contact with a topic, so opening on the hardest question the band allows
   *  is how a beginner concludes the topic is not for them. */
  easiestFirst?: boolean;
  /** Defaults to the calendar day, so reloading keeps the same session. */
  seed?: number;
}

/** Difficulty window for a learner at this accuracy. Sustained accuracy walks
 *  the window upward, which is what makes a mixed-difficulty bank worthwhile. */
export function targetBand(accuracy?: number): [Difficulty, Difficulty] {
  if (accuracy === undefined) return [1, 3];
  if (accuracy < 0.5) return [1, 2];
  if (accuracy < 0.7) return [1, 3];
  if (accuracy < 0.85) return [2, 4];
  return [3, 5];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedForDay(now: Date): number {
  const key = now.toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Weaker topics weigh more, so the session drifts toward what you're worst at.
 *  An unseen topic sits in the middle rather than dominating on no evidence. */
function weightFor(question: Question, topicAccuracy?: Record<string, number>) {
  const accuracy = topicAccuracy?.[question.topic];
  if (accuracy === undefined) return 1;
  return 1 + (1 - accuracy) * 3;
}

/** Weight descending, ties broken by the seeded RNG so the order is stable
 *  for a given day but not the same every day. With `easiestFirst`, difficulty
 *  leads and the weight becomes the tiebreak. */
function pickOrdered(
  questions: Question[],
  rng: () => number,
  topicAccuracy: Record<string, number> | undefined,
  easiestFirst = false,
): Question[] {
  return questions
    .map((question) => ({
      question,
      weight: weightFor(question, topicAccuracy),
      tiebreak: rng(),
    }))
    .sort((a, b) =>
      easiestFirst
        ? a.question.difficulty - b.question.difficulty ||
          b.weight - a.weight ||
          a.tiebreak - b.tiebreak
        : b.weight - a.weight || a.tiebreak - b.tiebreak,
    )
    .map((entry) => entry.question);
}

export function composeSession(input: ComposeInput): Question[] {
  const { questions, srs, goal, now, enabledTracks, accuracy, topicAccuracy } =
    input;
  if (goal <= 0) return [];

  const pool = enabledTracks
    ? questions.filter((q) => enabledTracks.includes(q.track))
    : questions;

  // Due reviews come first, most overdue leading.
  const reviews = pool
    .filter((q) => srs[q.id] && isDue(srs[q.id], now))
    .sort(
      (a, b) => Date.parse(srs[a.id].dueAt) - Date.parse(srs[b.id].dueAt),
    )
    .slice(0, goal);

  const remaining = goal - reviews.length;
  if (remaining <= 0) return reviews;

  const rng = mulberry32(input.seed ?? seedForDay(now));

  // Depth topics are excluded from NEW material only. Anything already
  // started stays in the review queue, so opting in and out never strands
  // questions mid-schedule.
  const { depthTopics, includeDepth } = input;
  const unseen = pool.filter(
    (q) =>
      !srs[q.id] &&
      (includeDepth || !depthTopics || !depthTopics.has(q.topic)),
  );
  const [min, max] = targetBand(accuracy);

  const inBand = unseen.filter(
    (q) => q.difficulty >= min && q.difficulty <= max,
  );
  const outOfBand = unseen.filter(
    (q) => q.difficulty < min || q.difficulty > max,
  );

  // Prefer the band, but never hand back a short session just to respect it.
  const easiestFirst = input.easiestFirst ?? false;
  const fresh = [
    ...pickOrdered(inBand, rng, topicAccuracy, easiestFirst),
    ...pickOrdered(outOfBand, rng, topicAccuracy, easiestFirst),
  ].slice(0, remaining);

  return [...reviews, ...fresh];
}
