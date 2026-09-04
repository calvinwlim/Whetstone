import type { Question, Track, Topic } from "@/content/types";

const topics: Topic[] = [
  {
    id: "scoping",
    track: "communication",
    title: "Scoping the Problem",
    blurb: "The first five minutes, where most design interviews are won or lost.",
    lesson: `"Design Twitter" is not a question, it is an invitation to ask questions. Candidates who start drawing boxes immediately are answering a problem nobody posed, and it is the most common way a strong engineer produces a weak interview.

**Establish scale before architecture.** Ten thousand users and ten million users are different systems. Ask for daily active users, read/write ratio, and payload size, then do the arithmetic out loud — 10M DAU each posting once a day is roughly 115 writes per second, and reads at 100:1 make 11,500 reads per second. That number is what justifies every later decision, and stating it converts opinion into reasoning.

**Cut scope explicitly.** "I'll design the posting and timeline read paths, and treat search and notifications as out of scope unless you want them" shows judgement and buys you time to go deep. Interviewers rarely want breadth; they want to see one thing designed properly.

**Name the non-functional requirements.** Latency target, availability target, consistency needs, retention. These decide the architecture more than the features do — "must serve a timeline in under 200ms" forces precomputation, and saying so makes your fan-out-on-write decision obvious rather than arbitrary.

**Write assumptions down** where the interviewer can see them. It makes them correctable, and an interviewer correcting an assumption early is the cheapest feedback you will get.

The underlying signal: can you turn an ambiguous request into a bounded problem? That is the job, at work and in the interview.`,
    resources: [
      {
        label: "Hello Interview — System design in a hurry",
        url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
      },
    ],
  },
  {
    id: "structuring",
    track: "communication",
    title: "Structuring an Answer",
    blurb: "Making an hour of thinking easy for someone else to follow.",
    lesson: `An unstructured answer is judged as an unstructured mind, even when the content is right. Structure is not decoration; it is how the listener keeps up.

**Signpost before you speak.** "I'll cover requirements, then the high-level design, then go deep on the data model, then failure modes." Now the interviewer knows where you are and stops worrying that you have forgotten something — they will simply wait, because you told them it is coming.

**Top-down, always.** Give the shape first, then fill it in. "Three components: an ingest API, a fan-out worker, and a timeline store" lands far better than narrating your way to the same place over four minutes. If you are interrupted at any point, a top-down answer has already delivered its most valuable part.

**State the decision, then the reason.** "I'd use a queue here, because the write path shouldn't block on fan-out" is one sentence and complete. Reasoning that wanders toward a conclusion makes the listener hold everything in memory while waiting to learn what it was for.

**Timebox out loud.** "I've spent long enough on the data model, let me move to failure modes" shows you are managing the clock rather than being managed by it.

**Land the plane.** Close with a summary: what you built, the main tradeoff you accepted, and what you would do next with more time. Trailing off at the end erases a good middle.

The same structure works in a design review or a standup. It is a general communication skill that interviews happen to test.`,
    resources: [
      {
        label: "The Pyramid Principle (overview)",
        url: "https://en.wikipedia.org/wiki/The_Pyramid_Principle",
      },
    ],
  },
  {
    id: "tradeoffs",
    track: "communication",
    title: "Defending a Tradeoff",
    blurb: "Holding a position under questioning without digging in or caving.",
    lesson: `Senior signal is not picking the right answer. It is knowing what you gave up and being able to say so.

**Every decision has a cost. Name it unprompted.** "I'm choosing eventual consistency for the feed — the tradeoff is a user might briefly not see their own post, so I'll add read-your-writes for the author specifically." That single sentence demonstrates you understand the failure your choice introduces and have already handled it.

**Distinguish pushback from disagreement.** When an interviewer asks "why not X?", they are usually probing whether you considered X, not asserting X is better. Answer the probe: "X would work; I chose Y because our read/write ratio is 100:1 and X optimises writes. If writes dominated, I'd switch." You have now shown the boundary of your own decision, which is the actual thing being tested.

**Change your mind for a reason, not for pressure.** Caving the moment you are questioned reads as having had no reason to begin with. Refusing to update when given new information reads as worse. The distinguishing question is always: *has anything changed about the constraints?* If yes, update and say why. If no, hold and say why.

**"It depends" is only acceptable with the dependency attached.** "It depends on whether we need cross-region writes — if we do, multi-leader; if not, leader-follower is simpler." Naked "it depends" sounds like avoidance.

**Admit unknowns cleanly.** "I don't know the exact throughput of that engine; my estimate assumes low thousands of writes per second, and I'd verify before committing." Confidence about the wrong thing is far more damaging than a stated gap.`,
    resources: [
      {
        label: "Designing Data-Intensive Applications",
        url: "https://dataintensive.net/",
      },
    ],
  },
  {
    id: "audience",
    track: "communication",
    title: "Explaining to Different Audiences",
    blurb: "Same system, four listeners, four correct explanations.",
    lesson: `The most common failure in technical communication is a technically correct explanation aimed at the wrong person.

**Match the abstraction to the decision they own.** An engineer joining your team needs interfaces and invariants. A product manager needs what it enables and what it costs in time. An executive needs risk, money, and timeline. Support needs what breaks and what to tell users. Same system, four different true explanations — and giving the PM the engineer's version is not thoroughness, it is a failure to translate.

**Lead with the consequence.** "This migration will take three weeks and freezes schema changes during it" earns the attention that a description of the migration mechanism does not. People decide whether to keep listening based on your first sentence.

**Analogies buy comprehension and cost precision.** They are excellent for building a first mental model and dangerous when the listener extends them past the point where they hold. Say where the analogy breaks: "it's like a queue at a shop, except the queue can duplicate people."

**Jargon is a shortcut only between people who share it.** Inside your team, "we'll denormalise the read path" is efficient and clear. Outside it, the same phrase transfers nothing while signalling that you have not thought about your listener.

**Check, don't assume.** "Does that level of detail work, or would it help to go deeper?" costs five seconds and prevents the entire rest of the conversation from missing. In a remote meeting where you cannot read faces, this is close to mandatory.`,
    resources: [
      {
        label: "Google — Technical writing courses",
        url: "https://developers.google.com/tech-writing",
      },
    ],
  },
  {
    id: "disagreement",
    track: "communication",
    title: "Disagreeing Well",
    blurb: "Changing an outcome without damaging the relationship.",
    lesson: `Disagreement is most of the value a senior engineer adds, and the way it is delivered decides whether it lands or costs you influence.

**Separate the idea from the person.** "This approach has a failure mode under partition" is about the design. "You didn't think about partitions" is about the author, and it converts a technical conversation into a defensive one.

**Steelman first.** "If I understand it, you're choosing multi-leader so European writes stay local — that's a real benefit." Demonstrating you understood the proposal before objecting is what buys you the right to object. Skipping it means the rest of your argument is heard as not having read the document.

**Argue from consequences, not preference.** "I prefer Postgres" invites a preference war. "We'd need cross-table transactions for the billing flow, which this store doesn't support" is checkable, and checkable claims resolve.

**Calibrate your strength of opinion explicitly.** "Weak preference, happy either way" and "I think this is a serious mistake and want to escalate if we proceed" are both useful, and being unclear which one you mean wastes everyone's time. Teams work far better when people state confidence honestly.

**Disagree and commit, genuinely.** If the decision goes the other way, support it — and note the specific thing that would change your mind: "I think the write throughput will be the constraint; let's revisit if we cross 5k writes per second." That converts a lost argument into a tripwire, which is more valuable than winning.

**Escalate on principle, not on emotion.** Escalation is appropriate for consequential, hard-to-reverse decisions. Escalating everything spends credibility you will want later.`,
    resources: [
      {
        label: "Amazon — Disagree and commit",
        url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles",
      },
    ],
  },
];

const questions: Question[] = [
  {
    id: "cm-scope-001",
    type: "mcq",
    track: "communication",
    topic: "scoping",
    difficulty: 2,
    context: "An interviewer opens with: 'Design Twitter.'",
    prompt: "What is the strongest first move?",
    options: [
      {
        id: "a",
        text: "Ask about scale, core features to include, and what is out of scope",
      },
      { id: "b", text: "Start drawing the high-level architecture immediately" },
      { id: "c", text: "Describe how Twitter actually works internally" },
      { id: "d", text: "Ask which programming language to use" },
    ],
    answer: "a",
    explanation:
      "The prompt is deliberately underspecified, and the first thing being tested is whether you notice. Scale and scope determine the entire architecture, so establishing them is not a delay before the real answer — it is the beginning of it. Language choice is almost never relevant at this altitude.",
    concepts: ["Requirements gathering", "Scoping", "Ambiguity"],
    tags: ["scoping", "requirements"],
  },
  {
    id: "cm-scope-002",
    type: "multi",
    track: "communication",
    topic: "scoping",
    difficulty: 3,
    prompt:
      "Which questions genuinely change the architecture of a design? Select all that apply.",
    options: [
      { id: "a", text: "What is the read-to-write ratio?" },
      { id: "b", text: "How many daily active users?" },
      { id: "c", text: "What latency is acceptable?" },
      { id: "d", text: "Which cloud provider are we on?" },
      { id: "e", text: "Does a user need to see their own writes immediately?" },
    ],
    answers: ["a", "b", "c", "e"],
    explanation:
      "Ratio, scale, latency, and consistency requirements each force real structural decisions — precompute versus compute on read, single database versus sharded, cache placement. Cloud provider changes which managed service you name, not the shape of the system, so asking it early spends a question without buying information.",
    concepts: ["Non-functional requirements", "Read-write ratio", "Latency budget"],
    tags: ["requirements"],
  },
  {
    id: "cm-scope-003",
    type: "mcq",
    track: "communication",
    topic: "scoping",
    difficulty: 3,
    context:
      "10 million daily active users each post once per day. Reads outnumber writes 100 to 1.",
    prompt: "Roughly what average read throughput should you plan for?",
    options: [
      { id: "a", text: "About 11,500 reads per second" },
      { id: "b", text: "About 1,150 reads per second" },
      { id: "c", text: "About 115,000 reads per second" },
      { id: "d", text: "About 100 reads per second" },
    ],
    answer: "a",
    explanation:
      "10M writes over 86,400 seconds is roughly 115 writes per second; at 100:1 that is about 11,500 reads per second. Doing this arithmetic out loud is the point — it converts every later decision from taste into consequence, and it is what justifies reaching for a cache. Remember to plan for peak, often several times the average.",
    concepts: ["Back-of-the-envelope estimation", "Requests per second", "Peak load"],
    tags: ["estimation", "back-of-envelope"],
  },
  {
    id: "cm-struct-001",
    type: "ordering",
    track: "communication",
    topic: "structuring",
    difficulty: 2,
    prompt: "Order the phases of a well-structured system design answer.",
    items: [
      "Clarify requirements and scope",
      "Estimate scale and derive throughput",
      "Sketch the high-level architecture",
      "Go deep on one or two components",
      "Discuss failure modes and bottlenecks",
      "Summarise the design and its main tradeoff",
    ],
    explanation:
      "Each phase constrains the next: scale justifies the architecture, the architecture determines what is worth going deep on, and depth reveals the failure modes worth discussing. Skipping to the sketch is the classic mistake, and skipping the summary wastes the strongest moment you have.",
    concepts: ["Signposting", "Top-down communication", "Design interview framework"],
    tags: ["structure"],
  },
  {
    id: "cm-struct-002",
    type: "mcq",
    track: "communication",
    topic: "structuring",
    difficulty: 3,
    prompt:
      "Why should you state your conclusion before your reasoning in a technical discussion?",
    options: [
      {
        id: "a",
        text: "The listener can follow the reasoning as support instead of holding it all in memory",
      },
      { id: "b", text: "It is faster to say" },
      { id: "c", text: "It prevents the listener from disagreeing" },
      { id: "d", text: "Reasoning is not important once a decision is made" },
    ],
    answer: "a",
    explanation:
      "Reasoning that arrives before its conclusion forces the listener to hold every step in working memory without knowing what it is for. Leading with the conclusion gives them a frame to slot each point into — and if you get interrupted, they already have the part that mattered.",
    concepts: ["Pyramid principle", "Top-down communication", "Working memory"],
    tags: ["top-down"],
  },
  {
    id: "cm-struct-003",
    type: "short",
    track: "communication",
    topic: "structuring",
    difficulty: 2,
    context:
      "Before diving in, you say: 'I'll cover requirements, then high-level design, then the data model, then failure modes.'",
    prompt: "What is this technique called? (One word.)",
    answers: ["signposting", "signpost", "sign-posting", "signposts"],
    typoTolerance: true,
    explanation:
      "Signposting. It tells the listener the shape of what is coming, so they stop wondering whether you have forgotten something and simply wait for it. It also quietly buys you permission to defer a topic rather than being pulled off course.",
    concepts: ["Signposting", "Meeting structure"],
    tags: ["signposting"],
  },
  {
    id: "cm-trade-001",
    type: "mcq",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 3,
    context:
      "You propose eventual consistency for a news feed. The interviewer asks: 'Why not strong consistency?'",
    prompt: "What is the strongest response?",
    options: [
      {
        id: "a",
        text: "Name the benefit strong consistency gives, why it is not worth the cost here, and what would change your mind",
      },
      { id: "b", text: "Change to strong consistency, since they seem to prefer it" },
      { id: "c", text: "Restate that eventual consistency is the industry standard" },
      { id: "d", text: "Explain that strong consistency is impossible at scale" },
    ],
    answer: "a",
    explanation:
      "The question is a probe, not a correction — they want to know whether you considered the alternative and understand its cost. Switching immediately suggests you had no reason initially. Claiming strong consistency is impossible is simply false, and overclaiming is more damaging than the original choice would have been.",
    concepts: ["Trade-off analysis", "Eventual consistency", "Design rationale"],
    tags: ["defending", "probing"],
  },
  {
    id: "cm-trade-002",
    type: "mcq",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 4,
    prompt: "When is changing your position mid-discussion a strength?",
    options: [
      {
        id: "a",
        text: "When you have been given new information that invalidates an assumption",
      },
      { id: "b", text: "Whenever someone more senior disagrees" },
      { id: "c", text: "Never — consistency signals conviction" },
      { id: "d", text: "Whenever the discussion has run long" },
    ],
    answer: "a",
    explanation:
      "The test is whether the constraints changed, not whether the pressure did. Updating on new information is exactly what good judgement looks like; updating on seniority alone signals that your original reasoning was not load-bearing. Refusing to update when genuinely shown otherwise is its own failure.",
    concepts: ["Updating on evidence", "Intellectual honesty", "Constraint change"],
    tags: ["updating"],
  },
  {
    id: "cm-trade-003",
    type: "mcq",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 3,
    prompt: "Why is a bare 'it depends' a weak answer?",
    options: [
      {
        id: "a",
        text: "It is only useful with the specific dependency and both outcomes named",
      },
      { id: "b", text: "It is always technically incorrect" },
      { id: "c", text: "Interviewers want a single definitive answer" },
      { id: "d", text: "It takes too long to say" },
    ],
    answer: "a",
    explanation:
      "'It depends' is true of nearly everything, so on its own it transfers no information and reads as hedging. The valuable version names the variable and both branches: 'depends on whether we need cross-region writes — if so, multi-leader; if not, leader-follower is simpler.'",
    concepts: ["Conditional reasoning", "Hedging", "Decision dependency"],
    tags: ["hedging"],
  },
  {
    id: "cm-aud-001",
    type: "matching",
    track: "communication",
    topic: "audience",
    difficulty: 3,
    prompt: "Match each audience to what they most need from an explanation.",
    pairs: [
      { left: "A new engineer on your team", right: "Interfaces, invariants, and how to change it safely" },
      { left: "Your product manager", right: "What it enables, and what it costs in time" },
      { left: "An executive sponsor", right: "Risk, cost, and timeline" },
      { left: "A support engineer", right: "How it fails, and what to tell affected users" },
    ],
    explanation:
      "The abstraction level should match the decision the listener actually owns. Giving an executive the engineer's explanation is not thoroughness — it is failing to translate, and it usually reads as an inability to see past your own context.",
    concepts: ["Audience adaptation", "Abstraction level", "Technical translation"],
    tags: ["audience"],
  },
  {
    id: "cm-aud-002",
    type: "mcq",
    track: "communication",
    topic: "audience",
    difficulty: 3,
    context:
      "You explain a queue to a non-technical stakeholder as 'like a queue at a shop.' They ask why a customer would ever be served twice.",
    prompt: "What went wrong, and what is the fix?",
    options: [
      {
        id: "a",
        text: "The analogy was extended past where it holds — name its limits when you introduce it",
      },
      { id: "b", text: "The analogy was wrong and should not have been used" },
      { id: "c", text: "The stakeholder needs the full technical explanation instead" },
      { id: "d", text: "Nothing went wrong; the question is unrelated" },
    ],
    answer: "a",
    explanation:
      "The analogy did its job — they built a mental model good enough to ask a sharp question. The failure was not marking its boundary. Saying 'like a shop queue, except the same person can be served twice, which is why we track who we have already served' pre-empts exactly this.",
    concepts: ["Analogy", "Mental model", "Abstraction leak"],
    tags: ["analogies"],
  },
  {
    id: "cm-dis-001",
    type: "mcq",
    track: "communication",
    topic: "disagreement",
    difficulty: 3,
    context:
      "A colleague proposes an architecture you believe has a serious flaw, in a design review with the team present.",
    prompt: "What is the most effective opening?",
    options: [
      {
        id: "a",
        text: "Restate their proposal and its benefit accurately, then raise the specific failure mode",
      },
      { id: "b", text: "State that the approach will not work and explain why" },
      { id: "c", text: "Say nothing publicly and raise it privately afterwards" },
      { id: "d", text: "Ask a series of leading questions until they find the flaw" },
    ],
    answer: "a",
    explanation:
      "Steelmanning proves you engaged with the proposal, which is what earns your objection a hearing rather than a defence. Leading a colleague into your conclusion in public reads as a trap even when well-intentioned. Private-only feedback deprives the team of information they need to decide.",
    concepts: ["Steelmanning", "Design review", "Constructive disagreement"],
    tags: ["steelmanning", "review"],
  },
  {
    id: "cm-dis-002",
    type: "mcq",
    track: "communication",
    topic: "disagreement",
    difficulty: 4,
    context:
      "The team chooses an approach you argued against. You still think it is the wrong call, but it is reversible.",
    prompt:
      "What is the right move after the team picks the approach you argued against?",
    options: [
      {
        id: "a",
        text: "Commit to it, and name the specific signal that should trigger a revisit",
      },
      { id: "b", text: "Implement it while documenting that you objected" },
      { id: "c", text: "Escalate to a manager to overturn the decision" },
      { id: "d", text: "Implement it exactly as specified and let it fail to prove the point" },
    ],
    answer: "a",
    explanation:
      "Disagree and commit, with a tripwire: 'I think write throughput will be the constraint — let's revisit if we cross 5k writes per second.' That converts a lost argument into a monitored assumption. Escalation is for consequential, hard-to-reverse decisions; spending it here costs credibility you will want later.",
    concepts: ["Disagree and commit", "Reversible decision", "Tripwire"],
    tags: ["disagree-and-commit"],
  },
  {
    id: "cm-dis-003",
    type: "multi",
    track: "communication",
    topic: "disagreement",
    difficulty: 4,
    prompt:
      "Which framings make a technical objection more likely to land? Select all that apply.",
    options: [
      { id: "a", text: "Naming a concrete failure scenario rather than a general worry" },
      { id: "b", text: "Stating how strongly you hold the position" },
      { id: "c", text: "Acknowledging what the proposal gets right first" },
      { id: "d", text: "Referring to what the author overlooked" },
      { id: "e", text: "Citing personal preference between technologies" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Concrete scenarios are checkable, stated confidence lets others weight your input correctly, and acknowledging merit keeps the conversation technical. Framing around what someone missed makes it personal, and preference arguments have no resolution path — they just run until someone gets tired.",
    concepts: ["Steelmanning", "Confidence calibration", "Falsifiable claim"],
    tags: ["framing"],
  },
  {
    id: "cm-scope-004",
    type: "matching",
    track: "communication",
    topic: "scoping",
    difficulty: 3,
    prompt: "Match each scoping question to what its answer actually decides.",
    pairs: [
      {
        left: "How many users, and how active are they?",
        right: "Whether one database will do, and for how long",
      },
      {
        left: "How stale may this data be?",
        right: "Whether caching and read replicas are available to you",
      },
      {
        left: "What happens if this is down for an hour?",
        right: "How much redundancy is worth paying for",
      },
      {
        left: "Who is allowed to see what?",
        right: "Whether tenancy and authorisation shape the data model",
      },
      {
        left: "How long must this be kept?",
        right: "Whether storage growth and deletion become design problems",
      },
    ],
    explanation:
      "Each of these earns its place by ruling something out. A scoping question whose answer cannot change your design is small talk, however sensible it sounds — and that is the test worth applying before you ask one, particularly when the clock is running.",
    concepts: ["Non-functional requirements", "Scoping", "Design constraint", "Data retention"],
    tags: ["questions", "requirements"],
  },
  {
    id: "cm-scope-005",
    type: "multi",
    track: "communication",
    topic: "scoping",
    difficulty: 3,
    context:
      "Your design depends on a question you cannot get answered — the person who knows is not available.",
    prompt:
      "What should you do with a question you cannot get answered? Select all that apply.",
    options: [
      { id: "a", text: "State the assumption explicitly and keep designing from it" },
      { id: "b", text: "Say what you would change if the assumption turned out to be wrong" },
      { id: "c", text: "Note which answers would change the design most, so the question gets prioritised" },
      { id: "d", text: "Design for every possible answer, so no assumption is needed" },
      { id: "e", text: "Choose the most technically interesting answer, since it shows more" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "A stated assumption turns an unknown into something someone can correct, which is the entire point; an unstated one is a landmine dressed as a decision. Designing for every branch produces something that serves none of them well, and reads as an inability to commit rather than as thoroughness.",
    concepts: ["Stated assumption", "Design constraint", "Confidence calibration", "Decision reversibility"],
    tags: ["assumptions", "unknowns"],
  },
  {
    id: "cm-struct-004",
    type: "multi",
    track: "communication",
    topic: "structuring",
    difficulty: 3,
    prompt:
      "What should a written status update on a piece of work contain? Select all that apply.",
    options: [
      { id: "a", text: "Whether it is on track, in the first line" },
      { id: "b", text: "What has changed since the last update" },
      { id: "c", text: "What you need from someone else, and by when" },
      { id: "d", text: "A list of everything you did this week" },
      { id: "e", text: "A reassurance that it is going well, with detail available on request" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "An update exists so someone can decide whether to intervene, which is why the status belongs first and the ask has to be unmissable. An activity log makes the reader derive the status themselves and most will not bother; reassurance without evidence is the format people quietly learn to skip.",
    concepts: ["Bottom line up front", "Status reporting", "Signposting", "Actionable request"],
    tags: ["updates", "writing"],
  },
  {
    id: "cm-struct-005",
    type: "matching",
    track: "communication",
    topic: "structuring",
    difficulty: 2,
    prompt: "Match each communication format to what it is best at.",
    pairs: [
      {
        left: "A short written summary",
        right: "Reaching people asynchronously, in their own time",
      },
      {
        left: "A meeting",
        right: "Resolving something where the positions are still moving",
      },
      {
        left: "A design document",
        right: "Getting considered feedback before the work gets expensive",
      },
      {
        left: "A diagram",
        right: "Showing a structure that prose would make the reader assemble",
      },
      { left: "A demo", right: "Establishing that the thing genuinely works" },
    ],
    explanation:
      "Most communication failures are a format mismatch rather than a wording problem: a decision argued in a comment thread, a status broadcast in a meeting, an architecture described in three paragraphs of prose. Choose the format from what the exchange has to accomplish, not from habit.",
    concepts: ["Synchronous versus asynchronous communication", "Design document", "Diagramming", "Audience adaptation"],
    tags: ["formats", "channel"],
  },
  {
    id: "cm-trade-004",
    type: "matching",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 2,
    prompt: "Match each design choice to the axis it trades along.",
    pairs: [
      { left: "Adding a cache", right: "Freshness given up for latency and load" },
      { left: "Denormalising a table", right: "Write complexity accepted for read speed" },
      { left: "Sharding a database", right: "Operational complexity accepted for capacity" },
      {
        left: "Putting a queue between two services",
        right: "Immediate consistency given up for availability",
      },
      { left: "Buying rather than building", right: "Control given up for time" },
    ],
    explanation:
      "Naming the axis is what turns an opinion into an argument, because it makes explicit what you are willing to lose. It also exposes the cases where nothing is being traded: if a change appears to cost nothing on any axis, you have either found free value or not yet found the axis.",
    concepts: ["Trade-off analysis", "Design rationale", "Build versus buy", "Denormalisation"],
    tags: ["axes", "naming"],
  },
  {
    id: "cm-trade-005",
    type: "short",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 3,
    context:
      "Some decisions can be undone cheaply if they prove wrong, and deserve a fast call from whoever is closest. Others are effectively permanent — a data model, a public API, a vendor holding your data — and deserve far more scrutiny.",
    prompt: "What is this distinction between reversible and irreversible decisions called?",
    answers: [
      "one-way door",
      "two-way door",
      "one way door",
      "two way door",
      "one-way and two-way doors",
      "door decisions",
      "reversibility",
    ],
    typoTolerance: true,
    explanation:
      "One-way and two-way doors. The value is in calibrating how much process a decision earns: applying one-way scrutiny to everything is how organisations become slow, and applying two-way speed to a data model is how they end up with one they cannot change. Most decisions are two-way doors being treated as one-way.",
    concepts: ["One-way door decision", "Reversibility", "Decision speed", "Blast radius"],
    tags: ["reversibility", "calibration"],
  },
  {
    id: "cm-aud-003",
    type: "ordering",
    track: "communication",
    topic: "audience",
    difficulty: 3,
    context:
      "You need approval to spend three weeks paying down infrastructure debt, from someone who does not own the code.",
    prompt:
      "Put the parts of a proposal to a non-technical decision-maker in order.",
    items: [
      "The decision you are asking them to make, in one sentence",
      "What happens if nothing is done, stated concretely rather than as risk in general",
      "The option you recommend, with its cost and timeline",
      "One alternative you are not recommending, and why",
      "What you need from them, and by when",
    ],
    explanation:
      "Leading with the ask is what stops the proposal being read as background. The alternative matters more than it looks: one option makes the choice 'yes or no to you', while two make it a decision between options — which is the decision they are equipped and willing to make.",
    concepts: ["Executive communication", "Decision framing", "Risk framing", "Bottom line up front"],
    tags: ["proposals", "stakeholders"],
  },
  {
    id: "cm-aud-004",
    type: "short",
    track: "communication",
    topic: "audience",
    difficulty: 3,
    context:
      "An engineer explains their service to a new joiner in terms specific to the system, cannot tell which parts are confusing, and genuinely cannot reconstruct what it was like not to know them.",
    prompt:
      "What is this difficulty in imagining not knowing something called? (Three words.)",
    answers: [
      "curse of knowledge",
      "the curse of knowledge",
      "curse of expertise",
      "knowledge curse",
    ],
    typoTolerance: true,
    explanation:
      "The curse of knowledge. You cannot detect it by introspection, which is exactly what makes it durable, so the fix has to be external: ask the listener to explain it back, watch where they hesitate, and treat every undefined term as a candidate. Writing for yourself from two years ago is the usable approximation.",
    concepts: ["Curse of knowledge", "Audience adaptation", "Jargon", "Onboarding"],
    tags: ["expertise", "bias"],
  },
  {
    id: "cm-dis-004",
    type: "multi",
    track: "communication",
    topic: "disagreement",
    difficulty: 3,
    prompt:
      "When is dropping a technical disagreement the right call? Select all that apply.",
    options: [
      { id: "a", text: "The decision is cheap to reverse and trying it teaches you more than arguing" },
      {
        id: "b",
        text: "You have made the argument clearly and what remains is judgement rather than facts",
      },
      { id: "c", text: "The cost of being wrong is small and the cost of the argument is not" },
      { id: "d", text: "You are outranked, whatever the consequences of the decision" },
      { id: "e", text: "You still believe the decision risks data loss or a security exposure" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The deciding variable is the cost of being wrong, never who prevailed. Reversible decisions are better settled by trying them, and repeating an argument already made spends credibility you will want later. Rank alone is not a reason — and the final case is the one where persisting, in writing, is the job.",
    concepts: ["Disagree and commit", "Reversible decision", "Escalation", "Professional obligation"],
    tags: ["letting-go", "judgement"],
  },
  {
    id: "cm-dis-005",
    type: "short",
    track: "communication",
    topic: "disagreement",
    difficulty: 3,
    context:
      "The team picks the approach you argued against. You support it fully — and you write into the design doc what you expected to go wrong, plus the specific metric and threshold that would show it.",
    prompt:
      "What is a pre-agreed signal that would reopen a settled decision called? (One word.)",
    answers: ["tripwire", "trip wire", "tripwires", "trigger"],
    typoTolerance: true,
    explanation:
      "A tripwire. It converts 'I think this will not scale' from an opinion into a testable claim with a threshold attached, which is what lets you commit honestly instead of waiting to be proved right. It protects the team too: without one, a decision gets reopened whenever somebody feels uneasy.",
    concepts: ["Tripwire", "Disagree and commit", "Falsifiable claim", "Decision record"],
    tags: ["commitment", "signals"],
  },
];

export const track: Track = {
  id: "communication",
  title: "Technical Communication",
  blurb:
    "Scoping ambiguous problems, structuring an answer, defending tradeoffs, and disagreeing well.",
  topics,
};

export { questions };
