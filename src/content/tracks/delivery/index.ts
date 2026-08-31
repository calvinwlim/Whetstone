import type { Question, Track } from "@/content/types";
import * as sourceAndTests from "./source-and-tests";
import * as shipping from "./shipping";

export const questions: Question[] = [
  ...sourceAndTests.questions,
  ...shipping.questions,
];

export const track: Track = {
  id: "delivery",
  title: "Delivery",
  blurb:
    "Version control, testing, CI/CD, cloud deployment, feature flags, and dependencies.",
  topics: [...sourceAndTests.topics, ...shipping.topics],
};
