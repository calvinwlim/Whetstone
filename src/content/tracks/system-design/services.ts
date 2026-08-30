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

**Ordering** is weaker than people expect. Most brokers guarantee order only within a partition or message group, so if order matters, it must be part of the key design.`,
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

**Transactions across services** do not exist. The patterns are *sagas* — a sequence of local transactions with compensating actions for rollback — or the *outbox pattern*, where you write the event to a table in the same transaction as the data change, then publish it asynchronously. Both trade atomicity for eventual consistency, deliberately.`,
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
    title: "Search",
    blurb: "Why text search needs its own index, and what it costs to keep one.",
    lesson: `A relational \`LIKE '%term%'\` cannot use a B-tree index and scans the table, and it has no concept of relevance. Real search needs an *inverted index*: a map from each term to the documents containing it, which is what makes multi-term queries fast.

**Analysis** happens before indexing and determines what you can find. Tokenisation splits text into terms; lowercasing makes matching case-insensitive; *stemming* reduces words to a root so "running" matches "run"; stop-word removal drops high-frequency noise. The same analysis must run on the query — mismatched analysers are the most common reason a search returns nothing for an obviously present term.

**Relevance.** BM25 is the standard scoring function: terms rare across the corpus but frequent in a document score highest, with a saturation curve so repeating a word twenty times does not rank a document twenty times higher. Boost fields — a title match should outrank a body match.

**Keeping it fresh.** The search index is a denormalised copy, so it needs an update path and it will drift. Options are dual writes (simple, silently drifts on partial failure), change data capture from the database log (robust, more infrastructure), or periodic full reindexing (simple, stale between runs).

**Vector search** matches on embedding similarity rather than exact terms, which finds semantically related results that share no words. Hybrid search combines both, because pure vector search is weak at exact identifiers like SKUs or error codes.`,
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

**Cardinality** is the hidden cost. Every distinct label combination on a metric creates a new time series, so adding a user id as a label can multiply your metrics bill by millions. High-cardinality data belongs in logs and traces.`,
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
    prompt: "What is the fix?",
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
    prompt: "What is the problem?",
    options: [
      {
        id: "a",
        text: "They are coupled through the schema — neither can change it independently, so they are one service in practice",
      },
      { id: "b", text: "Database connections will be exhausted" },
      { id: "c", text: "Nothing, as long as both use the same ORM" },
      { id: "d", text: "Reads will always be stale" },
    ],
    answer: "a",
    explanation:
      "A shared table is a shared contract. Neither team can alter the schema without coordinating with the other, so you have the deployment overhead and network latency of separate services with none of the independence they are supposed to buy. Each service should own its data and expose access through an API.",
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
        text: "The outbox pattern — write the event to a table in the same transaction, then publish asynchronously",
      },
      { id: "b", text: "Publish the event first, then write to the database" },
      { id: "c", text: "Use a two-phase commit across the database and broker" },
      { id: "d", text: "Retry the publish in a finally block" },
    ],
    answer: "a",
    explanation:
      "The outbox makes the event part of the same atomic database transaction as the data change, so they succeed or fail together. A separate relay reads the outbox and publishes with at-least-once delivery. Publishing first creates the opposite bug, and a finally block still fails if the process dies.",
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
    prompt: "What is the most likely cause?",
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
        text: "Vector search is weak on exact identifiers like SKUs, which keyword search handles precisely",
      },
      { id: "b", text: "Vector search cannot be indexed" },
      { id: "c", text: "Keyword search is always more relevant" },
      { id: "d", text: "Hybrid search requires less storage" },
    ],
    answer: "a",
    explanation:
      "Embeddings capture meaning, which is what makes semantic search work — and meaning is exactly the wrong tool for a part number. A user typing an exact SKU wants that item, not something conceptually similar. Hybrid search runs both and fuses the rankings.",
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
      { id: "c", text: "Users are comparing against a faster competitor" },
      { id: "d", text: "Average latency is the wrong unit" },
    ],
    answer: "a",
    explanation:
      "Averages are dominated by the common case and say nothing about the tail. With p50 at 40ms and p99 at 4s, one in a hundred requests is dreadful — and a page issuing 100 backend calls will hit that tail on nearly every load. Alert on p95 and p99.",
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
    prompt: "Why?",
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
    tags: ["alerting", "symptoms"],
  },
];
