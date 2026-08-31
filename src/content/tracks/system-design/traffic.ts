import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "caching",
    track: "system-design",
    title: "Caching",
    blurb: "Where to put a cache, how to keep it honest, and how it fails.",
    lesson: `A cache trades freshness for latency and load. Every caching decision is really two decisions: **how data gets in**, and **how stale data gets out**.

**Getting data in.** *Cache-aside* (lazy loading) is the default: the app checks the cache, misses, reads the database, then writes the cache. It only caches what is actually requested, and the cache can be down without taking the app with it. *Read-through* pushes that logic into the cache layer. *Write-through* writes cache and database together on every write, so the cache is never stale but every write pays both costs. *Write-behind* buffers writes and flushes asynchronously, which is fast and risks losing data if the cache dies before the flush.

**Getting data out.** TTL expiry is the workhorse: cheap, and you accept bounded staleness. Explicit invalidation on write gives tighter consistency, but you have to find every key a write affects, which is where most cache bugs live. Versioned keys sidestep invalidation entirely by making new data write to a new key.

**How it fails.** A *cache stampede* (or thundering herd) happens when a hot key expires and every concurrent request misses at once, all hammering the origin together. Fixes: coalesce duplicate in-flight requests behind a single origin call, expire probabilistically a little early so one unlucky request refreshes before the deadline, or serve stale data while refreshing in the background.`,
    resources: [
      {
        label: "AWS — Caching best practices",
        url: "https://aws.amazon.com/caching/best-practices/",
      },
      {
        label: "Redis — Client-side caching",
        url: "https://redis.io/docs/latest/develop/reference/client-side-caching/",
      },
    ],
  },
  {
    id: "load-balancing",
    track: "system-design",
    title: "Load Balancing",
    blurb: "Spreading traffic without creating a new single point of failure.",
    lesson: `A load balancer distributes requests across healthy backends. The two axes that matter are **which layer it operates at** and **how it chooses a backend**.

**Layer 4** balances on IP and port. It is fast, protocol-agnostic, and cheap, but it cannot see the request: no routing by path, no header inspection, no per-request retries. **Layer 7** parses HTTP, so it can route /api to one pool and /static to another, terminate TLS, retry idempotent requests, and inject headers. You pay in CPU and latency.

**Choosing a backend.** *Round robin* is fine when requests are uniform. *Least connections* handles uneven request durations far better, because a backend stuck on slow requests stops receiving new ones. *Consistent hashing* routes the same key to the same backend, which is what you want in front of a cache tier, and it only remaps 1/n of keys when a node joins or leaves instead of reshuffling everything.

**Health checks** are what make it a load balancer rather than a traffic splitter. Passive checks observe real traffic for errors; active checks probe an endpoint on a timer. The subtle failure is a health check that only proves the process is up. It should exercise the dependencies the request path actually needs, or you will happily route traffic to a server whose database connection pool is exhausted.

**Sticky sessions** pin a user to one backend. They make scaling and deploys harder, and they are usually a sign that session state belongs somewhere shared instead.`,
    resources: [
      {
        label: "Cloudflare — What is load balancing?",
        url: "https://www.cloudflare.com/learning/performance/what-is-load-balancing/",
      },
      {
        label: "NGINX — HTTP load balancing",
        url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/",
      },
    ],
  },
  {
    id: "cdn",
    track: "system-design",
    depth: true,
    title: "CDNs & Edge Delivery",
    blurb: "Moving bytes closer to users, and the invalidation cost of doing so.",
    lesson: `A CDN is a globally distributed cache in front of your origin. The win is physics: a user in Sydney fetching from a Sydney edge saves hundreds of milliseconds of round-trip time versus reaching a server in Virginia.

**What controls it.** Cache-Control is the contract. *max-age* tells browsers how long to cache; *s-maxage* overrides it for shared caches like the CDN, which lets you cache aggressively at the edge while keeping browsers on a short leash. *stale-while-revalidate* serves the stale copy instantly and refreshes in the background, and is the single highest-leverage header for perceived performance. *private* keeps a response out of shared caches entirely, which is what you want for anything user-specific.

**Invalidation.** Purging is slow and globally eventually-consistent, so the robust pattern is *content-addressed URLs*: put a hash in the filename (app.9f2c1b.js) and cache it forever. New deploy, new filename, no purge needed. Reserve purging for the HTML entry point, which you keep on a short TTL.

**Beyond static.** Modern CDNs cache dynamic responses too, keyed on whatever varies. But the Vary header fragments your cache once per distinct value, so *Vary: User-Agent* can shred a hit rate. An *origin shield* adds a mid-tier cache so a miss at fifty edges becomes one origin request instead of fifty.`,
    resources: [
      {
        label: "MDN — Cache-Control",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control",
      },
      {
        label: "Vercel — Edge Network caching",
        url: "https://vercel.com/docs/edge-network/caching",
      },
    ],
  },
  {
    id: "rate-limiting",
    track: "system-design",
    title: "Rate Limiting",
    blurb: "Protecting a service from traffic it cannot survive.",
    lesson: `Rate limiting protects a service from being overwhelmed, whether by abuse, by a buggy client in a retry loop, or by one tenant crowding out the rest. The algorithm choice trades burst tolerance against memory.

**Fixed window** counts requests per clock interval. Trivial to implement, but it allows double the limit across a boundary: 100 requests at 11:59:59 and 100 more at 12:00:00 is 200 in one second.

**Sliding window log** stores a timestamp per request and counts those inside the window. Perfectly accurate, and memory grows with request volume. **Sliding window counter** interpolates between the previous and current fixed window, which is nearly as accurate for a fraction of the memory. That is why it is the common production choice.

**Token bucket** refills tokens at a steady rate up to a cap, and each request spends one. It permits bursts up to the bucket size while bounding the sustained rate, which usually matches what you actually want from an API. **Leaky bucket** drains at a fixed rate and smooths bursts away entirely, which is better when the thing downstream genuinely cannot absorb a spike.

**Distributed limiting** is where it gets hard. Per-instance counters let the real limit drift to *limit x instances*. A shared store (typically Redis) gives one global count at the cost of a network hop on every request. Return 429 with a Retry-After header so well-behaved clients back off instead of hammering.`,
    resources: [
      {
        label: "Cloudflare — Rate limiting",
        url: "https://www.cloudflare.com/learning/bots/what-is-rate-limiting/",
      },
      {
        label: "Stripe — Scaling your API with rate limiters",
        url: "https://stripe.com/blog/rate-limiters",
      },
    ],
  },
];

export const questions: Question[] = [
  {
    id: "sd-cache-001",
    type: "mcq",
    track: "system-design",
    topic: "caching",
    difficulty: 2,
    context:
      "Reads dominate by roughly 100:1. The underlying data changes every 5 minutes, and users tolerate slightly stale results.",
    prompt: "Which cache invalidation strategy fits best?",
    options: [
      { id: "a", text: "TTL-based expiration set near the update interval" },
      { id: "b", text: "Write-through caching on every update" },
      { id: "c", text: "Explicit invalidation from the write path" },
      { id: "d", text: "No caching — read from the database every time" },
    ],
    answer: "a",
    explanation:
      "TTL is the cheapest thing that works here. Staleness is explicitly acceptable, so you do not need the coordination cost of write-through or the correctness burden of tracking down every key a write touches. Set the TTL near the update interval and you bound staleness without writing any invalidation logic.",
    concepts: ["TTL", "Cache invalidation", "Write-through cache"],
    tags: ["ttl", "invalidation"],
  },
  {
    id: "sd-cache-002",
    type: "short",
    track: "system-design",
    topic: "caching",
    difficulty: 2,
    context:
      "A popular key expires. Within milliseconds, thousands of concurrent requests all miss and hit the database simultaneously.",
    prompt: "What is this failure mode called? (Either common name is accepted.)",
    answers: [
      "cache stampede",
      "stampede",
      "thundering herd",
      "thundering herd problem",
      "cache stampede problem",
    ],
    typoTolerance: true,
    explanation:
      "A cache stampede, also called a thundering herd. The database sees a spike precisely because the cache was doing its job — the busier the key, the worse the spike. Mitigations: coalesce duplicate in-flight requests behind one origin call, expire probabilistically early, or serve stale while refreshing in the background.",
    concepts: ["Cache stampede", "Thundering herd problem"],
    tags: ["stampede", "failure-modes"],
  },
  {
    id: "sd-cache-003",
    type: "matching",
    track: "system-design",
    topic: "caching",
    difficulty: 3,
    prompt: "Match each caching pattern to its defining behaviour.",
    pairs: [
      {
        left: "Cache-aside",
        right: "App reads cache, misses, loads from DB, then populates",
      },
      {
        left: "Write-through",
        right: "Every write updates cache and database together",
      },
      {
        left: "Write-behind",
        right: "Writes buffer in cache and flush to the database later",
      },
      {
        left: "Read-through",
        right: "Cache itself loads from the database on a miss",
      },
    ],
    explanation:
      "The key distinction: cache-aside puts the loading logic in your application, read-through puts it in the cache layer. Write-through trades write latency for never serving stale data; write-behind trades durability for write speed — if the cache dies before flushing, those writes are gone.",
    concepts: ["Cache-aside", "Write-through cache", "Write-behind cache", "Read-through cache"],
    tags: ["patterns"],
  },
  {
    id: "sd-cache-004",
    type: "multi",
    track: "system-design",
    topic: "caching",
    difficulty: 4,
    prompt:
      "Which techniques genuinely mitigate a cache stampede? Select all that apply.",
    options: [
      { id: "a", text: "Request coalescing — one origin fetch serves all waiters" },
      { id: "b", text: "Probabilistic early expiration" },
      { id: "c", text: "Serving stale content while refreshing in the background" },
      { id: "d", text: "Increasing the TTL" },
      { id: "e", text: "Adding more cache memory" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Coalescing, early expiration, and stale-while-revalidate all attack the actual problem: many simultaneous misses on one key. A longer TTL just makes the stampede rarer and larger when it lands, and more memory does nothing — the key expired, it was not evicted.",
    concepts: ["Request coalescing", "Stale-while-revalidate", "Cache stampede"],
    tags: ["stampede", "mitigation"],
  },
  {
    id: "sd-cache-005",
    type: "ordering",
    track: "system-design",
    topic: "caching",
    difficulty: 2,
    prompt: "Put the cache-aside read path in order.",
    items: [
      "Application queries the cache for the key",
      "Cache reports a miss",
      "Application reads the record from the database",
      "Application writes the record into the cache with a TTL",
      "Application returns the record to the caller",
    ],
    explanation:
      "The defining trait of cache-aside is that the application orchestrates all of it — the cache is a dumb key-value store that never talks to the database. That is why the app keeps working, slower, when the cache is down.",
    concepts: ["Cache-aside", "Cache miss"],
    tags: ["patterns", "cache-aside"],
  },
  {
    id: "sd-cache-006",
    type: "mcq",
    track: "system-design",
    topic: "caching",
    difficulty: 4,
    context:
      "A user updates their profile and immediately reloads the page. They must see their own change, but other users seeing it a few seconds late is fine.",
    prompt: "What is the most practical approach?",
    options: [
      {
        id: "a",
        text: "Read-your-writes: route that user's reads to the origin briefly after a write",
      },
      { id: "b", text: "Drop the cache entirely for profile data" },
      { id: "c", text: "Reduce the TTL globally to one second" },
      { id: "d", text: "Switch the whole system to strong consistency" },
    ],
    answer: "a",
    explanation:
      "Only the writer needs freshness, so only the writer should pay for it. Pinning that one user to the origin for a few seconds — or invalidating just their key — costs almost nothing. Dropping the TTL globally makes every user pay for one user's write, which is how a cache quietly stops being a cache.",
    concepts: ["Read-your-writes consistency", "Cache invalidation"],
    tags: ["consistency", "read-your-writes"],
  },
  {
    id: "sd-lb-001",
    type: "mcq",
    track: "system-design",
    topic: "load-balancing",
    difficulty: 2,
    context:
      "Backend request durations vary wildly — most finish in 10ms, some take 30 seconds.",
    prompt: "Which balancing algorithm handles this best?",
    options: [
      { id: "a", text: "Least connections" },
      { id: "b", text: "Round robin" },
      { id: "c", text: "Random" },
      { id: "d", text: "IP hash" },
    ],
    answer: "a",
    explanation:
      "Round robin and random both assume requests cost roughly the same, so a server that catches several 30-second requests keeps getting new work anyway. Least connections tracks in-flight requests, so a backend bogged down in slow work naturally stops receiving traffic until it catches up.",
    concepts: ["Least connections", "Round robin", "Load balancing"],
    tags: ["algorithms"],
  },
  {
    id: "sd-lb-002",
    type: "mcq",
    track: "system-design",
    topic: "load-balancing",
    difficulty: 3,
    prompt:
      "Why is consistent hashing preferred over modulo hashing for routing to a cache tier?",
    options: [
      {
        id: "a",
        text: "Adding or removing a node remaps only a small fraction of keys",
      },
      { id: "b", text: "It distributes keys more evenly across nodes" },
      { id: "c", text: "It is faster to compute per request" },
      { id: "d", text: "It removes the need for health checks" },
    ],
    answer: "a",
    explanation:
      "With hash(key) % n, changing n remaps almost every key at once — every cache node misses simultaneously and the origin takes the full load. Consistent hashing remaps roughly 1/n of keys. Plain consistent hashing actually distributes less evenly than modulo, which is exactly why implementations add virtual nodes.",
    concepts: ["Consistent hashing", "Virtual nodes", "Modulo hashing"],
    tags: ["consistent-hashing"],
  },
  {
    id: "sd-lb-003",
    type: "multi",
    track: "system-design",
    topic: "load-balancing",
    difficulty: 3,
    prompt:
      "Which capabilities require a Layer 7 load balancer rather than Layer 4? Select all that apply.",
    options: [
      { id: "a", text: "Routing /api and /static to different backend pools" },
      { id: "b", text: "Retrying a failed idempotent request on another backend" },
      { id: "c", text: "TLS termination" },
      { id: "d", text: "Distributing TCP connections across servers" },
      { id: "e", text: "Rewriting or injecting request headers" },
    ],
    answers: ["a", "b", "c", "e"],
    explanation:
      "Everything except (d) requires parsing the request. L4 sees only IP and port, so it can move connections around but cannot tell you what is inside them. Distributing raw TCP connections is exactly what L4 does well — and it does it with far less CPU.",
    concepts: ["Layer 7 load balancing", "Layer 4 load balancing", "TLS termination"],
    tags: ["l4-l7"],
  },
  {
    id: "sd-lb-004",
    type: "mcq",
    track: "system-design",
    topic: "load-balancing",
    difficulty: 4,
    context:
      "A health check probes /health, which returns 200 as long as the HTTP server is running. Backends with an exhausted database connection pool keep passing it.",
    prompt: "What is the core problem?",
    options: [
      {
        id: "a",
        text: "The check tests liveness but not the dependencies the request path needs",
      },
      { id: "b", text: "The check interval is too long" },
      { id: "c", text: "The check should use TCP instead of HTTP" },
      { id: "d", text: "The load balancer should use passive checks only" },
    ],
    answer: "a",
    explanation:
      "A health check is only useful if failing it means real requests would fail. A check that proves the process is alive but not that it can serve traffic will happily route users into a broken backend. Exercise the critical dependencies — but keep it cheap, and do not cascade: if a shared dependency blips, an over-eager check can mark every backend unhealthy at once.",
    concepts: ["Health check", "Cascading failure", "Liveness probe"],
    tags: ["health-checks", "failure-modes"],
  },
  {
    id: "sd-cdn-001",
    type: "mcq",
    track: "system-design",
    topic: "cdn",
    difficulty: 3,
    prompt:
      "Which Cache-Control directive lets a CDN serve a stale response immediately while fetching a fresh one in the background?",
    options: [
      { id: "a", text: "stale-while-revalidate" },
      { id: "b", text: "must-revalidate" },
      { id: "c", text: "no-cache" },
      { id: "d", text: "immutable" },
    ],
    answer: "a",
    explanation:
      "stale-while-revalidate decouples the user's latency from the origin fetch — nobody waits for the refresh. must-revalidate is the opposite, forbidding stale responses. no-cache requires revalidation before every use, and immutable promises the content will never change at all.",
    concepts: ["stale-while-revalidate", "Cache-Control", "Revalidation"],
    tags: ["cache-control"],
  },
  {
    id: "sd-cdn-002",
    type: "mcq",
    track: "system-design",
    topic: "cdn",
    difficulty: 3,
    prompt: "Why do build tools emit hashed filenames like app.9f2c1b.js?",
    options: [
      { id: "a", text: "New content gets a new URL, so caches never need purging" },
      { id: "b", text: "Hashed names compress better over the wire" },
      { id: "c", text: "It prevents other sites from hotlinking the file" },
      { id: "d", text: "CDNs refuse to cache files without a hash" },
    ],
    answer: "a",
    explanation:
      "Content-addressed URLs sidestep invalidation entirely. Because the URL changes whenever the bytes change, you can cache with a one-year TTL and never purge — and a purge is slow and eventually consistent across hundreds of edges, so the best invalidation strategy is not needing one.",
    concepts: ["Content-addressed URL", "Cache busting", "Immutable caching"],
    tags: ["invalidation", "immutable"],
  },
  {
    id: "sd-cdn-003",
    type: "mcq",
    track: "system-design",
    topic: "cdn",
    difficulty: 4,
    context:
      "A team adds Vary: User-Agent to a cacheable HTML response. CDN hit rate collapses.",
    prompt: "Why?",
    options: [
      {
        id: "a",
        text: "The cache now stores a separate entry per distinct User-Agent string",
      },
      { id: "b", text: "Vary disables CDN caching entirely" },
      { id: "c", text: "User-Agent headers are stripped at the edge" },
      { id: "d", text: "Vary forces revalidation with the origin on every request" },
    ],
    answer: "a",
    explanation:
      "Vary fragments the cache once per distinct header value, and User-Agent strings are nearly unique across browser and OS version combinations — so almost every request becomes its own cache entry. If you must branch on device type, normalise to a small set of buckets first.",
    concepts: ["Vary header", "Cache key", "Cache hit rate"],
    tags: ["vary", "hit-rate"],
  },
  {
    id: "sd-rl-001",
    type: "mcq",
    track: "system-design",
    topic: "rate-limiting",
    difficulty: 2,
    context:
      "The limit is 100 requests per minute using a fixed window. A client sends 100 requests at 11:59:59 and another 100 at 12:00:00.",
    prompt: "What happened, and what is the flaw?",
    options: [
      {
        id: "a",
        text: "200 requests were allowed in one second — fixed windows permit double the limit at a boundary",
      },
      { id: "b", text: "The second batch was rejected — the window had not reset" },
      { id: "c", text: "The limiter averaged the two windows, allowing 100" },
      { id: "d", text: "Nothing is wrong; this is the intended behaviour" },
    ],
    answer: "a",
    explanation:
      "This is the classic fixed-window boundary problem: both batches are legal within their own window, but together they are twice the limit inside one second. A sliding window counter fixes it by interpolating across the previous window, at a small fraction of the memory a full request log would need.",
    concepts: ["Fixed window counter", "Sliding window counter", "Rate limiting"],
    tags: ["fixed-window", "boundary"],
  },
  {
    id: "sd-rl-002",
    type: "mcq",
    track: "system-design",
    topic: "rate-limiting",
    difficulty: 3,
    context:
      "An API should allow short bursts — a client syncing 50 records at once is legitimate — while capping sustained throughput.",
    prompt: "Which algorithm fits?",
    options: [
      { id: "a", text: "Token bucket" },
      { id: "b", text: "Leaky bucket" },
      { id: "c", text: "Fixed window" },
      { id: "d", text: "Sliding window log" },
    ],
    answer: "a",
    explanation:
      "Token bucket is built for exactly this shape: tokens accumulate up to a cap, so an idle client can spend a burst, while the refill rate bounds sustained throughput. Leaky bucket deliberately smooths bursts into a constant drain — correct when the downstream truly cannot absorb a spike, wrong when you want to let idle clients burst.",
    concepts: ["Token bucket", "Leaky bucket", "Burst capacity"],
    tags: ["token-bucket"],
  },
  {
    id: "sd-rl-003",
    type: "short",
    track: "system-design",
    topic: "rate-limiting",
    difficulty: 2,
    prompt: "Which HTTP status code should a rate-limited request return?",
    answers: ["429", "http 429", "429 too many requests", "too many requests"],
    explanation:
      "429 Too Many Requests. Pair it with a Retry-After header — without one, well-behaved clients have no idea how long to wait and typically retry immediately, turning your rate limit into a retry storm.",
    concepts: ["HTTP 429 Too Many Requests", "Retry-After header"],
    tags: ["http", "429"],
  },
  {
    id: "sd-rl-004",
    type: "mcq",
    track: "system-design",
    topic: "rate-limiting",
    difficulty: 4,
    context:
      "A rate limiter runs in-process on each of 10 API servers, each allowing 100 requests per minute per user.",
    prompt: "What is the actual effective limit, and what is the fix?",
    options: [
      {
        id: "a",
        text: "1000/min — counters are per-instance; use a shared store for a global count",
      },
      {
        id: "b",
        text: "100/min — the load balancer coordinates the counters automatically",
      },
      { id: "c", text: "10/min — the limit is divided across instances" },
      { id: "d", text: "Unlimited — in-process limiters never work" },
    ],
    answer: "a",
    explanation:
      "Each instance counts only what it sees, so the real ceiling is limit x instances — and it shifts every time you autoscale. A shared store (usually Redis) gives one global count at the cost of a network hop per request. The common compromise is a local limiter for cheap protection plus a shared one for correctness.",
    concepts: ["Distributed rate limiting", "Shared counter", "Autoscaling"],
    tags: ["distributed", "scaling"],
  },
];
