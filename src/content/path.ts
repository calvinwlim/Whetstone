/** The learning path: an ordered spine every engineer works through, and
 *  optional lanes chosen by what they actually do.
 *
 *  Why this exists as authored data rather than something derived: difficulty
 *  is not the same as pedagogical order. A band-1 question about Multi-Tenancy
 *  is still a question about multi-tenancy, which is not a week-one topic --
 *  so sorting the bank by difficulty produces easy questions about obscure
 *  things, which is the opposite of a beginner path. Somebody has to say that
 *  caching comes before sharding. This file is that judgement, written down.
 *
 *  Every topic appears exactly once across the spine and the lanes. The test
 *  beside this file enforces it, so adding a topic without placing it fails
 *  rather than quietly leaving it unreachable from the path. */

export type ExperienceLevel = "junior" | "mid" | "senior" | "staff";

export interface PathStage {
  id: string;
  title: string;
  blurb: string;
  /** Topic ids, in the order they should be met. */
  topics: string[];
}

export interface PathLane {
  id: string;
  title: string;
  blurb: string;
  topics: string[];
}

/** Four stages of six. Deliberately universal: nothing here is specific to a
 *  role, a stack, or a company size, because the spine is the part everybody
 *  is assumed to know before anything else makes sense. */
export const PATH_STAGES: PathStage[] = [
  {
    id: "foundations",
    title: "Foundations",
    blurb: "What every other topic quietly assumes you already know.",
    topics: [
      "version-control",
      "testing",
      "code-quality",
      "databases",
      "api-design",
      "error-handling",
    ],
  },
  {
    id: "everyday",
    title: "The everyday week",
    blurb: "The work you actually do between Monday and Friday.",
    topics: [
      "debugging",
      "code-review",
      "sql-joins",
      "caching",
      "ci-cd",
      "complexity",
    ],
  },
  {
    id: "systems",
    title: "Systems",
    blurb: "What changes once one machine and one process stop being enough.",
    topics: [
      "load-balancing",
      "queues",
      "observability",
      "protocols",
      "security",
      "concurrency",
    ],
  },
  {
    id: "judgment",
    title: "Judgment",
    blurb: "Where the answer is a trade-off and you have to defend the one you picked.",
    topics: [
      "consistency",
      "replication",
      "microservices",
      "tradeoffs",
      "incidents",
      "design-docs",
    ],
  },
];

/** Everything off the spine. Reachable at any time, recommended by role --
 *  and where all twelve specialist depth topics live, so none of them can
 *  turn up in somebody's first week. */
export const PATH_LANES: PathLane[] = [
  {
    id: "backend",
    title: "Backend & scale",
    blurb: "For work where the load, the data volume, or the uptime target is the hard part.",
    topics: [
      "storage",
      "backpressure",
      "antipatterns",
      "rate-limiting",
      "arch-patterns",
      "schema-design",
      "migrations",
      "db-security",
      "sharding",
      "cdn",
      "search",
      "dns",
      "availability",
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    blurb: "For anyone who ships something a person looks at.",
    topics: [
      "frontend-architecture",
      "frontend-performance",
      "accessibility",
      "frontend-security",
    ],
  },
  {
    id: "data",
    title: "Data & SQL",
    blurb: "Past the joins: analysis, measurement, and making a query fast.",
    topics: [
      "sql-aggregation",
      "sql-subqueries",
      "sql-window-functions",
      "sql-performance",
      "product-metrics",
      "statistics-basics",
      "ab-testing",
    ],
  },
  {
    id: "apis",
    title: "APIs & integration",
    blurb: "Contracts other teams depend on, and the security that goes with them.",
    topics: [
      "rest-soap",
      "api-contracts",
      "webhooks",
      "api-auth",
      "api-owasp",
      "api-governance",
    ],
  },
  {
    id: "ai",
    title: "AI engineering",
    blurb: "Building with models, and reviewing what they write for you.",
    topics: [
      "ml-basics",
      "llm-fundamentals",
      "ai-systems",
      "agents-tools",
      "mcp-servers",
      "ai-assisted-coding",
      "ai-coding-security",
    ],
  },
  {
    id: "craft",
    title: "Code craft",
    blurb: "Designing code that the next person can change without fear.",
    topics: [
      "design-patterns",
      "domain-modelling",
      "spec-driven-development",
      "feature-flags",
      "cloud-deployment",
      "dependencies",
    ],
  },
  {
    id: "dsa",
    title: "Data structures & algorithms",
    blurb: "The talking-through-it layer, not the coding layer.",
    topics: ["structure-choice", "patterns", "space-time"],
  },
  {
    id: "communication",
    title: "Communication",
    blurb: "Being understood, and being persuasive about a technical decision.",
    topics: ["scoping", "structuring", "audience", "disagreement", "estimation"],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    blurb: "Identity, tenancy, and the obligations that arrive with a large customer.",
    topics: [
      "enterprise-identity",
      "enterprise-integration",
      "multi-tenancy",
      "data-privacy",
    ],
  },
];

/** How far up the spine a stated experience level starts you. Somebody who
 *  says "senior" should not be asked what a branch is -- but the stages stay
 *  open behind them, because a claimed level is a shortcut, not a judgement
 *  about what they know. */
export const STARTING_STAGE: Record<ExperienceLevel, number> = {
  junior: 0,
  mid: 1,
  senior: 2,
  staff: 3,
};

export const EXPERIENCE_LEVELS: {
  value: ExperienceLevel;
  label: string;
  note: string;
}[] = [
  { value: "junior", label: "New to the field", note: "Start from the beginning" },
  { value: "mid", label: "A few years in", note: "Skip the foundations" },
  { value: "senior", label: "Senior", note: "Start at systems" },
  { value: "staff", label: "Staff or beyond", note: "Everything open" },
];
