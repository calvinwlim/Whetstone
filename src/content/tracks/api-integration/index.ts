import type { Question, Track } from "@/content/types";
import * as styles from "./styles";
import * as security from "./security";

export const questions: Question[] = [...styles.questions, ...security.questions];

export const track: Track = {
  id: "api-integration",
  title: "API & Integration",
  blurb:
    "API styles including SOAP, contracts and OpenAPI, webhooks, OAuth2, and API security.",
  topics: [...styles.topics, ...security.topics],
};
