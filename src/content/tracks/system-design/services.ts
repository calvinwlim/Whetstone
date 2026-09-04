import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "queues",
    track: "system-design",
    title: "Message Queues & Async Work",
    blurb: "Decoupling producers from consumers, and the delivery guarantees you get.",
    lesson: `A queue decouples the thing that requests work from the thing that does it. That buys three properties: the producer stops waiting, load spikes buffer instead of failing, and the consumer can be scaled or restarted independently.

**Queues vs logs.** A traditional queue (SQS, RabbitMQ) hands each message to one consumer and deletes it on acknowledgement. A log (Kafka) keeps an ordered, replayable record that many independent consumer groups read at their own offsets. If more than one system needs the same events, or you might want to reprocess history, you want a log.

**Delivery guarantees.** *At-most-once* can drop messages. *At-least-once* is what nearly everything gives you, and it means duplicates are guaranteed to happen eventually. *Exactly-once* delivery is not achievable end-to-end across a network; what systems offer is exactly-once *processing*, built from at-least-once delivery plus idempotent consumers.

That makes **idempotency** the consumer's job, not the broker's. Give each message a stable id and record processed ids, or design the operation so applying it twice is harmless.

**Failure handling.** A message that always fails will be redelivered forever and block progress, so a *dead letter queue* catches messages after N attempts for human inspection. Retries need exponential backoff and jitter — synchronised retries are how a brief blip becomes a sustained outage.

**Ordering** is weaker than people expect. Most brokers guarantee order only within a partition or message group, so if order matters, it must be part of the key design.

**Asynchrony has a cost, and the caller pays it.** The producer stops waiting, and in exchange nothing tells it whether the work succeeded. That means a status it can poll, or a notification, or an accepted-then-failed state somebody has to reconcile — none of which existed while the call was synchronous. If the caller genuinely needs the answer before it can respond, a queue does not remove the waiting, it moves it somewhere harder to see.

**Watch the queue, not only the consumers.** Depth and the age of the oldest message are the two numbers that matter: depth says whether you are keeping up, age says how stale the worst case already is. A consumer that is running, healthy, and falling steadily behind looks identical to a healthy one on a CPU dashboard. Alert on lag, and alert on dead letter queue depth separately, or failures pile up somewhere nobody is looking.`,
    resources: [
      {
        label: "AWS — SQS dead letter queues",
        url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html",
      },
      {
        label: "Kafka — Design",
        url: "https://kafka.apache.org/documentation/#design",
      },
    ],
  },
  {
    id: "api-design",
    track: "system-design",
    title: "API Design",
    blurb: "Contracts other people depend on, and changing them without breaking anyone.",
    lesson: `An API is a promise. The design work is deciding what you are promising and how you will change it later without breaking callers.

**Style.** REST models resources with HTTP verbs and gets caching, status codes, and tooling for free. GraphQL lets clients ask for exactly the fields they need, which solves over-fetching for varied clients and moves complexity into query cost control. gRPC is compact and fast, and it is best suited to service-to-service calls rather than public browser-facing APIs.

**Idempotency.** GET, PUT, and DELETE are idempotent by definition; POST is not. For operations that must not double-apply — payments especially — accept a client-supplied *idempotency key* and return the original result on retry. Without it, a timeout leaves the client unable to retry safely, because it cannot tell whether the request landed.

**Pagination.** Offset pagination (\`?page=3\`) is simple and drifts: rows inserted during traversal cause skipped or repeated results, and deep offsets get slow. Cursor pagination encodes the last-seen sorted key and stays correct and fast at any depth.

**Versioning and evolution.** Adding a field is safe; removing one, renaming one, or narrowing an accepted value is not. Prefer additive change, and treat any client relying on undocumented behaviour as a client you will still break. When you must version, do it explicitly and keep the old version alive long enough for callers to migrate.

**Errors** should be machine-readable: a stable code the client can branch on, plus a human message. Never make callers parse prose.`,
    resources: [
      {
        label: "Stripe — Idempotent requests",
        url: "https://docs.stripe.com/api/idempotent_requests",
      },
      {
        label: "Google — API design guide",
        url: "https://cloud.google.com/apis/design",
      },
    ],
  },
  {
    id: "microservices",
    track: "system-design",
    title: "Services & Boundaries",
    blurb: "When splitting a system helps, and what it costs when it does not.",
    lesson: `Splitting a system into services buys independent deployment, independent scaling, and clear team ownership. It charges network calls where you used to have function calls, and distributed failure where you used to have a stack trace.

**Start with the monolith.** A well-modularised monolith is easier to change than a distributed system whose boundaries are wrong, and boundaries drawn before you understand the domain are usually wrong. The strongest signal to split is organisational: separate teams needing to deploy on separate schedules.

**Draw boundaries around data ownership.** Each service owns its data and nobody else reads it directly. Two services sharing a database table are one service wearing a costume — you get the operational overhead of separation with none of the independence.

**Distributed failure.** Every call can now be slow, fail, or fail partially. Timeouts are mandatory: without one, a slow dependency exhausts your thread pool and your service dies of someone else's problem. *Circuit breakers* stop hammering a failing dependency and let it recover. *Bulkheads* isolate resource pools so one bad dependency cannot consume every connection.

**Transactions across services** do not exist. The patterns are *sagas* — a sequence of local transactions with compensating actions for rollback — or the *outbox pattern*, where you write the event to a table in the same transaction as the data change, then publish it asynchronously. Both trade atomicity for eventual consistency, deliberately.

**The contract between services is the hard part.** Once a call crosses a network it crosses a team boundary too, so every change to a response shape is a change to somebody else's release schedule. Stay additive, version explicitly when you cannot, and verify with consumer-driven contract tests rather than hoping — a mock both sides trust and neither verifies is how an integration breaks in staging.

**Budget for the operational tax.** A distributed system needs things a monolith gets for nothing: distributed tracing to answer which hop was slow, correlated logs to reconstruct one request, per-service dashboards and on-call rotas, and a deploy pipeline repeated across every repository. None of it is optional and none of it is interesting, which is why it tends to be discovered rather than planned. A team that cannot absorb that cost has bought a liability rather than a boundary.`,
    resources: [
      {
        label: "Martin Fowler — Microservice trade-offs",
        url: "https://martinfowler.com/articles/microservice-trade-offs.html",
      },
      {
        label: "microservices.io — Saga pattern",
        url: "https://microservices.io/patterns/data/saga.html",
      },
    ],
  },
  {
    id: "search",
    track: "system-design",
    depth: true,
    title: "Search",
    blurb: "Why text search needs its own index, and what it costs to keep one.",
    lesson: `A relational \`LIKE '%term%'\` cannot use a B-tree index and scans the table, and it has no concept of relevance. Real search needs an *inverted index*: a map from each term to the documents containing it, which is what makes multi-term queries fast.

**Analysis** happens before indexing and determines what you can find. Tokenisation splits text into terms; lowercasing makes matching case-insensitive; *stemming* reduces words to a root so "running" matches "run"; stop-word removal drops high-frequency noise. The same analysis must run on the query — mismatched analysers are the most common reason a search returns nothing for an obviously present term.

**Relevance.** BM25 is the standard scoring function: terms rare across the corpus but frequent in a document score highest, with a saturation curve so repeating a word twenty times does not rank a document twenty times higher. Boost fields — a title match should outrank a body match.

**Keeping it fresh.** The search index is a denormalised copy, so it needs an update path and it will drift. Options are dual writes (simple, silently drifts on partial failure), change data capture from the database log (robust, more infrastructure), or periodic full reindexing (simple, stale between runs).

**Vector search** matches on embedding similarity rather than exact terms, which finds semantically related results that share no words. Hybrid search combines both, because pure vector search is weak at exact identifiers like SKUs or error codes.

**Measure relevance, or you are guessing.** Search quality is not something you can eyeball from a handful of queries you invented yourself. Build a judgement set — real queries paired with the results that should have come back — and track precision and recall against it, so a tuning change that helps one query while quietly breaking nine becomes visible. Click-through and abandonment from real traffic supply the rest, and they are the only signal reflecting what people actually wanted.

**Design for the queries you will really get.** They are short, misspelt, and frequently not sentences: a part number, half a product name, an error string pasted from a screen. Edit-distance tolerance handles typos, synonym lists close the gap between what you call something and what a customer calls it, and the no-results path deserves real design — a search that silently returns nothing is where people leave.`,
    resources: [
      {
        label: "Elasticsearch — Analysis",
        url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html",
      },
      {
        label: "PostgreSQL — Full text search",
        url: "https://www.postgresql.org/docs/current/textsearch.html",
      },
    ],
  },
  {
    id: "observability",
    track: "system-design",
    title: "Observability",
    blurb: "Knowing what a system is doing, especially the parts you did not anticipate.",
    lesson: `Monitoring answers questions you knew to ask. Observability lets you ask new ones during an incident, without shipping code.

**The three signals.** *Metrics* are cheap aggregates, ideal for dashboards and alerts, and they cannot tell you about one specific request. *Logs* are detailed per-event records, expensive at volume, and invaluable once you know where to look. *Traces* follow one request across services and are the fastest way to answer "which hop was slow" in a distributed system.

**Percentiles, not averages.** An average latency hides everything that matters. If p50 is 40ms and p99 is 4s, one percent of requests are terrible — and for a page making 100 backend calls, nearly every page view hits at least one. Alert on p95 and p99; treat the average as decoration.

**The four golden signals** — latency, traffic, errors, saturation — cover most of what you need from a service dashboard. **Alert on symptoms, not causes.** "Checkout error rate above 2%" tells you users are hurting. "CPU above 80%" might be perfectly healthy, and paging a human for it teaches them to ignore pages, which is how real alerts get missed.

**Cardinality** is the hidden cost. Every distinct label combination on a metric creates a new time series, so adding a user id as a label can multiply your metrics bill by millions. High-cardinality data belongs in logs and traces.

**Service level objectives** turn all of this into a decision rule. An SLO states a target — 99.9% of checkout requests served under 300ms over 30 days — and the *error budget* is whatever remains: 0.1%, or roughly 43 minutes a month. Spending it gradually is normal; spending it in one afternoon is a signal to stop shipping features and fix reliability instead. The value is that it converts an argument about whether the service is fast enough into arithmetic both sides already agreed to.

**Make the data usable before you need it.** Log structured events rather than prose, so a field can be filtered instead of grepped for. Attach a request id to everything and propagate it, or you cannot join a log line to the trace it belongs to. And sample deliberately: keeping every trace at volume is unaffordable, while a flat 1% throws away the rare slow request you most wanted, so sample errors and slow requests far more heavily than successes.`,
    resources: [
      {
        label: "Google SRE — Monitoring distributed systems",
        url: "https://sre.google/sre-book/monitoring-distributed-systems/",
      },
      {
        label: "OpenTelemetry",
        url: "https://opentelemetry.io/docs/what-is-opentelemetry/",
      },
    ],
  },
];

export const questions: Question[] = [
  {
    id: "sd-q-001",
    type: "mcq",
    track: "system-design",
    topic: "queues",
    difficulty: 3,
    context:
      "A payment service consumes from a queue with at-least-once delivery. A network blip causes a message to be redelivered.",
    prompt: "What must the consumer do?",
    options: [
      {
        id: "a",
        text: "Be idempotent — track processed message ids or make reapplying harmless",
      },
      { id: "b", text: "Switch the broker to exactly-once delivery" },
      { id: "c", text: "Acknowledge before processing to prevent redelivery" },
      { id: "d", text: "Reject duplicates at the load balancer" },
    ],
    answer: "a",
    explanation:
      "At-least-once means duplicates are certain over a long enough window, so correctness has to live in the consumer. Exactly-once delivery is not achievable across a network; exactly-once processing is, and it is built from at-least-once delivery plus idempotency. Acknowledging early converts duplicates into lost messages, which is worse for payments.",
    concepts: ["At-least-once delivery", "Idempotent consumer", "Exactly-once processing"],
    tags: ["idempotency", "delivery"],
  },
  {
    id: "sd-q-002",
    type: "short",
    track: "system-design",
    topic: "queues",
    difficulty: 2,
    context:
      "A malformed message fails every time it is processed, is redelivered forever, and blocks the queue.",
    prompt: "Which mechanism should catch it after N failed attempts?",
    answers: [
      "dead letter queue",
      "dlq",
      "dead-letter queue",
      "deadletter queue",
      "dead letter",
    ],
    typoTolerance: true,
    explanation:
      "A dead letter queue. After a configured number of attempts the message is moved aside so the main queue keeps flowing, and a human can inspect what went wrong. Without one, a single poison message can stall an entire pipeline.",
    concepts: ["Dead letter queue", "Poison message"],
    tags: ["dlq", "failure-handling"],
  },
  {
    id: "sd-q-003",
    type: "mcq",
    track: "system-design",
    topic: "queues",
    difficulty: 4,
    context:
      "Three separate services need to react to the same 'order placed' event, and the analytics team wants to reprocess last month's events after a bug fix.",
    prompt: "Which fits better, a traditional queue or a log?",
    options: [
      {
        id: "a",
        text: "A log — many consumer groups read independently and history can be replayed",
      },
      { id: "b", text: "A queue — each consumer gets its own copy automatically" },
      { id: "c", text: "A queue, with the message duplicated three times by the producer" },
      { id: "d", text: "Neither; use synchronous HTTP calls to all three services" },
    ],
    answer: "a",
    explanation:
      "A queue deletes a message once it is acknowledged, so fan-out means the producer duplicating it and replay is impossible. A log retains an ordered record that independent consumer groups read at their own offsets, which gives you both fan-out and replay for free.",
    concepts: ["Event log", "Consumer group", "Message replay"],
    tags: ["kafka", "fan-out"],
  },
  {
    id: "sd-q-004",
    type: "multi",
    track: "system-design",
    topic: "queues",
    difficulty: 4,
    prompt:
      "Why should retries use exponential backoff with jitter? Select all that apply.",
    options: [
      { id: "a", text: "Backoff gives a struggling dependency room to recover" },
      { id: "b", text: "Jitter prevents many clients retrying in lockstep" },
      { id: "c", text: "It avoids turning a brief blip into a sustained overload" },
      { id: "d", text: "It guarantees the request eventually succeeds" },
      { id: "e", text: "It makes each individual retry faster" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Backoff reduces pressure over time; jitter de-synchronises clients that all failed at the same instant and would otherwise retry at the same instant. Together they stop a retry storm. Neither guarantees success, and retries are slower by construction — that is the point.",
    concepts: ["Exponential backoff", "Jitter", "Retry storm"],
    tags: ["retries", "backoff"],
  },
  {
    id: "sd-api-001",
    type: "mcq",
    track: "system-design",
    topic: "api-design",
    difficulty: 3,
    context:
      "A client POSTs a payment, the request times out, and the client does not know whether it succeeded.",
    prompt: "What API feature makes retrying safe?",
    options: [
      {
        id: "a",
        text: "An idempotency key that returns the original result on retry",
      },
      { id: "b", text: "A longer client timeout" },
      { id: "c", text: "Switching the endpoint to PUT" },
      { id: "d", text: "Returning 202 Accepted instead of 200" },
    ],
    answer: "a",
    explanation:
      "The client supplies a unique key with the request; the server records it with the result and returns that same result for any retry carrying the key. Without it, the client must choose between risking a double charge and risking no charge at all. Switching to PUT does not help, because the resource id is server-generated.",
    concepts: ["Idempotency key", "Idempotent operation"],
    tags: ["idempotency"],
  },
  {
    id: "sd-api-002",
    type: "mcq",
    track: "system-design",
    topic: "api-design",
    difficulty: 3,
    context:
      "A feed endpoint uses offset pagination. Users report seeing duplicate items while scrolling, and page 500 is very slow.",
    prompt:
      "How do you fix duplicate items and slow deep pages in offset pagination?",
    options: [
      {
        id: "a",
        text: "Cursor pagination keyed on the last-seen sort value",
      },
      { id: "b", text: "Increase the page size to reduce the number of requests" },
      { id: "c", text: "Add an index on the offset column" },
      { id: "d", text: "Cache each page for 60 seconds" },
    ],
    answer: "a",
    explanation:
      "Both symptoms are inherent to offsets. New rows inserted during scrolling shift everything down, so items repeat, and OFFSET 10000 still requires the database to walk and discard 10,000 rows. A cursor encodes where you actually stopped, so it stays correct under concurrent writes and fast at any depth.",
    concepts: ["Cursor pagination", "Offset pagination"],
    tags: ["pagination"],
  },
  {
    id: "sd-api-003",
    type: "multi",
    track: "system-design",
    topic: "api-design",
    difficulty: 4,
    prompt:
      "Which changes to a public API are backwards compatible? Select all that apply.",
    options: [
      { id: "a", text: "Adding a new optional request field" },
      { id: "b", text: "Adding a new field to a response body" },
      { id: "c", text: "Adding a new endpoint" },
      { id: "d", text: "Renaming an existing response field" },
      { id: "e", text: "Making a previously optional request field required" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Additive changes are safe because existing callers keep working unchanged. Renaming a field breaks anyone reading it, and making an optional field required breaks every caller who omitted it. The practical rule: you can add, you cannot take away or rename.",
    concepts: ["Backwards compatibility", "Breaking change", "API versioning"],
    tags: ["versioning", "compatibility"],
  },
  {
    id: "sd-api-004",
    type: "matching",
    track: "system-design",
    topic: "api-design",
    difficulty: 2,
    prompt: "Match each HTTP status code to the situation it describes.",
    pairs: [
      { left: "400", right: "The request itself is malformed" },
      { left: "401", right: "Not authenticated — no valid credentials" },
      { left: "403", right: "Authenticated, but not allowed to do this" },
      { left: "404", right: "The resource does not exist" },
      { left: "409", right: "Conflicts with current state, such as a duplicate" },
    ],
    explanation:
      "The 401/403 distinction is the one interviews probe: 401 means we do not know who you are, 403 means we know and you still cannot. Some APIs deliberately return 404 instead of 403 to avoid revealing that a resource exists at all.",
    concepts: ["HTTP 401 Unauthorized", "HTTP 403 Forbidden", "HTTP 409 Conflict"],
    tags: ["http", "status-codes"],
  },
  {
    id: "sd-ms-001",
    type: "mcq",
    track: "system-design",
    topic: "microservices",
    difficulty: 4,
    context:
      "Two services read and write the same database table directly.",
    prompt:
      "What is the problem with two services reading and writing the same table?",
    options: [
      {
        id: "a",
        text: "They are coupled through the schema, so neither can change it independently",
      },
      { id: "b", text: "The connection pool will be exhausted by the second service" },
      { id: "c", text: "Nothing, as long as both services use the same ORM and migrations" },
      { id: "d", text: "Reads will be stale, because each service caches the table" },
    ],
    answer: "a",
    explanation:
      "A shared table is a shared contract. Neither team can alter the schema without coordinating with the other, so you have the deployment overhead and network latency of separate services with none of the independence they are supposed to buy. Each service should own its data and expose access through an API.",
    concepts: ["Shared database antipattern", "Service boundary", "Schema coupling"],
    tags: ["boundaries", "coupling"],
  },
  {
    id: "sd-ms-002",
    type: "mcq",
    track: "system-design",
    topic: "microservices",
    difficulty: 4,
    context:
      "A downstream service becomes slow rather than failing outright. Upstream services begin timing out and falling over one by one.",
    prompt: "Which pattern most directly prevents this cascade?",
    options: [
      {
        id: "a",
        text: "A circuit breaker that stops calling the failing dependency after a threshold",
      },
      { id: "b", text: "Adding more replicas of the upstream services" },
      { id: "c", text: "Increasing upstream timeouts" },
      { id: "d", text: "Retrying failed calls more aggressively" },
    ],
    answer: "a",
    explanation:
      "A circuit breaker trips after repeated failures and fails fast instead of holding threads open, which both protects the caller and gives the struggling dependency room to recover. Longer timeouts and more retries make it strictly worse — they hold resources longer and add load to the thing already drowning.",
    concepts: ["Circuit breaker", "Cascading failure", "Fail fast"],
    tags: ["circuit-breaker", "resilience"],
  },
  {
    id: "sd-ms-003",
    type: "short",
    track: "system-design",
    topic: "microservices",
    difficulty: 4,
    context:
      "An order spans three services. There is no distributed transaction, so each step commits locally and failures must undo prior steps with compensating actions.",
    prompt: "What is this pattern called?",
    answers: ["saga", "saga pattern", "sagas", "the saga pattern"],
    typoTolerance: true,
    explanation:
      "The saga pattern. Each step is a local transaction, and each has a compensating action that semantically undoes it — you cannot roll back a committed transaction, so you issue a refund rather than un-charging. It trades atomicity for availability, deliberately.",
    concepts: ["Saga pattern", "Compensating transaction"],
    tags: ["saga", "transactions"],
  },
  {
    id: "sd-ms-004",
    type: "mcq",
    track: "system-design",
    topic: "microservices",
    difficulty: 5,
    context:
      "A service must update its database and publish an event. Writing to the database and then publishing leaves a window where the write succeeds and the publish fails.",
    prompt: "Which pattern closes that window?",
    options: [
      {
        id: "a",
        text: "The outbox — write the event to a table in the same transaction, publish later",
      },
      { id: "b", text: "Publish the event first, then write to the database afterwards" },
      { id: "c", text: "Use a two-phase commit spanning the database and the broker" },
      { id: "d", text: "Retry the publish in a finally block until it succeeds" },
    ],
    answer: "a",
    explanation:
      "The outbox makes the event part of the same atomic database transaction as the data change, so they succeed or fail together. A separate relay reads the outbox and publishes with at-least-once delivery. Publishing first creates the opposite bug, and a finally block still fails if the process dies.",
    concepts: ["Outbox pattern", "Dual write problem", "Change data capture"],
    tags: ["outbox", "consistency"],
  },
  {
    id: "sd-search-001",
    type: "mcq",
    track: "system-design",
    topic: "search",
    difficulty: 3,
    prompt:
      "Why can a B-tree index not accelerate a query like LIKE '%term%'?",
    options: [
      {
        id: "a",
        text: "B-trees are ordered by prefix, and a leading wildcard has no prefix to seek on",
      },
      { id: "b", text: "B-trees cannot index text columns" },
      { id: "c", text: "LIKE queries bypass the query planner" },
      { id: "d", text: "The index is only used for numeric comparisons" },
    ],
    answer: "a",
    explanation:
      "A B-tree sorts by the start of the value, so it can seek efficiently for 'term%' but a leading wildcard could match anywhere and forces a scan. Substring and relevance search need an inverted index, which maps each term to the documents that contain it.",
    concepts: ["Inverted index", "B-tree index", "Full-text search"],
    tags: ["inverted-index"],
  },
  {
    id: "sd-search-002",
    type: "mcq",
    track: "system-design",
    topic: "search",
    difficulty: 4,
    context:
      "A document clearly containing the word 'running' is not returned when a user searches for 'run'.",
    prompt: "Why would a search for 'run' miss a document containing 'running'?",
    options: [
      {
        id: "a",
        text: "No stemming in the analyzer, so 'running' and 'run' index as unrelated terms",
      },
      { id: "b", text: "The document was never indexed" },
      { id: "c", text: "BM25 scored the document below the cutoff" },
      { id: "d", text: "The query needs a wildcard to match" },
    ],
    answer: "a",
    explanation:
      "Stemming reduces words to a common root so morphological variants match. Without it, the index holds 'running' and the query asks for 'run', and they simply do not match. The same analyzer must run at index time and query time — a mismatch there is the classic cause of a search that finds nothing.",
    concepts: ["Stemming", "Text analysis", "Analyzer"],
    tags: ["analysis", "stemming"],
  },
  {
    id: "sd-search-003",
    type: "mcq",
    track: "system-design",
    topic: "search",
    difficulty: 4,
    prompt:
      "Why is hybrid search usually preferred over pure vector search for a product catalogue?",
    options: [
      {
        id: "a",
        text: "Vector search is weak on exact identifiers like SKUs; keyword search is not",
      },
      { id: "b", text: "Embeddings cannot be computed for short strings like part numbers" },
      { id: "c", text: "Keyword search returns more relevant results in every case" },
      { id: "d", text: "Hybrid search needs less storage than a vector index alone" },
    ],
    answer: "a",
    explanation:
      "Embeddings capture meaning, which is what makes semantic search work — and meaning is exactly the wrong tool for a part number. A user typing an exact SKU wants that item, not something conceptually similar. Hybrid search runs both and fuses the rankings.",
    concepts: ["Hybrid search", "Vector search", "Semantic search"],
    tags: ["vector-search", "hybrid"],
  },
  {
    id: "sd-obs-001",
    type: "mcq",
    track: "system-design",
    topic: "observability",
    difficulty: 3,
    context: "A service reports average latency of 45ms. Users complain it is slow.",
    prompt: "What is the most likely explanation?",
    options: [
      {
        id: "a",
        text: "The average hides a bad tail — p99 could be seconds",
      },
      { id: "b", text: "The metric is being collected incorrectly" },
      { id: "c", text: "The average is computed over too short a window" },
      { id: "d", text: "Average latency is the wrong unit" },
    ],
    answer: "a",
    explanation:
      "Averages are dominated by the common case and say nothing about the tail. With p50 at 40ms and p99 at 4s, one in a hundred requests is dreadful — and a page issuing 100 backend calls will hit that tail on nearly every load. Alert on p95 and p99.",
    concepts: ["p99 latency", "Tail latency", "Percentile"],
    tags: ["percentiles", "latency"],
  },
  {
    id: "sd-obs-002",
    type: "multi",
    track: "system-design",
    topic: "observability",
    difficulty: 3,
    prompt:
      "Which are the four golden signals of monitoring? Select all that apply.",
    options: [
      { id: "a", text: "Latency" },
      { id: "b", text: "Traffic" },
      { id: "c", text: "Errors" },
      { id: "d", text: "Saturation" },
      { id: "e", text: "Deployment frequency" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Latency, traffic, errors, and saturation — from Google's SRE book. Together they cover almost everything a service dashboard needs. Deployment frequency is a DORA delivery metric: useful, but it measures your team rather than your running system.",
    concepts: ["Four golden signals", "Saturation", "Service monitoring"],
    tags: ["golden-signals"],
  },
  {
    id: "sd-obs-003",
    type: "mcq",
    track: "system-design",
    topic: "observability",
    difficulty: 4,
    context:
      "An engineer adds user_id as a label on a request-count metric. The monitoring bill increases sharply.",
    prompt:
      "Why does adding user_id as a metric label make the monitoring bill jump?",
    options: [
      {
        id: "a",
        text: "Every distinct label value creates a separate time series — a cardinality explosion",
      },
      { id: "b", text: "User ids are stored in plaintext, triggering compliance costs" },
      { id: "c", text: "Metrics are billed per query, not per series" },
      { id: "d", text: "Labels force metrics to be sampled at a higher rate" },
    ],
    answer: "a",
    explanation:
      "Metrics systems store one time series per unique label combination, so a user id label multiplies your series count by your user count. High-cardinality dimensions belong in logs and traces, which are designed to be queried rather than pre-aggregated.",
    concepts: ["Cardinality explosion", "Time series", "Metric labels"],
    tags: ["cardinality", "cost"],
  },
  {
    id: "sd-obs-004",
    type: "mcq",
    track: "system-design",
    topic: "observability",
    difficulty: 4,
    prompt:
      "Why is 'CPU above 80%' generally a worse alert than 'checkout error rate above 2%'?",
    options: [
      {
        id: "a",
        text: "It alerts on a cause that may be harmless, rather than a symptom users feel",
      },
      { id: "b", text: "CPU metrics are less accurate than error rates" },
      { id: "c", text: "CPU cannot be measured reliably in containers" },
      { id: "d", text: "Error rates are cheaper to collect" },
    ],
    answer: "a",
    explanation:
      "High CPU on a healthy, well-utilised service is fine — and it is entirely possible to be at 40% CPU while failing every request. Alerting on symptoms ties every page to real user impact. Cause metrics are for diagnosis once you are already investigating, and paging on them trains people to ignore pages.",
    concepts: ["Symptom-based alerting", "Alert fatigue", "Service level objective"],
    tags: ["alerting", "symptoms"],
  },
  {
    id: "sd-q-005",
    type: "short",
    track: "system-design",
    topic: "queues",
    difficulty: 3,
    context:
      "A service writes an order row to its database and then publishes an 'order placed' event to the broker. If it crashes between the two, the order exists and the event was never sent.",
    prompt:
      "Which pattern makes the database write and the event publish succeed or fail together? (Two words.)",
    answers: [
      "transactional outbox",
      "outbox",
      "outbox pattern",
      "transactional outbox pattern",
      "the outbox pattern",
    ],
    typoTolerance: true,
    explanation:
      "The transactional outbox. The event is inserted into an outbox table inside the same database transaction as the order, so either both land or neither does; a separate relay then reads that table and publishes. It replaces a distributed transaction across a database and a broker, which is the thing you are trying to avoid.",
    concepts: ["Transactional outbox", "Dual write problem", "Change data capture"],
    tags: ["outbox", "dual-write"],
  },
  {
    id: "sd-q-006",
    type: "multi",
    track: "system-design",
    topic: "queues",
    difficulty: 4,
    prompt:
      "What must hold for a consumer to process one entity's events in the order they were produced? Select all that apply.",
    options: [
      {
        id: "a",
        text: "Every event for that entity carries the same partition key, so they land on one partition",
      },
      { id: "b", text: "Only one consumer instance reads that partition at a time" },
      {
        id: "c",
        text: "A failed event is retried before later events for that entity are processed",
      },
      { id: "d", text: "The broker maintains a total order across every partition in the topic" },
      { id: "e", text: "The producer batches events to raise throughput" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Ordering is a per-partition property, so it is bought with the key design and one reader per partition. Total ordering across a topic would give it to you and costs your entire parallelism, which is why no one does it. The price of (c) is head-of-line blocking: one stuck event stalls its partition, so pair it with a bounded attempt count and a dead letter queue.",
    concepts: ["Partition key", "Head-of-line blocking", "Consumer group", "Message ordering"],
    tags: ["ordering", "partitions"],
  },
  {
    id: "sd-q-007",
    type: "mcq",
    track: "system-design",
    topic: "queues",
    difficulty: 3,
    context:
      "A job takes about 90 seconds to process. The queue's visibility timeout is 30 seconds. The job completes correctly, and other workers keep picking up the same message and running it again.",
    prompt: "Why is one message being processed several times concurrently?",
    options: [
      {
        id: "a",
        text: "The timeout expires before the worker acknowledges, so it is re-offered",
      },
      { id: "b", text: "The worker never acknowledges, so everything is redelivered" },
      { id: "c", text: "The queue is set to fan-out, so every consumer gets a copy" },
      { id: "d", text: "The dead letter queue is feeding the message back into the main queue" },
    ],
    answer: "a",
    explanation:
      "A visibility timeout is the broker's bet on how long processing takes. Exceed it and the broker assumes the worker died and re-offers the message, so a slow job manufactures its own duplicates. Set the timeout above the p99 processing time or extend it with a heartbeat — and keep the consumer idempotent, because this is only the most obvious way duplicates arise.",
    concepts: ["Visibility timeout", "At-least-once delivery", "Idempotent consumer"],
    tags: ["visibility-timeout", "duplicates"],
  },
  {
    id: "sd-q-008",
    type: "ordering",
    track: "system-design",
    topic: "queues",
    difficulty: 2,
    prompt: "Put the journey of a poison message to the dead letter queue in order.",
    items: [
      "A consumer receives the message and throws while processing it",
      "No acknowledgement arrives, so the broker makes the message available again",
      "The message is redelivered and its receive count increases",
      "The receive count passes the configured maximum attempts",
      "The broker moves the message to the dead letter queue",
      "The main queue resumes delivering the messages queued behind it",
    ],
    explanation:
      "The last step is the point of the whole mechanism. Without a maximum attempt count the loop between redelivery and failure never terminates, and one malformed message holds up every message behind it indefinitely. The dead letter queue then needs an alarm on its depth, or it becomes a place failures go to be forgotten.",
    concepts: ["Dead letter queue", "Poison message", "Redrive policy"],
    tags: ["dlq", "failure-handling"],
  },
  {
    id: "sd-q-009",
    type: "multi",
    track: "system-design",
    topic: "queues",
    difficulty: 4,
    context:
      "Consumer lag on a topic is growing steadily. The topic has 6 partitions and the consumer group already runs 6 instances.",
    prompt:
      "Which changes would actually reduce consumer lag here? Select all that apply.",
    options: [
      {
        id: "a",
        text: "Raise the partition count so the group can run more consumers in parallel",
      },
      {
        id: "b",
        text: "Make per-message work cheaper, for example by batching the downstream writes",
      },
      {
        id: "c",
        text: "Move a slow side effect out of the consumer into a separate downstream stage",
      },
      { id: "d", text: "Add a seventh instance to the same consumer group" },
      { id: "e", text: "Increase the topic's retention period" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Partition count is the hard ceiling on parallelism within a group, so the seventh instance is assigned nothing and idles — the most common wasted response to lag. Retention governs how long messages are kept, not how fast they are read. Everything else is either more consumers or less work per message, which are the only two levers there are.",
    concepts: ["Consumer lag", "Partition count", "Consumer group", "Horizontal scaling"],
    tags: ["lag", "scaling"],
  },
  {
    id: "sd-api-005",
    type: "mcq",
    track: "system-design",
    topic: "api-design",
    difficulty: 3,
    context:
      "Generating an export takes two to ten minutes. The endpoint holds the connection open until it finishes, and clients behind proxies are seeing timeouts.",
    prompt: "How should an endpoint whose work takes minutes be redesigned?",
    options: [
      {
        id: "a",
        text: "Return 202 Accepted with a status URL to poll, and the result's location once it is ready",
      },
      { id: "b", text: "Raise the client and proxy timeouts to fifteen minutes" },
      { id: "c", text: "Stream keep-alive whitespace until the work finishes" },
      { id: "d", text: "Split the work into several synchronous calls the client makes in a loop" },
    ],
    answer: "a",
    explanation:
      "Make the job itself a resource: the request creates it, the response says where to watch it. Raising timeouts means depending on every intermediary between you and the client, most of which you do not control. Keep-alive whitespace holds a connection and a worker for ten minutes and still dies to any proxy that gives up first.",
    concepts: ["HTTP 202 Accepted", "Asynchronous request-reply", "Polling"],
    tags: ["async", "long-running"],
  },
  {
    id: "sd-api-006",
    type: "multi",
    track: "system-design",
    topic: "api-design",
    difficulty: 3,
    prompt:
      "Which properties should an API's error responses have? Select all that apply.",
    options: [
      { id: "a", text: "A stable machine-readable code the client can branch on" },
      { id: "b", text: "A human-readable message aimed at a developer reading logs" },
      { id: "c", text: "Enough structure to say which field failed and why" },
      { id: "d", text: "A stack trace so the caller can see where the server failed" },
      { id: "e", text: "Message wording clients are expected to match against" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Codes are the contract; prose is for humans and must stay free to change. Once clients match on your wording, the wording is an undocumented part of your API and you can never improve it. A stack trace hands an attacker your framework versions and internal paths, and tells the caller nothing they can act on.",
    concepts: ["Error code", "Problem Details for HTTP APIs", "Information disclosure"],
    tags: ["errors", "contracts"],
  },
  {
    id: "sd-api-007",
    type: "short",
    track: "system-design",
    topic: "api-design",
    difficulty: 3,
    context:
      "To render one screen a mobile client fetches the user, then their orders, then the line items for each order — a dozen sequential round trips before anything appears.",
    prompt: "What term describes an API that forces this many small round trips?",
    answers: ["chatty", "chatty api", "chattiness", "chatty interface", "too chatty"],
    typoTolerance: true,
    explanation:
      "A chatty API. Each hop pays a full round-trip time, which dominates everything else on a mobile network, and the trips are sequential because each depends on the last. The fixes are a coarser endpoint, a backend-for-frontend that composes the calls server-side, or letting the client state the shape it wants.",
    concepts: ["Chatty API", "Backend for Frontend", "Round-trip time", "Over-fetching"],
    tags: ["granularity", "mobile"],
  },
  {
    id: "sd-api-008",
    type: "ordering",
    track: "system-design",
    topic: "api-design",
    difficulty: 3,
    prompt:
      "Put the steps of removing a response field from a public API in order.",
    items: [
      "Add the replacement field and populate both on every response",
      "Announce the deprecation and publish a removal date",
      "Serve a Sunset header on responses that still include the old field",
      "Wait out the deprecation window while callers migrate",
      "Confirm from telemetry that no caller still reads the old field",
      "Remove the old field and release the change",
    ],
    explanation:
      "This is expand and contract: the two versions coexist so no caller is ever forced to change on your schedule. The step teams omit is the telemetry — without per-field usage you are guessing about who breaks, and an announcement is not evidence that anyone read it.",
    concepts: ["Expand and contract migration", "Deprecation window", "Sunset header"],
    tags: ["versioning", "deprecation"],
  },
  {
    id: "sd-api-009",
    type: "mcq",
    track: "system-design",
    topic: "api-design",
    difficulty: 4,
    context:
      "A bulk endpoint accepts 500 records. Twelve fail validation; the other 488 have already been written.",
    prompt: "How should the response report a partly applied bulk request?",
    options: [
      {
        id: "a",
        text: "A per-record status list, so the client can retry exactly the twelve that failed",
      },
      { id: "b", text: "400 Bad Request for the whole call, since part of the payload was invalid" },
      { id: "c", text: "200 with a count of successes, leaving the client to work out the rest" },
      { id: "d", text: "500, so the client's existing retry logic resends the batch" },
    ],
    answer: "a",
    explanation:
      "The response has to describe what actually happened. A blanket 400 or 500 tells the client nothing was applied, so its retry double-applies 488 records; a success count is honest but not actionable, because the client cannot tell which twelve to fix. If you would rather keep the response simple, make the operation atomic instead — and then apply nothing.",
    concepts: ["Partial failure", "HTTP 207 Multi-Status", "Idempotency key", "Atomicity"],
    tags: ["bulk", "partial-failure"],
  },
  {
    id: "sd-ms-005",
    type: "short",
    track: "system-design",
    topic: "microservices",
    difficulty: 3,
    context:
      "A team is replacing a monolith one capability at a time. A routing layer in front sends each migrated path to its new service and everything else to the monolith, until nothing is left to route.",
    prompt: "What is this incremental replacement pattern called? (Two words.)",
    answers: [
      "strangler fig",
      "strangler",
      "strangler pattern",
      "strangler fig pattern",
      "strangler application",
    ],
    typoTolerance: true,
    explanation:
      "The strangler fig, named for the vine that grows around a tree until the tree is gone. Its value is that every step ships and every step is reversible. A big-bang rewrite has no working intermediate state, so it cannot be de-risked incrementally and cannot be abandoned halfway without losing everything.",
    concepts: ["Strangler fig pattern", "Incremental migration", "Facade"],
    tags: ["migration", "monolith"],
  },
  {
    id: "sd-obs-005",
    type: "matching",
    track: "system-design",
    topic: "observability",
    difficulty: 2,
    prompt:
      "Match each observability signal to the question it answers best.",
    pairs: [
      { left: "Metrics", right: "Is the error rate rising, and since when?" },
      { left: "Logs", right: "What exactly happened inside this one failed request?" },
      { left: "Distributed traces", right: "Which service in the chain spent the time?" },
      { left: "Profiles", right: "Which function inside one process is burning CPU?" },
    ],
    explanation:
      "They are not interchangeable, and using the wrong one is expensive. Answering a metrics question with logs means storing and scanning terabytes to compute a number a counter would have given you for free; answering a tracing question with logs means reconstructing causality by hand from timestamps across five services.",
    concepts: ["Distributed tracing", "Structured logging", "Continuous profiling", "Cardinality"],
    tags: ["signals", "pillars"],
  },
  {
    id: "sd-obs-006",
    type: "short",
    track: "system-design",
    topic: "observability",
    difficulty: 3,
    context:
      "A request crosses five services. Each one emits spans, but the backend shows five separate single-service traces rather than one connected tree.",
    prompt:
      "What must each service forward on its outgoing calls to link those spans into one trace?",
    answers: [
      "trace context",
      "trace id",
      "traceid",
      "trace-id",
      "traceparent",
      "traceparent header",
      "trace context header",
      "w3c trace context",
      "correlation id",
    ],
    typoTolerance: true,
    explanation:
      "The trace context — carried as the W3C traceparent header, holding the trace id and the current span id so the callee can parent its spans correctly. Generating spans is the easy half; propagating context across every client library, queue, and thread pool is the half that actually breaks, which is why traces silently fragment at exactly one service.",
    concepts: ["Trace context propagation", "W3C Trace Context", "Span", "Distributed tracing"],
    tags: ["tracing", "propagation"],
  },
];
