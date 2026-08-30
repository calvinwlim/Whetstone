import type { Question, Track } from "@/content/types";
import * as llmSystems from "./llm-systems";
import * as mlBasics from "./ml-basics";
import * as practice from "./practice";

export const questions: Question[] = [
  ...mlBasics.questions,
  ...llmSystems.questions,
  ...practice.questions,
];

export const track: Track = {
  id: "ai-engineering",
  title: "AI Engineering",
  blurb:
    "ML fundamentals, LLM systems, agents and MCP, and working safely with generated code.",
  topics: [...mlBasics.topics, ...llmSystems.topics, ...practice.topics],
};
