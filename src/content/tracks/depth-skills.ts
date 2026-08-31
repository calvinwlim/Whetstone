import type { Question } from "@/content/types";

/** Additional depth for the communication, DSA, and workplace topics that were
 *  thin after the first authoring pass. */
export const questions: Question[] = [
  // ---------- Explaining to different audiences ----------
  {
    id: "dp-aud-001",
    type: "mcq",
    track: "communication",
    topic: "audience",
    difficulty: 3,
    context:
      "A VP asks why the migration you are proposing will take six weeks.",
    prompt:
      "Which opening is most likely to get the decision you want?",
    options: [
      {
        id: "a",
        text: "What the six weeks buys and what the risk is of not doing it, then detail only if asked",
      },
      { id: "b", text: "A walkthrough of the technical steps that make up the six weeks" },
      { id: "c", text: "An explanation of the legacy system's design flaws" },
      { id: "d", text: "A comparison of the three approaches you considered" },
    ],
    answer: "a",
    explanation:
      "An executive is deciding whether to fund and when to expect it, so lead with outcome and risk. The technical breakdown is your evidence, not your argument — offer it, do not open with it. Alternatives matter to reviewers of the design, not to the person approving the time.",
    concepts: ["Executive communication", "Risk framing", "Abstraction level"],
    tags: ["executives"],
  },
  {
    id: "dp-aud-002",
    type: "mcq",
    track: "communication",
    topic: "audience",
    difficulty: 3,
    context:
      "You are onboarding an engineer to a service you own. You have one hour.",
    prompt:
      "What should you cover first when onboarding an engineer to your service?",
    options: [
      {
        id: "a",
        text: "The invariants the system must maintain and where it is easy to break them",
      },
      { id: "b", text: "The full history of how the design evolved" },
      { id: "c", text: "A file-by-file tour of the repository" },
      { id: "d", text: "The deployment pipeline configuration" },
    ],
    answer: "a",
    explanation:
      "A new engineer's first real risk is breaking something they did not know mattered. Invariants and sharp edges are the highest-value hour. They can read the file layout themselves; they cannot infer which assumptions the code silently depends on.",
    concepts: ["Onboarding", "System invariants", "Knowledge transfer"],
    tags: ["onboarding"],
  },
  {
    id: "dp-aud-003",
    type: "multi",
    track: "communication",
    topic: "audience",
    difficulty: 4,
    prompt:
      "Which habits make a technical explanation land with a non-technical listener? Select all that apply.",
    options: [
      { id: "a", text: "Leading with the consequence before the mechanism" },
      { id: "b", text: "Naming where an analogy stops being accurate" },
      { id: "c", text: "Checking whether the level of detail is useful" },
      { id: "d", text: "Using precise internal terminology so nothing is oversimplified" },
      { id: "e", text: "Covering every edge case to avoid being misleading" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Consequence first earns attention, analogy limits prevent confident misunderstanding, and checking in prevents the whole conversation missing. Insisting on internal vocabulary and exhaustive edge cases is precision aimed at yourself rather than the listener — it feels rigorous and transfers nothing.",
    concepts: ["Technical translation", "Analogy", "Jargon"],
    tags: ["translation"],
  },
  {
    id: "dp-aud-004",
    type: "mcq",
    track: "communication",
    topic: "audience",
    difficulty: 4,
    context:
      "Support asks what they should tell customers during a partial outage of your service.",
    prompt: "What do they actually need from you?",
    options: [
      {
        id: "a",
        text: "Which user-visible behaviours are affected, and what to advise, in the customer's language",
      },
      { id: "b", text: "The root cause and the current state of the fix" },
      { id: "c", text: "A link to the incident channel so they can follow along" },
      { id: "d", text: "The error rate and affected service names" },
    ],
    answer: "a",
    explanation:
      "Support's job is to set expectations for people who do not know your service names. Symptoms and advice are directly usable; root cause and error rates require translation they should not have to do mid-conversation. Pointing them at the incident channel outsources the translation entirely.",
    concepts: ["Incident communication", "User-visible impact", "Support enablement"],
    tags: ["support", "incidents"],
  },
  {
    id: "dp-aud-005",
    type: "short",
    track: "communication",
    topic: "audience",
    difficulty: 2,
    context:
      "You describe a queue as being like a line at a shop. The listener then asks a question the analogy cannot answer correctly.",
    prompt:
      "What should you have stated when you introduced the analogy? (One word: its ____.)",
    answers: ["limits", "limit", "boundaries", "boundary", "limitations"],
    typoTolerance: true,
    explanation:
      "Its limits. An analogy builds a mental model fast and the listener will keep extending it after you stop talking. Saying where it breaks — \"like a queue, except the same person can be served twice\" — pre-empts exactly the confident wrong conclusion.",
    concepts: ["Analogy", "Abstraction leak"],
    tags: ["analogies"],
  },

  // ---------- Disagreeing well ----------
  {
    id: "dp-dis-001",
    type: "ordering",
    track: "communication",
    topic: "disagreement",
    difficulty: 3,
    prompt: "Order the steps of raising a technical objection effectively.",
    items: [
      "Restate the proposal and its genuine benefit",
      "Name the specific scenario where it fails",
      "State how strongly you hold the position",
      "Propose what you would do instead",
      "Say what evidence would change your mind",
    ],
    explanation:
      "Steelmanning first earns the right to object. A concrete failure scenario is checkable where a general worry is not. Stating confidence lets others weight your input, and naming your own falsifier turns a standoff into something the team can actually resolve.",
    concepts: ["Steelmanning", "Falsifiable claim", "Confidence calibration"],
    tags: ["structure"],
  },
  {
    id: "dp-dis-002",
    type: "mcq",
    track: "communication",
    topic: "disagreement",
    difficulty: 4,
    context:
      "A senior engineer dismisses your concern without engaging with the scenario you raised.",
    prompt: "What is the most productive next move?",
    options: [
      {
        id: "a",
        text: "Ask directly how the proposal handles that specific scenario",
      },
      { id: "b", text: "Defer, since they have more context than you" },
      { id: "c", text: "Escalate to your manager" },
      { id: "d", text: "Restate the concern more forcefully" },
    ],
    answer: "a",
    explanation:
      "A specific question is hard to wave away and easy to answer if they have already thought about it. It also distinguishes the two possibilities: they may have context you lack, or they may not have considered it. Deferring loses the information, and volume does not add evidence.",
    concepts: ["Specific questioning", "Constructive disagreement"],
    tags: ["seniority", "pushback"],
  },
  {
    id: "dp-dis-003",
    type: "mcq",
    track: "communication",
    topic: "disagreement",
    difficulty: 4,
    prompt: "When is escalating a technical disagreement appropriate?",
    options: [
      {
        id: "a",
        text: "When the decision is consequential and hard to reverse, and the team is genuinely stuck",
      },
      { id: "b", text: "Whenever you are confident you are correct" },
      { id: "c", text: "As soon as a discussion runs longer than expected" },
      { id: "d", text: "Never — escalation always damages relationships" },
    ],
    answer: "a",
    explanation:
      "Escalation spends credibility, so save it for decisions where being wrong is expensive and difficult to undo. Reversible decisions are usually better settled by trying one and watching. Refusing to ever escalate is its own failure — some calls genuinely need a wider view.",
    concepts: ["Escalation", "Reversible decision", "Credibility"],
    tags: ["escalation"],
  },
  {
    id: "dp-dis-004",
    type: "mcq",
    track: "communication",
    topic: "disagreement",
    difficulty: 3,
    context:
      "You strongly prefer one database, a colleague prefers another, and the discussion has been going in circles for twenty minutes.",
    prompt: "What most likely unsticks it?",
    options: [
      {
        id: "a",
        text: "Identify a requirement that distinguishes them and check it, turning preference into evidence",
      },
      { id: "b", text: "Take a team vote to settle it" },
      { id: "c", text: "Defer to whoever will maintain it" },
      { id: "d", text: "Pick one and revisit in six months" },
    ],
    answer: "a",
    explanation:
      "Circular arguments are usually preference arguments with no resolution path. Finding a checkable requirement — does it need cross-table transactions, what is the write volume — converts it into a question with an answer. Voting settles it without anyone learning why.",
    concepts: ["Preference versus evidence", "Decision criteria"],
    tags: ["resolution"],
  },

  // ---------- Scoping ----------
  {
    id: "dp-scope-001",
    type: "mcq",
    track: "communication",
    topic: "scoping",
    difficulty: 4,
    context:
      "Ten minutes into a design interview you realise the problem is far broader than the time allows.",
    prompt:
      "What is the right move when a design problem is broader than the time allows?",
    options: [
      {
        id: "a",
        text: "Name the full scope, then say which part you will design and why that part matters most",
      },
      { id: "b", text: "Cover everything at a shallow level to show breadth" },
      { id: "c", text: "Design the part you know best without comment" },
      { id: "d", text: "Ask the interviewer to pick which part to cover" },
    ],
    answer: "a",
    explanation:
      "Showing you can see the whole problem and then deliberately bound it is the signal being tested — that is what scoping is. Shallow breadth demonstrates nothing in depth, and silently designing your favourite part looks like you missed the rest. Handing the choice over skips the judgement call.",
    concepts: ["Scoping", "Depth over breadth", "Design interview framework"],
    tags: ["scoping", "interviews"],
  },
  {
    id: "dp-scope-002",
    type: "short",
    track: "communication",
    topic: "scoping",
    difficulty: 3,
    context:
      "A service handles 4 million requests per day, spread evenly.",
    prompt:
      "Roughly how many requests per second is that? (Number only, to the nearest ten.)",
    answers: ["46", "50", "45", "46.3", "40"],
    typoTolerance: false,
    explanation:
      "About 46 — there are 86,400 seconds in a day, so a useful shortcut is that one million per day is roughly 12 per second. Peak is typically two to three times the average, so plan for well over a hundred.",
    concepts: ["Back-of-the-envelope estimation", "Requests per second", "Peak load"],
    tags: ["estimation"],
  },
  {
    id: "dp-scope-003",
    type: "multi",
    track: "communication",
    topic: "scoping",
    difficulty: 4,
    prompt:
      "Which non-functional requirements most change an architecture? Select all that apply.",
    options: [
      { id: "a", text: "The latency target for the critical read path" },
      { id: "b", text: "Whether users must see their own writes immediately" },
      { id: "c", text: "How long data must be retained" },
      { id: "d", text: "The availability target" },
      { id: "e", text: "The team's preferred programming language" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Latency forces precomputation or caching, read-your-writes forces routing decisions, retention drives storage tiering and cost, and availability drives redundancy and failover. Language choice changes what the code looks like, not the shape of the system.",
    concepts: ["Non-functional requirements", "Latency budget", "Data retention"],
    tags: ["requirements"],
  },

  // ---------- Structuring ----------
  {
    id: "dp-struct-001",
    type: "mcq",
    track: "communication",
    topic: "structuring",
    difficulty: 3,
    context:
      "You are twenty minutes into a design and realise you are deep in a detail that is not the most important part left.",
    prompt:
      "What should you do on realising you are deep in a low-priority detail?",
    options: [
      {
        id: "a",
        text: "Say you are moving on, note what you would return to, and switch to the higher-value area",
      },
      { id: "b", text: "Finish the detail properly before moving on" },
      { id: "c", text: "Move on silently to save time" },
      { id: "d", text: "Ask whether the interviewer wants more detail here" },
    ],
    answer: "a",
    explanation:
      "Managing your own time out loud is a positive signal, and flagging what you are deferring shows you are choosing rather than forgetting. Moving silently reads as losing your thread, and finishing a low-value detail because you started it is the sunk cost fallacy in real time.",
    concepts: ["Timeboxing", "Signposting", "Time management"],
    tags: ["timeboxing"],
  },
  {
    id: "dp-struct-002",
    type: "mcq",
    track: "communication",
    topic: "structuring",
    difficulty: 3,
    prompt:
      "What should you cover in the last two minutes of a system design interview?",
    options: [
      {
        id: "a",
        text: "What you built, the main tradeoff you accepted, and what you would do next",
      },
      { id: "b", text: "Any remaining components you did not get to" },
      { id: "c", text: "A recap of the requirements you gathered at the start" },
      { id: "d", text: "The alternatives you rejected early on" },
    ],
    answer: "a",
    explanation:
      "The close is the last thing the interviewer hears and often what they write down. A summary plus a named tradeoff plus a next step demonstrates you know what you built and what it cost. Trailing off, or listing what you did not reach, wastes the strongest moment you have.",
    concepts: ["Summarising", "Trade-off articulation", "Closing"],
    tags: ["closing"],
  },
  {
    id: "dp-struct-003",
    type: "mcq",
    track: "communication",
    topic: "structuring",
    difficulty: 4,
    context:
      "An interviewer interrupts your explanation with a question about something you planned to cover later.",
    prompt:
      "How should you respond when an interviewer jumps ahead to a later topic?",
    options: [
      {
        id: "a",
        text: "Answer briefly now, and say you will expand when you reach that section",
      },
      { id: "b", text: "Ask them to hold the question until you get there" },
      { id: "c", text: "Abandon your plan and go deep on their question" },
      { id: "d", text: "Answer in full detail immediately" },
    ],
    answer: "a",
    explanation:
      "An interruption is usually a signal about what they care about, so ignoring it is a mistake — but so is abandoning your structure every time one arrives. A short answer plus a commitment to return respects both their question and your plan, and keeps you in control of the time.",
    concepts: ["Interruption handling", "Signposting"],
    tags: ["interruptions"],
  },

  // ---------- Defending a tradeoff ----------
  {
    id: "dp-trade-001",
    type: "mcq",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 4,
    context:
      "You are asked why you chose a managed service over building the component yourself.",
    prompt: "What makes the strongest answer?",
    options: [
      {
        id: "a",
        text: "The cost you avoid, what you give up in control, and the condition under which you would build it",
      },
      { id: "b", text: "That managed services are industry best practice" },
      { id: "c", text: "That building it would take too long" },
      { id: "d", text: "That the team lacks expertise in that area" },
    ],
    answer: "a",
    explanation:
      "Naming what you gave up is what makes a choice read as reasoned rather than defaulted into. Adding the condition that would flip the decision — cost at scale, a capability the service lacks — shows you know the boundary of your own answer, which is the thing actually being probed.",
    concepts: ["Build versus buy", "Trade-off analysis", "Decision boundary"],
    tags: ["build-vs-buy"],
  },
  {
    id: "dp-trade-002",
    type: "mcq",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 4,
    context:
      "An interviewer says: \"That will not scale.\" You believe it will, at the scale you established earlier.",
    prompt:
      "How should you answer 'that will not scale' when you believe it will?",
    options: [
      {
        id: "a",
        text: "Restate the numbers you are designing for and show the maths, then ask what scale they have in mind",
      },
      { id: "b", text: "Redesign for a larger scale to be safe" },
      { id: "c", text: "Agree and move on to avoid friction" },
      { id: "d", text: "Explain that premature optimisation is a mistake" },
    ],
    answer: "a",
    explanation:
      "You already agreed the requirements, so the productive move is to make your reasoning checkable and find out whether they are testing your arithmetic or introducing a new constraint. Redesigning immediately abandons the requirements you scoped; agreeing without engaging discards your own analysis.",
    concepts: ["Capacity estimation", "Requirements grounding", "Defending a design"],
    tags: ["defending"],
  },
  {
    id: "dp-trade-003",
    type: "multi",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 4,
    prompt:
      "Which statements demonstrate senior judgement about a design decision? Select all that apply.",
    options: [
      { id: "a", text: "Naming the cost of the option you chose, unprompted" },
      { id: "b", text: "Stating the condition under which you would choose differently" },
      { id: "c", text: "Admitting a number you are unsure of and how you would verify it" },
      { id: "d", text: "Presenting the choice as the obvious industry standard" },
      { id: "e", text: "Avoiding commitment until you know the interviewer's preference" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "All three show you understand the shape of your own decision rather than having recalled a default. Appealing to industry standard skips the reasoning entirely, and waiting to read the room avoids demonstrating judgement, which is the only thing the question is measuring.",
    concepts: ["Confidence calibration", "Decision boundary", "Intellectual honesty"],
    tags: ["judgement"],
  },

  // ---------- Space/time tradeoffs ----------
  {
    id: "dp-st-001",
    type: "mcq",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 3,
    context:
      "A function is called repeatedly with the same arguments and recomputes an expensive pure result each time.",
    prompt: "What is the trade being made by caching the results?",
    options: [
      {
        id: "a",
        text: "Memory proportional to distinct inputs, in exchange for eliminating repeat computation",
      },
      { id: "b", text: "Computation time, in exchange for less memory" },
      { id: "c", text: "Accuracy, in exchange for speed" },
      { id: "d", text: "No trade — memoisation is free" },
    ],
    answer: "a",
    explanation:
      "Memoisation stores one entry per distinct input, so the memory cost scales with the input space rather than the call count. It is only valid for pure functions, and unbounded caches are a slow memory leak — which is why production versions have an eviction policy.",
    concepts: ["Memoisation", "Pure function", "Cache eviction"],
    tags: ["memoisation"],
  },
  {
    id: "dp-st-002",
    type: "mcq",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 4,
    context:
      "You must count distinct visitors across billions of events, and a small error margin is acceptable.",
    prompt: "What approach fits the memory constraint?",
    options: [
      {
        id: "a",
        text: "A probabilistic cardinality estimator such as HyperLogLog, using kilobytes instead of storing every id",
      },
      { id: "b", text: "A hash set of every visitor id seen" },
      { id: "c", text: "Sorting the events and counting adjacent duplicates" },
      { id: "d", text: "A Bloom filter, which returns an exact count" },
    ],
    answer: "a",
    explanation:
      "HyperLogLog estimates cardinality in a fixed, tiny amount of memory with a known error rate, and merges across shards cleanly. A hash set is exact and grows with the data. A Bloom filter answers membership, not cardinality — it cannot produce a count.",
    concepts: ["HyperLogLog", "Cardinality estimation", "Probabilistic data structure"],
    tags: ["hyperloglog", "approximation"],
  },
  {
    id: "dp-st-003",
    type: "mcq",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 4,
    context:
      "A prefix sum array makes range queries O(1), but the underlying values are now updated frequently.",
    prompt: "What breaks, and what is the usual answer?",
    options: [
      {
        id: "a",
        text: "Each update invalidates every prefix after it — use a Fenwick or segment tree for O(log n) updates and queries",
      },
      { id: "b", text: "Nothing — prefix sums handle updates in constant time" },
      { id: "c", text: "Queries become O(n); rebuild the array on each read" },
      { id: "d", text: "The array must be re-sorted after each update" },
    ],
    answer: "a",
    explanation:
      "Precomputation assumes the inputs hold still. Once writes are frequent, the O(n) rebuild per update dominates. A Fenwick (binary indexed) tree or segment tree balances both sides at O(log n), which is the standard answer whenever a range-query problem adds updates.",
    concepts: ["Fenwick tree", "Segment tree", "Prefix sum"],
    tags: ["precomputation", "fenwick"],
  },
  {
    id: "dp-st-004",
    type: "short",
    track: "dsa-concepts",
    topic: "space-time",
    difficulty: 3,
    context:
      "A structure answers \"definitely not present\" or \"possibly present\" using a bit array and several hash functions, in a fraction of the memory of a real set.",
    prompt: "What is it called? (Two words.)",
    answers: ["bloom filter", "bloom-filter", "a bloom filter", "bloomfilter"],
    typoTolerance: true,
    explanation:
      "A Bloom filter. It never produces a false negative, which is what makes it safe as a pre-check in front of an expensive lookup — a negative is definitive, and a positive just means you do the real query.",
    concepts: ["Bloom filter", "False positive", "Probabilistic data structure"],
    tags: ["bloom-filter"],
  },

  // ---------- Algorithmic patterns ----------
  {
    id: "dp-pat-001",
    type: "matching",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 4,
    prompt: "Match each problem signal to the pattern it suggests.",
    pairs: [
      { left: "Longest contiguous run satisfying a constraint", right: "Sliding window" },
      { left: "Pair summing to a target in a sorted array", right: "Two pointers" },
      { left: "Minimum value for which a condition holds", right: "Binary search on the answer" },
      { left: "Shortest path in an unweighted graph", right: "Breadth-first search" },
      { left: "Repeatedly needing the k largest so far", right: "Heap of size k" },
    ],
    explanation:
      "Naming the pattern out loud is most of the signal in a phone screen — it shows you recognised the shape before writing anything. The tells are quite reliable: contiguous suggests a window, sorted-and-pairwise suggests pointers, monotonic feasibility suggests binary search.",
    concepts: ["Sliding window", "Two pointers", "Binary search on the answer"],
    tags: ["recognition"],
  },
  {
    id: "dp-pat-002",
    type: "mcq",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 4,
    context:
      "You must detect whether a linked list contains a cycle, using constant extra space.",
    prompt:
      "Which technique detects a cycle in a linked list using constant space?",
    options: [
      {
        id: "a",
        text: "Fast and slow pointers — they meet inside a cycle and the fast one exits if there is none",
      },
      { id: "b", text: "A hash set of visited nodes" },
      { id: "c", text: "Sorting the nodes by address" },
      { id: "d", text: "Binary search over the list length" },
    ],
    answer: "a",
    explanation:
      "Two pointers moving at different speeds must eventually meet if the list loops, and the fast one reaches the end if it does not — all in O(1) space. A hash set solves it in O(n) time too, but uses O(n) memory, which the constraint rules out.",
    concepts: ["Fast and slow pointers", "Cycle detection", "Floyd cycle detection"],
    tags: ["fast-slow-pointers"],
  },
  {
    id: "dp-pat-003",
    type: "mcq",
    track: "dsa-concepts",
    topic: "patterns",
    difficulty: 4,
    context:
      "A problem asks for all valid combinations satisfying a constraint, not just the count.",
    prompt: "Which approach is the natural fit?",
    options: [
      {
        id: "a",
        text: "Backtracking — build candidates incrementally and abandon partial ones that cannot succeed",
      },
      { id: "b", text: "Dynamic programming over the count" },
      { id: "c", text: "A greedy scan taking the best local option" },
      { id: "d", text: "Binary search over the solution space" },
    ],
    answer: "a",
    explanation:
      "Enumerating actual solutions rather than counting them is the backtracking signal, and pruning invalid partial candidates early is what keeps it tractable. DP is the right tool when you need a count or an optimum but not the solutions themselves, and greedy fails whenever a locally best choice can rule out a valid combination.",
    concepts: ["Backtracking", "Pruning", "Combinatorial search"],
    tags: ["backtracking"],
  },

  // ---------- Design docs ----------
  {
    id: "dp-doc-001",
    type: "ordering",
    track: "workplace",
    topic: "design-docs",
    difficulty: 3,
    prompt: "Order the sections of a design doc so a reader can evaluate it.",
    items: [
      "The problem and why it matters now",
      "Constraints and non-goals",
      "The proposed approach",
      "Alternatives considered and why they were rejected",
      "Risks and the tradeoffs accepted",
      "Open questions and the decision deadline",
    ],
    explanation:
      "Readers cannot evaluate an approach before they know the problem and the constraints, and they cannot trust it without seeing the alternatives. Ending with open questions and a deadline is what turns a document into a decision rather than a broadcast.",
    concepts: ["Design document", "Non-goals", "Alternatives considered"],
    tags: ["structure"],
  },
  {
    id: "dp-doc-002",
    type: "mcq",
    track: "workplace",
    topic: "design-docs",
    difficulty: 4,
    context:
      "A design doc lists three alternatives, each dismissed in one line as 'does not scale'.",
    prompt:
      "What is the problem with alternatives each dismissed in a single line?",
    options: [
      {
        id: "a",
        text: "Strawmanned alternatives undermine the whole document — a reader cannot tell whether they were seriously considered",
      },
      { id: "b", text: "Three alternatives is too many to include" },
      { id: "c", text: "Alternatives should be listed without judgement" },
      { id: "d", text: "Nothing — brevity is a virtue in design docs" },
    ],
    answer: "a",
    explanation:
      "The alternatives section exists to prove the decision was made rather than defaulted into. A one-line dismissal proves the opposite, and it invites exactly the reviewer who will reopen the option you thought you had closed. Each rejection needs a specific, checkable reason.",
    concepts: ["Strawman argument", "Alternatives considered", "Design review"],
    tags: ["alternatives"],
  },
  {
    id: "dp-doc-003",
    type: "mcq",
    track: "workplace",
    topic: "design-docs",
    difficulty: 3,
    prompt: "What is the purpose of a non-goals section?",
    options: [
      {
        id: "a",
        text: "It bounds the review, stopping discussion of things this work deliberately does not address",
      },
      { id: "b", text: "It lists features cut for time and planned for later" },
      { id: "c", text: "It records requirements the team disagreed about" },
      { id: "d", text: "It documents what the previous system failed to do" },
    ],
    answer: "a",
    explanation:
      "Without non-goals, review meetings expand to fill every adjacent concern anyone can think of. Writing \"this does not address multi-region failover\" closes that thread before it opens. It is about scope, not a backlog of deferred features.",
    concepts: ["Non-goals", "Scope creep"],
    tags: ["non-goals", "scope"],
  },
  {
    id: "dp-doc-004",
    type: "mcq",
    track: "workplace",
    topic: "design-docs",
    difficulty: 4,
    context:
      "Six months after a decision, nobody remembers why an unusual approach was chosen, and someone proposes reverting it.",
    prompt: "What should the original document have recorded?",
    options: [
      {
        id: "a",
        text: "The constraints in force at the time, so a reader can check whether they still hold",
      },
      { id: "b", text: "More detail about the implementation" },
      { id: "c", text: "The names of everyone who approved it" },
      { id: "d", text: "A longer list of alternatives" },
    ],
    answer: "a",
    explanation:
      "The conclusion alone ages badly, because the reader cannot tell whether it is still right. Recording the constraints makes the decision re-evaluable: if they have changed, reverting may be correct, and if they have not, the question is settled without relitigating it.",
    concepts: ["Architecture decision record", "Design rationale", "Constraints"],
    tags: ["decision-records"],
  },

  // ---------- Incidents ----------
  {
    id: "dp-inc-001",
    type: "mcq",
    track: "workplace",
    topic: "incidents",
    difficulty: 3,
    context:
      "An incident is ongoing and stakeholders keep interrupting the responders to ask for status.",
    prompt:
      "How do you keep stakeholder status requests from interrupting incident responders?",
    options: [
      {
        id: "a",
        text: "Post updates on a fixed schedule, including when there is nothing new",
      },
      { id: "b", text: "Ask stakeholders to stop interrupting until it is resolved" },
      { id: "c", text: "Add the stakeholders to the debugging channel" },
      { id: "d", text: "Assign a responder to answer questions as they arrive" },
    ],
    answer: "a",
    explanation:
      "People interrupt because they do not know when they will next hear something. A predictable cadence — even \"still investigating, next update in 15 minutes\" — removes the reason to ask. Silence generates more interruptions than any update, and answering ad hoc consumes a responder.",
    concepts: ["Incident communication", "Status cadence", "Stakeholder management"],
    tags: ["communication"],
  },
  {
    id: "dp-inc-002",
    type: "multi",
    track: "workplace",
    topic: "incidents",
    difficulty: 4,
    prompt:
      "What makes a postmortem action item likely to actually happen? Select all that apply.",
    options: [
      { id: "a", text: "A named owner" },
      { id: "b", text: "A due date" },
      { id: "c", text: "Being tracked where the team's other work lives" },
      { id: "d", text: "Being one of many items for thoroughness" },
      { id: "e", text: "Being phrased as a principle to keep in mind" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Owner, date, and visibility in the normal backlog are what turn an intention into work. A long list dilutes attention until none of it happens, and \"be more careful\" is not an action — it is a wish with no completion criterion.",
    concepts: ["Postmortem action item", "Ownership", "Follow-through"],
    tags: ["postmortem", "follow-up"],
  },
  {
    id: "dp-inc-003",
    type: "mcq",
    track: "workplace",
    topic: "incidents",
    difficulty: 4,
    context:
      "During an incident you notice a second, unrelated bug.",
    prompt:
      "What should you do with an unrelated bug you notice during an incident?",
    options: [
      {
        id: "a",
        text: "Write it down and keep going — fixing unrelated things mid-incident adds risk and confuses the timeline",
      },
      { id: "b", text: "Fix it immediately while you are already in the code" },
      { id: "c", text: "Stop the incident response and assess which is worse" },
      { id: "d", text: "Ignore it, since it is not causing the outage" },
    ],
    answer: "a",
    explanation:
      "Every change during an incident is a variable, and an unrelated fix makes it harder to tell what actually resolved things — and can cause a second incident inside the first. Capture it and move on. Ignoring it entirely loses information you will not recover later.",
    concepts: ["Incident discipline", "Change control", "Scope containment"],
    tags: ["discipline", "scope"],
  },
];
