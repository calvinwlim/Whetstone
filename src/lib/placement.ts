import type { Question } from "@/content/types";
import {
  PATH_STAGES,
  STARTING_STAGE,
  type ExperienceLevel,
} from "@/content/path";

/** Two questions per stage. Enough to be a signal, short enough that somebody
 *  will actually finish it before they have seen the product work. */
const PER_STAGE = 2;

/** What each stage is pitched at. Stage 1 opens at band 2 rather than band 1
 *  because a placement check is not a lesson -- getting "what does a load
 *  balancer do" right proves very little about whether the foundations can be
 *  skipped. */
const STAGE_DIFFICULTY = [2, 2, 3, 3] as const;

/** Stage index back to the level that opens it, which is the inverse of
 *  STARTING_STAGE. Derived rather than written twice, so the two can never
 *  drift apart. */
const LEVEL_FOR_STAGE = (Object.entries(STARTING_STAGE) as [
  ExperienceLevel,
  number,
][])
  .sort((a, b) => a[1] - b[1])
  .map(([level]) => level);

export interface PlacementResult {
  /** The level the answers suggest. */
  level: ExperienceLevel;
  /** Correct count per stage, in stage order. */
  byStage: number[];
  perStage: number;
  /** The first stage where they did not get everything right -- the stage the
   *  path will open at. */
  stageIndex: number;
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

/** Questions nearest the stage's target difficulty, preferring exact matches
 *  and never taking two from one topic while another is available -- a
 *  placement that asked two caching questions would be measuring caching. */
function forStage(
  stageIndex: number,
  questions: Question[],
  rng: () => number,
): Question[] {
  const stage = PATH_STAGES[stageIndex];
  const target = STAGE_DIFFICULTY[stageIndex];

  const byTopic = stage.topics.map((topicId) =>
    questions
      .filter((q) => q.topic === topicId)
      .sort(
        (a, b) =>
          Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target) ||
          rng() - 0.5,
      ),
  );

  // Shuffle which topics get asked, then take the best question from each.
  return byTopic
    .filter((list) => list.length > 0)
    .map((list) => ({ list, order: rng() }))
    .sort((a, b) => a.order - b.order)
    .slice(0, PER_STAGE)
    .map(({ list }) => list[0]);
}

/** The placement set, in stage order so the drill gets harder as it goes and
 *  somebody who is out of their depth can see why. */
export function composePlacement(
  questions: Question[],
  seed = 1,
): Question[] {
  const rng = mulberry32(seed);
  return PATH_STAGES.flatMap((_, index) => forStage(index, questions, rng));
}

/** Scored by where somebody first stops getting everything right, which is
 *  also where the path should open. Getting every question right places you
 *  at the top; missing one in stage 1 places you at the bottom.
 *
 *  Deliberately strict: the cost of placing somebody too low is a few minutes
 *  of easy questions they can skip past, and the cost of placing them too high
 *  is a path that assumes knowledge they do not have. */
export function scorePlacement(
  session: Question[],
  results: boolean[],
): PlacementResult {
  const byStage = PATH_STAGES.map((_, index) => {
    const slice = results.slice(index * PER_STAGE, (index + 1) * PER_STAGE);
    return slice.filter(Boolean).length;
  });

  const firstStumble = byStage.findIndex((correct) => correct < PER_STAGE);
  const stageIndex =
    firstStumble === -1 ? PATH_STAGES.length - 1 : firstStumble;

  return {
    level: LEVEL_FOR_STAGE[stageIndex] ?? "junior",
    byStage,
    perStage: PER_STAGE,
    stageIndex,
  };
}

/** How many questions a placement check asks, for the copy that promises it. */
export const PLACEMENT_LENGTH = PATH_STAGES.length * PER_STAGE;
