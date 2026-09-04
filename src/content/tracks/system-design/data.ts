import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "databases",
    track: "system-design",
    title: "Databases & Indexing",
    blurb: "Picking a store, and making it answer questions quickly.",
    lesson: `"SQL or NoSQL" is the wrong first question. The useful first question is **what access patterns must be fast**, because that determines the data model, and the data model determines the store.

**Relational** databases give you joins, multi-row transactions, and a schema the database enforces. Reach for one by default: most applications have relational data, and being wrong about that later is cheaper than being wrong about consistency. **Document** stores fit data that is genuinely read and written as one blob. **Wide-column** stores are built for enormous write volume with known query patterns. **Key-value** stores are for lookups by exact key, and nothing else.

**Indexes** are the single biggest lever on read latency. A B-tree index turns a table scan into a logarithmic seek. The cost is real: every index slows writes and consumes storage, so an unused index is pure overhead. A *composite* index on (a, b) can serve queries filtering on \`a\`, or on \`a\` and \`b\`, but not on \`b\` alone — leftmost-prefix. A *covering* index contains every column the query needs, letting the database answer without touching the table at all.

**Transactions and isolation.** Read committed prevents dirty reads but allows a value to change between two reads in one transaction. Repeatable read stops that, and still permits phantom rows in some engines. Serializable is the only level that behaves the way people assume all of them do, and it costs the most. Most production defaults sit at read committed, which is worth knowing before you assume otherwise.`,
    resources: [
      {
        label: "Use The Index, Luke",
        url: "https://use-the-index-luke.com/",
      },
      {
        label: "PostgreSQL — Transaction isolation",
        url: "https://www.postgresql.org/docs/current/transaction-iso.html",
      },
    ],
  },
  {
    id: "sharding",
    track: "system-design",
    depth: true,
    title: "Sharding & Partitioning",
    blurb: "Splitting data across machines, and living with the shard key you chose.",
    lesson: `Sharding splits one logical dataset across many machines because it no longer fits, or no longer keeps up, on one. The shard key is the decision that matters, and it is close to irreversible.

**Range partitioning** keeps ordered keys together, so range scans stay efficient — and it invites hotspots, because sequential keys like timestamps route every new write to the same shard. **Hash partitioning** spreads writes evenly by hashing the key, at the cost of destroying range-scan locality. **Directory-based** partitioning keeps an explicit lookup table, which is the most flexible and adds a hop plus a component that must not go down.

**Choosing the key.** A good shard key has high cardinality, even access distribution, and appears in most queries. That last property is what people miss: a query that does not include the shard key must be *scattered* to every shard and gathered back, so the slowest shard sets your latency and your throughput ceiling drops.

**What you lose.** Cross-shard joins and transactions become application problems. Unique constraints stop being free. Rebalancing means moving data while serving traffic, which is why consistent hashing and virtual nodes are so common — they bound how much moves.

**Hotspots survive a good hash.** An even distribution of keys is not an even distribution of load: one celebrity account, one enormous tenant, or one product on the front page puts a disproportionate share of traffic on whichever shard happens to hold it. The answers are a composite key that spreads a single logical entity across several partitions, a cache in front of the keys you know are hot, or moving the largest tenants onto shards of their own.

**Plan the resharding you promise never to do.** The cheapest insurance is *logical shards*: hash into a large fixed number of buckets — a thousand or so — and keep a small table mapping buckets to machines. Growing then moves buckets rather than rehashing keys, and the mapping is something you can change. Teams that hash directly onto the machine count discover that adding capacity means recomputing the placement of every row.

The honest rule: do not shard until you must. A single well-indexed database with a read replica handles far more than most teams assume, and unsharding is much harder than sharding.`,
    resources: [
      {
        label: "MongoDB — Sharding",
        url: "https://www.mongodb.com/docs/manual/sharding/",
      },
      {
        label: "Vitess — Sharding concepts",
        url: "https://vitess.io/docs/concepts/shard/",
      },
    ],
  },
  {
    id: "replication",
    track: "system-design",
    title: "Replication",
    blurb: "More copies for durability and reads, and the lag that comes with them.",
    lesson: `Replication keeps copies of data on multiple machines for durability, read scaling, and failover.

**Leader-follower** is the common shape: writes go to one leader and propagate to followers that serve reads. Simple and effective, and it introduces **replication lag** — the window where a follower has not yet applied a write. Read your own write from a follower during that window and the data appears to have vanished, which is the single most common replication bug in production.

**Synchronous vs asynchronous.** Synchronous replication confirms a write only after a follower acknowledges it, so no data is lost on leader failure and every write pays the slowest follower's latency. Asynchronous is fast and loses recent writes if the leader dies before propagating. *Semi-synchronous* — one synchronous follower, the rest async — is the usual compromise.

**Multi-leader** lets several nodes accept writes, which helps across regions and creates write conflicts you must resolve. Last-write-wins is easy and silently discards data. **Leaderless** (Dynamo-style) uses quorums: with N replicas, if W + R > N, reads and writes overlap on at least one node and you read the latest value.

**Failover** is where the sharp edges are. Promoting a follower that was behind loses writes. Two nodes both believing they are leader is *split-brain*, and it corrupts data quietly rather than loudly.

**What actually travels.** *Statement-based* replication ships the SQL and re-runs it, which is compact and breaks on anything non-deterministic — \`NOW()\`, a random value, an auto-increment race. *Row-based* (logical) replication ships the resulting row changes, which survives differing schemas and versions and is what makes change-data-capture pipelines possible. *Physical* (WAL) replication ships storage-level changes, which is the fastest and requires the replica to be a byte-compatible copy of the same engine version.

**Replication is not a backup.** A replica faithfully applies whatever the leader did, including the \`DELETE\` with the missing \`WHERE\` clause, and it applies it within seconds. Replication protects you from a machine dying. Backups and point-in-time recovery protect you from a person or a deploy, and the only meaningful test of a backup is a restore you have actually performed.

**Read replicas do not scale writes.** Every replica applies the entire write stream, so adding one raises read capacity, leaves write throughput exactly where it was, and adds load to the leader feeding it. When writes are the constraint, more copies is the wrong shape of answer; partitioning is the right one.`,
    resources: [
      {
        label: "Designing Data-Intensive Applications — Replication",
        url: "https://dataintensive.net/",
      },
      {
        label: "PostgreSQL — Replication",
        url: "https://www.postgresql.org/docs/current/high-availability.html",
      },
    ],
  },
  {
    id: "consistency",
    track: "system-design",
    title: "Consistency & CAP",
    blurb: "What guarantees you actually need, stated precisely.",
    lesson: `**CAP** says that when a network partition occurs, a distributed system must choose between consistency and availability. The framing is widely misused: CAP only applies *during* a partition. Absent one, you can have both, and the real everyday tradeoff is consistency versus *latency* — which is what PACELC adds.

**The useful ladder,** from strongest down:

*Linearizable* (strong): every read returns the most recent write, as if there were one copy. Expensive; requires coordination.
*Sequential*: all nodes see operations in the same order, not necessarily real-time order.
*Causal*: operations that are causally related appear in order everywhere; unrelated ones may not. Enough for most collaborative applications.
*Read-your-writes*: you always see your own writes. Others may lag.
*Eventual*: given no new writes, replicas converge. Says nothing about when.

**Session guarantees** are the practical middle of that ladder, and the ones a user would actually notice missing: *monotonic reads* (time never runs backwards, so a value that was there does not disappear on the next read), *read-your-writes* (your own change is always visible to you), and *consistent prefix reads* (you never see an effect before its cause — a reply before the message it answers). Each is cheap, usually bought by pinning a session to one replica or having the client carry the version it last saw, and together they cover most of what strong consistency is reached for.

**Isolation is a different axis.** The C in ACID is not the C in CAP. Isolation levels describe how concurrent transactions on one database are allowed to interleave; consistency models describe what a read on one replica may say about a write accepted by another. They are orthogonal, which is why a serializable database still hands you a stale read from a follower — and why "we use a strongly consistent database" settles less than the people saying it usually think.

**Choose per operation, not per system.** A payment must be linearizable. The like count on a post can be eventual and nobody will ever notice. Teams that pick one consistency level for an entire system either overpay everywhere or underpay somewhere that matters.

**Quorums** give tunable consistency: with N replicas, W + R > N guarantees a read overlaps the latest write. W=N, R=1 favours fast reads; W=1, R=N favours fast writes.`,
    resources: [
      {
        label: "Jepsen — Consistency models",
        url: "https://jepsen.io/consistency",
      },
      {
        label: "PACELC",
        url: "https://en.wikipedia.org/wiki/PACELC_design_principle",
      },
    ],
  },
  {
    id: "storage",
    track: "system-design",
    title: "Storage & Data Modelling",
    blurb: "Where large objects live, and how to model what points at them.",
    lesson: `Not everything belongs in a database. Matching the storage type to the access pattern avoids a large class of scaling problems.

**Object storage** (S3, GCS, Vercel Blob) holds immutable blobs addressed by key. Effectively unlimited, cheap, durable, and high-latency per request. Correct for images, video, backups, and logs. **Block storage** is a raw disk attached to one machine — the thing databases run on. **File storage** offers a shared POSIX filesystem across machines, convenient and usually the slowest option.

**The rule for large files:** store the bytes in object storage and the *metadata plus the key* in your database. Storing blobs in a relational database bloats backups, wrecks buffer-cache hit rates, and drags down queries that never touch the blob.

**Uploads** should not proxy through your API. Issue a *presigned URL* so the client uploads straight to object storage; your server only signs and records. This removes your API from the bandwidth path entirely.

**Modelling.** Normalise until joins hurt, then denormalise deliberately, and know that a denormalised copy is a consistency obligation you have taken on. Soft deletes preserve history and mean every query must remember to filter. Append-only event tables give you an audit trail and unbounded growth to manage.

**Durability is not availability.** Object storage advertises eleven nines of durability and considerably fewer of availability. Those are separate promises: the first says the bytes will still exist, the second says you can fetch them right now. A design that treats a storage read as infallible has quietly bet on the weaker of the two.

**Classes and lifecycle.** Tiers trade retrieval cost and latency against storage price, so data written once and read almost never — old logs, raw event archives, backups past their restore window — belongs on a colder tier. Make that a lifecycle rule rather than a chore someone remembers, because storage bills grow quietly and no one looks at a bucket until it is expensive.

**Deletion is a design decision.** Overwriting a key in an object store is a new version rather than an edit, and versioning plus object lock is what stops a bad deploy erasing production data. The same mechanism means bytes you told a user you deleted are still there until the lifecycle rule catches up, which matters the moment you have promised anyone a deletion deadline in writing.`,
    resources: [
      {
        label: "AWS — Presigned URLs",
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html",
      },
      {
        label: "Vercel Blob",
        url: "https://vercel.com/docs/vercel-blob",
      },
    ],
  },
];

export const questions: Question[] = [
  {
    id: "sd-db-001",
    type: "mcq",
    track: "system-design",
    topic: "databases",
    difficulty: 3,
    context:
      "A table has a composite index on (tenant_id, created_at). A query filters only on created_at.",
    prompt: "Can the index serve this query efficiently?",
    options: [
      {
        id: "a",
        text: "No — composite indexes require a leftmost prefix, and tenant_id is missing",
      },
      { id: "b", text: "Yes — any column in the index can be used independently" },
      { id: "c", text: "Yes, but only if created_at is the primary key" },
      { id: "d", text: "Only if the table has fewer than a million rows" },
    ],
    answer: "a",
    explanation:
      "A composite index is sorted by tenant_id first, then created_at within each tenant. Filtering on created_at alone means scanning every tenant's slice, so the database usually falls back to a full scan. The index would serve tenant_id alone, or both together, but not created_at alone.",
    concepts: ["Composite index", "Leftmost prefix rule", "B-tree index"],
    tags: ["indexes", "composite"],
  },
  {
    id: "sd-db-002",
    type: "short",
    track: "system-design",
    topic: "databases",
    difficulty: 3,
    prompt:
      "What is the name for an index that contains every column a query needs, letting the database answer without reading the table?",
    answers: ["covering index", "covering", "a covering index", "index-only scan"],
    typoTolerance: true,
    explanation:
      "A covering index. Because the index holds all requested columns, the engine performs an index-only scan and never touches the heap — often a large speedup on wide tables, paid for with a bigger index and slower writes.",
    concepts: ["Covering index", "Index-only scan"],
    tags: ["indexes", "covering"],
  },
  {
    id: "sd-db-003",
    type: "multi",
    track: "system-design",
    topic: "databases",
    difficulty: 4,
    prompt: "What are the real costs of adding an index? Select all that apply.",
    options: [
      { id: "a", text: "Every insert, update, and delete must maintain it" },
      { id: "b", text: "It consumes additional storage" },
      { id: "c", text: "It can slow the query planner with more paths to consider" },
      { id: "d", text: "It makes existing reads on other columns slower" },
      { id: "e", text: "It requires the table to be locked permanently" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Indexes tax writes, storage, and planning. They do not slow unrelated reads, and modern engines can build them concurrently without a long lock. The practical takeaway: an index nothing queries is pure cost, so audit for unused indexes as readily as you add new ones.",
    concepts: ["Database index", "Write amplification", "Query planner"],
    tags: ["indexes", "tradeoffs"],
  },
  {
    id: "sd-db-004",
    type: "matching",
    track: "system-design",
    topic: "databases",
    difficulty: 4,
    prompt: "Match each isolation level to the anomaly it is the first to prevent.",
    pairs: [
      { left: "Read uncommitted", right: "Nothing — dirty reads are possible" },
      { left: "Read committed", right: "Dirty reads" },
      { left: "Repeatable read", right: "Non-repeatable reads" },
      { left: "Serializable", right: "Phantom reads and write skew" },
    ],
    explanation:
      "Each level rules out one more anomaly at increasing cost. Worth knowing that read committed is the default in PostgreSQL and many others — so unless you asked for more, a value you read twice in one transaction can legitimately differ.",
    concepts: ["Read committed", "Repeatable read", "Serializable isolation", "Phantom read"],
    tags: ["transactions", "isolation"],
  },
  {
    id: "sd-shard-001",
    type: "mcq",
    track: "system-design",
    topic: "sharding",
    difficulty: 3,
    context:
      "An events table is sharded by a range partition on timestamp. Writes are overwhelming a single shard while others sit idle.",
    prompt:
      "Why does range-sharding an events table on timestamp overload a single shard?",
    options: [
      {
        id: "a",
        text: "A hotspot — sequential timestamps all route to the newest shard",
      },
      { id: "b", text: "The shards are unevenly sized on disk" },
      { id: "c", text: "Range partitioning does not support timestamps" },
      { id: "d", text: "Replication lag is concentrating writes" },
    ],
    answer: "a",
    explanation:
      "Range partitioning on a monotonically increasing key sends every new write to whichever shard owns the newest range, so you get the operational cost of sharding with none of the write scaling. Hash the key, or prefix it with something high-cardinality, to spread writes.",
    concepts: ["Hotspot", "Range partitioning", "Shard key"],
    tags: ["hotspot", "partition-key"],
  },
  {
    id: "sd-shard-002",
    type: "multi",
    track: "system-design",
    topic: "sharding",
    difficulty: 4,
    prompt: "What makes a good shard key? Select all that apply.",
    options: [
      { id: "a", text: "High cardinality" },
      { id: "b", text: "Evenly distributed access" },
      { id: "c", text: "Present in most queries" },
      { id: "d", text: "Monotonically increasing" },
      { id: "e", text: "As few distinct values as possible" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "High cardinality and even access spread the load; being present in most queries is what keeps them from scattering to every shard. Monotonically increasing is actively bad — it is the hotspot recipe — and low cardinality caps how many shards you can ever use.",
    concepts: ["Shard key", "Cardinality", "Hash partitioning"],
    tags: ["partition-key"],
  },
  {
    id: "sd-shard-003",
    type: "mcq",
    track: "system-design",
    topic: "sharding",
    difficulty: 4,
    prompt:
      "Why is a query that omits the shard key expensive in a sharded system?",
    options: [
      {
        id: "a",
        text: "It must scatter to every shard and gather results, so the slowest shard sets the latency",
      },
      { id: "b", text: "It is rejected outright by the router" },
      { id: "c", text: "It forces an immediate rebalance" },
      { id: "d", text: "It bypasses all indexes" },
    ],
    answer: "a",
    explanation:
      "Without the shard key the router cannot tell which shard holds the data, so it asks all of them. Latency becomes the slowest shard's response, and total throughput drops because every shard works on every such query. This is why access patterns must inform the shard key before you commit to it.",
    concepts: ["Scatter-gather query", "Shard key", "Fan-out"],
    tags: ["scatter-gather"],
  },
  {
    id: "sd-repl-001",
    type: "mcq",
    track: "system-design",
    topic: "replication",
    difficulty: 3,
    context:
      "A user posts a comment, the write goes to the leader, and the page reloads reading from a follower. The comment is missing.",
    prompt: "What is the cause and the standard fix?",
    options: [
      {
        id: "a",
        text: "Replication lag — read from the leader for that user briefly after their write",
      },
      { id: "b", text: "The write failed silently; add retries" },
      { id: "c", text: "The follower is corrupted and needs rebuilding" },
      { id: "d", text: "The cache returned a stale entry; shorten the TTL" },
    ],
    answer: "a",
    explanation:
      "The write succeeded but had not reached the follower yet. This is the read-your-writes problem. Standard fixes: route a user's reads to the leader for a short window after they write, or track the write position and only read from a replica that has caught up past it.",
    concepts: ["Replication lag", "Read-your-writes consistency", "Leader-follower replication"],
    tags: ["lag", "read-your-writes"],
  },
  {
    id: "sd-repl-002",
    type: "mcq",
    track: "system-design",
    topic: "replication",
    difficulty: 4,
    context:
      "With 5 replicas, a system is configured with W=3 and R=3.",
    prompt: "What does this guarantee?",
    options: [
      {
        id: "a",
        text: "Reads and writes overlap on at least one node, so a read sees the latest write",
      },
      { id: "b", text: "Writes are three times faster than with W=1" },
      { id: "c", text: "The system tolerates any four node failures" },
      { id: "d", text: "Nothing — quorums require W and R to be equal to N" },
    ],
    answer: "a",
    explanation:
      "W + R > N is the quorum condition: 3 + 3 = 6 > 5, so the write set and read set must share at least one node, and that node has the newest value. Tuning W down speeds writes at the cost of read consistency, and vice versa.",
    concepts: ["Quorum", "Leaderless replication", "Tunable consistency"],
    tags: ["quorum"],
  },
  {
    id: "sd-repl-003",
    type: "short",
    track: "system-design",
    topic: "replication",
    difficulty: 4,
    context:
      "A network partition leaves two nodes each believing they are the leader. Both accept writes.",
    prompt: "What is this condition called?",
    answers: ["split brain", "split-brain", "splitbrain", "split brain syndrome"],
    typoTolerance: true,
    explanation:
      "Split-brain. It is dangerous because both halves accept writes that will conflict when the partition heals, and the damage is silent rather than loud. Fencing tokens and requiring a majority quorum to elect a leader are the usual defences.",
    concepts: ["Split-brain", "Fencing token", "Leader election"],
    tags: ["failover", "split-brain"],
  },
  {
    id: "sd-repl-004",
    type: "mcq",
    track: "system-design",
    topic: "replication",
    difficulty: 3,
    prompt:
      "What does synchronous replication cost compared to asynchronous?",
    options: [
      {
        id: "a",
        text: "Every write waits for follower acknowledgement, so write latency rises",
      },
      { id: "b", text: "It requires twice the storage" },
      { id: "c", text: "Followers can no longer serve reads" },
      { id: "d", text: "It prevents the use of more than two replicas" },
    ],
    answer: "a",
    explanation:
      "Synchronous replication buys durability — a confirmed write survives leader failure — and charges the slowest acknowledging follower's latency on every write. It also means a slow or unreachable follower can stall writes entirely, which is why semi-synchronous setups keep exactly one synchronous follower.",
    concepts: ["Synchronous replication", "Asynchronous replication", "Semi-synchronous replication"],
    tags: ["sync-async"],
  },
  {
    id: "sd-cons-001",
    type: "mcq",
    track: "system-design",
    topic: "consistency",
    difficulty: 3,
    prompt: "What does the CAP theorem actually claim?",
    options: [
      {
        id: "a",
        text: "During a network partition, a system must choose between consistency and availability",
      },
      { id: "b", text: "A system can only ever have two of consistency, availability, and partition tolerance" },
      { id: "c", text: "Distributed systems cannot be consistent" },
      { id: "d", text: "Availability and consistency are always mutually exclusive" },
    ],
    answer: "a",
    explanation:
      "The popular 'pick two' phrasing is misleading. Partitions are a fact of networks, not a design choice, so the real statement is conditional: when a partition happens, you choose C or A. With no partition you can have both — and the tradeoff you actually make daily is consistency versus latency, which is what PACELC captures.",
    concepts: ["CAP theorem", "PACELC", "Network partition"],
    tags: ["cap", "pacelc"],
  },
  {
    id: "sd-cons-002",
    type: "ordering",
    track: "system-design",
    topic: "consistency",
    difficulty: 4,
    prompt: "Order these consistency models from strongest to weakest.",
    items: [
      "Linearizable",
      "Sequential",
      "Causal",
      "Read-your-writes",
      "Eventual",
    ],
    explanation:
      "Strength is about how many orderings the model rules out. Linearizable admits only real-time order; eventual admits almost anything as long as replicas converge. The practical skill is picking per operation rather than per system — a payment needs the top of this list, a like count is fine at the bottom.",
    concepts: ["Linearizability", "Causal consistency", "Eventual consistency"],
    tags: ["models"],
  },
  {
    id: "sd-cons-003",
    type: "mcq",
    track: "system-design",
    topic: "consistency",
    difficulty: 3,
    context:
      "You are designing the like counter on a social feed serving millions of reads per second.",
    prompt: "Which consistency model is appropriate?",
    options: [
      { id: "a", text: "Eventual — a briefly stale count is imperceptible" },
      { id: "b", text: "Linearizable — counts must always be exact" },
      { id: "c", text: "Serializable transactions per like" },
      { id: "d", text: "Causal consistency across all users" },
    ],
    answer: "a",
    explanation:
      "Nobody can tell whether a like count is 1,203 or 1,204, and paying coordination cost on the highest-volume operation in the system to get it exactly right is a poor trade. Reserve strong consistency for operations where being wrong is actually visible or costly.",
    concepts: ["Eventual consistency", "Coordination cost"],
    tags: ["tradeoffs"],
  },
  {
    id: "sd-stor-001",
    type: "mcq",
    track: "system-design",
    topic: "storage",
    difficulty: 2,
    context: "Users upload profile photos averaging 2MB.",
    prompt: "Where should the image bytes live?",
    options: [
      {
        id: "a",
        text: "Object storage, with the key and metadata in the database",
      },
      { id: "b", text: "A BLOB column in the relational database" },
      { id: "c", text: "On the application server's local disk" },
      { id: "d", text: "In the cache layer" },
    ],
    answer: "a",
    explanation:
      "Object storage is built for this: cheap, durable, and effectively unlimited. Blobs in a relational database bloat every backup, evict useful pages from the buffer cache, and slow queries that never touch the image. Local disk does not survive a redeploy and is not shared across instances.",
    concepts: ["Object storage", "BLOB", "Buffer cache"],
    tags: ["object-storage"],
  },
  {
    id: "sd-stor-002",
    type: "mcq",
    track: "system-design",
    topic: "storage",
    difficulty: 3,
    prompt:
      "Why issue a presigned URL instead of proxying uploads through your API?",
    options: [
      {
        id: "a",
        text: "The client uploads directly to storage, keeping your API out of the bandwidth path",
      },
      { id: "b", text: "Presigned URLs compress the file automatically" },
      { id: "c", text: "It is the only way to enforce a file size limit" },
      { id: "d", text: "It avoids the need to authenticate the user" },
    ],
    answer: "a",
    explanation:
      "Proxying a 2MB upload means your server absorbs the bandwidth, memory, and request duration for every file. A presigned URL moves the transfer directly between client and storage while your server only signs the request and records metadata. It still requires authentication — you authenticate before you sign.",
    concepts: ["Presigned URL", "Direct-to-storage upload"],
    tags: ["presigned-urls", "uploads"],
  },
  {
    id: "sd-stor-003",
    type: "multi",
    track: "system-design",
    topic: "storage",
    difficulty: 4,
    prompt:
      "What obligations does denormalising a field into a second table create? Select all that apply.",
    options: [
      { id: "a", text: "Every write path must update both copies" },
      { id: "b", text: "The copies can diverge and need reconciliation" },
      { id: "c", text: "Backfills are needed when the denormalised field changes shape" },
      { id: "d", text: "Reads become slower" },
      { id: "e", text: "The database can no longer enforce foreign keys anywhere" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Denormalisation buys read speed and sells consistency. You now own keeping the copies in sync, detecting drift, and migrating both when the shape changes. Reads get faster, not slower — that is the entire point — and foreign keys elsewhere are unaffected.",
    concepts: ["Denormalisation", "Data consistency", "Backfill"],
    tags: ["modelling", "denormalisation"],
  },
  {
    id: "sd-db-005",
    type: "multi",
    track: "system-design",
    topic: "databases",
    difficulty: 3,
    prompt:
      "Which query patterns stop a B-tree index on a single column from being used? Select all that apply.",
    options: [
      { id: "a", text: "Wrapping the column in a function, as in WHERE lower(email) = ?" },
      { id: "b", text: "A leading wildcard, as in WHERE name LIKE '%son'" },
      {
        id: "c",
        text: "Comparing the column to a different type, forcing an implicit cast on the column",
      },
      { id: "d", text: "A range comparison, as in WHERE created_at > ?" },
      { id: "e", text: "Sorting the results by that same column" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "An index stores the column's values, not the result of something applied to them, so any transformation of the column side makes it unusable — the cure is an expression index, or moving the work to the literal side. A leading wildcard has no prefix to seek on. Ranges and ordering are precisely what a B-tree is for, because it keeps values sorted.",
    concepts: ["Sargable predicate", "Expression index", "Implicit type conversion", "B-tree index"],
    tags: ["indexes", "sargability"],
  },
  {
    id: "sd-repl-005",
    type: "multi",
    track: "system-design",
    topic: "replication",
    difficulty: 4,
    prompt:
      "Which anomalies can a client observe when its reads are spread across asynchronously updated followers? Select all that apply.",
    options: [
      { id: "a", text: "A value the client just wrote is missing from its next read" },
      { id: "b", text: "A value visible on one read has disappeared by the next one" },
      { id: "c", text: "A reply appears before the message it is replying to" },
      { id: "d", text: "A write the leader committed is silently rolled back on the leader" },
      { id: "e", text: "A follower returns a value no client ever wrote" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Each is a named guarantee going missing: read-your-writes, monotonic reads, and consistent prefix reads respectively. All three come from consecutive reads landing on replicas at different points in the stream — which is why pinning a session to one replica fixes all three at once. Replicas may lag, but they do not invent or unwind committed data.",
    concepts: ["Read-your-writes consistency", "Monotonic reads", "Consistent prefix reads", "Replication lag"],
    tags: ["anomalies", "session-guarantees"],
  },
  {
    id: "sd-repl-006",
    type: "ordering",
    track: "system-design",
    topic: "replication",
    difficulty: 3,
    prompt: "Put the steps of an automated leader failover in order.",
    items: [
      "Followers stop receiving heartbeats from the leader",
      "A quorum of nodes agrees the leader is gone",
      "The follower with the most complete log is elected leader",
      "Remaining followers follow the new leader and discard writes it never saw",
      "The routing layer points clients at the new leader",
    ],
    explanation:
      "The two dangerous steps are the middle ones. Requiring a quorum is what stops a partition producing two leaders that both accept writes, and discarding divergent writes is silent data loss — so asynchronous replication plus automatic failover is a durability decision, not an operational convenience.",
    concepts: ["Failover", "Leader election", "Split-brain", "Quorum"],
    tags: ["failover", "elections"],
  },
  {
    id: "sd-stor-004",
    type: "ordering",
    track: "system-design",
    topic: "storage",
    difficulty: 3,
    prompt:
      "Put the steps of a presigned direct-to-object-storage upload in order.",
    items: [
      "The client asks your API to upload a file of a given name, type, and size",
      "Your API authorises the user and signs a short-lived upload URL for one key",
      "The client sends the bytes straight to object storage using that URL",
      "Object storage confirms the upload, to the client or by event notification",
      "Your service records the object key against the owning row",
    ],
    explanation:
      "Your server signs and records; it never carries the bytes, so upload bandwidth stops scaling with your API tier. The step most often dropped is the last one: until the key is stored against a row, the object is orphaned — which is how buckets accumulate files nothing references and why a lifecycle rule for unclaimed uploads is worth having.",
    concepts: ["Presigned URL", "Object storage", "Orphaned object", "Lifecycle policy"],
    tags: ["uploads", "presigned"],
  },
];
