import { ALL_TOPICS } from "@/content";

/** Data for the "Stack Map" -- an interactive architecture diagram that shows
 *  where each authored topic sits in a real system, and how the layers
 *  connect. Positions are hand-placed (no auto-layout dependency); they are
 *  loose pixel coordinates on the React Flow canvas, not a grid contract. */

export type StackGroupId =
  | "client"
  | "edge"
  | "api"
  | "cross-cutting"
  | "services"
  | "ai"
  | "data"
  | "eventing"
  | "storage"
  | "analytics"
  | "delivery"
  | "practice";

export interface StackGroup {
  id: StackGroupId;
  label: string;
}

export const STACK_GROUPS: StackGroup[] = [
  { id: "client", label: "Client" },
  { id: "edge", label: "Edge" },
  { id: "api", label: "API" },
  { id: "cross-cutting", label: "Cross-cutting" },
  { id: "services", label: "Services" },
  { id: "ai", label: "AI" },
  { id: "data", label: "Data" },
  { id: "eventing", label: "Eventing" },
  { id: "storage", label: "Storage" },
  { id: "analytics", label: "Analytics" },
  { id: "delivery", label: "Delivery" },
  { id: "practice", label: "Engineering Practice" },
];

/** A leaf revealed when its parent node is expanded. Carries its own topic
 *  links so expanding a coarse layer gets you to something clickable. */
export interface StackChild {
  id: string;
  label: string;
  description: string;
  relatedTopicIds: string[];
}

export interface StackNodeDef {
  id: string;
  label: string;
  description: string;
  group: StackGroupId;
  position: { x: number; y: number };
  relatedTopicIds: string[];
  children?: StackChild[];
}

export interface StackEdgeDef {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export const STACK_NODES: StackNodeDef[] = [
  {
    id: "client",
    label: "Client Apps",
    description:
      "What the user actually runs -- browser or native shell. Everything downstream exists to answer what this layer asks for.",
    group: "client",
    position: { x: 0, y: 300 },
    relatedTopicIds: ["frontend-architecture"],
    children: [
      {
        id: "client-rendering",
        label: "Rendering & Architecture",
        description: "How the client is structured and where rendering happens.",
        relatedTopicIds: ["frontend-architecture"],
      },
      {
        id: "client-perf",
        label: "Performance",
        description: "What makes the client feel fast, and what quietly wrecks it.",
        relatedTopicIds: ["frontend-performance"],
      },
      {
        id: "client-security",
        label: "Frontend Security",
        description: "The attack surface that lives in the browser.",
        relatedTopicIds: ["frontend-security"],
      },
      {
        id: "client-a11y",
        label: "Accessibility",
        description: "Building a client that works for every user.",
        relatedTopicIds: ["accessibility"],
      },
    ],
  },
  {
    id: "edge",
    label: "CDN / Edge",
    description:
      "The first stop off the client's network. Caches static and semi-static responses close to the user before anything hits your infrastructure.",
    group: "edge",
    position: { x: 280, y: 300 },
    relatedTopicIds: ["cdn"],
    children: [
      {
        id: "edge-cdn",
        label: "CDNs & Edge Delivery",
        description: "Caching and serving content close to the user.",
        relatedTopicIds: ["cdn"],
      },
      {
        id: "edge-dns",
        label: "DNS",
        description: "How a hostname turns into a route to your infrastructure.",
        relatedTopicIds: ["dns"],
      },
      {
        id: "edge-protocols",
        label: "Protocols & Communication",
        description: "HTTP versions, TCP vs UDP, and what each buys you.",
        relatedTopicIds: ["protocols"],
      },
    ],
  },
  {
    id: "loadbalancer",
    label: "Load Balancer",
    description:
      "Spreads requests across instances and keeps a failed one from taking traffic down with it.",
    group: "edge",
    position: { x: 560, y: 300 },
    relatedTopicIds: ["load-balancing"],
    children: [
      {
        id: "lb-balancing",
        label: "Load Balancing",
        description: "Algorithms and layers for spreading load.",
        relatedTopicIds: ["load-balancing"],
      },
      {
        id: "lb-rate",
        label: "Rate Limiting",
        description: "Protecting the system from too much of a good thing.",
        relatedTopicIds: ["rate-limiting"],
      },
    ],
  },
  {
    id: "availability",
    label: "Availability & Failover",
    description:
      "What keeps the system up when a node, a zone, or a dependency goes away.",
    group: "cross-cutting",
    position: { x: 1120, y: 60 },
    relatedTopicIds: ["availability"],
    children: [
      {
        id: "avail-failover",
        label: "Availability & Failover",
        description: "Redundancy, health checks, and graceful degradation.",
        relatedTopicIds: ["availability"],
      },
      {
        id: "avail-antipatterns",
        label: "Performance Antipatterns",
        description: "The common ways systems slow down under load.",
        relatedTopicIds: ["antipatterns"],
      },
    ],
  },
  {
    id: "auth",
    label: "Auth & Security",
    description:
      "Cross-cutting: who is calling, what they are allowed to do, and what a malicious caller could try instead.",
    group: "cross-cutting",
    position: { x: 840, y: 60 },
    relatedTopicIds: ["api-auth"],
    children: [
      {
        id: "auth-oauth",
        label: "OAuth2 & OIDC",
        description: "Delegated auth and identity, the way most APIs actually do it.",
        relatedTopicIds: ["api-auth"],
      },
      {
        id: "auth-owasp",
        label: "API Security Risks",
        description: "The OWASP API Top 10, in practice.",
        relatedTopicIds: ["api-owasp"],
      },
      {
        id: "auth-fundamentals",
        label: "Security Fundamentals",
        description: "The baseline every layer of this diagram should assume.",
        relatedTopicIds: ["security"],
      },
    ],
  },
  {
    id: "api-gateway",
    label: "API / BFF Layer",
    description:
      "The contract between client and backend. Shapes requests and responses so nothing downstream is coupled to what the client happens to need.",
    group: "api",
    position: { x: 840, y: 300 },
    relatedTopicIds: ["api-design"],
    children: [
      {
        id: "api-styles",
        label: "REST, SOAP & API Styles",
        description: "Choosing a shape for the API and living with it.",
        relatedTopicIds: ["rest-soap"],
      },
      {
        id: "api-contracts",
        label: "API Contracts & OpenAPI",
        description: "Specifying an API so client and server agree without guessing.",
        relatedTopicIds: ["api-contracts"],
      },
      {
        id: "api-design-child",
        label: "API Design",
        description: "Resource modelling, pagination, errors, idempotency.",
        relatedTopicIds: ["api-design"],
      },
      {
        id: "api-governance",
        label: "Versioning & Governance",
        description: "Changing an API that other people already depend on.",
        relatedTopicIds: ["api-governance"],
      },
      {
        id: "api-webhooks",
        label: "Webhooks & Event Delivery",
        description: "Pushing events out instead of waiting to be polled.",
        relatedTopicIds: ["webhooks"],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    description:
      "The business logic tier -- controllers, domain logic, and the boundaries between services that let teams ship independently.",
    group: "services",
    position: { x: 1120, y: 300 },
    relatedTopicIds: ["microservices"],
    children: [
      {
        id: "svc-boundaries",
        label: "Services & Boundaries",
        description: "Where one service ends and another begins.",
        relatedTopicIds: ["microservices"],
      },
      {
        id: "svc-patterns",
        label: "Architecture Patterns",
        description: "Layered, hexagonal, event-driven -- and when each earns its cost.",
        relatedTopicIds: ["arch-patterns"],
      },
      {
        id: "svc-backpressure",
        label: "Idempotency & Back Pressure",
        description: "Handling retries and overload without corrupting state.",
        relatedTopicIds: ["backpressure"],
      },
      {
        id: "svc-concurrency",
        label: "Concurrency in Application Code",
        description: "Doing more than one thing at once, correctly.",
        relatedTopicIds: ["concurrency"],
      },
      {
        id: "svc-errors",
        label: "Error Handling",
        description: "Failing in a way callers and operators can act on.",
        relatedTopicIds: ["error-handling"],
      },
    ],
  },
  {
    id: "ai-agents",
    label: "AI & Agents",
    description:
      "An alternate backend path: LLM-backed services, agents, and tools, called the same way any other service is called.",
    group: "ai",
    position: { x: 1120, y: 560 },
    relatedTopicIds: ["ai-systems"],
    children: [
      {
        id: "ai-systems-child",
        label: "AI & LLM Systems",
        description: "How an LLM gets wired into a production system.",
        relatedTopicIds: ["ai-systems"],
      },
      {
        id: "ai-agents-child",
        label: "Agents & Tool Use",
        description: "Giving a model actions to take, and bounding what it can do.",
        relatedTopicIds: ["agents-tools"],
      },
      {
        id: "ai-mcp",
        label: "MCP Servers",
        description: "A standard interface between a model and its tools.",
        relatedTopicIds: ["mcp-servers"],
      },
      {
        id: "ai-llm-fundamentals",
        label: "LLM Fundamentals",
        description: "What is actually happening inside the box you are calling.",
        relatedTopicIds: ["llm-fundamentals"],
      },
      {
        id: "ai-ml-basics",
        label: "Machine Learning Basics",
        description: "The concepts underneath the LLM layer.",
        relatedTopicIds: ["ml-basics"],
      },
      {
        id: "ai-assisted-coding",
        label: "AI-Assisted Coding",
        description: "Using these tools to build the rest of the stack.",
        relatedTopicIds: ["ai-assisted-coding"],
      },
      {
        id: "ai-coding-security",
        label: "AI Coding Security",
        description: "What changes about your threat model when an agent writes the code.",
        relatedTopicIds: ["ai-coding-security"],
      },
    ],
  },
  {
    id: "observability",
    label: "Observability",
    description:
      "Cross-cutting: logs, metrics, and traces from every layer, so a problem is diagnosable instead of a mystery.",
    group: "cross-cutting",
    position: { x: 1400, y: 60 },
    relatedTopicIds: ["observability"],
  },
  {
    id: "data-access",
    label: "Data Access Layer",
    description:
      "The repository tier: what talks to the database, so the rest of the service doesn't need to know it exists.",
    group: "data",
    position: { x: 1400, y: 300 },
    relatedTopicIds: ["databases"],
    children: [
      {
        id: "data-db",
        label: "Databases & Indexing",
        description: "Picking a store, and making it answer questions quickly.",
        relatedTopicIds: ["databases"],
      },
      {
        id: "data-schema",
        label: "Schema Design",
        description: "Modelling data so the queries you actually run stay cheap.",
        relatedTopicIds: ["schema-design"],
      },
      {
        id: "data-migrations",
        label: "Schema Migrations",
        description: "Changing a live schema without taking the system down.",
        relatedTopicIds: ["migrations"],
      },
      {
        id: "data-security",
        label: "Database Security",
        description: "Access control and exposure at the data layer.",
        relatedTopicIds: ["db-security"],
      },
      {
        id: "data-search",
        label: "Search",
        description: "When a query is a search problem, not a lookup.",
        relatedTopicIds: ["search"],
      },
    ],
  },
  {
    id: "queue",
    label: "Message Queue / Pub-Sub",
    description:
      "Decouples producers from consumers so a slow or down downstream doesn't block the request path.",
    group: "eventing",
    position: { x: 1400, y: 560 },
    relatedTopicIds: ["queues"],
    children: [
      {
        id: "queue-async",
        label: "Message Queues & Async Work",
        description: "Moving work off the request path.",
        relatedTopicIds: ["queues"],
      },
      {
        id: "queue-webhooks",
        label: "Webhooks & Event Delivery",
        description: "The other half of event delivery: pushing out, not just in.",
        relatedTopicIds: ["webhooks"],
      },
    ],
  },
  {
    id: "cache",
    label: "Cache",
    description:
      "A layer that trades a little staleness for a lot of latency, sitting in front of whatever is slow to compute or fetch.",
    group: "data",
    position: { x: 1680, y: 60 },
    relatedTopicIds: ["caching"],
  },
  {
    id: "database",
    label: "Database",
    description:
      "Where state actually lives. Everything above this line is, in some sense, in service of reading and writing here correctly.",
    group: "data",
    position: { x: 1680, y: 300 },
    relatedTopicIds: ["databases"],
    children: [
      {
        id: "db-sharding",
        label: "Sharding & Partitioning",
        description: "Splitting data across machines, and living with the shard key you chose.",
        relatedTopicIds: ["sharding"],
      },
      {
        id: "db-replication",
        label: "Replication",
        description: "More copies for durability and reads, and the lag that comes with them.",
        relatedTopicIds: ["replication"],
      },
      {
        id: "db-consistency",
        label: "Consistency & CAP",
        description: "What guarantees you actually need, stated precisely.",
        relatedTopicIds: ["consistency"],
      },
    ],
  },
  {
    id: "storage",
    label: "Object Storage",
    description:
      "Where large, mostly-immutable bytes live -- images, uploads, backups -- addressed by key rather than modelled as rows.",
    group: "storage",
    position: { x: 1680, y: 560 },
    relatedTopicIds: ["storage"],
  },
  {
    id: "analytics",
    label: "Analytics & BI",
    description:
      "Where operational data becomes a question someone can answer -- dashboards, experiments, and the SQL underneath both.",
    group: "analytics",
    position: { x: 1960, y: 300 },
    relatedTopicIds: ["sql-joins"],
    children: [
      {
        id: "an-joins",
        label: "SQL Joins",
        description: "Combining rows across tables correctly.",
        relatedTopicIds: ["sql-joins"],
      },
      {
        id: "an-agg",
        label: "Aggregation & NULLs",
        description: "Summarizing data without quietly dropping rows.",
        relatedTopicIds: ["sql-aggregation"],
      },
      {
        id: "an-window",
        label: "Window Functions",
        description: "Per-row calculations across a related set of rows.",
        relatedTopicIds: ["sql-window-functions"],
      },
      {
        id: "an-subqueries",
        label: "CTEs & Subqueries",
        description: "Structuring a complex query so it stays readable.",
        relatedTopicIds: ["sql-subqueries"],
      },
      {
        id: "an-perf",
        label: "Query Performance",
        description: "Why a query is slow, and what to do about it.",
        relatedTopicIds: ["sql-performance"],
      },
      {
        id: "an-metrics",
        label: "Product Metrics",
        description: "Picking numbers that actually mean something.",
        relatedTopicIds: ["product-metrics"],
      },
      {
        id: "an-stats",
        label: "Statistics Basics",
        description: "The math underneath a trustworthy metric.",
        relatedTopicIds: ["statistics-basics"],
      },
      {
        id: "an-ab",
        label: "A/B Testing",
        description: "Answering \"did this actually work\" with a straight face.",
        relatedTopicIds: ["ab-testing"],
      },
    ],
  },
  {
    id: "enterprise",
    label: "Enterprise & Governance",
    description:
      "The constraints that show up once a system has real customers, contracts, and regulators -- not before.",
    group: "cross-cutting",
    position: { x: 1960, y: 60 },
    relatedTopicIds: ["enterprise-integration"],
    children: [
      {
        id: "ent-integration",
        label: "Enterprise Integration & Data",
        description: "Moving data across systems you don't fully control.",
        relatedTopicIds: ["enterprise-integration"],
      },
      {
        id: "ent-identity",
        label: "Enterprise Identity",
        description: "SSO, SCIM, and identity at organization scale.",
        relatedTopicIds: ["enterprise-identity"],
      },
      {
        id: "ent-tenancy",
        label: "Multi-Tenancy",
        description: "Isolating customers who share the same system.",
        relatedTopicIds: ["multi-tenancy"],
      },
      {
        id: "ent-privacy",
        label: "Data Privacy & Retention",
        description: "What you're allowed to keep, and for how long.",
        relatedTopicIds: ["data-privacy"],
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery & CI/CD",
    description:
      "Cross-cutting: how a change gets from a commit to production, and how it gets back out if it's wrong.",
    group: "delivery",
    position: { x: 560, y: 560 },
    relatedTopicIds: ["ci-cd"],
    children: [
      {
        id: "del-vcs",
        label: "Version Control",
        description: "The history everything else in this diagram is built on top of.",
        relatedTopicIds: ["version-control"],
      },
      {
        id: "del-testing",
        label: "Testing",
        description: "What gives you the confidence to ship the next change.",
        relatedTopicIds: ["testing"],
      },
      {
        id: "del-cicd",
        label: "CI/CD Pipelines",
        description: "Automating the path from commit to deploy.",
        relatedTopicIds: ["ci-cd"],
      },
      {
        id: "del-deploy",
        label: "Deploying to the Cloud",
        description: "Getting a build running somewhere real.",
        relatedTopicIds: ["cloud-deployment"],
      },
      {
        id: "del-flags",
        label: "Feature Flags",
        description: "Decoupling deploy from release.",
        relatedTopicIds: ["feature-flags"],
      },
      {
        id: "del-deps",
        label: "Dependencies & Supply Chain",
        description: "Trusting code you didn't write and don't control.",
        relatedTopicIds: ["dependencies"],
      },
    ],
  },
  {
    id: "code-quality",
    label: "Code Quality & Design",
    description:
      "The craft underneath every layer above -- how the code inside a service is actually shaped and kept honest.",
    group: "practice",
    position: { x: 1120, y: 820 },
    relatedTopicIds: ["design-patterns"],
    children: [
      {
        id: "cq-spec",
        label: "Spec-Driven Development",
        description: "Writing down what a change should do before writing the code.",
        relatedTopicIds: ["spec-driven-development"],
      },
      {
        id: "cq-patterns",
        label: "Design Patterns",
        description: "Named shapes for recurring problems, and when one earns its complexity.",
        relatedTopicIds: ["design-patterns"],
      },
      {
        id: "cq-quality",
        label: "Code Quality & Refactoring",
        description: "Keeping a codebase changeable as it grows.",
        relatedTopicIds: ["code-quality"],
      },
      {
        id: "cq-domain",
        label: "Domain Modelling",
        description: "Shaping code around the business it serves, not the database under it.",
        relatedTopicIds: ["domain-modelling"],
      },
    ],
  },
  {
    id: "algorithms",
    label: "Algorithms & Problem Solving",
    description:
      "The reasoning skills every layer above draws on -- picking the right structure and knowing what it costs.",
    group: "practice",
    position: { x: 1400, y: 820 },
    relatedTopicIds: ["complexity"],
    children: [
      {
        id: "algo-complexity",
        label: "Complexity Analysis",
        description: "Reasoning about how an approach scales before it ships.",
        relatedTopicIds: ["complexity"],
      },
      {
        id: "algo-structures",
        label: "Choosing a Data Structure",
        description: "Matching a structure to the operations that actually matter.",
        relatedTopicIds: ["structure-choice"],
      },
      {
        id: "algo-patterns",
        label: "Algorithmic Patterns",
        description: "The recurring techniques behind most interview and real-world problems.",
        relatedTopicIds: ["patterns"],
      },
      {
        id: "algo-tradeoffs",
        label: "Space/Time Tradeoffs",
        description: "Trading memory for speed, deliberately.",
        relatedTopicIds: ["space-time"],
      },
    ],
  },
  {
    id: "workplace",
    label: "Workplace Craft",
    description:
      "How engineering actually gets done day to day, independent of any one layer of the stack.",
    group: "practice",
    position: { x: 0, y: 820 },
    relatedTopicIds: ["code-review"],
    children: [
      {
        id: "wp-review",
        label: "Code Review",
        description: "Giving and receiving feedback that actually improves the change.",
        relatedTopicIds: ["code-review"],
      },
      {
        id: "wp-debugging",
        label: "Debugging Methodically",
        description: "Finding the cause instead of guessing at fixes.",
        relatedTopicIds: ["debugging"],
      },
      {
        id: "wp-design-docs",
        label: "Design Docs & RFCs",
        description: "Writing down a plan so it can be argued with before it's built.",
        relatedTopicIds: ["design-docs"],
      },
      {
        id: "wp-incidents",
        label: "Incidents",
        description: "What happens when a layer of this diagram actually breaks.",
        relatedTopicIds: ["incidents"],
      },
      {
        id: "wp-estimation",
        label: "Estimation & Scoping",
        description: "Sizing work honestly enough to plan around.",
        relatedTopicIds: ["estimation"],
      },
    ],
  },
  {
    id: "communication",
    label: "Technical Communication",
    description:
      "Explaining the system in this diagram to the people who need a decision from you.",
    group: "practice",
    position: { x: 280, y: 820 },
    relatedTopicIds: ["scoping"],
    children: [
      {
        id: "comm-scoping",
        label: "Scoping the Problem",
        description: "Making sure you're answering the question that was actually asked.",
        relatedTopicIds: ["scoping"],
      },
      {
        id: "comm-structuring",
        label: "Structuring an Answer",
        description: "Leading with the point instead of the path to it.",
        relatedTopicIds: ["structuring"],
      },
      {
        id: "comm-tradeoffs",
        label: "Defending a Tradeoff",
        description: "Explaining why you chose this and not the alternative.",
        relatedTopicIds: ["tradeoffs"],
      },
      {
        id: "comm-audience",
        label: "Explaining to Different Audiences",
        description: "The same decision, pitched differently to an engineer and a stakeholder.",
        relatedTopicIds: ["audience"],
      },
      {
        id: "comm-disagreement",
        label: "Disagreeing Well",
        description: "Pushing back on a decision without stalling it.",
        relatedTopicIds: ["disagreement"],
      },
    ],
  },
];

export const STACK_EDGES: StackEdgeDef[] = [
  { id: "e-client-edge", source: "client", target: "edge", label: "HTTPS" },
  { id: "e-edge-lb", source: "edge", target: "loadbalancer", label: "cache miss" },
  { id: "e-lb-api", source: "loadbalancer", target: "api-gateway", label: "HTTP" },
  { id: "e-lb-avail", source: "loadbalancer", target: "availability", label: "health checks" },
  { id: "e-auth-api", source: "auth", target: "api-gateway", label: "token" },
  { id: "e-api-services", source: "api-gateway", target: "services", label: "JSON" },
  { id: "e-api-ai", source: "api-gateway", target: "ai-agents", label: "JSON" },
  { id: "e-api-obs", source: "api-gateway", target: "observability", label: "telemetry" },
  { id: "e-services-data", source: "services", target: "data-access", label: "query" },
  { id: "e-ai-data", source: "ai-agents", target: "data-access", label: "query" },
  { id: "e-services-obs", source: "services", target: "observability", label: "telemetry" },
  { id: "e-services-queue", source: "services", target: "queue", label: "publish" },
  { id: "e-services-storage", source: "services", target: "storage", label: "blob" },
  { id: "e-data-cache", source: "data-access", target: "cache", label: "read/write" },
  { id: "e-data-db", source: "data-access", target: "database", label: "SQL" },
  { id: "e-queue-analytics", source: "queue", target: "analytics", label: "events" },
  { id: "e-db-analytics", source: "database", target: "analytics", label: "ETL" },
  { id: "e-db-storage", source: "database", target: "storage", label: "backup" },
  { id: "e-delivery-services", source: "delivery", target: "services", label: "deploy" },
  { id: "e-enterprise-data", source: "enterprise", target: "data-access", label: "policy" },
  { id: "e-services-codequality", source: "services", target: "code-quality", label: "shapes" },
  { id: "e-services-algorithms", source: "services", target: "algorithms", label: "informs" },
  { id: "e-delivery-workplace", source: "delivery", target: "workplace", label: "practice" },
  { id: "e-workplace-communication", source: "workplace", target: "communication", label: "review" },
];

const knownTopicIds = new Set(ALL_TOPICS.map((t) => t.id));

/** Every id the map references, whether on a top-level node or a child --
 *  used by tests to catch a topic that was renamed or removed out from under
 *  the diagram. */
export function stackMapTopicReferences(): { location: string; topicId: string }[] {
  const refs: { location: string; topicId: string }[] = [];
  for (const node of STACK_NODES) {
    for (const id of node.relatedTopicIds) {
      refs.push({ location: node.id, topicId: id });
    }
    for (const child of node.children ?? []) {
      for (const id of child.relatedTopicIds) {
        refs.push({ location: `${node.id}/${child.id}`, topicId: id });
      }
    }
  }
  return refs;
}

export function isKnownTopicId(id: string): boolean {
  return knownTopicIds.has(id);
}
