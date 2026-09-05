import type { Question, Topic, Track, TrackId } from "@/content/types";
import * as systemDesign from "./tracks/system-design";
import * as aiEngineering from "./tracks/ai-engineering";
import * as apiIntegration from "./tracks/api-integration";
import * as dataEnterprise from "./tracks/data-enterprise";
import * as frontendTrack from "./tracks/frontend";
import * as delivery from "./tracks/delivery";
import * as codeCraft from "./tracks/code-craft";
import * as sqlAnalytics from "./tracks/sql-analytics";
import * as communication from "./tracks/communication";
import * as dsaConcepts from "./tracks/dsa-concepts";
import * as workplace from "./tracks/workplace";
import * as foundations from "./tracks/foundations";
import * as fundamentals from "./tracks/fundamentals";
import * as advanced from "./tracks/advanced";
import * as depthSystemDesign from "./tracks/depth-system-design";
import * as depthSkills from "./tracks/depth-skills";
import * as easySystems from "./tracks/easy-systems";
import * as easyCraft from "./tracks/easy-craft";
import * as easyFoundations from "./tracks/easy-foundations";
import * as easyEveryday from "./tracks/easy-everyday";
import * as easyCoreSystems from "./tracks/easy-core-systems";

/** The whole bank, bundled at build time. Nothing here touches a database,
 *  so rendering a question costs zero network round trips. */
export const TRACKS: Track[] = [
  systemDesign.track,
  aiEngineering.track,
  apiIntegration.track,
  dataEnterprise.track,
  frontendTrack.track,
  delivery.track,
  codeCraft.track,
  sqlAnalytics.track,
  communication.track,
  dsaConcepts.track,
  workplace.track,
];

export const ALL_QUESTIONS: Question[] = [
  ...systemDesign.questions,
  ...aiEngineering.questions,
  ...apiIntegration.questions,
  ...dataEnterprise.questions,
  ...frontendTrack.questions,
  ...delivery.questions,
  ...codeCraft.questions,
  ...sqlAnalytics.questions,
  ...communication.questions,
  ...dsaConcepts.questions,
  ...workplace.questions,
  // Difficulty 1 and 5 sets live apart from the per-topic files so the easiest
  // and hardest bands stay easy to see, audit, and extend.
  ...foundations.questions,
  ...fundamentals.questions,
  ...advanced.questions,
  // Depth added to topics that were thin after the first authoring pass.
  ...depthSystemDesign.questions,
  ...depthSkills.questions,
  // Band 1 and 2 backfill for topics authored mid-to-advanced, so a learner
  // dropped into the easy band has a real pool to draw from.
  ...easySystems.questions,
  ...easyCraft.questions,
  // Band 1-2 depth for the Stage 1 topics on the learning spine.
  ...easyFoundations.questions,
  ...easyEveryday.questions,
  ...easyCoreSystems.questions,
];

/** Topic ids marked as specialist depth, for the session composer and the UI. */
export const DEPTH_TOPIC_IDS: Set<string> = new Set();

export const ALL_TOPICS: Topic[] = TRACKS.flatMap((track) => track.topics);

for (const topic of ALL_TOPICS) {
  if (topic.depth) DEPTH_TOPIC_IDS.add(topic.id);
}

const questionsById = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
const topicsById = new Map(ALL_TOPICS.map((t) => [t.id, t]));
const tracksById = new Map(TRACKS.map((t) => [t.id, t]));

export function getQuestion(id: string): Question | undefined {
  return questionsById.get(id);
}

export function getTopic(id: string): Topic | undefined {
  return topicsById.get(id);
}

export function getTrack(id: TrackId): Track | undefined {
  return tracksById.get(id);
}

export function questionsForTopic(topicId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topic === topicId);
}

export function questionsForTrack(trackId: TrackId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.track === trackId);
}
