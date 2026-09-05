import type { Question } from "@/content/types";
import {
  PATH_LANES,
  PATH_STAGES,
  STARTING_STAGE,
  type ExperienceLevel,
} from "@/content/path";
import type { SrsState } from "@/lib/srs";
import type { Tally } from "@/lib/progress";

/** Distinct questions you must have answered in a topic before the path calls
 *  it done. Capped by how many the topic actually has, so a thin topic is
 *  still completable. */
const REQUIRED_ATTEMPTS = 5;

/** And you have to have got most of them right. Below this the topic reads as
 *  in progress rather than complete, which is the point of a path -- moving on
 *  from something you are getting wrong is how the next stage stops making
 *  sense. */
const PASS_ACCURACY = 0.7;

export type UnitStatus = "complete" | "in-progress" | "available" | "locked";

export interface PathUnit {
  topicId: string;
  title: string;
  status: UnitStatus;
  /** Distinct questions in this topic that have been answered at least once. */
  attempted: number;
  /** How many are needed to complete it. */
  required: number;
  total: number;
  accuracy: number | undefined;
}

export interface PathStageView {
  id: string;
  title: string;
  blurb: string;
  units: PathUnit[];
  unlocked: boolean;
  complete: boolean;
  /** Completed units over total, for the progress bar. */
  done: number;
}

export interface PathLaneView {
  id: string;
  title: string;
  blurb: string;
  units: PathUnit[];
  done: number;
}

export interface PathInput {
  questions: Question[];
  srs: Record<string, SrsState>;
  byTopic: Record<string, Tally>;
  topicTitles: Record<string, string>;
  experienceLevel?: ExperienceLevel;
}

interface TopicFacts {
  attempted: number;
  required: number;
  total: number;
  accuracy: number | undefined;
  complete: boolean;
}

/** Everything the path needs to know about one topic, derived entirely from
 *  progress that already exists. This is what lets somebody who has been using
 *  the daily mix for a month open the path and find it partly filled in,
 *  rather than being told to start from zero. */
function factsFor(topicId: string, input: PathInput): TopicFacts {
  const questions = input.questions.filter((q) => q.topic === topicId);
  const attempted = questions.filter((q) => input.srs[q.id] !== undefined).length;
  const required = Math.min(REQUIRED_ATTEMPTS, questions.length);

  const tally = input.byTopic[topicId];
  const accuracy =
    tally && tally.seen > 0 ? tally.correct / tally.seen : undefined;

  const complete =
    required > 0 &&
    attempted >= required &&
    accuracy !== undefined &&
    accuracy >= PASS_ACCURACY;

  return { attempted, required, total: questions.length, accuracy, complete };
}

function unitFor(topicId: string, input: PathInput, unlocked: boolean): PathUnit {
  const facts = factsFor(topicId, input);
  const status: UnitStatus = facts.complete
    ? "complete"
    : !unlocked
      ? "locked"
      : facts.attempted > 0
        ? "in-progress"
        : "available";

  return {
    topicId,
    title: input.topicTitles[topicId] ?? topicId,
    status,
    attempted: facts.attempted,
    required: facts.required,
    total: facts.total,
    accuracy: facts.accuracy,
  };
}

/** Stages unlock in order, and a stated experience level can open several at
 *  once. Note what is deliberately absent: units inside a stage do not lock
 *  each other. Strict one-at-a-time sequencing reads badly for anyone with
 *  existing history, who would see a completed topic sitting behind a locked
 *  one purely because the daily mix served it early. */
export function buildStages(input: PathInput): PathStageView[] {
  const floor = input.experienceLevel
    ? STARTING_STAGE[input.experienceLevel]
    : 0;

  const views: PathStageView[] = [];
  let previousComplete: boolean = true;

  for (const [index, stage] of PATH_STAGES.entries()) {
    const unlocked: boolean = previousComplete || index <= floor;
    const units: PathUnit[] = stage.topics.map((topicId) =>
      unitFor(topicId, input, unlocked),
    );
    const done: number = units.filter((u) => u.status === "complete").length;
    const complete: boolean = done === units.length;

    views.push({
      id: stage.id,
      title: stage.title,
      blurb: stage.blurb,
      units,
      unlocked,
      complete,
      done,
    });

    previousComplete = previousComplete && complete;
  }

  return views;
}

/** Lanes have no lock at all. They are a recommendation about what is worth
 *  your time given what you do, not a gate -- somebody who wants to read about
 *  sharding on day one should be allowed to. */
export function buildLanes(input: PathInput): PathLaneView[] {
  return PATH_LANES.map((lane) => {
    const units = lane.topics.map((topicId) => unitFor(topicId, input, true));
    return {
      id: lane.id,
      title: lane.title,
      blurb: lane.blurb,
      units,
      done: units.filter((u) => u.status === "complete").length,
    };
  });
}

/** The one thing the path has to answer on every visit: what next? Resumes an
 *  unfinished topic before starting a fresh one, so a half-done unit does not
 *  get stranded behind newer ones. */
export function nextUnit(stages: PathStageView[]): PathUnit | undefined {
  for (const stage of stages) {
    if (!stage.unlocked) continue;
    const resumable = stage.units.find((u) => u.status === "in-progress");
    if (resumable) return resumable;
    const fresh = stage.units.find((u) => u.status === "available");
    if (fresh) return fresh;
  }
  return undefined;
}

/** Spine progress as a fraction, for the header. Lanes are excluded on
 *  purpose: they are optional, so counting them would make the number depend
 *  on how much optional material a person chose to ignore. */
export function spineProgress(stages: PathStageView[]): {
  done: number;
  total: number;
} {
  const units = stages.flatMap((s) => s.units);
  return {
    done: units.filter((u) => u.status === "complete").length,
    total: units.length,
  };
}
