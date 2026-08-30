import type { Question, Track } from "@/content/types";
import * as traffic from "./traffic";
import * as data from "./data";
import * as services from "./services";

export const questions: Question[] = [
  ...traffic.questions,
  ...data.questions,
  ...services.questions,
];

export const track: Track = {
  id: "system-design",
  title: "System Design",
  blurb:
    "The full design surface: caching, load balancing, data, queues, APIs, search, and observability.",
  topics: [...traffic.topics, ...data.topics, ...services.topics],
};
