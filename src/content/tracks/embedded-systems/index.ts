import type { Question, Track } from "@/content/types";
import * as foundations from "./foundations";
import * as systems from "./systems";
import * as networking from "./networking";

export const questions: Question[] = [
  ...foundations.questions,
  ...systems.questions,
  ...networking.questions,
];

export const track: Track = {
  id: "embedded-systems",
  title: "Embedded Systems",
  blurb:
    "C and memory fundamentals, concurrency, embedded Linux, and the sockets/networking layer -- built from first principles for an embedded interview at a networking company.",
  topics: [...foundations.topics, ...systems.topics, ...networking.topics],
};
