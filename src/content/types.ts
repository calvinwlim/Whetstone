/** Content schema. Everything here is authored by hand in `src/content/tracks/*`
 *  and bundled at build time -- no database reads to render a question. */

export type TrackId =
  | "system-design"
  | "ai-engineering"
  | "api-integration"
  | "data-enterprise"
  | "frontend"
  | "delivery"
  | "code-craft"
  | "sql-analytics"
  | "communication"
  | "dsa-concepts"
  | "workplace";

/** 1 = fundamentals, 5 = staff-level ambiguity. Used to band questions to the
 *  learner's rolling accuracy so the bank stays useful as they level up. */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type QuestionType = "mcq" | "multi" | "short" | "matching" | "ordering";

export interface Resource {
  label: string;
  url: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

interface QuestionBase {
  id: string;
  track: TrackId;
  topic: string;
  difficulty: Difficulty;
  /** Optional scenario framing rendered above the prompt. */
  context?: string;
  prompt: string;
  /** Always shown after answering, right or wrong. */
  explanation: string;
  /** Named, lookup-able terms this question teaches -- the CRUD or ETL a
   *  learner can go and read about afterwards. Surfaced after answering.
   *  Write them as proper names, not slugs: "N+1 query problem", not "n+1". */
  concepts: string[];
  resources?: Resource[];
  tags?: string[];
}

export interface McqQuestion extends QuestionBase {
  type: "mcq";
  options: Option[];
  answer: string;
}

export interface MultiQuestion extends QuestionBase {
  type: "multi";
  options: Option[];
  answers: string[];
}

export interface ShortQuestion extends QuestionBase {
  type: "short";
  /** Any of these count as correct, after normalisation. */
  answers: string[];
  /** Allow a single-character typo. Off for questions where spelling matters. */
  typoTolerance?: boolean;
}

export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  pairs: MatchPair[];
}

export interface OrderingQuestion extends QuestionBase {
  type: "ordering";
  /** Stored in the correct order; shuffled for display. */
  items: string[];
}

export type Question =
  | McqQuestion
  | MultiQuestion
  | ShortQuestion
  | MatchingQuestion
  | OrderingQuestion;

export type Response =
  | { type: "mcq"; optionId: string | null }
  | { type: "multi"; optionIds: string[] }
  | { type: "short"; text: string }
  | { type: "matching"; pairs: Record<string, string> }
  | { type: "ordering"; items: string[] };

export interface Topic {
  /** Marks a topic as specialist depth rather than the software engineering
   *  core -- platform, data, or enterprise material that is worth having and
   *  is not what most engineers hit in a normal week. Depth topics stay fully
   *  browsable and drillable on their own; they are just kept out of the daily
   *  mix unless the learner opts in. */
  depth?: true;
  id: string;
  track: TrackId;
  title: string;
  blurb: string;
  /** Short markdown-ish lesson shown on the topic page. */
  lesson: string;
  resources?: Resource[];
}

export interface Track {
  id: TrackId;
  title: string;
  blurb: string;
  topics: Topic[];
}

export const TRACK_IDS: TrackId[] = [
  "system-design",
  "ai-engineering",
  "api-integration",
  "data-enterprise",
  "frontend",
  "delivery",
  "code-craft",
  "sql-analytics",
  "communication",
  "dsa-concepts",
  "workplace",
];
