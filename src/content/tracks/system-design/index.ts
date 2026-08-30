import type { Question, Track } from "@/content/types";
import * as traffic from "./traffic";
import * as data from "./data";
import * as services from "./services";
import * as network from "./network";
import * as reliability from "./reliability";
import * as securityArch from "./security-arch";

export const questions: Question[] = [
  ...traffic.questions,
  ...data.questions,
  ...services.questions,
  ...network.questions,
  ...reliability.questions,
  ...securityArch.questions,
];

export const track: Track = {
  id: "system-design",
  title: "System Design",
  blurb:
    "The full design surface: traffic, data, services, networking, reliability, and security.",
  topics: [
    ...traffic.topics,
    ...data.topics,
    ...services.topics,
    ...network.topics,
    ...reliability.topics,
    ...securityArch.topics,
  ],
};
