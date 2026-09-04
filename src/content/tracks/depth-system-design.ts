import type { Question } from "@/content/types";

/** Additional depth for system design topics that were thin. Kept apart from
 *  the per-topic files so it is obvious what was added to fill coverage
 *  rather than authored as part of the original pass. */
export const questions: Question[] = [
  // ---------- CDNs ----------
  {
    id: "dp-cdn-001",
    type: "mcq",
    track: "system-design",
    topic: "cdn",
    difficulty: 3,
    prompt: "What is the difference between a push CDN and a pull CDN?",
    options: [
      {
        id: "a",
        text: "Push uploads to the edge ahead of time; pull fetches from origin on first use",
      },
      { id: "b", text: "Push is for static files and pull is for dynamic responses" },
      { id: "c", text: "Push caches in the browser while pull caches at the edge" },
      { id: "d", text: "They are two vendor names for the same mechanism" },
    ],
    answer: "a",
    explanation:
      "Pull is the common default: the first visitor to each region pays a slow miss, and everything else is automatic. Push suits small, infrequently changing catalogues where you would rather nobody pays that first miss — and it means you own uploading and expiring the content yourself.",
    concepts: ["Push CDN", "Pull CDN", "Cache warming"],
    tags: ["push-pull"],
  },
  {
    id: "dp-cdn-002",
    type: "short",
    track: "system-design",
    topic: "cdn",
    difficulty: 4,
    context:
      "A miss at fifty edge locations currently produces fifty separate requests to your origin. You add a mid-tier cache so it produces one.",
    prompt: "What is this mid-tier layer called? (Two words.)",
    answers: ["origin shield", "origin shielding", "shield", "origin-shield"],
    typoTolerance: true,
    explanation:
      "An origin shield. Edges miss to the shield rather than to you, so the origin sees one request per object instead of one per edge. It matters most during a purge or a deploy, when many edges go cold simultaneously.",
    concepts: ["Origin shield", "Cache hierarchy"],
    tags: ["origin-shield"],
  },
  {
    id: "dp-cdn-003",
    type: "matching",
    track: "system-design",
    topic: "cdn",
    difficulty: 3,
    prompt: "Match each Cache-Control directive to its effect.",
    pairs: [
      { left: "max-age", right: "How long any cache may reuse the response" },
      { left: "s-maxage", right: "Overrides max-age for shared caches only" },
      { left: "private", right: "Keeps the response out of shared caches" },
      { left: "no-store", right: "Forbids storing the response anywhere" },
      { left: "immutable", right: "Stops clients revalidating while it is still fresh" },
    ],
    explanation:
      "The pairing that unlocks most real setups is s-maxage with a short max-age: cache hard at the CDN where you can purge, and keep browsers on a short leash where you cannot. Note no-store and no-cache are different — no-cache permits storage but requires revalidation.",
    concepts: ["max-age", "s-maxage", "no-store", "immutable"],
    tags: ["cache-control"],
  },
  {
    id: "dp-cdn-004",
    type: "mcq",
    track: "system-design",
    topic: "cdn",
    difficulty: 4,
    context:
      "An authenticated dashboard is accidentally served with a public, long max-age. Users begin seeing each other's data.",
    prompt: "Which directive should have been set?",
    options: [
      { id: "a", text: "private — so shared caches never store a per-user response" },
      { id: "b", text: "must-revalidate — so the cache checks with the origin" },
      { id: "c", text: "stale-while-revalidate — so refreshes happen in the background" },
      { id: "d", text: "immutable — so the response is never re-fetched" },
    ],
    answer: "a",
    explanation:
      "This is one of the most damaging caching bugs there is: a shared cache stores one user's response and serves it to everyone behind the same key. Anything user-specific needs private, or no-store when it must never be written down at all. Revalidation directives control freshness, not who may store it.",
    concepts: ["Shared cache", "Cache-Control private", "Cache poisoning"],
    tags: ["security", "cache-control"],
  },

  // ---------- Search ----------
  {
    id: "dp-search-001",
    type: "ordering",
    track: "system-design",
    topic: "search",
    difficulty: 3,
    prompt: "Order the stages of text analysis before a document is indexed.",
    items: [
      "Split the text into tokens",
      "Lowercase the tokens",
      "Remove stop words",
      "Reduce tokens to their stems",
      "Write the terms into the inverted index",
    ],
    explanation:
      "The same pipeline must run over the query at search time. A mismatch between index-time and query-time analysis is the classic cause of a search that finds nothing for a term you can see in the document.",
    concepts: ["Tokenisation", "Stemming", "Stop words", "Inverted index"],
    tags: ["analysis"],
  },
  {
    id: "dp-search-002",
    type: "mcq",
    track: "system-design",
    topic: "search",
    difficulty: 4,
    prompt:
      "In BM25, why does repeating a term twenty times not make a document rank twenty times higher?",
    options: [
      {
        id: "a",
        text: "Term frequency saturates, so additional occurrences give diminishing returns",
      },
      { id: "b", text: "Repeated terms are deduplicated at index time" },
      { id: "c", text: "The index stores only whether a term is present" },
      { id: "d", text: "Documents are normalised to a fixed length" },
    ],
    answer: "a",
    explanation:
      "BM25 applies a saturating curve to term frequency, so the tenth occurrence adds far less than the second. That is what makes it resistant to keyword stuffing. It also penalises length, so a term in a short title counts for more than the same term buried in a long body.",
    concepts: ["BM25", "Term frequency saturation", "Relevance ranking"],
    tags: ["bm25", "relevance"],
  },
  {
    id: "dp-search-003",
    type: "multi",
    track: "system-design",
    topic: "search",
    difficulty: 4,
    prompt:
      "Which are valid ways to keep a search index in sync with the source database? Select all that apply.",
    options: [
      { id: "a", text: "Change data capture from the database log" },
      { id: "b", text: "Dual writes from the application" },
      { id: "c", text: "Periodic full reindexing" },
      { id: "d", text: "Querying the database directly at search time" },
      { id: "e", text: "Letting the index rebuild itself on a cache miss" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "CDC is the most robust because it derives from the same log the database already commits. Dual writes are simplest and drift silently when one write fails. Periodic reindexing is simple and stale between runs. Querying the database at search time means you have no search index, which was the problem.",
    concepts: ["Change data capture", "Dual write", "Reindexing"],
    tags: ["indexing", "sync"],
  },
  {
    id: "dp-search-004",
    type: "short",
    track: "system-design",
    topic: "search",
    difficulty: 3,
    context:
      "Rather than storing which terms each document contains, the index stores, for each term, the list of documents containing it.",
    prompt: "What is this data structure called? (Two words.)",
    answers: ["inverted index", "inverted-index", "an inverted index", "inverted"],
    typoTolerance: true,
    explanation:
      "An inverted index. The inversion is what makes multi-term queries fast: look up each term's document list and intersect them, rather than scanning every document to see what it contains.",
    concepts: ["Inverted index", "Full-text search"],
    tags: ["inverted-index"],
  },

  // ---------- Rate limiting ----------
  {
    id: "dp-rl-001",
    type: "matching",
    track: "system-design",
    topic: "rate-limiting",
    difficulty: 4,
    prompt: "Match each rate limiting algorithm to its defining behaviour.",
    pairs: [
      { left: "Fixed window", right: "Counts per clock interval; allows a double burst at boundaries" },
      { left: "Sliding window log", right: "Stores a timestamp per request; exact but memory-hungry" },
      { left: "Token bucket", right: "Accumulates credit, permitting bursts up to a cap" },
      { left: "Leaky bucket", right: "Drains at a constant rate, smoothing bursts away" },
    ],
    explanation:
      "The choice is really about burst tolerance. Token bucket rewards a client that has been idle, which usually matches what an API wants. Leaky bucket refuses to pass a burst on at all, which is what you want when the thing downstream genuinely cannot absorb one.",
    concepts: ["Fixed window counter", "Sliding window log", "Token bucket", "Leaky bucket"],
    tags: ["algorithms"],
  },
  {
    id: "dp-rl-002",
    type: "mcq",
    track: "system-design",
    topic: "rate-limiting",
    difficulty: 4,
    context:
      "A rate limiter keys on client IP. Many users behind one corporate NAT are being blocked together.",
    prompt: "What is the underlying problem?",
    options: [
      {
        id: "a",
        text: "IP is a poor identity when many users share one — key on the signed-in user",
      },
      { id: "b", text: "The limit is set too low and should be raised for everyone" },
      { id: "c", text: "NAT traversal interferes with the limiter's counting logic" },
      { id: "d", text: "IPv6 should be adopted so each user gets a stable address" },
    ],
    answer: "a",
    explanation:
      "Rate limiting is only as good as its notion of \"who\". Shared NATs, mobile carrier gateways, and corporate proxies all collapse many users onto one address. Key on API key or user id where you have one, and treat IP as a coarse fallback for unauthenticated traffic.",
    concepts: ["Rate limit key", "Network address translation", "Client identity"],
    tags: ["identity", "keys"],
  },
  {
    id: "dp-rl-003",
    type: "short",
    track: "system-design",
    topic: "rate-limiting",
    difficulty: 3,
    context:
      "You return 429 to a client that has exceeded its limit, and want well-behaved clients to wait rather than retry immediately.",
    prompt: "Which HTTP response header should you include?",
    answers: ["retry-after", "retry after", "retryafter", "the retry-after header"],
    typoTolerance: true,
    explanation:
      "Retry-After, giving either seconds to wait or an HTTP date. Without it a client has no basis for choosing a delay, and most libraries default to retrying quickly — which converts your rate limit into a retry storm.",
    concepts: ["Retry-After header", "HTTP 429 Too Many Requests"],
    tags: ["http", "429"],
  },

  // ---------- Sharding ----------
  {
    id: "dp-shard-001",
    type: "mcq",
    track: "system-design",
    topic: "sharding",
    difficulty: 4,
    context:
      "A multi-tenant system shards by tenant id. One tenant grows to ten times the size of all others combined.",
    prompt: "What is the problem and a reasonable fix?",
    options: [
      {
        id: "a",
        text: "A hot shard — subdivide that tenant with a composite key, or isolate it",
      },
      { id: "b", text: "Nothing — a tenant id is high-cardinality, so spread is even" },
      { id: "c", text: "Re-hash every tenant id to redistribute load across shards" },
      { id: "d", text: "Add read replicas to every shard so the load is shared out" },
    ],
    answer: "a",
    explanation:
      "Even a high-cardinality key distributes badly when the underlying data is skewed. The usual answers are a composite key that subdivides the whale, or isolating it on its own shard so its load cannot hurt anyone else. Re-hashing keeps the same skew in a different arrangement.",
    concepts: ["Hot shard", "Data skew", "Composite shard key"],
    tags: ["hot-shard", "skew"],
  },
  {
    id: "dp-shard-002",
    type: "matching",
    track: "system-design",
    topic: "sharding",
    difficulty: 3,
    prompt: "Match each partitioning strategy to its main property.",
    pairs: [
      { left: "Range partitioning", right: "Keeps ordered keys together, so range scans stay efficient" },
      { left: "Hash partitioning", right: "Spreads writes evenly but destroys ordering" },
      { left: "Directory-based", right: "Uses a lookup table, most flexible but adds a hop" },
      { left: "Geographic", right: "Places data near the users who read it most" },
    ],
    explanation:
      "The recurring tension is locality versus evenness: anything that keeps related rows together also concentrates load on them. Directory-based buys flexibility to rebalance individual keys, and introduces a component that must not go down.",
    concepts: ["Range partitioning", "Hash partitioning", "Directory-based partitioning"],
    tags: ["strategies"],
  },
  {
    id: "dp-shard-003",
    type: "mcq",
    track: "system-design",
    topic: "sharding",
    difficulty: 5,
    prompt:
      "Why do sharded systems use consistent hashing with virtual nodes rather than plain consistent hashing?",
    options: [
      {
        id: "a",
        text: "Plain consistent hashing distributes unevenly; virtual nodes smooth it out",
      },
      { id: "b", text: "Virtual nodes remove the need to rebalance at all when a server joins" },
      { id: "c", text: "Virtual nodes make ring lookups constant time rather than logarithmic" },
      { id: "d", text: "Plain consistent hashing cannot handle a server being removed" },
    ],
    answer: "a",
    explanation:
      "With one position per server the ring segments come out very unequal, so some servers own far more of the keyspace than others. Giving each server many virtual positions averages the segments out, and it also means a departing server's load spreads across all the others rather than landing entirely on its single neighbour.",
    concepts: ["Consistent hashing", "Virtual nodes", "Rebalancing"],
    tags: ["consistent-hashing", "virtual-nodes"],
  },

  // ---------- Consistency ----------
  {
    id: "dp-cons-001",
    type: "mcq",
    track: "system-design",
    topic: "consistency",
    difficulty: 4,
    prompt: "What does PACELC add to the CAP theorem?",
    options: [
      {
        id: "a",
        text: "That absent a partition you still trade latency against consistency",
      },
      { id: "b", text: "That partitions can be avoided entirely with enough redundancy" },
      { id: "c", text: "That availability should always be chosen over consistency" },
      { id: "d", text: "That CAP applies only to relational database systems" },
    ],
    answer: "a",
    explanation:
      "CAP only describes behaviour during a partition, which is rare. PACELC points out that Else — the other 99.9% of the time — you are still choosing between Latency and Consistency, because coordination costs round trips. That is the tradeoff you actually make every day.",
    concepts: ["PACELC", "CAP theorem", "Latency-consistency tradeoff"],
    tags: ["pacelc", "cap"],
  },
  {
    id: "dp-cons-002",
    type: "multi",
    track: "system-design",
    topic: "consistency",
    difficulty: 4,
    prompt:
      "Which operations genuinely warrant strong consistency? Select all that apply.",
    options: [
      { id: "a", text: "Debiting an account balance" },
      { id: "b", text: "Claiming the last unit of inventory" },
      { id: "c", text: "Assigning a unique username at signup" },
      { id: "d", text: "Incrementing a view counter" },
      { id: "e", text: "Updating a user's display avatar" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The test is whether two concurrent operations can both succeed and leave an invalid state. Money, scarce inventory, and uniqueness all fail that test. View counts and avatars converge harmlessly, and paying coordination cost on the highest-volume operations is how systems get slow for no benefit.",
    concepts: ["Linearizability", "Invariant", "Uniqueness constraint"],
    tags: ["per-operation"],
  },
  {
    id: "dp-cons-003",
    type: "short",
    track: "system-design",
    topic: "consistency",
    difficulty: 4,
    context:
      "With N replicas, you want any read to be guaranteed to observe the most recent successful write.",
    prompt:
      "Complete the quorum condition: W + R > ___",
    answers: ["n", "N", "n replicas", "the number of replicas"],
    typoTolerance: false,
    explanation:
      "W + R > N. If the write set and the read set together exceed the number of replicas, they must overlap on at least one node, and that node holds the newest value. Tuning W down speeds writes at the cost of read certainty, and vice versa.",
    concepts: ["Quorum", "Replication factor"],
    tags: ["quorum"],
  },

  // ---------- Storage ----------
  {
    id: "dp-stor-001",
    type: "matching",
    track: "system-design",
    topic: "storage",
    difficulty: 3,
    prompt: "Match each storage type to what it is for.",
    pairs: [
      { left: "Object storage", right: "Large immutable blobs addressed by key" },
      { left: "Block storage", right: "A raw disk attached to one machine" },
      { left: "File storage", right: "A shared filesystem several machines can mount" },
      { left: "Key-value store", right: "Fast lookups by exact key, nothing else" },
    ],
    explanation:
      "Databases run on block storage; user uploads belong in object storage; shared filesystems are convenient and usually the slowest option. Matching the type to the access pattern avoids a whole class of scaling problems later.",
    concepts: ["Object storage", "Block storage", "File storage", "Key-value store"],
    tags: ["taxonomy"],
  },
  {
    id: "dp-stor-002",
    type: "mcq",
    track: "system-design",
    topic: "storage",
    difficulty: 4,
    context:
      "A table uses soft deletes with a deleted_at column. Months later, several reports show deleted records.",
    prompt: "What is the underlying weakness of this approach?",
    options: [
      {
        id: "a",
        text: "Every query must remember to filter, so correctness rests on discipline",
      },
      { id: "b", text: "Soft deletes corrupt the table's foreign key relationships" },
      { id: "c", text: "The deleted_at column cannot be indexed, so filtering is slow" },
      { id: "d", text: "Soft-deleted rows stop the table from ever being vacuumed" },
    ],
    answer: "a",
    explanation:
      "Soft deletes preserve history and quietly turn every future query into a chance to get it wrong. The fix is structural rather than cultural: a view or row-level policy that filters by default, so forgetting is not an option.",
    concepts: ["Soft delete", "Row-level security", "Database view"],
    tags: ["soft-delete", "modelling"],
  },
  {
    id: "dp-stor-003",
    type: "mcq",
    track: "system-design",
    topic: "storage",
    difficulty: 3,
    context:
      "You need to keep uploaded files for seven years for compliance, but they are almost never read after the first month.",
    prompt: "What is the cost-effective approach?",
    options: [
      {
        id: "a",
        text: "A lifecycle policy that transitions objects to colder storage tiers as they age",
      },
      { id: "b", text: "Compress the files and keep them in the hot tier" },
      { id: "c", text: "Move them into the database for cheaper storage" },
      { id: "d", text: "Delete them after a month and regenerate on demand" },
    ],
    answer: "a",
    explanation:
      "Object stores price storage against retrieval: cold tiers cost a fraction to hold and more to read, which is exactly right for data that is legally required and rarely touched. Compression helps a little; a database is more expensive per byte, not less; and deletion defeats the compliance requirement.",
    concepts: ["Storage lifecycle policy", "Cold storage", "Data retention"],
    tags: ["tiering", "cost"],
  },
];
