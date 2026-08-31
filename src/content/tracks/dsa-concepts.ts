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
];

export const track: Track = {
  id: "dsa-concepts",
  title: "DSA Concepts",
  blurb:
    "Complexity, structure choice, and pattern recognition — the talking-through-it layer, not the coding layer.",
  topics,
};

export { questions };
