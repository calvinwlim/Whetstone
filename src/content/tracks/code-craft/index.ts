import type { Question, Track } from "@/content/types";
import * as design from "./design";
import * as runtime from "./runtime";

export const questions: Question[] = [...design.questions, ...runtime.questions];

export const track: Track = {
  id: "code-craft",
  title: "Code Craft",
  blurb:
    "Specs, design patterns, code quality, concurrency, error handling, and domain modelling.",
  topics: [...design.topics, ...runtime.topics],
};
