import type { Question, Track, Topic } from "@/content/types";

const topics: Topic[] = [
  {
    id: "complexity",
    track: "dsa-concepts",
    title: "Complexity Analysis",
    blurb: "Talking about cost precisely, before writing any code.",
    lesson: `Big-O describes how cost grows with input size, ignoring constants. It is the shared vocabulary for discussing an approach before anyone commits to implementing it, which is exactly what a phone screen is testing.

**Read the shape, not the code.** A loop over n is O(n). A nested loop over the same n is O(n²). Halving the search space each step is O(log n). Sorting is O(n log n) and is usually the dominant term the moment it appears. Recursion that splits into two halves and does linear work per level is also O(n log n) — that is mergesort.

**Constants and the real world.** O(n log n) with a tiny constant routinely beats O(n) with a huge one at realistic sizes. Big-O is about asymptotic growth; when someone says "this is O(1) but the constant is a network round trip," they are making a real and important point.

**Amortised is not average.** A dynamic array's push is O(1) amortised: most pushes are cheap, and the occasional resize is O(n), which averages out across a sequence. That is a worst-case guarantee over a sequence of operations, unlike hash table lookup, which is O(1) average and O(n) worst case under adversarial collisions.

**Space counts too, and recursion is where people forget.** A recursive solution carries O(depth) stack space even when it allocates nothing — a recursion over a linked list of a million nodes will overflow the stack while looking allocation-free.

**Say the bound and the reason.** "This is O(n log n), dominated by the sort" is a complete answer. Reciting a bound with no justification is the thing interviewers are checking for.`,
    resources: [
      {
        label: "Big-O cheat sheet",
        url: "https://www.bigocheatsheet.com/",
      },
    ],
  },
  {
    id: "structure-choice",
    track: "dsa-concepts",
    title: "Choosing a Data Structure",
    blurb: "Letting the access pattern pick the structure.",
    lesson: `Almost every "which data structure" question reduces to one prior question: **what operation must be fast?**

**Hash map** — O(1) average lookup, insert, and delete by exact key, with no ordering. The default when you need to answer "have I seen this?" or "what is associated with this key?"

**Balanced tree / sorted map** — O(log n) operations *and* ordering, so it supports range queries, floor and ceiling lookups, and in-order traversal. Choose it over a hash map the moment you need "all keys between X and Y" or "the next key after X."

**Heap** — O(1) peek at the minimum or maximum, O(log n) insert and extract. Correct whenever you repeatedly need the extreme element without needing the rest sorted. "Top k of a stream" is a heap of size k, at O(n log k) instead of sorting everything at O(n log n).

**Deque** — O(1) insertion and removal at both ends. Sliding window problems are usually a deque holding indices.

**Trie** — prefix lookup in time proportional to key length rather than dictionary size. Autocomplete and prefix matching.

**Union-find** — near-constant merging and connectivity checks over disjoint sets. Connected components and cycle detection in an undirected graph.

**Do not skip the plain array.** A contiguous array is the fastest thing on real hardware for anything you scan, because the values sit next to one another and the prefetcher stays ahead of you. Asymptotic analysis assumes every memory access costs the same, which stopped being true decades ago, so a linear scan of a small array routinely beats the hash map or linked list that should have won — often up to a few hundred elements. Where two candidates share a complexity, prefer the contiguous one.

**The interesting structures are usually two simple ones joined** at the operation each is good at. An LRU cache is a hash map for lookup plus a doubly linked list for recency; a top-k over a stream is a heap plus whatever holds the stream. So when no single structure has every operation you need fast, that is a signal to compose rather than to compromise on the one you already know.

**The interview move** is to state the requirement first: "I need the minimum repeatedly and I don't need full ordering, so a heap." That sentence is worth more than the name alone, because it shows the choice was derived rather than recalled.`,
    resources: [
      {
        label: "MIT 6.006 — Introduction to Algorithms",
        url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
      },
    ],
  },
  {
    id: "patterns",
    track: "dsa-concepts",
    title: "Algorithmic Patterns",
    blurb: "Recognising the shape of a problem before solving it.",
    lesson: `Most interview problems are variations on a small set of patterns. Recognising the pattern is most of the work, and it is what lets you talk through an approach confidently before writing a line.

**Two pointers** — a sorted array with a pair or triple condition. Converts O(n²) scanning into O(n) by moving pointers inward based on the comparison.

**Sliding window** — contiguous subarrays or substrings with a constraint. Expand the right edge, contract the left when the constraint breaks. O(n) instead of O(n²).

**Fast and slow pointers** — cycle detection in a linked list, or finding the middle in one pass.

**Binary search on the answer** — the classic tell is "minimum X such that a condition holds," where the condition is monotonic. You are not searching an array, you are searching the answer space.

**BFS vs DFS** — BFS finds shortest paths in unweighted graphs and explores level by level; DFS is natural for exhaustive exploration, path finding, and anything recursive on trees. Weighted shortest path means Dijkstra instead.

**Dynamic programming** — overlapping subproblems plus optimal substructure. Start from the recurrence, then decide memoisation versus tabulation. Being able to state the recurrence out loud matters more than the implementation.

**Heap for top-k**, **trie for prefixes**, **union-find for connectivity** — each has a distinctive tell.

Say the pattern out loud when you spot it: "this is a sliding window, because we need the longest contiguous run satisfying a constraint." That sentence is the signal being measured.`,
    resources: [
      {
        label: "NeetCode — Patterns",
        url: "https://neetcode.io/roadmap",
      },
    ],
  },
  {
    id: "space-time",
    track: "dsa-concepts",
    title: "Space/Time Tradeoffs",
    blurb: "Spending memory to buy speed, deliberately.",
    lesson: `Most optimisation is trading one resource for another. Naming the trade explicitly is a senior signal, because it shows you know what you spent.

**Precomputation** — a prefix sum array costs O(n) space and turns every range-sum query from O(n) into O(1). Worth it when queries are frequent, wasteful for a single query.

**Memoisation** — cache subproblem results to avoid recomputation. Turns exponential recursion into polynomial, and the cache is the cost. It is the same trade a web cache makes, one abstraction level down.

**Hashing for lookup** — building a set of seen values costs O(n) memory and converts an O(n²) nested scan into O(n). This is the single most common optimisation in interviews, and it is worth saying "I'll trade O(n) space for O(n) time" as you do it.

**When memory is the constraint** the trade reverses. Sorting in place at O(n log n) beats hashing when you cannot afford the extra array. Streaming algorithms give approximate answers in bounded memory — HyperLogLog estimates distinct counts in kilobytes rather than storing every value, and a Bloom filter answers "definitely not present" or "probably present" in a fraction of the space of a real set.

**Measure before you trade.** Each resource is only worth spending where it is genuinely scarce, and intuition about which one is scarce here is unreliable — a cache that introduces an invalidation bug to save two milliseconds is a bad trade made confidently. Profile first, and prefer the version of the trade that is easy to undo when the measurement changes.

**There is a third resource, and it is often the largest.** Every precomputed copy is complexity somebody maintains: a cache is a consistency obligation, a denormalised column is an update path, a memo table is a lifetime question nobody asked. None of that appears in a comparison of two Big-O expressions, and it is usually what decides whether the optimisation survives the next six months. The simplest version that is fast enough beats the fastest version nobody dares change.

**The real-world version** is the same reasoning: a denormalised table, a materialised view, and a cache are all precomputation. The cost is memory plus a consistency obligation. Recognising that a database index is a space-for-time trade is the point where these two tracks meet.`,
    resources: [
      {
        label: "Bloom filters explained",
        url: "https://en.wikipedia.org/wiki/Bloom_filter",
      },
    ],
  },
];

const questions: Question[] = [
  {
    id: "ds-cx-001",
    type: "mcq",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 2,
    context:
      "An algorithm sorts an array of n items, then does a single linear pass over it.",
    prompt: "What is the overall time complexity?",
    options: [
      { id: "a", text: "O(n log n) — the sort dominates" },
      { id: "b", text: "O(n) — the linear pass dominates" },
      { id: "c", text: "O(n² log n)" },
      { id: "d", text: "O(log n)" },
    ],
    answer: "a",
    explanation:
      "Sequential steps add, and the sum is dominated by the largest term: O(n log n) + O(n) = O(n log n). A useful habit is that once a sort appears, it is almost always the bound unless something heavier follows.",
    concepts: ["Big-O notation", "Asymptotic dominance", "Comparison sort"],
    tags: ["big-o", "dominance"],
  },
  {
    id: "ds-cx-002",
    type: "mcq",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 3,
    prompt:
      "What does it mean that appending to a dynamic array is O(1) amortised?",
    options: [
      {
        id: "a",
        text: "Most appends are constant time; occasional resizes cost O(n) but average out over a sequence",
      },
      { id: "b", text: "Every append is guaranteed constant time" },
      { id: "c", text: "It is O(1) on average inputs but O(n) on adversarial ones" },
      { id: "d", text: "It is O(1) only when the array is preallocated" },
    ],
    answer: "a",
    explanation:
      "Amortised analysis averages cost across a sequence of operations and is a worst-case guarantee for that sequence — no adversary can make a run of appends expensive. That is different from 'average case', which is about input distribution and is what hash table lookup gives you.",
    concepts: ["Amortised analysis", "Dynamic array", "Worst-case complexity"],
    tags: ["amortised"],
  },
  {
    id: "ds-cx-003",
    type: "matching",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 3,
    prompt: "Match each operation to its typical time complexity.",
    pairs: [
      { left: "Hash map lookup (average)", right: "O(1)" },
      { left: "Binary search on a sorted array", right: "O(log n)" },
      { left: "Comparison sort", right: "O(n log n)" },
      { left: "Nested loop over the same array", right: "O(n squared)" },
      { left: "Generating every subset of a set", right: "O(2 to the n)" },
    ],
    explanation:
      "Worth remembering that hash map lookup is O(1) on average and O(n) in the worst case when collisions degrade the bucket to a list. Comparison sorts cannot beat O(n log n); counting and radix sorts do, by not comparing.",
    concepts: ["Big-O notation", "Binary search", "Hash table"],
    tags: ["big-o", "reference"],
  },
  {
    id: "ds-cx-004",
    type: "mcq",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 4,
    context:
      "A recursive function walks a linked list of one million nodes, allocating nothing.",
    prompt: "What is the space complexity, and why does it matter?",
    options: [
      {
        id: "a",
        text: "O(n) — each recursive call holds a stack frame, so it will overflow the stack",
      },
      { id: "b", text: "O(1) — no data structures are allocated" },
      { id: "c", text: "O(log n) — recursion depth is logarithmic" },
      { id: "d", text: "O(n) heap allocation from the call arguments" },
    ],
    answer: "a",
    explanation:
      "Recursion depth is space. A million frames will exhaust a typical stack long before memory runs out, which is why the iterative version is not merely a stylistic preference here. Languages with guaranteed tail-call elimination avoid this; most mainstream ones do not.",
    concepts: ["Space complexity", "Call stack", "Stack overflow"],
    tags: ["space", "recursion"],
  },
  {
    id: "ds-struct-001",
    type: "mcq",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 3,
    context:
      "You need to repeatedly retrieve the smallest element from a changing collection, but never need the collection fully sorted.",
    prompt:
      "Which structure repeatedly returns the smallest element without a full sort?",
    options: [
      { id: "a", text: "A min-heap" },
      { id: "b", text: "A sorted array" },
      { id: "c", text: "A hash map" },
      { id: "d", text: "A linked list" },
    ],
    answer: "a",
    explanation:
      "A heap gives O(1) access to the extreme element and O(log n) insert and extract, which is exactly the operation set required. Keeping a sorted array costs O(n) per insertion to maintain order you never actually use, and a hash map has no ordering at all.",
    concepts: ["Heap", "Priority queue", "Sorted array"],
    tags: ["heap"],
  },
  {
    id: "ds-struct-002",
    type: "mcq",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 3,
    context:
      "You need to find all keys between two values, and also look keys up individually.",
    prompt: "Why is a balanced tree the better choice over a hash map here?",
    options: [
      {
        id: "a",
        text: "A hash map has no ordering, so a range query would require scanning every key",
      },
      { id: "b", text: "A hash map cannot store more than a fixed number of keys" },
      { id: "c", text: "Balanced trees have faster individual lookups" },
      { id: "d", text: "Hash maps do not support deletion" },
    ],
    answer: "a",
    explanation:
      "Hashing deliberately destroys ordering — that is how it distributes keys evenly. A balanced tree keeps keys sorted, so a range query is a seek plus an in-order walk. You pay O(log n) instead of O(1) for point lookups, which is the price of the ordering.",
    concepts: ["Balanced tree", "Range query", "Hash table"],
    tags: ["trees", "range-queries"],
  },
  {
    id: "ds-struct-003",
    type: "short",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 3,
    context:
      "You need autocomplete: given a prefix, return every stored word starting with it, in time proportional to the prefix length rather than the dictionary size.",
    prompt: "Which data structure is designed for this?",
    answers: ["trie", "a trie", "prefix tree", "tries", "radix trie"],
    typoTolerance: true,
    explanation:
      "A trie (prefix tree). Each node is one character, so walking the prefix takes time proportional to its length regardless of how many words are stored, and everything below that node shares the prefix. A radix tree compresses single-child chains to save memory.",
    concepts: ["Trie", "Prefix tree", "Radix tree"],
    tags: ["trie", "prefix"],
  },
  {
    id: "ds-struct-004",
    type: "mcq",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 4,
    context:
      "You must find the top 10 items from a stream of 100 million values.",
    prompt:
      "What is the efficient way to find the top 10 of 100 million streamed values?",
    options: [
      {
        id: "a",
        text: "Keep a min-heap of size 10, giving O(n log k)",
      },
      { id: "b", text: "Sort all 100 million values and take the first 10" },
      { id: "c", text: "Keep a sorted array of all values" },
      { id: "d", text: "Use a hash map keyed by value" },
    ],
    answer: "a",
    explanation:
      "A bounded heap of size k holds only the current best 10: compare each incoming value to the smallest, replace if larger. That is O(n log k) time and O(k) space — critically, it never needs to hold the full stream, which sorting does.",
    concepts: ["Top-k selection", "Min-heap", "Streaming algorithm"],
    tags: ["top-k", "streaming"],
  },
  {
    id: "ds-pat-001",
    type: "mcq",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 3,
    context:
      "Find the longest contiguous substring containing at most k distinct characters.",
    prompt:
      "Which pattern solves the longest substring with at most k distinct characters?",
    options: [
      { id: "a", text: "Sliding window" },
      { id: "b", text: "Binary search" },
      { id: "c", text: "Dynamic programming" },
      { id: "d", text: "Union-find" },
    ],
    answer: "a",
    explanation:
      "The tells are *contiguous* and a constraint that can be violated and repaired: grow the window on the right, shrink from the left when distinct characters exceed k. Each character enters and leaves at most once, giving O(n) rather than the O(n²) of checking every substring.",
    concepts: ["Sliding window", "Two pointers", "Contiguous subarray"],
    tags: ["sliding-window"],
  },
  {
    id: "ds-pat-002",
    type: "mcq",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 4,
    context:
      "Find the minimum capacity such that a shipment can be delivered within d days. Larger capacities always work if a smaller one does.",
    prompt:
      "Which pattern finds the smallest workable capacity when larger values always work?",
    options: [
      {
        id: "a",
        text: "Binary search on the answer, since feasibility is monotonic",
      },
      { id: "b", text: "Sliding window over the package list" },
      { id: "c", text: "Depth-first search over capacity combinations" },
      { id: "d", text: "Greedy selection of the largest packages first" },
    ],
    answer: "a",
    explanation:
      "The tell is 'minimum X such that a condition holds', with the condition monotonic — if capacity c works, every capacity above it works. You binary search the answer space rather than an array, testing feasibility at each midpoint. This is one of the highest-value patterns to recognise on sight.",
    concepts: ["Binary search on the answer", "Monotonic predicate", "Search space"],
    tags: ["binary-search"],
  },
  {
    id: "ds-pat-003",
    type: "mcq",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 3,
    prompt:
      "When should you use BFS rather than DFS for a graph traversal?",
    options: [
      {
        id: "a",
        text: "When you need the shortest path in an unweighted graph",
      },
      { id: "b", text: "When the graph contains cycles" },
      { id: "c", text: "When memory is severely constrained" },
      { id: "d", text: "When the graph is a tree" },
    ],
    answer: "a",
    explanation:
      "BFS explores level by level, so the first time it reaches a node it has done so in the fewest edges — that property is what makes it correct for unweighted shortest paths. Both handle cycles with a visited set, and BFS typically uses *more* memory, since a frontier can be much wider than a path is deep. Weighted graphs need Dijkstra.",
    concepts: ["Breadth-first search", "Depth-first search", "Shortest path"],
    tags: ["bfs-dfs", "graphs"],
  },
  {
    id: "ds-pat-004",
    type: "multi",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 4,
    prompt:
      "Which two properties must a problem have for dynamic programming to apply? Select all that apply.",
    options: [
      { id: "a", text: "Overlapping subproblems" },
      { id: "b", text: "Optimal substructure" },
      { id: "c", text: "A sorted input" },
      { id: "d", text: "A single global optimum" },
      { id: "e", text: "Bounded input size" },
    ],
    answers: ["a", "b"],
    explanation:
      "Overlapping subproblems is what makes caching pay off — without it, you are doing plain divide and conquer. Optimal substructure means an optimal solution is built from optimal solutions to subproblems, which is what makes the recurrence valid. Sorting and input size are irrelevant to whether DP applies.",
    concepts: ["Dynamic programming", "Overlapping subproblems", "Optimal substructure"],
    tags: ["dynamic-programming"],
  },
  {
    id: "ds-st-001",
    type: "mcq",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 2,
    context:
      "Finding whether any two numbers in an array sum to a target, by storing seen values in a hash set.",
    prompt: "What trade does a hash set of seen values make in a two-sum scan?",
    options: [
      {
        id: "a",
        text: "O(n) extra space to reduce time from O(n squared) to O(n)",
      },
      { id: "b", text: "O(n) extra time to reduce space" },
      { id: "c", text: "No trade — it is strictly better in both" },
      { id: "d", text: "O(log n) space for O(log n) time" },
    ],
    answer: "a",
    explanation:
      "The nested-loop version uses no extra memory and takes quadratic time. The hash set version remembers what it has already seen, so each element needs one O(1) lookup instead of a scan. Saying the trade out loud — 'I'll spend O(n) space to get O(n) time' — is the part interviewers listen for.",
    concepts: ["Space-time trade-off", "Hash set", "Memoisation"],
    tags: ["hashing", "tradeoff"],
  },
  {
    id: "ds-st-002",
    type: "mcq",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 4,
    context:
      "You need to know whether a URL has been seen before, across billions of URLs, and a rare false positive is acceptable.",
    prompt: "Which structure fits the memory constraint?",
    options: [
      {
        id: "a",
        text: "A Bloom filter — no false negatives, occasional false positives, a fraction of the space",
      },
      { id: "b", text: "A hash set of every URL seen" },
      { id: "c", text: "A sorted array with binary search" },
      { id: "d", text: "A trie of all URLs" },
    ],
    answer: "a",
    explanation:
      "A Bloom filter answers 'definitely not present' or 'probably present' using a bit array and several hash functions, in orders of magnitude less memory than storing the values. The tolerance for false positives is exactly what buys the space saving — and it never produces a false negative, which is why crawlers use it.",
    concepts: ["Bloom filter", "Probabilistic data structure", "False positive"],
    tags: ["bloom-filter", "approximation"],
  },
  {
    id: "ds-st-003",
    type: "mcq",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 3,
    prompt:
      "A prefix sum array is built over n values. What does it buy, and what does it cost?",
    options: [
      {
        id: "a",
        text: "O(1) range-sum queries, costing O(n) space and O(n) preprocessing",
      },
      { id: "b", text: "O(log n) queries, costing O(log n) space" },
      { id: "c", text: "O(1) queries with no additional space" },
      { id: "d", text: "Faster insertion into the underlying array" },
    ],
    answer: "a",
    explanation:
      "Precompute cumulative sums once, then any range sum is one subtraction. It is worth it when queries are frequent and the data is static — and it actively hurts when the underlying values change often, because every update invalidates the prefixes after it. That is the same reasoning behind a materialised view.",
    concepts: ["Prefix sum", "Precomputation", "Range query"],
    tags: ["precomputation", "prefix-sum"],
  },
  {
    id: "ds-cx-005",
    type: "ordering",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 2,
    prompt:
      "Order these growth rates from slowest-growing to fastest-growing.",
    items: [
      "O(1) — constant",
      "O(log n) — logarithmic",
      "O(n) — linear",
      "O(n log n) — linearithmic",
      "O(n^2) — quadratic",
      "O(2^n) — exponential",
    ],
    explanation:
      "The gap that decides real designs is between linearithmic and quadratic: at a million items that is roughly twenty million steps against a trillion. Below about a hundred items the ordering predicts almost nothing, because constants dominate — which is why library sorts switch to insertion sort on small ranges.",
    concepts: ["Big-O notation", "Linearithmic time", "Asymptotic growth"],
    tags: ["big-o", "growth-rates"],
  },
  {
    id: "ds-cx-006",
    type: "short",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 3,
    context:
      "A function builds a result by writing s = s + chunk inside a loop over n chunks. Strings are immutable, so each concatenation copies everything accumulated so far.",
    prompt: "In one word, what is the growth rate of that loop?",
    answers: ["quadratic", "quadratic time", "o(n^2)", "n^2", "n squared"],
    typoTolerance: true,
    explanation:
      "Quadratic. The copies are 1 + 2 + ... + n, which is n(n+1)/2. This is the classic accidental O(n^2): every individual line looks constant-time, and the cost is hidden inside an operator. Collect the chunks in a list and join once at the end, which is linear.",
    concepts: ["Quadratic time", "String immutability", "String builder"],
    tags: ["hidden-cost", "strings"],
  },
  {
    id: "ds-cx-007",
    type: "multi",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 3,
    prompt:
      "Which facts does a Big-O bound deliberately leave out? Select all that apply.",
    options: [
      {
        id: "a",
        text: "The constant factor, so an O(n) algorithm can lose to an O(n log n) one at real sizes",
      },
      { id: "b", text: "Lower-order terms, so n^2 + n is written O(n^2)" },
      { id: "c", text: "Whether the bound describes the best, average, or worst case" },
      { id: "d", text: "How the running time grows as the input becomes large" },
      { id: "e", text: "Whether one algorithm has a higher growth rate than another" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Big-O states growth as n tends to infinity and nothing else, so it is silent on everything that decides performance at n = 200. The omission people forget is the case: quicksort is O(n^2) in the worst case and still the default sort in several languages, because its average case and its constants are excellent.",
    concepts: ["Big-O notation", "Constant factor", "Worst-case complexity", "Average-case complexity"],
    tags: ["big-o", "limitations"],
  },
  {
    id: "ds-cx-008",
    type: "mcq",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 3,
    context:
      "An outer loop runs n times. Inside it, a second pointer advances through the same array — and across the whole run that pointer never resets or moves backwards.",
    prompt: "What is the total time complexity of this two-pointer scan?",
    options: [
      {
        id: "a",
        text: "O(n) — the inner pointer advances at most n times across all outer iterations combined",
      },
      { id: "b", text: "O(n^2) — a loop inside a loop is quadratic" },
      { id: "c", text: "O(n log n) — the inner pointer halves the remaining range" },
      { id: "d", text: "O(n), but only if the array is sorted first" },
    ],
    answer: "a",
    explanation:
      "Nesting is about total work, not syntax. Since the inner pointer only ever moves forward, the sum of all its steps is bounded by n however they are distributed across the outer loop — the same aggregate argument that makes appending to a dynamic array amortised O(1). Counting nesting instead of steps is how sliding-window solutions get mislabelled quadratic.",
    concepts: ["Aggregate analysis", "Two pointers", "Amortised analysis", "Sliding window"],
    tags: ["aggregate-analysis", "misconceptions"],
  },
  {
    id: "ds-cx-009",
    type: "matching",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 3,
    prompt: "Match each complexity term to what it actually claims.",
    pairs: [
      { left: "Big-O", right: "An upper bound — growth is no worse than this" },
      { left: "Big-Omega", right: "A lower bound — growth is at least this" },
      { left: "Big-Theta", right: "A tight bound — the upper and lower bounds agree" },
      {
        left: "Amortised cost",
        right: "A guaranteed average per operation over any long sequence",
      },
      {
        left: "Average case",
        right: "The expected cost over a distribution of inputs",
      },
    ],
    explanation:
      "The last two are the pair people conflate. Amortised is a worst-case promise about a sequence: no adversarial input makes n appends to a dynamic array cost more than O(n) in total. Average case is a claim about typical inputs, and an adversary can defeat it — which is exactly why a hash table is O(1) average and O(n) worst case.",
    concepts: ["Big-Theta notation", "Big-Omega notation", "Amortised analysis", "Average-case complexity"],
    tags: ["notation", "terminology"],
  },
  {
    id: "ds-cx-010",
    type: "multi",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 2,
    context:
      "Merge sort splits an array in half, sorts each half recursively, then merges the two sorted halves.",
    prompt:
      "Which statements about merge sort's cost are true? Select all that apply.",
    options: [
      { id: "a", text: "The recursion is about log n levels deep, because the input halves each time" },
      { id: "b", text: "Each level does O(n) work merging, so the total is O(n log n)" },
      { id: "c", text: "It needs O(n) extra space for the merge buffer" },
      { id: "d", text: "Its worst case degrades to O(n^2) on already-sorted input" },
      { id: "e", text: "It sorts in place, using no additional memory" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Multiplying recursion depth by the work per level is how you read any divide-and-conquer cost. Merge sort's O(n log n) holds on every input, including sorted ones — the degradation on sorted input is quicksort's problem, with a bad pivot rule. The O(n) buffer is the price, and the reason quicksort is often preferred despite a worse worst case.",
    concepts: ["Merge sort", "Divide and conquer", "Recursion depth", "Auxiliary space"],
    tags: ["sorting", "divide-and-conquer"],
  },
  {
    id: "ds-cx-011",
    type: "mcq",
    track: "dsa-concepts",
    topic: "complexity",
    difficulty: 4,
    context:
      "A service uses a hash map keyed on user-supplied strings. Someone submits thousands of keys chosen to land in the same bucket, and lookups degrade from constant time to linear.",
    prompt:
      "What is this attack on hash table complexity called, and what defends against it?",
    options: [
      {
        id: "a",
        text: "Hash flooding — seed the hash randomly per process so bucket assignment cannot be predicted",
      },
      { id: "b", text: "A rainbow table attack — store the keys salted" },
      { id: "c", text: "A cache stampede — coalesce the colliding lookups" },
      { id: "d", text: "A birthday attack — widen the hash output to 256 bits" },
    ],
    answer: "a",
    explanation:
      "Constant-time lookup is an average-case claim that assumes keys spread across buckets. Anyone who controls the keys can choose the worst case on purpose and turn every lookup into a linear scan. Random per-process seeding makes the buckets unpredictable; some implementations also convert a degenerate bucket into a tree, capping the damage at O(log n).",
    concepts: ["Hash flooding", "Average-case complexity", "Hash seed randomisation", "Collision resolution"],
    tags: ["security", "hash-tables"],
  },
  {
    id: "ds-struct-005",
    type: "matching",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 2,
    prompt:
      "Match each requirement to the data structure that satisfies it most directly.",
    pairs: [
      { left: "Take the item that has been waiting longest", right: "Queue" },
      { left: "Undo the most recent action", right: "Stack" },
      { left: "Always take the smallest remaining item", right: "Heap" },
      { left: "Walk the keys in sorted order", right: "Balanced binary search tree" },
      { left: "Test membership in constant time", right: "Hash set" },
    ],
    explanation:
      "What picks the structure is which operation has to be fast, not which one stores the data most naturally. A plain list can satisfy all five requirements; it just does four of them in linear time, which is fine until the collection stops being small.",
    concepts: ["Queue", "Stack", "Heap", "Balanced binary search tree"],
    tags: ["selection", "operations"],
  },
  {
    id: "ds-struct-006",
    type: "mcq",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 3,
    context:
      "A million integers are scanned front to back and summed. The linked-list version is several times slower than the array version, although both do O(n) work and exactly the same number of additions.",
    prompt: "Why is the linked list slower despite the identical asymptotic cost?",
    options: [
      {
        id: "a",
        text: "Its nodes are scattered in memory, so each step risks a cache miss instead of a prefetched sequential read",
      },
      { id: "b", text: "Dereferencing a pointer is a more expensive CPU instruction than indexing an array" },
      { id: "c", text: "Traversing a linked list is actually O(n^2)" },
      { id: "d", text: "The extra pointer field doubles the number of additions performed" },
    ],
    answer: "a",
    explanation:
      "Big-O counts operations and assumes each costs the same, which stopped being true once memory became far slower than the processor. An array is one contiguous block, so the prefetcher has the next cache line ready before you ask; linked nodes sit wherever the allocator put them, and a miss costs a hundred cycles. This is why a growable array beats a linked list for most real workloads.",
    concepts: ["Cache locality", "Cache miss", "Contiguous memory", "Prefetching"],
    tags: ["memory", "constants"],
  },
  {
    id: "ds-struct-007",
    type: "short",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 3,
    context:
      "Each entry is a node in a doubly linked list ordered by recency, and a hash map points from key straight to its node — so both lookup and moving a node to the front are constant time.",
    prompt: "Which cache eviction policy does this pair of structures implement?",
    answers: [
      "lru",
      "least recently used",
      "least-recently-used",
      "lru cache",
      "least recently used cache",
    ],
    typoTolerance: true,
    explanation:
      "Least recently used. Neither structure can do it alone: a hash map has no notion of order, and a linked list has no fast lookup. The map finds the node in O(1), and because you already hold the node you can unlink and re-link it in O(1). It is the canonical example of composing two structures to get the strong operation of each.",
    concepts: ["LRU cache", "Doubly linked list", "Hash map", "Cache eviction"],
    tags: ["lru", "composition"],
  },
  {
    id: "ds-struct-008",
    type: "multi",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 3,
    prompt:
      "Which requirements rule out a plain hash map? Select all that apply.",
    options: [
      { id: "a", text: "Return every key between two bounds" },
      { id: "b", text: "Iterate the keys in sorted order" },
      { id: "c", text: "Find the nearest key to a value that is not present" },
      { id: "d", text: "Look up a value by its exact key" },
      { id: "e", text: "Count how many distinct keys have been inserted" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Hashing destroys ordering on purpose — that is what buys the constant-time lookup. So any requirement mentioning order, range, or nearness needs a structure that preserves it: a balanced tree, a skip list, or a sorted array with binary search. Exact lookup and counting are precisely what a hash map is best at.",
    concepts: ["Hash map", "Balanced binary search tree", "Range query", "Skip list"],
    tags: ["ordering", "selection"],
  },
  {
    id: "ds-struct-009",
    type: "mcq",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 4,
    context:
      "A program repeatedly merges groups of items and asks whether two items are now in the same group. There are millions of each operation, and groups are never split apart again.",
    prompt:
      "Which structure answers 'are these in the same group?' and 'merge these groups' efficiently?",
    options: [
      { id: "a", text: "A disjoint-set (union-find) structure with path compression" },
      { id: "b", text: "A hash map from each item to a list of its group's members" },
      { id: "c", text: "An adjacency list with a breadth-first search per query" },
      { id: "d", text: "A balanced binary search tree keyed on group id" },
    ],
    answer: "a",
    explanation:
      "Union-find stores one parent pointer per item, so merging is a single pointer write and a membership test is two walks to a root — near constant once path compression flattens the trees. The alternatives pay linear cost per operation: merging member lists copies them, and a traversal per query rediscovers what the structure could have remembered. The catch is that a merge cannot be undone.",
    concepts: ["Disjoint-set union", "Path compression", "Union by rank", "Connected components"],
    tags: ["union-find", "graphs"],
  },
  {
    id: "ds-struct-010",
    type: "ordering",
    track: "dsa-concepts",
    topic: "structure-choice",
    difficulty: 2,
    prompt:
      "Put the steps of choosing a data structure for a workload in order.",
    items: [
      "Write down every operation the structure must support",
      "Estimate how often each operation runs, and at what size",
      "Rule out the structures that are too slow for the hottest operation",
      "Among those left, prefer the simplest and most cache-friendly",
      "Measure, because constant factors decide between close candidates",
    ],
    explanation:
      "The order matters because it stops you starting from a structure you already like — most wrong choices are made by picking first and discovering afterwards that some required operation is linear. The final step is what catches the array-versus-linked-list case, where the asymptotics agree and the hardware does not.",
    concepts: ["Access pattern", "Asymptotic analysis", "Cache locality", "Premature optimisation"],
    tags: ["method", "selection"],
  },
  {
    id: "ds-pat-005",
    type: "ordering",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 3,
    prompt: "Put the steps of solving a problem with a sliding window in order.",
    items: [
      "State the condition that makes a window valid, such as at most k distinct characters",
      "Extend the right edge by one element and fold it into the running state",
      "While the window is invalid, advance the left edge and undo that element's contribution",
      "Record the best window now that the window is valid again",
      "Repeat until the right edge has passed the end of the input",
    ],
    explanation:
      "This is linear rather than quadratic because each edge only ever moves right, so both pointers together take at most 2n steps however the loops nest. The step that goes wrong is the third: every piece of state added when the right edge moved has to be removable when the left edge passes it, which is why counts work and 'maximum so far' does not.",
    concepts: ["Sliding window", "Two pointers", "Loop invariant", "Aggregate analysis"],
    tags: ["sliding-window", "method"],
  },
  {
    id: "ds-pat-006",
    type: "short",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 3,
    context:
      "Tasks have dependencies. You need an order in which every task appears after everything it depends on, and you must detect the case where no such order exists.",
    prompt: "Which graph algorithm produces this ordering? (Two words.)",
    answers: [
      "topological sort",
      "topological sorting",
      "topological ordering",
      "topsort",
      "toposort",
    ],
    typoTolerance: true,
    explanation:
      "A topological sort, which exists exactly when the dependency graph is acyclic — so the algorithm that produces the order detects the impossible case for free. Kahn's algorithm repeatedly removes a node with no remaining dependencies; if nodes are left and none has zero in-degree, those nodes are the cycle. Build tools, schedulers, and migration runners are all this problem.",
    concepts: ["Topological sort", "Directed acyclic graph", "Kahn's algorithm", "Cycle detection"],
    tags: ["graphs", "dependencies"],
  },
  {
    id: "ds-pat-007",
    type: "multi",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 4,
    context:
      "A greedy algorithm takes the locally best option at each step and never reconsiders it.",
    prompt:
      "Which conditions must hold for a greedy algorithm to be provably correct? Select all that apply.",
    options: [
      {
        id: "a",
        text: "Every locally optimal choice is contained in some globally optimal solution",
      },
      { id: "b", text: "An optimal solution is built from optimal solutions to its subproblems" },
      { id: "c", text: "The input is sorted before the algorithm runs" },
      { id: "d", text: "The problem has overlapping subproblems" },
      { id: "e", text: "Every choice the algorithm makes can be reversed later" },
    ],
    answers: ["a", "b"],
    explanation:
      "The greedy choice property is the one that fails, and it fails silently — you get a plausible answer that is not optimal, which is why greedy needs a proof and dynamic programming does not. Overlapping subproblems is the signal for DP, not greedy: greedy works precisely when a subproblem never needs revisiting. Sorting is a common first step, not a condition.",
    concepts: ["Greedy algorithm", "Greedy choice property", "Optimal substructure", "Dynamic programming"],
    tags: ["greedy", "correctness"],
  },
  {
    id: "ds-pat-008",
    type: "mcq",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 3,
    context:
      "For every element of an array you need the next element to its right that is strictly greater. Scanning forward from each position is O(n^2).",
    prompt:
      "Which structure reduces 'next greater element' to a single linear pass?",
    options: [
      { id: "a", text: "A monotonic stack holding the indices whose answer is still unknown" },
      { id: "b", text: "A min-heap of the elements not yet visited" },
      { id: "c", text: "A prefix sum array built over the values" },
      { id: "d", text: "A hash map from each value to its index" },
    ],
    answer: "a",
    explanation:
      "Each index is pushed once and popped once, so the pass is linear even though one step can pop many entries — the same aggregate argument as the sliding window. When a larger element arrives it is the answer for every smaller index still waiting on the stack, so they resolve and leave. A heap would give you the global maximum, which is not what 'next to the right' asks.",
    concepts: ["Monotonic stack", "Next greater element", "Aggregate analysis", "Amortised analysis"],
    tags: ["stack", "linear-scan"],
  },
  {
    id: "ds-st-004",
    type: "multi",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 2,
    prompt:
      "Which of these spend memory to save time? Select all that apply.",
    options: [
      { id: "a", text: "Memoising the results of a pure function" },
      { id: "b", text: "Building an index over a table" },
      { id: "c", text: "Precomputing a lookup table of answers" },
      { id: "d", text: "Compressing data before storing it" },
      { id: "e", text: "Streaming a file instead of loading it into memory" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The last two run the trade the other way: they spend time to save memory, which is the direction you take when memory is the binding constraint. Naming which resource is actually scarce is what makes the choice obvious — without that step, teams optimise whichever one they happened to measure most recently.",
    concepts: ["Space-time trade-off", "Memoisation", "Precomputation", "Streaming algorithm"],
    tags: ["trade-offs", "direction"],
  },
  {
    id: "ds-st-005",
    type: "mcq",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 4,
    context:
      "A dynamic programming solution fills an n by m table, but each row depends only on the row directly above it. Both dimensions are large and the table does not fit in memory.",
    prompt:
      "How can this DP be made to fit in memory without changing its time complexity?",
    options: [
      {
        id: "a",
        text: "Keep only the previous and current rows, dropping space from O(n*m) to O(m)",
      },
      { id: "b", text: "Recompute each cell on demand instead of storing the table" },
      { id: "c", text: "Write the table to disk and page rows back in as needed" },
      { id: "d", text: "Switch from a bottom-up table to top-down recursion with memoisation" },
    ],
    answer: "a",
    explanation:
      "The dependency structure tells you exactly what you are allowed to forget: nothing ever reads two rows back, so the rest of the table is dead weight the moment its row is complete. Recomputing restores the exponential blow-up memoisation removed, and a top-down memo table holds the same entries — it just fills them in a different order.",
    concepts: ["Rolling array", "Dynamic programming", "Space optimisation", "Memoisation"],
    tags: ["dp", "space-optimisation"],
  },
  {
    id: "ds-st-006",
    type: "short",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 4,
    context:
      "A stream is far too large to store. You need an approximate count of how often each key has appeared, within a bounded error, in a fixed amount of memory that does not grow with the number of distinct keys.",
    prompt:
      "Which probabilistic structure gives approximate per-key frequencies in fixed space? (Three words.)",
    answers: [
      "count-min sketch",
      "count min sketch",
      "countmin sketch",
      "count-min",
      "count min",
    ],
    typoTolerance: true,
    explanation:
      "A count-min sketch keeps a small grid of counters, hashes each key to one counter per row, and takes the minimum on read. Collisions can only inflate a count, so the estimate is never too low — and that one-sided error is what makes it safe to act on. It is the frequency counterpart to a Bloom filter's membership and HyperLogLog's cardinality.",
    concepts: ["Count-min sketch", "Probabilistic data structure", "Frequency estimation", "One-sided error"],
    tags: ["sketches", "streaming"],
  },
  {
    id: "ds-st-007",
    type: "matching",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 3,
    prompt:
      "Match each probabilistic structure to the question it answers in tiny fixed space.",
    pairs: [
      { left: "Bloom filter", right: "Have I definitely never seen this key?" },
      { left: "HyperLogLog", right: "Roughly how many distinct keys are there?" },
      { left: "Count-min sketch", right: "Roughly how often has this key appeared?" },
      {
        left: "Reservoir sampling",
        right: "Give me a fair sample from a stream of unknown length",
      },
    ],
    explanation:
      "All four buy a fixed, tiny footprint by giving up exactness, and each gives it up in a known direction. A Bloom filter has false positives and never false negatives; a count-min sketch overestimates and never underestimates. Knowing which way the error leans is what tells you whether the answer is safe to act on.",
    concepts: ["Bloom filter", "HyperLogLog", "Count-min sketch", "Reservoir sampling"],
    tags: ["sketches", "approximation"],
  },
  {
    id: "ds-st-008",
    type: "ordering",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 3,
    prompt:
      "Put the stages of turning an exponential recursion into an efficient algorithm in order.",
    items: [
      "Write the plain recursion and confirm it produces correct answers",
      "Notice that the same subproblem is being recomputed many times",
      "Add memoisation, so each distinct subproblem is solved once",
      "Rewrite it bottom-up, filling a table in dependency order",
      "Drop the parts of the table that nothing will read again",
    ],
    explanation:
      "Each stage is mechanical once the one before it is done, which is why the progression is worth memorising: correctness first, then time, then space. Jumping straight to the bottom-up table is where people get stuck, because the fill order only becomes obvious after the recursion has shown you the dependencies.",
    concepts: ["Memoisation", "Tabulation", "Dynamic programming", "Rolling array"],
    tags: ["dp", "method"],
  },
];

export const track: Track = {
  id: "dsa-concepts",
  title: "DSA Concepts",
  blurb:
    "Complexity, structure choice, and pattern recognition — the talking-through-it layer, not the coding layer.",
  topics,
};

export { questions };
