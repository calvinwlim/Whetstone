import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "antipatterns",
    track: "system-design",
    title: "Performance Antipatterns",
    blurb: "The named ways systems get slow, and what each one actually is.",
    lesson: `Most production slowness is one of a small number of recognisable shapes. Knowing their names is useful because it turns "the page is slow" into a specific hypothesis you can test.

**Chatty I/O** — many small round trips where a few larger ones would do. Latency, not bandwidth, is the cost: 200 calls at 5ms each is a second of waiting no matter how small the payloads are. The database version is the **N+1 query**: fetch a list, then issue one query per row. Fix by batching, joining, or eager-loading.

**Extraneous fetching** — pulling far more data than the operation needs. \`SELECT *\` to read one column, or fetching a full object graph to display a name. It wastes network, memory, and cache space, and it hides behind "the query is indexed".

**Busy database** — pushing work into the database that the application should do, so the hardest component to scale horizontally becomes the bottleneck.

**Busy frontend** — the opposite: heavy work on the request thread that should be queued, so the thing users wait on is doing something they never asked to wait for.

**Synchronous I/O** — blocking a thread on a call that could be awaited. Throughput collapses under load because threads sit idle holding memory rather than serving other requests.

**Noisy neighbour** — one tenant or workload consuming shared capacity and degrading everyone else. The defence is isolation: quotas, separate pools, rate limits per tenant.

**Retry storm** — every client retrying a failing dependency at once, turning a blip into a sustained outage. The defence is exponential backoff with jitter, a retry budget, and a circuit breaker.

**Improper instantiation** — creating an expensive client, connection, or parser per request instead of reusing one. It looks like a memory problem and is really a lifetime problem.`,
    resources: [
      {
        label: "Azure — Performance antipatterns",
        url: "https://learn.microsoft.com/en-us/azure/architecture/antipatterns/",
      },
    ],
  },
  {
    id: "backpressure",
    track: "system-design",
    title: "Idempotency & Back Pressure",
    blurb: "Surviving retries, and what to do when demand exceeds capacity.",
    lesson: `Two problems show up together in every distributed system: work arrives more than once, and work arrives faster than you can do it.

**Idempotency** means applying an operation twice leaves the same state as applying it once. It matters because a client that times out cannot tell whether the request landed, so its only safe options are to retry or to give up — and giving up on a payment is not an option. The standard mechanism is an *idempotency key*: the client generates a unique id, the server records it with the result, and any retry carrying that key returns the stored result instead of doing the work again.

GET, PUT, and DELETE are idempotent by definition. POST is not, which is why creation endpoints need explicit keys.

**Back pressure** is a system telling its callers to slow down instead of silently queueing forever. Unbounded queues do not absorb overload, they hide it — latency climbs, memory grows, and eventually everything fails at once with a queue full of requests whose callers have already timed out. A bounded queue that rejects work is more honest and recovers faster.

**Ways to shed load, in rough order of preference.** *Rate limiting* caps input per client. *Throttling* slows everyone proportionally. *Load shedding* drops the least valuable requests first — health checks and paying customers survive, background refreshes do not. *Queue-based load levelling* puts a buffer between a spiky producer and a steady consumer, which smooths bursts but does not create capacity.

**The rule that ties them together:** if you are going to retry, be idempotent; if you are going to be retried, apply back pressure. A system that does neither converts one slow dependency into a full outage.`,
    resources: [
      {
        label: "Stripe — Idempotent requests",
        url: "https://docs.stripe.com/api/idempotent_requests",
      },
      {
        label: "AWS — Timeouts, retries and backoff with jitter",
        url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Antipatterns ----------
  {
    id: "sd-anti-001",
    type: "short",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 2,
    context:
      "An endpoint loads 100 orders, then issues one query per order to fetch its customer. The page makes 101 database queries.",
    prompt: "What is this antipattern called? (Include the number.)",
    answers: ["n+1", "n + 1", "n+1 query", "n+1 queries", "n plus 1", "the n+1 problem"],
    typoTolerance: true,
    explanation:
      "The N+1 query problem: one query for the list, then N more for the details. Fix it with a join, an eager load, or a batched \"where customer_id in (...)\" query. It hides well in development because N is small there.",
    concepts: ["N+1 query problem", "Eager loading", "Query batching"],
    tags: ["n+1", "database"],
  },
  {
    id: "sd-anti-002",
    type: "matching",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 4,
    prompt: "Match each performance antipattern to what it describes.",
    pairs: [
      { left: "Chatty I/O", right: "Many small round trips where fewer larger ones would do" },
      { left: "Extraneous fetching", right: "Retrieving far more data than the operation needs" },
      { left: "Noisy neighbour", right: "One tenant consuming shared capacity and degrading others" },
      { left: "Retry storm", right: "Clients all retrying a failing dependency at once" },
      { left: "Improper instantiation", right: "Recreating an expensive client per request instead of reusing it" },
    ],
    explanation:
      "Naming the shape is most of the diagnosis. Chatty I/O is a latency problem, extraneous fetching is a bandwidth and memory problem, noisy neighbour is an isolation problem, retry storms are a coordination problem, and improper instantiation is an object-lifetime problem wearing a memory costume.",
    concepts: ["Chatty I/O", "Extraneous fetching", "Noisy neighbour", "Retry storm"],
    tags: ["catalogue"],
  },
  {
    id: "sd-anti-003",
    type: "mcq",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 3,
    context:
      "A service makes 200 sequential calls to a dependency, each taking 5ms. Payloads are tiny and the network is fast.",
    prompt: "What is the problem, and what fixes it?",
    options: [
      {
        id: "a",
        text: "Chatty I/O — latency per round trip dominates, so batch the calls or parallelise them",
      },
      { id: "b", text: "Bandwidth saturation — compress the payloads" },
      { id: "c", text: "The dependency is too slow — ask its owners to optimise" },
      { id: "d", text: "Nothing; 5ms per call is acceptable" },
    ],
    answer: "a",
    explanation:
      "Small payloads and a fast network are exactly the tell: the cost is 200 round trips, not the bytes. 200 x 5ms is a full second of latency. Batching into one call or issuing them concurrently collapses it, and neither requires the dependency to get any faster.",
    concepts: ["Chatty I/O", "Round-trip latency", "Request batching"],
    tags: ["chatty-io", "latency"],
  },
  {
    id: "sd-anti-004",
    type: "mcq",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 4,
    context:
      "A dependency has a brief 10-second blip. Every client retries immediately and keeps retrying. The dependency stays down for 20 minutes.",
    prompt: "Why does a 10-second dependency blip turn into a 20-minute outage?",
    options: [
      {
        id: "a",
        text: "A retry storm — synchronised retries kept load above what the dependency could recover under",
      },
      { id: "b", text: "The initial blip corrupted data, requiring manual recovery" },
      { id: "c", text: "The clients exhausted their connection pools permanently" },
      { id: "d", text: "DNS caching pointed clients at the failed instance" },
    ],
    answer: "a",
    explanation:
      "Retries turned a 10-second problem into a 20-minute one: the moment the dependency came back it was hit by every backed-up client simultaneously and fell over again. Exponential backoff spreads the load over time and jitter de-synchronises clients that all failed at the same instant. A circuit breaker stops the calls entirely until it is worth trying again.",
    concepts: ["Retry storm", "Exponential backoff", "Circuit breaker"],
    tags: ["retry-storm"],
  },
  {
    id: "sd-anti-005",
    type: "multi",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 4,
    prompt:
      "Which are effective defences against a noisy neighbour on shared infrastructure? Select all that apply.",
    options: [
      { id: "a", text: "Per-tenant rate limits or quotas" },
      { id: "b", text: "Separate resource pools for heavy tenants" },
      { id: "c", text: "Bulkheads that cap the resources any one workload can hold" },
      { id: "d", text: "Increasing total capacity" },
      { id: "e", text: "Retrying the requests that got starved" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The problem is a lack of isolation, so the fixes are all forms of isolation. Adding capacity is temporary — the noisy tenant simply consumes that too — and retrying starved requests adds load to a system already short of it.",
    concepts: ["Noisy neighbour", "Bulkhead pattern", "Resource quota"],
    tags: ["noisy-neighbour", "isolation"],
  },
  {
    id: "sd-anti-006",
    type: "mcq",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 3,
    context:
      "Under load, a service's throughput collapses while CPU sits at 20%. Threads are blocked waiting on outbound HTTP calls.",
    prompt: "What is the antipattern?",
    options: [
      {
        id: "a",
        text: "Synchronous I/O — threads block instead of yielding, so the pool exhausts long before the CPU does",
      },
      { id: "b", text: "Busy database — queries are too expensive" },
      { id: "c", text: "Extraneous fetching — payloads are too large" },
      { id: "d", text: "Improper instantiation — clients are recreated per request" },
    ],
    answer: "a",
    explanation:
      "Idle CPU with collapsed throughput is the signature of blocked threads. Each one holds memory and a pool slot while doing nothing. Async I/O lets the same thread serve other requests during the wait, which is why the fix raises throughput without touching CPU.",
    concepts: ["Synchronous I/O", "Thread pool exhaustion", "Non-blocking I/O"],
    tags: ["synchronous-io", "throughput"],
  },
  {
    id: "sd-anti-007",
    type: "mcq",
    track: "system-design",
    topic: "antipatterns",
    difficulty: 2,
    context:
      "A report page runs SELECT * on a wide table to display two columns.",
    prompt: "Which antipattern is this, and why does it matter if the query is indexed?",
    options: [
      {
        id: "a",
        text: "Extraneous fetching — an index does not stop the wasted network, memory, and cache pressure of unused columns",
      },
      { id: "b", text: "Chatty I/O — too many round trips" },
      { id: "c", text: "Busy database — the query should run in the application" },
      { id: "d", text: "Nothing is wrong if the query uses an index" },
    ],
    answer: "a",
    explanation:
      "Indexing addresses how rows are found, not how much is carried back. Selecting only what you need shrinks transfer and memory, and can let a covering index answer the query without touching the table at all.",
    concepts: ["Extraneous fetching", "Covering index", "Projection"],
    tags: ["extraneous-fetching"],
  },

  // ---------- Idempotency & back pressure ----------
  {
    id: "sd-bp-001",
    type: "mcq",
    track: "system-design",
    topic: "backpressure",
    difficulty: 3,
    context:
      "A queue in front of a slow consumer is unbounded. Producers keep enqueueing during a traffic spike.",
    prompt: "What actually happens?",
    options: [
      {
        id: "a",
        text: "Latency and memory grow until the system fails, serving requests whose callers already timed out",
      },
      { id: "b", text: "The queue absorbs the spike and everything recovers cleanly" },
      { id: "c", text: "Producers automatically slow to match the consumer" },
      { id: "d", text: "The consumer scales up to match the queue depth" },
    ],
    answer: "a",
    explanation:
      "An unbounded queue does not absorb overload, it conceals it. Work keeps accumulating past the point where anyone still wants the result, so the system spends its recovery capacity on requests nobody is waiting for. A bounded queue that rejects work fails faster, more honestly, and recovers sooner.",
    concepts: ["Back pressure", "Bounded queue", "Queue depth"],
    tags: ["queues", "overload"],
  },
  {
    id: "sd-bp-002",
    type: "mcq",
    track: "system-design",
    topic: "backpressure",
    difficulty: 4,
    context:
      "Demand exceeds capacity and you must drop some requests. Traffic includes health checks, paying customers, and background cache refreshes.",
    prompt: "When you must shed load, which traffic should you drop first?",
    options: [
      {
        id: "a",
        text: "Load shedding by priority — drop background refreshes first, protect health checks and paying traffic",
      },
      { id: "b", text: "Drop requests at random to be fair" },
      { id: "c", text: "Drop the oldest requests in the queue" },
      { id: "d", text: "Accept everything and let timeouts sort it out" },
    ],
    answer: "a",
    explanation:
      "Not all requests are worth the same. Shedding by priority keeps the system observable and the revenue path alive. Random dropping discards valuable work at the same rate as disposable work, and dropping health checks specifically can get you removed from the load balancer during a partial outage — turning degradation into an outage.",
    concepts: ["Load shedding", "Graceful degradation", "Request prioritisation"],
    tags: ["load-shedding", "priority"],
  },
  {
    id: "sd-bp-003",
    type: "mcq",
    track: "system-design",
    topic: "backpressure",
    difficulty: 3,
    context:
      "A mobile client POSTs an order, the connection drops before a response arrives, and the app retries.",
    prompt: "What prevents a duplicate order?",
    options: [
      {
        id: "a",
        text: "An idempotency key sent with both attempts, so the server returns the original result",
      },
      { id: "b", text: "A unique constraint on the orders table" },
      { id: "c", text: "Retrying only after a delay" },
      { id: "d", text: "Switching the endpoint from POST to PUT" },
    ],
    answer: "a",
    explanation:
      "The client cannot tell whether the first request landed, so the server has to recognise the retry. A client-generated key recorded with its result makes that possible. A unique constraint only helps if the request carries something naturally unique, which orders usually do not, and a delay changes nothing about duplication.",
    concepts: ["Idempotency key", "At-least-once delivery"],
    tags: ["idempotency-key"],
  },
  {
    id: "sd-bp-004",
    type: "multi",
    track: "system-design",
    topic: "backpressure",
    difficulty: 3,
    prompt: "Which HTTP methods are idempotent by definition? Select all that apply.",
    options: [
      { id: "a", text: "GET" },
      { id: "b", text: "PUT" },
      { id: "c", text: "DELETE" },
      { id: "d", text: "POST" },
      { id: "e", text: "PATCH" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "GET reads, PUT replaces at a known location, and DELETE removes — repeating any of them lands in the same state. POST creates, so repeating it creates again. PATCH is not idempotent in general, because a patch like \"increment by one\" applied twice differs from applying it once.",
    concepts: ["Idempotent method", "HTTP PUT", "HTTP POST"],
    tags: ["http", "idempotency"],
  },
  {
    id: "sd-bp-005",
    type: "ordering",
    track: "system-design",
    topic: "backpressure",
    difficulty: 4,
    prompt:
      "Order these overload responses from least to most disruptive to callers.",
    items: [
      "Queue the work behind a bounded buffer",
      "Throttle everyone to a slower rate",
      "Rate limit the heaviest clients",
      "Shed low-priority requests",
      "Reject all non-essential traffic",
    ],
    explanation:
      "Reach for the cheapest intervention that works, and escalate only as far as you must. Buffering costs latency, throttling costs throughput, rate limiting costs specific clients, and shedding costs specific requests. Rejecting broadly is a last resort — but it is still better than accepting work you cannot complete.",
    concepts: ["Back pressure", "Throttling", "Load shedding"],
    tags: ["load-shedding", "escalation"],
  },
  {
    id: "sd-bp-006",
    type: "short",
    track: "system-design",
    topic: "backpressure",
    difficulty: 4,
    context:
      "Many clients fail at the same instant and all back off by the same doubling schedule, so their retries stay synchronised and arrive in waves.",
    prompt: "What must be added to the backoff to spread them out?",
    answers: ["jitter", "random jitter", "randomness", "randomisation", "randomization"],
    typoTolerance: true,
    explanation:
      "Jitter — randomising each client's delay. Without it, exponential backoff still leaves every client retrying at the same moments, just less often, so the dependency keeps getting hit by synchronised waves instead of a smooth trickle.",
    concepts: ["Jitter", "Exponential backoff", "Thundering herd problem"],
    tags: ["backoff", "jitter"],
  },
  {
    id: "sd-bp-007",
    type: "mcq",
    track: "system-design",
    topic: "backpressure",
    difficulty: 5,
    context:
      "A team adds a large buffer in front of an overloaded consumer. Median latency improves, then the system fails harder than before.",
    prompt: "What went wrong?",
    options: [
      {
        id: "a",
        text: "The buffer added capacity to queue but not to process, so it delayed the failure and enlarged it",
      },
      { id: "b", text: "The buffer introduced message reordering that corrupted state" },
      { id: "c", text: "Buffers always reduce throughput" },
      { id: "d", text: "The consumer was never the bottleneck" },
    ],
    answer: "a",
    explanation:
      "Buffering smooths bursts; it does not create throughput. If arrival rate exceeds service rate on average, a bigger buffer only means more work accumulates before the collapse, and more of it is stale by the time it is processed. Buffers are for spikes against spare average capacity — for a sustained deficit you need more capacity or less work.",
    concepts: ["Queue-based load levelling", "Capacity planning", "Little's law"],
    tags: ["buffering", "capacity"],
  },
];
