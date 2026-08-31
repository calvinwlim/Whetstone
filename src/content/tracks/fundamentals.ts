import type { Question } from "@/content/types";

/** Difficulty 1 across every track. Extends foundations.ts, which only covered
 *  the four original tracks, to the newer ones and to system design topics
 *  added later. The easy band needs a real pool: a learner whose accuracy has
 *  dropped should get genuinely easier questions, not the same mid-tier ones. */
export const questions: Question[] = [
  // ================= System design (topics added after foundations.ts) ==========
  {
    id: "fn-dns-001",
    type: "mcq",
    track: "system-design",
    topic: "dns",
    difficulty: 1,
    prompt: "What does a TTL on a DNS record control?",
    options: [
      { id: "a", text: "How long resolvers may cache the answer before asking again" },
      { id: "b", text: "How long the server waits before timing out" },
      { id: "c", text: "How many times the record may be queried" },
      { id: "d", text: "How long the domain registration lasts" },
    ],
    answer: "a",
    explanation:
      "Time to live is a caching instruction. A long TTL means fewer lookups and slower changes; a short one means the opposite. It is why DNS changes appear to take effect gradually — you are waiting for other people's caches to expire.",
    tags: ["fundamentals", "ttl"],
  },
  {
    id: "fn-proto-001",
    type: "mcq",
    track: "system-design",
    topic: "protocols",
    difficulty: 1,
    prompt: "What is the main difference between TCP and UDP?",
    options: [
      {
        id: "a",
        text: "TCP guarantees ordered, reliable delivery; UDP does not, and is faster for it",
      },
      { id: "b", text: "TCP is encrypted and UDP is not" },
      { id: "c", text: "TCP is for web traffic and UDP is for email" },
      { id: "d", text: "UDP is a newer replacement for TCP" },
    ],
    answer: "a",
    explanation:
      "TCP retransmits what is lost and delivers in order, which costs a handshake and waiting. UDP skips all of it, which is why live video and games prefer it — a dropped frame beats a pause. Neither provides encryption on its own.",
    tags: ["fundamentals", "tcp-udp"],
  },
  {
    id: "fn-avail-001",
    type: "mcq",
    track: "system-design",
    topic: "availability",
    difficulty: 1,
    prompt: "What does 'availability' mean for a service?",
    options: [
      { id: "a", text: "The proportion of time it is working and able to serve requests" },
      { id: "b", text: "How many requests per second it can handle" },
      { id: "c", text: "How quickly it responds to a request" },
      { id: "d", text: "How much data it can store" },
    ],
    answer: "a",
    explanation:
      "Availability is uptime as a fraction, usually quoted in nines. Throughput and latency are separate properties — a service can be fully available and unusably slow, which is why you measure all three.",
    tags: ["fundamentals"],
  },
  {
    id: "fn-anti-001",
    type: "mcq",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 1,
    prompt:
      "A page loads a list, then makes one extra database query per item in that list. What is the concern?",
    options: [
      { id: "a", text: "The number of queries grows with the list, so it gets slower as data grows" },
      { id: "b", text: "The queries will return incorrect results" },
      { id: "c", text: "The database will run out of connections immediately" },
      { id: "d", text: "Nothing, as long as each query is fast" },
    ],
    answer: "a",
    explanation:
      "This is the N+1 query problem. Each query may be quick, but a hundred of them is a hundred round trips. It hides in development where the list has three items and appears in production where it has three hundred.",
    tags: ["fundamentals", "n+1"],
  },
  {
    id: "fn-bp-001",
    type: "mcq",
    track: "system-design",
    topic: "backpressure",
    difficulty: 1,
    prompt: "What does it mean for an operation to be idempotent?",
    options: [
      { id: "a", text: "Doing it twice leaves the same result as doing it once" },
      { id: "b", text: "It always succeeds" },
      { id: "c", text: "It runs without side effects of any kind" },
      { id: "d", text: "It completes in constant time" },
    ],
    answer: "a",
    explanation:
      "Idempotency is what makes retrying safe. It matters because a client that times out cannot tell whether the request landed, so retrying is its only option — and that must not create a second order or a second charge.",
    tags: ["fundamentals", "idempotency"],
  },
  {
    id: "fn-sec-001",
    type: "mcq",
    track: "system-design",
    topic: "security",
    difficulty: 1,
    prompt: "Where should application secrets such as API keys be stored?",
    options: [
      {
        id: "a",
        text: "In environment variables or a secret manager — never committed to source control",
      },
      { id: "b", text: "In a config file committed to the repository" },
      { id: "c", text: "Hard-coded in the source, but only in private repositories" },
      { id: "d", text: "In the frontend bundle, so the server does not have to hold them" },
    ],
    answer: "a",
    explanation:
      "Anything committed lives in every clone and every backup forever, even after you delete it. And anything in a frontend bundle is public by definition — it is shipped to the browser, where anyone can read it.",
    tags: ["fundamentals", "secrets"],
  },
  {
    id: "fn-arch-001",
    type: "mcq",
    track: "system-design",
    topic: "arch-patterns",
    difficulty: 1,
    prompt: "What does a circuit breaker do?",
    options: [
      {
        id: "a",
        text: "Stops calling a failing dependency for a while, so the caller fails fast and the dependency can recover",
      },
      { id: "b", text: "Retries a failed request until it succeeds" },
      { id: "c", text: "Restarts a service that has crashed" },
      { id: "d", text: "Limits how many requests a client may send" },
    ],
    answer: "a",
    explanation:
      "Named after the electrical device: it trips to protect what is behind it. Continuing to call something that is already failing wastes your resources and adds load to a struggling service, so failing fast is better for both sides.",
    tags: ["fundamentals", "circuit-breaker"],
  },

  // ======================== AI Engineering ====================================
  {
    id: "fn-ml-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 1,
    prompt: "Why is data split into training and test sets?",
    options: [
      {
        id: "a",
        text: "To measure how the model performs on data it has never seen",
      },
      { id: "b", text: "To make training run faster on less data" },
      { id: "c", text: "To reduce the storage the dataset requires" },
      { id: "d", text: "Because models cannot process all data at once" },
    ],
    answer: "a",
    explanation:
      "Scoring a model on data it trained on measures memorisation, not learning. Held-out data is the only way to estimate how it will behave on the new inputs it will actually face.",
    tags: ["fundamentals", "splits"],
  },
  {
    id: "fn-llm-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 1,
    prompt: "What is a context window?",
    options: [
      {
        id: "a",
        text: "The maximum amount of text a model can consider at once, measured in tokens",
      },
      { id: "b", text: "How long the model remembers a conversation between sessions" },
      { id: "c", text: "The time limit for generating a response" },
      { id: "d", text: "The number of requests allowed per minute" },
    ],
    answer: "a",
    explanation:
      "Everything the model can see — instructions, conversation history, retrieved documents, and its own output — must fit inside it. Models have no memory between requests; a chat feels continuous only because the history is re-sent each turn.",
    tags: ["fundamentals", "context"],
  },
  {
    id: "fn-agent-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "agents-tools",
    difficulty: 1,
    prompt: "What distinguishes an AI agent from a single model call?",
    options: [
      {
        id: "a",
        text: "It loops — choosing tools, acting, reading the result, and deciding again",
      },
      { id: "b", text: "It uses a larger model" },
      { id: "c", text: "It runs without any prompt" },
      { id: "d", text: "It is trained on your own data" },
    ],
    answer: "a",
    explanation:
      "The loop is the whole idea, and the source of every hard problem: it can take many steps, and without limits on iterations, cost, and permissions it can take many wrong ones.",
    tags: ["fundamentals", "agents"],
  },
  {
    id: "fn-mcp-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "mcp-servers",
    difficulty: 1,
    prompt: "What is an MCP server for?",
    options: [
      {
        id: "a",
        text: "Exposing tools and data to AI applications through a shared protocol",
      },
      { id: "b", text: "Hosting and running the language model itself" },
      { id: "c", text: "Storing conversation history between sessions" },
      { id: "d", text: "Training a model on your private documents" },
    ],
    answer: "a",
    explanation:
      "It is an integration standard, not a model host. Write a server once and any MCP-capable client can use its capabilities, instead of every assistant needing a bespoke integration with every tool.",
    tags: ["fundamentals", "mcp"],
  },
  {
    id: "fn-vibe-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-assisted-coding",
    difficulty: 1,
    prompt: "Who is responsible for code an AI tool generated and you merged?",
    options: [
      { id: "a", text: "You — you are the author of record regardless of how it was produced" },
      { id: "b", text: "The tool vendor" },
      { id: "c", text: "Whoever reviews the pull request" },
      { id: "d", text: "Nobody, if the tests pass" },
    ],
    answer: "a",
    explanation:
      "Merging is the act of taking ownership. If you cannot explain it in review, you cannot maintain it or debug it later — which makes it a merge blocker rather than a technicality.",
    tags: ["fundamentals", "ownership"],
  },
  {
    id: "fn-vsec-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-coding-security",
    difficulty: 1,
    prompt:
      "An AI tool suggests installing a package you have never heard of. What should you check first?",
    options: [
      {
        id: "a",
        text: "That the package actually exists and is genuinely maintained",
      },
      { id: "b", text: "That it has TypeScript types available" },
      { id: "c", text: "That its bundle size is acceptable" },
      { id: "d", text: "Nothing — the package manager verifies packages" },
    ],
    answer: "a",
    explanation:
      "Models sometimes invent package names, and attackers register the commonly invented ones. Installing can execute scripts, so verification has to happen before installation rather than after.",
    tags: ["fundamentals", "dependencies"],
  },

  // ======================== API & Integration =================================
  {
    id: "fn-rest-001",
    type: "mcq",
    track: "api-integration",
    topic: "rest-soap",
    difficulty: 1,
    prompt: "In a REST API, what does a URL like /users/42 identify?",
    options: [
      { id: "a", text: "A resource — the user with id 42" },
      { id: "b", text: "A function to call named users" },
      { id: "c", text: "A database table and row offset" },
      { id: "d", text: "A file stored on the server" },
    ],
    answer: "a",
    explanation:
      "REST models things rather than actions: the URL names a resource and the HTTP method says what to do with it. That is why you rarely see verbs in a well-designed REST path.",
    tags: ["fundamentals", "rest"],
  },
  {
    id: "fn-contract-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-contracts",
    difficulty: 1,
    prompt: "What is an API contract?",
    options: [
      {
        id: "a",
        text: "The agreed shape of requests and responses that consumers can rely on",
      },
      { id: "b", text: "A legal agreement covering API usage limits" },
      { id: "c", text: "The rate limit applied to each client" },
      { id: "d", text: "The authentication method the API accepts" },
    ],
    answer: "a",
    explanation:
      "It is the promise you are making about the interface. Written in a machine-readable form such as OpenAPI it can generate clients, validate requests, and be diffed for breaking changes — which is what makes it enforceable rather than aspirational.",
    tags: ["fundamentals", "contracts"],
  },
  {
    id: "fn-hook-001",
    type: "mcq",
    track: "api-integration",
    topic: "webhooks",
    difficulty: 1,
    prompt: "What is a webhook?",
    options: [
      {
        id: "a",
        text: "An HTTP request a provider sends to your endpoint when an event happens",
      },
      { id: "b", text: "A scheduled job that polls an API for changes" },
      { id: "c", text: "A persistent connection between browser and server" },
      { id: "d", text: "A cache that stores API responses" },
    ],
    answer: "a",
    explanation:
      "It inverts the integration: instead of you asking repeatedly whether anything changed, they tell you when it does. That removes polling latency and wasted requests, and makes you responsible for an endpoint anyone on the internet can call.",
    tags: ["fundamentals", "webhooks"],
  },
  {
    id: "fn-auth-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 1,
    prompt: "What problem does OAuth2 solve?",
    options: [
      {
        id: "a",
        text: "Letting an application act on a user's behalf without ever seeing their password",
      },
      { id: "b", text: "Encrypting traffic between client and server" },
      { id: "c", text: "Storing user passwords securely in a database" },
      { id: "d", text: "Preventing brute-force login attempts" },
    ],
    answer: "a",
    explanation:
      "Before delegated authorisation, letting one service access another meant handing over your password. OAuth2 replaces that with a scoped, revocable token — which is why 'sign in with' flows never ask the third party for your credentials.",
    tags: ["fundamentals", "oauth"],
  },
  {
    id: "fn-owasp-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 1,
    context:
      "An endpoint returns a record when given its id. It checks that the caller is logged in.",
    prompt: "What check is still missing?",
    options: [
      { id: "a", text: "That this particular user is allowed to see this particular record" },
      { id: "b", text: "That the id is a valid number" },
      { id: "c", text: "That the caller has accepted the terms of service" },
      { id: "d", text: "Nothing — being logged in is sufficient" },
    ],
    answer: "a",
    explanation:
      "Authentication establishes who is calling; authorisation decides what they may touch. Without the ownership check, changing the id in the URL walks through everyone else's data — the most common serious API flaw there is.",
    tags: ["fundamentals", "bola"],
  },
  {
    id: "fn-gov-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 1,
    prompt: "Which change to a public API is safe for existing clients?",
    options: [
      { id: "a", text: "Adding a new optional field to the response" },
      { id: "b", text: "Renaming an existing field" },
      { id: "c", text: "Removing a field nobody on your team uses" },
      { id: "d", text: "Making an optional request field required" },
    ],
    answer: "a",
    explanation:
      "Additive changes are safe because existing clients simply ignore what they do not know about. The other three all break someone — and 'nobody on your team uses it' says nothing about the consumers you do not control.",
    tags: ["fundamentals", "compatibility"],
  },

  // ======================== Data & Enterprise =================================
  {
    id: "fn-schema-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "schema-design",
    difficulty: 1,
    prompt: "What does a foreign key do?",
    options: [
      {
        id: "a",
        text: "Enforces that a value in one table refers to an existing row in another",
      },
      { id: "b", text: "Makes joins between the two tables faster" },
      { id: "c", text: "Guarantees the column contains unique values" },
      { id: "d", text: "Encrypts the referenced column" },
    ],
    answer: "a",
    explanation:
      "It is a referential integrity constraint: the database refuses writes that would point at nothing. That guarantee holds for every writer, including migration scripts and manual fixes, which is what application-level checking cannot promise.",
    tags: ["fundamentals", "constraints"],
  },
  {
    id: "fn-mig-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "migrations",
    difficulty: 1,
    prompt: "Why are database migrations kept in version control alongside code?",
    options: [
      {
        id: "a",
        text: "So the schema and the code that depends on it change together and can be reproduced anywhere",
      },
      { id: "b", text: "So the database can roll itself back automatically" },
      { id: "c", text: "Because databases cannot store their own schema" },
      { id: "d", text: "To make the migrations run faster" },
    ],
    answer: "a",
    explanation:
      "A schema applied by hand exists only where someone remembered to apply it. Versioned migrations mean any environment can be rebuilt to a known state, and you can see which code change a schema change belonged to.",
    tags: ["fundamentals", "migrations"],
  },
  {
    id: "fn-dbsec-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "db-security",
    difficulty: 1,
    prompt: "Why should an application not connect to its database as a superuser?",
    options: [
      {
        id: "a",
        text: "So a bug or injection cannot do more damage than the application legitimately needs to",
      },
      { id: "b", text: "Superuser connections are slower" },
      { id: "c", text: "Superusers cannot use connection pooling" },
      { id: "d", text: "It is required for backups to work" },
    ],
    answer: "a",
    explanation:
      "Least privilege bounds the blast radius. An application that can read and write rows but not drop tables turns a potentially catastrophic bug into a contained one.",
    tags: ["fundamentals", "least-privilege"],
  },
  {
    id: "fn-priv-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "data-privacy",
    difficulty: 1,
    prompt: "What is personally identifiable information?",
    options: [
      {
        id: "a",
        text: "Data that could identify a specific individual, alone or combined with other data",
      },
      { id: "b", text: "Only names and email addresses" },
      { id: "c", text: "Any data stored in a user table" },
      { id: "d", text: "Data that has been encrypted at rest" },
    ],
    answer: "a",
    explanation:
      "The 'combined with other data' part is what surprises people: a postcode, a birth date, and a gender together identify a large share of a population, even though none of them is a name.",
    tags: ["fundamentals", "pii"],
  },
  {
    id: "fn-eid-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-identity",
    difficulty: 1,
    prompt: "What does single sign-on give an organisation?",
    options: [
      {
        id: "a",
        text: "One authentication that works across many applications, with access controlled centrally",
      },
      { id: "b", text: "One password shared between all employees" },
      { id: "c", text: "Automatic encryption of all application traffic" },
      { id: "d", text: "The removal of any need for access reviews" },
    ],
    answer: "a",
    explanation:
      "Users authenticate once with the identity provider, and applications trust that. The operational win is bigger than the convenience: when someone leaves, access can be removed in one place rather than in thirty.",
    tags: ["fundamentals", "sso"],
  },
  {
    id: "fn-eint-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-integration",
    difficulty: 1,
    prompt:
      "Why do organisations run analytics on a separate database rather than the production one?",
    options: [
      {
        id: "a",
        text: "Large analytical scans compete with transactional traffic and slow the application",
      },
      { id: "b", text: "Production databases cannot run aggregate queries" },
      { id: "c", text: "Analytics data must be stored in a different format by law" },
      { id: "d", text: "It halves the storage cost" },
    ],
    answer: "a",
    explanation:
      "Transactional workloads are many small operations; analytical ones scan enormous ranges. Running both on the same machine means they fight over memory and I/O, and users feel it as unexplained slowness.",
    tags: ["fundamentals", "oltp-olap"],
  },
  {
    id: "fn-tenant-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "multi-tenancy",
    difficulty: 1,
    prompt: "What does multi-tenancy mean?",
    options: [
      {
        id: "a",
        text: "One system serving many customers whose data must stay separated",
      },
      { id: "b", text: "Running an application in several data centres" },
      { id: "c", text: "Allowing multiple users per customer account" },
      { id: "d", text: "Deploying several versions of an application at once" },
    ],
    answer: "a",
    explanation:
      "The whole design problem is how much tenants share. Sharing more is cheaper and denser; sharing less isolates them more strongly. Whatever you choose, keeping one customer's data away from another is the requirement that cannot be relaxed.",
    tags: ["fundamentals", "tenancy"],
  },

  // ============================= Frontend =====================================
  {
    id: "fn-fesec-001",
    type: "mcq",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 1,
    prompt: "What is cross-site scripting?",
    options: [
      {
        id: "a",
        text: "An attacker getting their own JavaScript to run in another user's browser on your site",
      },
      { id: "b", text: "A site loading scripts from a third-party domain" },
      { id: "c", text: "A request sent from one origin to another" },
      { id: "d", text: "Copying code between two projects" },
    ],
    answer: "a",
    explanation:
      "The attacker's code runs in your origin with your user's session, so it can do anything that user could. It is why untrusted content must be escaped on output rather than merely trusted on input.",
    tags: ["fundamentals", "xss"],
  },
  {
    id: "fn-a11y-001",
    type: "mcq",
    track: "frontend",
    topic: "accessibility",
    difficulty: 1,
    prompt: "What is alt text on an image for?",
    options: [
      {
        id: "a",
        text: "Conveying the image's purpose to people who cannot see it, and when it fails to load",
      },
      { id: "b", text: "Improving how fast the image loads" },
      { id: "c", text: "Providing a caption displayed under the image" },
      { id: "d", text: "Telling the browser which image format to use" },
    ],
    answer: "a",
    explanation:
      "It should carry purpose rather than describe pixels. A decorative image takes an empty alt so screen readers skip it — omitting the attribute entirely is different and worse, since some readers then announce the filename.",
    tags: ["fundamentals", "alt-text"],
  },
  {
    id: "fn-feperf-001",
    type: "mcq",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 1,
    prompt: "Why does the size of a JavaScript bundle affect how a page feels?",
    options: [
      {
        id: "a",
        text: "It must be downloaded, parsed, and executed before the page becomes interactive",
      },
      { id: "b", text: "Larger files are always served more slowly by CDNs" },
      { id: "c", text: "Browsers limit how much JavaScript a page may contain" },
      { id: "d", text: "It only affects the first visit, never later ones" },
    ],
    answer: "a",
    explanation:
      "Unlike an image, script has to be parsed and run on the main thread — the same thread handling user input. That is why bundle size shows up in responsiveness, and why a page can look finished while ignoring clicks.",
    tags: ["fundamentals", "bundle-size"],
  },
  {
    id: "fn-fearch-001",
    type: "mcq",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 1,
    prompt:
      "What is the difference between server-side rendering and client-side rendering?",
    options: [
      {
        id: "a",
        text: "Server-side sends ready-made HTML; client-side sends a shell and builds the page with JavaScript",
      },
      { id: "b", text: "Server-side is always faster in every respect" },
      { id: "c", text: "Client-side rendering cannot fetch data" },
      { id: "d", text: "They differ only in where the code is stored" },
    ],
    answer: "a",
    explanation:
      "Server rendering gets content on screen sooner and is indexable; client rendering is simpler to host and can feel snappier once loaded. Most real applications mix them per route rather than choosing one for everything.",
    tags: ["fundamentals", "rendering"],
  },

  // ========================== SQL & Analytics =================================
  {
    id: "fn-join-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-joins",
    difficulty: 1,
    prompt: "What does an INNER JOIN return?",
    options: [
      { id: "a", text: "Only the rows that have a match on both sides" },
      { id: "b", text: "All rows from both tables" },
      { id: "c", text: "All rows from the first table, with NULLs where there is no match" },
      { id: "d", text: "Every combination of rows from both tables" },
    ],
    answer: "a",
    explanation:
      "Unmatched rows are dropped from both sides. If you need to keep rows that have no match — customers who have never ordered, for instance — you want a LEFT JOIN instead.",
    tags: ["fundamentals", "joins"],
  },
  {
    id: "fn-agg-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 1,
    prompt: "What does GROUP BY do?",
    options: [
      {
        id: "a",
        text: "Collapses rows sharing a value into one row per group, so aggregates can be computed per group",
      },
      { id: "b", text: "Sorts the result set by the named column" },
      { id: "c", text: "Removes duplicate rows from the results" },
      { id: "d", text: "Filters rows before they are returned" },
    ],
    answer: "a",
    explanation:
      "It turns many rows into one per group, which is what lets COUNT, SUM, and AVG mean something. Sorting is ORDER BY, deduplicating is DISTINCT, and filtering is WHERE — all commonly confused with it.",
    tags: ["fundamentals", "group-by"],
  },
  {
    id: "fn-null-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-aggregation",
    difficulty: 1,
    prompt: "Why does WHERE column = NULL never match anything?",
    options: [
      {
        id: "a",
        text: "NULL means unknown, so comparing to it gives unknown rather than true — use IS NULL",
      },
      { id: "b", text: "NULL cannot be stored in an indexed column" },
      { id: "c", text: "The syntax should be WHERE column == NULL" },
      { id: "d", text: "NULL only works in SELECT clauses" },
    ],
    answer: "a",
    explanation:
      "SQL uses three-valued logic: true, false, and unknown. Since NULL represents an unknown value, asking whether it equals anything — including another NULL — yields unknown, and WHERE keeps only rows that are true.",
    tags: ["fundamentals", "nulls"],
  },
  {
    id: "fn-win-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-window-functions",
    difficulty: 1,
    prompt:
      "What does a window function do differently from a normal aggregate?",
    options: [
      { id: "a", text: "It keeps every row, adding the computed value alongside" },
      { id: "b", text: "It can only be used with numeric columns" },
      { id: "c", text: "It runs before the WHERE clause" },
      { id: "d", text: "It requires a subquery to work" },
    ],
    answer: "a",
    explanation:
      "GROUP BY collapses rows; a window function does not. That is why you can show each employee next to their department's average without joining an aggregate back to the original table.",
    tags: ["fundamentals", "window"],
  },
  {
    id: "fn-cte-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-subqueries",
    difficulty: 1,
    prompt: "What does a CTE, written with WITH, give you?",
    options: [
      { id: "a", text: "A named intermediate result you can reference later in the query" },
      { id: "b", text: "A permanent table stored in the database" },
      { id: "c", text: "An automatic index on the result" },
      { id: "d", text: "A guarantee the query will run faster" },
    ],
    answer: "a",
    explanation:
      "It is a name for a step, and it exists only for the duration of the query. The benefit is readability — four named steps are reviewable where four nested subqueries are not — rather than speed.",
    tags: ["fundamentals", "cte"],
  },
  {
    id: "fn-sqlperf-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "sql-performance",
    difficulty: 1,
    prompt: "What is the main reason to add an index to a column?",
    options: [
      {
        id: "a",
        text: "To let the database find matching rows without scanning the whole table",
      },
      { id: "b", text: "To reduce the storage the table uses" },
      { id: "c", text: "To make inserts and updates faster" },
      { id: "d", text: "To prevent duplicate values automatically" },
    ],
    answer: "a",
    explanation:
      "An index is a sorted structure supporting fast lookup. It costs storage and slows writes, since every change must maintain it — so an index nothing queries is pure overhead.",
    tags: ["fundamentals", "indexes"],
  },
  {
    id: "fn-metric-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "product-metrics",
    difficulty: 1,
    prompt: "What does retention measure?",
    options: [
      { id: "a", text: "Whether users come back after their first use" },
      { id: "b", text: "How many new users signed up this month" },
      { id: "c", text: "How long each session lasts on average" },
      { id: "d", text: "How much revenue each user generates" },
    ],
    answer: "a",
    explanation:
      "Retention is the honest metric because acquisition can be bought and retention cannot. A product with excellent signups and poor retention is filling a leaking bucket, and totals will hide that for a surprisingly long time.",
    tags: ["fundamentals", "retention"],
  },
  {
    id: "fn-stat-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "statistics-basics",
    difficulty: 1,
    prompt:
      "Ice cream sales and drowning incidents rise and fall together. What does this show?",
    options: [
      {
        id: "a",
        text: "Correlation without causation — hot weather drives both",
      },
      { id: "b", text: "That ice cream consumption is dangerous near water" },
      { id: "c", text: "That the data was collected incorrectly" },
      { id: "d", text: "Nothing — two variables cannot be compared this way" },
    ],
    answer: "a",
    explanation:
      "Temperature is a confounder: it drives both independently, producing a real correlation with no causal link between them. Reverse causation and selection effects are the other two standard reasons correlation fails to imply causation.",
    tags: ["fundamentals", "correlation"],
  },
  {
    id: "fn-ab-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "ab-testing",
    difficulty: 1,
    prompt: "Why are users assigned to A/B test groups at random?",
    options: [
      {
        id: "a",
        text: "So the groups differ only by chance, and any outcome difference can be attributed to the change",
      },
      { id: "b", text: "To make the test finish faster" },
      { id: "c", text: "Because users would otherwise notice they are in a test" },
      { id: "d", text: "To keep the groups exactly equal in size" },
    ],
    answer: "a",
    explanation:
      "Randomisation is what makes the comparison valid. Splitting by anything correlated with behaviour — signup date, region, device — means you are measuring that characteristic rather than your change.",
    tags: ["fundamentals", "randomisation"],
  },
];
