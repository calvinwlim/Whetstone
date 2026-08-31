import type { Question, Track } from "@/content/types";
import * as sql from "./sql";
import * as analytics from "./analytics";

export const questions: Question[] = [...sql.questions, ...analytics.questions];

export const track: Track = {
  id: "sql-analytics",
  title: "SQL & Analytics",
  blurb:
    "SQL joins, aggregation, window functions and performance, plus product metrics, statistics, and A/B testing.",
  topics: [...sql.topics, ...analytics.topics],
};
