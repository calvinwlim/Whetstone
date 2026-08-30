import type { Question, Track } from "@/content/types";
import * as security from "./security";
import * as craft from "./craft";

export const questions: Question[] = [...security.questions, ...craft.questions];

export const track: Track = {
  id: "frontend",
  title: "Frontend",
  blurb:
    "Browser security, accessibility, Core Web Vitals, and rendering and state architecture.",
  topics: [...security.topics, ...craft.topics],
};
