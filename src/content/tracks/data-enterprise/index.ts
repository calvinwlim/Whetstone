import type { Question, Track } from "@/content/types";
import * as data from "./data";
import * as enterprise from "./enterprise";

export const questions: Question[] = [...data.questions, ...enterprise.questions];

export const track: Track = {
  id: "data-enterprise",
  title: "Data & Enterprise",
  blurb:
    "Schema design, migrations, database security and privacy, enterprise identity, integration, and multi-tenancy.",
  topics: [...data.topics, ...enterprise.topics],
};
