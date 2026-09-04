import type { Question, Track, Topic } from "@/content/types";

const topics: Topic[] = [
  {
    id: "code-review",
    track: "workplace",
    title: "Code Review",
    blurb: "Catching what matters without becoming the bottleneck.",
    lesson: `Code review has two jobs: catch defects, and spread knowledge. Most bad reviews fail at both by optimising for the wrong things.

**Review in priority order.** Correctness and security first. Then design and whether this is the right change at all. Then maintainability. Style last, and ideally never — if you are commenting on formatting, your linter is missing a rule and you are spending human attention on something a machine should own.

**The most valuable comment is usually a question.** "What happens if this list is empty?" invites the author to check and preserves the possibility that you have missed context. "This breaks on empty lists" is worse when you are wrong and no better when you are right.

**Distinguish blocking from non-blocking.** Prefix the ones that are not: "nit:", "optional:", "future:". Without that, authors treat every comment as a gate and reviews spiral. A reviewer who never says "this is fine, ship it" is teaching people to stop asking.

**Small PRs get real reviews.** A 50-line change gets scrutinised; a 2,000-line change gets an approval and a prayer. Defect detection falls off a cliff with size, so the highest-leverage review comment is often "can this be split?" — said before the work is done, not after.

**Approve with comments** when nothing blocks. Holding an approval hostage to a preference is how review queues become the constraint on a team's delivery.

**On the receiving end:** assume good intent, ask when unclear, and push back with reasons when you disagree. A review comment is an opinion with context you may not have — and so is your code.`,
    resources: [
      {
        label: "Google — Code review developer guide",
        url: "https://google.github.io/eng-practices/review/",
      },
    ],
  },
  {
    id: "debugging",
    track: "workplace",
    title: "Debugging Methodically",
    blurb: "Finding causes by narrowing, not by guessing.",
    lesson: `Debugging is a search problem. The engineers who are fast at it are not guessing better — they are eliminating half the search space at a time instead of poking at whatever they touched last.

**Reproduce first.** A bug you cannot reproduce is a bug you cannot verify you fixed. Nail down the smallest reliable reproduction; that act alone often reveals the cause, because minimising forces you to identify which conditions actually matter.

**Form a hypothesis you can falsify.** "The cache is returning stale data" is testable. "Something is wrong with the cache" is not. Then design the cheapest test that splits the possibilities — check the value at the boundary between two components rather than tracing from the top.

**Bisect.** In the code path, in the data, or in history. \`git bisect\` finds the introducing commit in log₂(n) steps and is chronically underused; a hundred commits is seven checkouts.

**Read the error properly.** Whole stack trace, actual line numbers, actual values. An enormous share of debugging time is spent on a message that already said what was wrong.

**Change one thing at a time.** Changing three and seeing it work leaves you not knowing why, which means you have not fixed it — you have hidden it.

**Question your assumptions last but genuinely.** "That library can't be wrong", "that config is definitely applied", "that code path can't run" — when the evidence contradicts an assumption, verify it directly rather than reasoning around it.

**Fix the cause, not the symptom.** A null check that silences a crash without explaining why the value was null converts a loud bug into a quiet one, which is a downgrade.`,
    resources: [
      {
        label: "Why Programs Fail (Zeller) — overview",
        url: "https://www.debuggingbook.org/",
      },
    ],
  },
  {
    id: "design-docs",
    track: "workplace",
    title: "Design Docs & RFCs",
    blurb: "Getting alignment in writing, before the code exists.",
    lesson: `A design doc exists to get disagreement to happen early, when it is cheap. If nobody could possibly object to your document, it probably is not saying anything.

**Lead with the problem, not the solution.** Readers cannot evaluate an approach without knowing what it is for. Open with the problem, why it matters now, and what happens if you do nothing.

**State the constraints explicitly.** Deadlines, team size, systems that cannot change, compliance requirements. Most disagreement in design reviews is really disagreement about constraints, surfaced late — writing them down converts an argument about taste into a check on facts.

**Alternatives considered is the section that carries the document.** It proves the choice was made rather than defaulted into, and it pre-empts the reviewer who arrives asking "why not X?". Give each alternative a fair description and a specific reason for rejection. An obviously strawmanned alternative undermines the whole document.

**Name what you are trading away.** Every design has a cost. A doc that lists only benefits reads as advocacy, and experienced reviewers discount it accordingly.

**Non-goals prevent scope creep** better than any other section. "This does not address multi-region failover" stops that discussion from consuming the review.

**Make it reviewable.** Specific questions you want answered, a decision deadline, and named owners. "Thoughts?" produces silence; "Does anyone object to the migration order in §4 by Thursday?" produces answers.

**Record the decision and why.** Six months on, the reasoning is the valuable part — the conclusion alone leaves the next person unable to tell whether the constraints still hold.`,
    resources: [
      {
        label: "Google — Design docs",
        url: "https://www.industrialempathy.com/posts/design-docs-at-google/",
      },
    ],
  },
  {
    id: "incidents",
    track: "workplace",
    title: "Incidents",
    blurb: "Restoring service first, understanding it second.",
    lesson: `During an incident the goal is to stop the bleeding. Understanding comes afterwards, and confusing the two extends outages.

**Mitigate before diagnosing.** Roll back, disable the flag, shift traffic. Engineers frequently spend twenty minutes finding root cause when a thirty-second rollback would have ended user impact — and the evidence is still there afterwards.

**One incident commander.** Their job is coordination and decisions, not debugging. Without a clear owner, three people investigate the same thing while nobody communicates and nobody decides.

**Communicate on a schedule.** Regular updates, even "still investigating, next update in 15 minutes", stop the stream of interruptions asking for status. Silence generates more load than any update.

**Write down a timeline as you go.** Memory reconstructs incidents wrongly, confidently. Timestamps of what you observed and what you changed are what make the review accurate.

**Blameless postmortems, genuinely.** If someone is punished for an outage, the next one gets hidden, and hidden incidents are how organisations stop learning. The useful question is never "who ran the command" — it is "why was it possible for a single command to do this, and why did nothing catch it?"

**Root cause is usually plural.** "The deploy broke it" is where analysis starts. Why did review pass? Why did staging not catch it? Why did alerting take eleven minutes? Each is a separate improvement.

**Action items need owners and dates,** or the postmortem was theatre. Fewer real items beat a long aspirational list.`,
    resources: [
      {
        label: "Google SRE — Postmortem culture",
        url: "https://sre.google/sre-book/postmortem-culture/",
      },
    ],
  },
  {
    id: "estimation",
    track: "workplace",
    title: "Estimation & Scoping",
    blurb: "Being useful about time without pretending to certainty.",
    lesson: `Estimates are forecasts, not commitments, and most of the pain around them comes from the two sides quietly using different definitions.

**Decompose until the pieces are familiar.** "Build the reporting feature" is unestimable. Break it down until each piece resembles something you have done, then add up. Anything you cannot decompose is a signal you do not understand it yet — which is itself worth reporting.

**Give ranges, with the reason for the spread.** "Three to eight days, depending on whether the existing export code can be reused" is honest and actionable. A single number implies a precision you do not have, and it is the number people will hold you to.

**Estimate the whole job.** Code is often less than half of it: review, tests, migration, deployment, docs, and the follow-up bugs are all real. Estimating only implementation is the single most common cause of overrun.

**Separate uncertainty from padding.** Padding hides the risk; naming it lets others act on it. "There's a real chance the third-party API doesn't support bulk updates — I can spike it in half a day and firm up the estimate" gives the person planning something they can actually use.

**Re-estimate out loud when you learn something.** The failure mode is silence until the deadline. An early "this is bigger than I thought, here's why" is a manageable problem; the same news on the due date is not.

**Track your own calibration.** Compare your estimates to reality for a while. Most engineers discover a consistent personal multiplier — knowing yours makes you dramatically more useful than being 'accurate' by luck.`,
    resources: [
      {
        label: "Shape Up — Appetite and scoping",
        url: "https://basecamp.com/shapeup",
      },
    ],
  },
];

const questions: Question[] = [
  {
    id: "wk-cr-001",
    type: "ordering",
    track: "workplace",
    topic: "code-review",
    difficulty: 2,
    prompt: "Order these review concerns from highest to lowest priority.",
    items: [
      "Correctness and security defects",
      "Design — is this the right approach",
      "Maintainability and naming",
      "Formatting and style",
    ],
    explanation:
      "Attention is finite, so spend it where a machine cannot. Formatting belongs to a linter or formatter, and a review thread about it is a signal that tooling is missing. Design comments are best raised early, because by review time the cost of changing direction is already high.",
    concepts: ["Code review", "Review priorities", "Linting"],
    tags: ["priorities"],
  },
  {
    id: "wk-cr-002",
    type: "mcq",
    track: "workplace",
    topic: "code-review",
    difficulty: 3,
    context:
      "You spot what looks like an edge case the author may not have handled.",
    prompt: "What is the most effective way to raise it?",
    options: [
      {
        id: "a",
        text: "Ask what happens in that case, leaving room for context you may lack",
      },
      { id: "b", text: "State that the code is broken and request changes" },
      { id: "c", text: "Fix it yourself and push to their branch" },
      { id: "d", text: "Approve and file a separate bug" },
    ],
    answer: "a",
    explanation:
      "A question costs nothing if you are wrong and works just as well if you are right — the author checks either way. Asserting a break is expensive when you have missed context. Pushing to someone's branch removes their ownership, and approving a suspected defect defeats the purpose of reviewing.",
    concepts: ["Code review", "Feedback framing", "Psychological safety"],
    tags: ["feedback", "tone"],
  },
  {
    id: "wk-cr-003",
    type: "mcq",
    track: "workplace",
    topic: "code-review",
    difficulty: 3,
    prompt:
      "Why does defect detection fall sharply as pull request size grows?",
    options: [
      {
        id: "a",
        text: "Reviewer attention does not scale with diff size, so large PRs get skimmed",
      },
      { id: "b", text: "Large PRs are usually written by less experienced engineers" },
      { id: "c", text: "Review tools fail to render large diffs" },
      { id: "d", text: "Large PRs contain proportionally fewer defects" },
    ],
    answer: "a",
    explanation:
      "A 50-line change gets read line by line; a 2,000-line change gets an approval. The most valuable thing a reviewer can do about it is intervene before the work happens — 'can this land in three PRs?' is cheap in advance and expensive once it is written.",
    concepts: ["Pull request size", "Defect detection rate", "Review fatigue"],
    tags: ["pr-size"],
  },
  {
    id: "wk-cr-004",
    type: "multi",
    track: "workplace",
    topic: "code-review",
    difficulty: 3,
    prompt:
      "Which practices keep a review queue from becoming a delivery bottleneck? Select all that apply.",
    options: [
      { id: "a", text: "Marking non-blocking comments as nits or optional" },
      { id: "b", text: "Approving with comments when nothing actually blocks" },
      { id: "c", text: "Automating style enforcement so humans never discuss it" },
      { id: "d", text: "Requiring every comment to be resolved before merge" },
      { id: "e", text: "Requiring three approvals on every change" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Signalling severity, approving when nothing blocks, and letting tools own style all reduce round trips. Requiring every comment resolved treats a preference as a gate, and blanket multi-approval rules add latency to every change to catch problems that concentrate in a few.",
    concepts: ["Review throughput", "Blocking feedback", "Automated formatting"],
    tags: ["throughput"],
  },
  {
    id: "wk-dbg-001",
    type: "mcq",
    track: "workplace",
    topic: "debugging",
    difficulty: 2,
    context: "A bug is reported that you have not yet seen happen.",
    prompt: "What is the first step?",
    options: [
      { id: "a", text: "Find a reliable reproduction" },
      { id: "b", text: "Read the code where you think the bug is" },
      { id: "c", text: "Add logging throughout the suspect area" },
      { id: "d", text: "Ask the reporter to try again" },
    ],
    answer: "a",
    explanation:
      "Without a reproduction you cannot confirm a fix, and you risk 'fixing' something that was never the cause. Minimising the reproduction frequently identifies the cause on its own, because stripping conditions away forces you to find which ones actually matter.",
    concepts: ["Reproduction", "Minimal reproducible example", "Debugging method"],
    tags: ["reproduction"],
  },
  {
    id: "wk-dbg-002",
    type: "mcq",
    track: "workplace",
    topic: "debugging",
    difficulty: 3,
    context:
      "A regression appeared somewhere in the last 200 commits. Each check takes a few minutes.",
    prompt:
      "What is the efficient way to locate a regression across 200 commits?",
    options: [
      {
        id: "a",
        text: "Bisect — about 8 checks instead of up to 200",
      },
      { id: "b", text: "Review each commit's diff in order" },
      { id: "c", text: "Revert all 200 commits and reapply them one at a time" },
      { id: "d", text: "Add logging and wait for it to recur in production" },
    ],
    answer: "a",
    explanation:
      "Bisection is binary search over history: log₂(200) is under 8 steps. git bisect automates it and can run a test script per step. Reading 200 diffs assumes you will recognise the bug on sight, which is exactly the assumption that has already failed.",
    concepts: ["git bisect", "Binary search", "Regression"],
    tags: ["bisection", "git"],
  },
  {
    id: "wk-dbg-003",
    type: "mcq",
    track: "workplace",
    topic: "debugging",
    difficulty: 4,
    context:
      "You change three things at once and the bug disappears.",
    prompt: "What is the problem with stopping here?",
    options: [
      {
        id: "a",
        text: "You do not know which change fixed it, so you cannot be sure it is fixed rather than hidden",
      },
      { id: "b", text: "The other two changes will definitely cause new bugs" },
      { id: "c", text: "Nothing — the bug is gone, which is what matters" },
      { id: "d", text: "Reviewers will reject a three-part change" },
    ],
    answer: "a",
    explanation:
      "Without knowing the mechanism, you cannot tell whether you removed the cause or perturbed the timing enough to mask it — and masked bugs return in production under different load. Revert to one change at a time and confirm which one is load-bearing.",
    concepts: ["Change one variable at a time", "Root cause analysis", "Heisenbug"],
    tags: ["method", "one-at-a-time"],
  },
  {
    id: "wk-dbg-004",
    type: "short",
    track: "workplace",
    topic: "debugging",
    difficulty: 3,
    context:
      "A crash is silenced by adding a null check, but nobody investigates why the value was null.",
    prompt:
      "Is this fixing the cause or the symptom? (One word.)",
    answers: ["symptom", "the symptom", "symptoms"],
    typoTolerance: true,
    explanation:
      "The symptom. The crash is gone and the invalid state remains, so the system now proceeds with data it should not have — a loud failure converted into a quiet one, which is strictly worse for diagnosis later. A null check is fine as a guard once you know why null is possible.",
    concepts: ["Root cause versus symptom", "Defensive programming", "Fail fast"],
    tags: ["root-cause"],
  },
  {
    id: "wk-doc-001",
    type: "mcq",
    track: "workplace",
    topic: "design-docs",
    difficulty: 3,
    prompt:
      "Why is 'Alternatives considered' usually the most valuable section of a design doc?",
    options: [
      {
        id: "a",
        text: "It shows the choice was reasoned rather than defaulted into, and pre-empts the obvious objections",
      },
      { id: "b", text: "It makes the document longer and more thorough" },
      { id: "c", text: "It is required by most review processes" },
      { id: "d", text: "It lets readers pick their preferred option" },
    ],
    answer: "a",
    explanation:
      "Reviewers arrive with a favourite alternative. Addressing it in the document turns a live debate into a resolved one, and it demonstrates the decision was made rather than fallen into. Strawmanning the alternatives destroys this benefit and costs you credibility on the rest of the doc.",
    concepts: ["Alternatives considered", "Design document", "Decision rationale"],
    tags: ["alternatives"],
  },
  {
    id: "wk-doc-002",
    type: "mcq",
    track: "workplace",
    topic: "design-docs",
    difficulty: 3,
    context: "You end a design doc with 'Thoughts?' and get no responses.",
    prompt: "What would produce better engagement?",
    options: [
      {
        id: "a",
        text: "Ask specific questions, name a decision deadline, and tag the people whose input you need",
      },
      { id: "b", text: "Send more reminders to the channel" },
      { id: "c", text: "Shorten the document until people read it" },
      { id: "d", text: "Schedule a meeting to read it together" },
    ],
    answer: "a",
    explanation:
      "An open request gives nobody a reason to be the one who responds, and no deadline to respond by. 'Does anyone object to the migration order in §4 by Thursday?' assigns responsibility and a due date, which is what actually converts a document into a decision.",
    concepts: ["Design review", "Decision deadline", "Reviewability"],
    tags: ["reviewability"],
  },
  {
    id: "wk-doc-003",
    type: "multi",
    track: "workplace",
    topic: "design-docs",
    difficulty: 4,
    prompt:
      "Which sections make a design doc more decision-ready? Select all that apply.",
    options: [
      { id: "a", text: "Explicit non-goals" },
      { id: "b", text: "Constraints such as deadlines and unchangeable systems" },
      { id: "c", text: "The tradeoffs the chosen approach accepts" },
      { id: "d", text: "A full API reference for every endpoint" },
      { id: "e", text: "A detailed implementation schedule per engineer" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Non-goals stop scope creep in review, constraints resolve most disagreements (which are usually about constraints rather than taste), and stated tradeoffs make the document credible. Exhaustive API references and staffing schedules belong elsewhere — they bury the decision the reader is there to make.",
    concepts: ["Non-goals", "Scope creep", "Design document"],
    tags: ["structure"],
  },
  {
    id: "wk-inc-001",
    type: "mcq",
    track: "workplace",
    topic: "incidents",
    difficulty: 3,
    context:
      "A deploy 10 minutes ago correlates with a spike in errors. Users are affected right now.",
    prompt: "What should happen first?",
    options: [
      { id: "a", text: "Roll back, then investigate" },
      { id: "b", text: "Find the root cause before changing anything" },
      { id: "c", text: "Add logging and redeploy to gather data" },
      { id: "d", text: "Wait to see whether it resolves itself" },
    ],
    answer: "a",
    explanation:
      "Mitigation comes before diagnosis while users are affected. A rollback takes seconds and the evidence — logs, traces, the commit itself — is all still available afterwards. Redeploying with logging extends the outage to gather data you could collect off the critical path.",
    concepts: ["Mitigation before diagnosis", "Rollback", "Incident response"],
    tags: ["mitigation"],
  },
  {
    id: "wk-inc-002",
    type: "mcq",
    track: "workplace",
    topic: "incidents",
    difficulty: 3,
    prompt: "What is the incident commander's actual job?",
    options: [
      {
        id: "a",
        text: "Coordinate, decide, and communicate — explicitly not to debug",
      },
      { id: "b", text: "Personally find and fix the root cause" },
      { id: "c", text: "Write the postmortem during the incident" },
      { id: "d", text: "Approve every change made during the incident" },
    ],
    answer: "a",
    explanation:
      "A commander who starts debugging stops coordinating, and that is when three people investigate the same thing while nobody talks to stakeholders. The role is deliberately separate from the hands-on work — on a small incident it can be someone with no context at all, which often works better.",
    concepts: ["Incident commander", "Incident roles", "Coordination"],
    tags: ["roles"],
  },
  {
    id: "wk-inc-003",
    type: "mcq",
    track: "workplace",
    topic: "incidents",
    difficulty: 4,
    context:
      "A postmortem concludes: 'An engineer ran the wrong migration command.'",
    prompt: "Why is this an inadequate root cause?",
    options: [
      {
        id: "a",
        text: "It stops at the person instead of asking why the system allowed it and why nothing caught it",
      },
      { id: "b", text: "It names an individual, which is a privacy issue" },
      { id: "c", text: "Human error is never a real cause" },
      { id: "d", text: "Postmortems should not discuss migrations" },
    ],
    answer: "a",
    explanation:
      "Every system will eventually see the wrong command run. The useful questions are why it was possible without confirmation, why it was not caught in staging, and why detection took as long as it did. Stopping at the person also teaches everyone to hide the next incident, which removes your ability to learn from it at all.",
    concepts: ["Blameless postmortem", "Root cause analysis", "Systemic failure"],
    tags: ["postmortem", "blameless"],
  },
  {
    id: "wk-est-001",
    type: "mcq",
    track: "workplace",
    topic: "estimation",
    difficulty: 3,
    context: "You are asked how long a moderately unfamiliar feature will take.",
    prompt: "What is the most useful answer?",
    options: [
      {
        id: "a",
        text: "A range, with the specific unknown that drives the spread",
      },
      { id: "b", text: "A single number, padded to be safe" },
      { id: "c", text: "That it cannot be estimated without full requirements" },
      { id: "d", text: "The optimistic case, to keep momentum" },
    ],
    answer: "a",
    explanation:
      "'Three to eight days, depending on whether the existing export code is reusable' tells the planner both the shape of the risk and how to reduce it — they can authorise a spike. A padded single number hides the risk inside a figure people will treat as a commitment.",
    concepts: ["Estimation range", "Uncertainty", "Spike"],
    tags: ["ranges", "uncertainty"],
  },
  {
    id: "wk-est-002",
    type: "multi",
    track: "workplace",
    topic: "estimation",
    difficulty: 3,
    prompt:
      "Which work is routinely left out of engineering estimates? Select all that apply.",
    options: [
      { id: "a", text: "Code review turnaround" },
      { id: "b", text: "Writing and fixing tests" },
      { id: "c", text: "Data migration and deployment" },
      { id: "d", text: "Follow-up bugs after release" },
      { id: "e", text: "Writing the implementation" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Implementation is the one thing everyone remembers, and it is often under half the total. Review latency, tests, migrations, deploys, and the bug tail are all real work — estimating only the coding is the single most common source of overrun.",
    concepts: ["Estimation", "Hidden work", "Definition of done"],
    tags: ["scope"],
  },
  {
    id: "wk-est-003",
    type: "mcq",
    track: "workplace",
    topic: "estimation",
    difficulty: 4,
    context:
      "Two days into a five-day estimate, you realise it will take closer to twelve.",
    prompt: "When and how should you raise it?",
    options: [
      {
        id: "a",
        text: "Immediately, with what changed and the options available",
      },
      { id: "b", text: "At the deadline, once you are certain of the new date" },
      { id: "c", text: "At the next scheduled status meeting" },
      { id: "d", text: "Work extra hours and try to hit the original estimate" },
    ],
    answer: "a",
    explanation:
      "Early bad news is a planning problem; late bad news is a crisis, because everyone downstream has already committed against your date. Raising it with options — cut scope, add help, move the date — makes it a decision someone can make rather than an announcement they have to absorb.",
    concepts: ["Re-estimation", "Early escalation", "Scope negotiation"],
    tags: ["communication", "re-estimation"],
  },
  {
    id: "wk-cr-005",
    type: "matching",
    track: "workplace",
    topic: "code-review",
    difficulty: 2,
    prompt: "Match each review comment prefix to what it asks the author to do.",
    pairs: [
      { left: "nit:", right: "Fix it or do not — either way this does not block the merge" },
      { left: "question:", right: "Explain, because I may be missing context" },
      { left: "blocking:", right: "This has to change before I approve" },
      { left: "future:", right: "Not this pull request — worth a follow-up ticket" },
      { left: "praise:", right: "Nothing to do; I want you to keep doing this" },
    ],
    explanation:
      "Without labels every comment reads as a gate, so authors either argue about formatting or silently rewrite working code. Making the weight explicit is the cheapest thing a reviewer can do for a slow queue. Praise is not decoration either — it is how the good patterns in a codebase actually spread.",
    concepts: ["Blocking feedback", "Conventional Comments", "Review latency"],
    tags: ["feedback", "conventions"],
  },
  {
    id: "wk-cr-006",
    type: "multi",
    track: "workplace",
    topic: "code-review",
    difficulty: 3,
    prompt:
      "What is worth checking about the tests in a pull request? Select all that apply.",
    options: [
      { id: "a", text: "Whether the test would actually fail if the behaviour it names regressed" },
      { id: "b", text: "Whether the cases cover the boundaries this change introduces" },
      { id: "c", text: "Whether it asserts on behaviour rather than on internal implementation detail" },
      { id: "d", text: "Whether the diff raised the project's line coverage number" },
      { id: "e", text: "Whether there is one test per newly added function" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The first is the check almost nobody performs, and it is the one that matters: a test passing against a deliberately broken implementation asserts nothing, and nothing in the tooling will tell you. Coverage counts executed lines rather than verified behaviour, so both of the rejected options can be satisfied by tests that could never fail.",
    concepts: ["Assertion strength", "Code coverage", "Mutation testing", "Test brittleness"],
    tags: ["tests", "review"],
  },
  {
    id: "wk-cr-007",
    type: "mcq",
    track: "workplace",
    topic: "code-review",
    difficulty: 4,
    context:
      "A reviewer and an author have gone four rounds on one design point in the comments. Neither has moved, the pull request is three days old, and other work is queued behind it.",
    prompt:
      "What should happen after four rounds of unresolved review comments?",
    options: [
      {
        id: "a",
        text: "Move it to a synchronous conversation, then write the outcome back into the pull request",
      },
      { id: "b", text: "The reviewer should approve, since the author owns the code" },
      { id: "c", text: "The author should implement the reviewer's version to unblock the queue" },
      { id: "d", text: "Escalate to a manager to settle the technical question" },
    ],
    answer: "a",
    explanation:
      "Comment threads are a poor medium for disagreement: they are slow, and each written round hardens both positions, because setting an argument down is an act of committing to it. Two rounds is the practical signal to change channel. Recording the outcome back in the thread matters because whoever reads this code next year needs the decision to be discoverable.",
    concepts: ["Escalation path", "Decision record", "Synchronous communication"],
    tags: ["disagreement", "escalation"],
  },
  {
    id: "wk-cr-008",
    type: "ordering",
    track: "workplace",
    topic: "code-review",
    difficulty: 2,
    prompt: "Put the steps of preparing a change for review in order.",
    items: [
      "Split the work so each pull request does one reviewable thing",
      "Get the automated checks passing, so no reviewer spends attention on formatting",
      "Read your own diff line by line, as though someone else had written it",
      "Write a description covering what changed, why, and what you deliberately left out",
      "Request review, flagging the parts you are least confident about",
    ],
    explanation:
      "Every step before the last one removes work from the reviewer, and reviewer attention is the scarce resource in this loop. Reading your own diff has the highest yield of the five — you will find something, and finding it yourself costs a minute rather than a day of round-trip latency.",
    concepts: ["Self-review", "Pull request size", "Review latency", "Automated checks"],
    tags: ["authoring", "preparation"],
  },
  {
    id: "wk-cr-009",
    type: "short",
    track: "workplace",
    topic: "code-review",
    difficulty: 3,
    context:
      "A pull request changes how payments are retried. The comments are almost all about variable naming and brace placement; nobody has questioned the retry logic.",
    prompt:
      "What is this misallocation of review attention called? (Either common name is accepted.)",
    answers: [
      "bikeshedding",
      "bike shedding",
      "bike-shedding",
      "bikeshed",
      "law of triviality",
      "parkinsons law of triviality",
    ],
    typoTolerance: true,
    explanation:
      "Bikeshedding, from Parkinson's law of triviality: people comment on what they can evaluate cheaply, and naming is cheap where retry semantics are not. Exhortation does not fix it. Deleting the cheap surface does — hand style to a formatter, and the only thing left to discuss is the part that matters.",
    concepts: ["Bikeshedding", "Law of triviality", "Review priorities"],
    tags: ["attention", "triviality"],
  },
  {
    id: "wk-cr-010",
    type: "multi",
    track: "workplace",
    topic: "code-review",
    difficulty: 4,
    context:
      "A 2,000-line pull request genuinely cannot be split: it is one generated migration plus the hand-written code that uses it.",
    prompt:
      "How should a reviewer handle a large diff that cannot be split? Select all that apply.",
    options: [
      { id: "a", text: "Ask the author to walk through it, making the review a conversation" },
      { id: "b", text: "Review the hand-written part closely and spot-check the generated part" },
      { id: "c", text: "State in the approval what was and was not actually reviewed" },
      { id: "d", text: "Approve it, since careful review at this size is impossible anyway" },
      { id: "e", text: "Reject it on size, since a large pull request is always avoidable" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The honest move is to bound what your approval claims. An approval that silently covers 2,000 unread lines is worse than one naming the 300 that were checked, because the next person assumes the whole thing was reviewed. Generated code is reviewed at its generator, not line by line.",
    concepts: ["Review scope", "Pull request size", "Generated code", "Defect detection rate"],
    tags: ["large-diffs", "scope"],
  },
  {
    id: "wk-cr-011",
    type: "mcq",
    track: "workplace",
    topic: "code-review",
    difficulty: 3,
    context:
      "Reviews on a team are thorough but take two days to start. Authors have responded by opening bigger pull requests, batching several changes so they only wait once.",
    prompt: "Why does slow review latency push pull request size up?",
    options: [
      {
        id: "a",
        text: "The wait is a fixed cost per review, so authors amortise it by batching more work into one",
      },
      { id: "b", text: "Larger pull requests get reviewed sooner, because reviewers prioritise them" },
      { id: "c", text: "Authors write more code because they have idle time while waiting" },
      { id: "d", text: "Batching improves defect detection, so authors reasonably prefer it" },
    ],
    answer: "a",
    explanation:
      "The loop is the trap: latency drives size up, size drives defect detection down, and reviews get slower still because each one is bigger. Attacking the latency with a rota or a same-day norm is what breaks it. Asking for smaller pull requests while the wait stays at two days is asking people to pay that cost more often.",
    concepts: ["Review latency", "Batch size", "Pull request size", "Feedback loop"],
    tags: ["throughput", "incentives"],
  },
  {
    id: "wk-dbg-005",
    type: "ordering",
    track: "workplace",
    topic: "debugging",
    difficulty: 2,
    prompt: "Put a methodical debugging pass in order.",
    items: [
      "Reproduce the failure reliably, as small as you can make it",
      "Read the error and the stack trace in full, including the actual values",
      "State a hypothesis specific enough that a test could prove it wrong",
      "Design the cheapest test that splits the remaining possibilities in half",
      "Run it, and either discard the hypothesis or narrow it",
      "Fix the cause, then add a test that fails without the fix",
    ],
    explanation:
      "The middle three steps are a loop, and each pass should eliminate about half of what is left rather than confirm what you already suspect. The final step is what stops the bug returning, and it is the one skipped when the fix arrives late in the day.",
    concepts: ["Minimal reproducible example", "Falsifiable hypothesis", "Binary search debugging", "Regression test"],
    tags: ["method", "loop"],
  },
  {
    id: "wk-dbg-006",
    type: "short",
    track: "workplace",
    topic: "debugging",
    difficulty: 3,
    context:
      "A crash happens reliably in production. Attach a debugger or add logging around the failing line and it stops; take them away and it comes back.",
    prompt: "What is a bug that disappears when observed called? (One word.)",
    answers: ["heisenbug", "heisen bug", "heisenbugs", "heisen-bug"],
    typoTolerance: true,
    explanation:
      "A heisenbug, after the uncertainty principle. It is nearly always timing or memory ordering: the logging adds a delay or a barrier that makes the race lose. So the disappearance is your strongest piece of evidence — it says concurrency rather than logic, and points at the interleaving rather than the line.",
    concepts: ["Heisenbug", "Race condition", "Observer effect"],
    tags: ["concurrency", "terminology"],
  },
  {
    id: "wk-dbg-007",
    type: "multi",
    track: "workplace",
    topic: "debugging",
    difficulty: 3,
    context:
      "A bug reproduces on a colleague's machine and in production, and never on yours.",
    prompt:
      "Which differences should you check first when a bug will not reproduce locally? Select all that apply.",
    options: [
      { id: "a", text: "The data — your local database lacks the row shape that triggers it" },
      { id: "b", text: "The configuration actually resolved at runtime, not the values in the repo" },
      { id: "c", text: "Concurrency — local requests are serial where production requests overlap" },
      { id: "d", text: "The runtime version listed in the project's README" },
      { id: "e", text: "Whether your local branch is ahead of the main branch" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The pattern behind all three is that your machine is a small, clean, serial version of production. The README is close to right and wrong in the way that counts — check what the runtime resolved, not what a file claims. Being ahead of main would explain a bug you have and others do not, which is the opposite symptom.",
    concepts: ["Environment parity", "Configuration drift", "Race condition", "Production data"],
    tags: ["reproduction", "environments"],
  },
  {
    id: "wk-dbg-008",
    type: "mcq",
    track: "workplace",
    topic: "debugging",
    difficulty: 4,
    context:
      "An engineer suspects a caching bug, adds a bypass, watches the error stop appearing, and closes the ticket.",
    prompt:
      "What is the risk in concluding the cache was the cause because bypassing it stopped the error?",
    options: [
      {
        id: "a",
        text: "The bypass also changed timing and load, so it may have hidden a different bug rather than fixed one",
      },
      { id: "b", text: "None — a change that stops the error is by definition the fix" },
      { id: "c", text: "The engineer should have bypassed the database instead" },
      { id: "d", text: "The error will only return if the cache is switched back on" },
    ],
    answer: "a",
    explanation:
      "A change that makes a symptom vanish is evidence, not proof — least of all a change that alters timing, since that is exactly what masks a race. The test is whether you can narrate the mechanism: which value was stale, how it got that way, and why that produced this error. No chain means you have a correlation and a closed ticket.",
    concepts: ["Confirmation bias", "Root cause analysis", "Correlation versus causation", "Race condition"],
    tags: ["bias", "verification"],
  },
  {
    id: "wk-dbg-009",
    type: "matching",
    track: "workplace",
    topic: "debugging",
    difficulty: 3,
    prompt: "Match each debugging tool to the question it answers best.",
    pairs: [
      { left: "Stack trace", right: "Which call path reached the failure?" },
      { left: "git bisect", right: "Which commit introduced this?" },
      { left: "Interactive debugger", right: "What are the values right now, at this line?" },
      { left: "Structured logs", right: "What happened in production last Tuesday at 03:00?" },
      { left: "Profiler", right: "Where is the time actually going?" },
    ],
    explanation:
      "Reaching for the wrong one is most of what makes debugging slow. A debugger is excellent locally and useless for something that already happened on a machine you cannot attach to — which is why production debugging is really log design, done before the incident rather than during it.",
    concepts: ["Structured logging", "git bisect", "Profiler", "Stack trace"],
    tags: ["tooling", "selection"],
  },
  {
    id: "wk-dbg-010",
    type: "mcq",
    track: "workplace",
    topic: "debugging",
    difficulty: 3,
    context:
      "A value is correct when it leaves the client and wrong by the time it reaches the database. Six components sit between the two.",
    prompt:
      "What is the fastest way to find which of six components corrupts the value?",
    options: [
      {
        id: "a",
        text: "Inspect the value at the midpoint, then repeat on whichever half still contains the corruption",
      },
      { id: "b", text: "Add logging to all six components and read the output end to end" },
      { id: "c", text: "Start at the client and step forward through each component in turn" },
      { id: "d", text: "Rewrite the two components most likely to be at fault" },
    ],
    answer: "a",
    explanation:
      "Bisection is not only for commit history — it works on any ordered chain. Six components is under three probes, where walking forward averages three and costs six at worst, and instrumenting everything is the most work up front for information you will mostly discard. The skill is picking a boundary where the value is easy to observe.",
    concepts: ["Binary search debugging", "Bisection", "Observability boundary"],
    tags: ["bisection", "method"],
  },
  {
    id: "wk-dbg-011",
    type: "multi",
    track: "workplace",
    topic: "debugging",
    difficulty: 4,
    prompt:
      "What should happen after a bug is fixed, before the ticket is closed? Select all that apply.",
    options: [
      { id: "a", text: "A test that fails against the old code and passes against the new" },
      { id: "b", text: "A search for the same mistake elsewhere in the codebase" },
      { id: "c", text: "A note on why the bug was not caught before it shipped" },
      { id: "d", text: "A defensive check added at every layer the value passes through" },
      { id: "e", text: "The debug logging from the investigation left in permanently" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Running the new test against the unfixed code is what verifies the test, and it is routinely skipped. Blanket defensive checks feel responsible and instead scatter one bug's fix across five files, so the next occurrence is swallowed rather than raised. A mistake made once in a codebase has usually been made more than once.",
    concepts: ["Regression test", "Defensive programming", "Systemic fix", "Root cause analysis"],
    tags: ["closure", "follow-up"],
  },
  {
    id: "wk-est-004",
    type: "short",
    track: "workplace",
    topic: "estimation",
    difficulty: 3,
    context:
      "A team underestimates consistently. Shown that their last ten projects each took roughly twice the estimate, their next estimate is optimistic again.",
    prompt: "What is this systematic bias towards optimistic estimates called? (Two words.)",
    answers: [
      "planning fallacy",
      "the planning fallacy",
      "planning bias",
      "optimism bias",
    ],
    typoTolerance: true,
    explanation:
      "The planning fallacy: people estimate from an imagined smooth path through this specific task rather than from what comparable tasks actually cost. Knowing about it does not fix it — that is the finding. Reference class forecasting does: start from how long the last five similar things took, then argue about why this one differs.",
    concepts: ["Planning fallacy", "Reference class forecasting", "Optimism bias"],
    tags: ["bias", "forecasting"],
  },
  {
    id: "wk-est-005",
    type: "mcq",
    track: "workplace",
    topic: "estimation",
    difficulty: 3,
    context:
      "An engineer says a piece of work is 'about three weeks'. It appears on the roadmap the next day as a date, and a week later as a customer commitment.",
    prompt: "What was lost between the engineer's estimate and the commitment?",
    options: [
      {
        id: "a",
        text: "An estimate is a distribution and a commitment is a promise — converting one to the other takes an explicit buffer and a decision",
      },
      { id: "b", text: "Nothing — once a number is stated it is a commitment" },
      { id: "c", text: "The engineer should have declined to give a number at all" },
      { id: "d", text: "The roadmap should have shown story points rather than weeks" },
    ],
    answer: "a",
    explanation:
      "'About three weeks' usually means something closer to 'more likely than not, between two and five'. A commitment pinned to the middle of a distribution is right roughly half the time, which is not what anyone means by a commitment. State the range and the confidence, and let whoever owns the promise choose where in it to stand.",
    concepts: ["Estimate versus commitment", "Confidence interval", "Schedule buffer"],
    tags: ["commitments", "communication"],
  },
  {
    id: "wk-est-006",
    type: "multi",
    track: "workplace",
    topic: "estimation",
    difficulty: 4,
    prompt:
      "Which practices genuinely improve a team's estimates over time? Select all that apply.",
    options: [
      { id: "a", text: "Comparing estimates against actuals and tracking the ratio" },
      { id: "b", text: "Estimating from how long comparable past work took, rather than from the plan" },
      { id: "c", text: "Decomposing until each piece resembles something the team has done before" },
      { id: "d", text: "Adding a fixed percentage buffer to every estimate" },
      { id: "e", text: "Having the most senior engineer estimate everything" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "All three replace imagination with evidence, which is the only thing that moves accuracy. A flat buffer changes the number without changing what you know, and teams quietly consume it. A single senior estimator is the quickest way to discard the information held by whoever will actually do the work.",
    concepts: ["Reference class forecasting", "Estimate-to-actual ratio", "Decomposition", "Schedule buffer"],
    tags: ["calibration", "practice"],
  },
  {
    id: "wk-est-007",
    type: "ordering",
    track: "workplace",
    topic: "estimation",
    difficulty: 2,
    prompt: "Put the steps of producing a defensible estimate in order.",
    items: [
      "Agree what 'done' means, including review, tests, migration, and rollout",
      "Break the work into pieces small enough that each resembles something done before",
      "Give each piece a range rather than a single number",
      "Name the unknowns that would move that range the most",
      "Time-box a spike for the largest unknown before committing to a number",
    ],
    explanation:
      "Definition of done comes first because it decides what is being estimated at all — most estimates that miss badly were accurate about coding and silent about review and rollout. The last step is what separates an estimate from a guess: when one unknown dominates the range, buy information instead of padding the number.",
    concepts: ["Definition of done", "Decomposition", "Spike", "Timebox"],
    tags: ["method", "ranges"],
  },
  {
    id: "wk-est-008",
    type: "matching",
    track: "workplace",
    topic: "estimation",
    difficulty: 3,
    prompt: "Match each estimation term to what it names.",
    pairs: [
      { left: "Spike", right: "Time-boxed work bought purely to reduce an unknown" },
      {
        left: "Definition of done",
        right: "The agreed list of what must be true before it counts as finished",
      },
      {
        left: "Cone of uncertainty",
        right: "The range narrowing as the work becomes understood",
      },
      {
        left: "Reference class forecasting",
        right: "Estimating from what comparable past work actually cost",
      },
      {
        left: "Yak shaving",
        right: "The chain of prerequisites discovered only once you start",
      },
    ],
    explanation:
      "These name parts of a conversation people otherwise have vaguely. The cone is the one worth internalising: an estimate given before any investigation is not a worse estimate of the same kind, it is a wider one — so the honest answer to 'can you be more precise?' is usually 'yes, after a spike'.",
    concepts: ["Spike", "Cone of uncertainty", "Reference class forecasting", "Definition of done"],
    tags: ["vocabulary"],
  },
  {
    id: "wk-inc-004",
    type: "ordering",
    track: "workplace",
    topic: "incidents",
    difficulty: 2,
    prompt: "Put the phases of responding to a production incident in order.",
    items: [
      "Declare the incident and say who is coordinating it",
      "Stop the bleeding — roll back or disable the change, before understanding why",
      "Confirm from the metrics that users are no longer affected",
      "Diagnose the cause with the time pressure off",
      "Write the postmortem and give each follow-up an owner and a date",
    ],
    explanation:
      "Mitigation before diagnosis is the ordering people invert under pressure, because understanding feels more responsible than reverting. It is not: every minute spent diagnosing is a minute of user impact you could already have ended, and the evidence is still there afterwards.",
    concepts: ["Mitigation before diagnosis", "Incident commander", "Rollback", "Blameless postmortem"],
    tags: ["response", "sequence"],
  },
  {
    id: "wk-inc-005",
    type: "short",
    track: "workplace",
    topic: "incidents",
    difficulty: 3,
    context:
      "A postmortem opens by establishing how many users were affected, for how long, and which functionality degraded — before it goes anywhere near whose change caused it.",
    prompt:
      "What term describes the extent of a failure's impact across users and systems? (Two words.)",
    answers: ["blast radius", "blastradius", "blast-radius", "impact radius"],
    typoTolerance: true,
    explanation:
      "Blast radius. Sizing it first makes severity a fact rather than an argument, and it drives everything downstream: who gets paged, what customers are told, how much the follow-up work is worth. Designs are judged on it too — a change that can only break one tenant is a different risk from one that can break every tenant.",
    concepts: ["Blast radius", "Incident severity", "Blameless postmortem"],
    tags: ["severity", "impact"],
  },
  {
    id: "wk-doc-004",
    type: "matching",
    track: "workplace",
    topic: "design-docs",
    difficulty: 3,
    prompt: "Match each design doc section to the question it answers for a reader.",
    pairs: [
      { left: "Problem statement", right: "Why is anyone spending time on this?" },
      { left: "Non-goals", right: "What did you deliberately decide not to solve?" },
      { left: "Alternatives considered", right: "Why not the obvious cheaper option?" },
      { left: "Rollout plan", right: "How does this reach production without breaking anything?" },
      { left: "Open questions", right: "What do you still need a decision on?" },
    ],
    explanation:
      "Readers arrive with these questions whether or not the document answers them, so a section answering none of them is padding. Open questions changes a review the most: naming what you are unsure about invites help, whereas a document projecting total confidence gets either rubber-stamped or nitpicked.",
    concepts: ["Non-goals", "Alternatives considered", "Rollout plan", "Design document"],
    tags: ["structure", "sections"],
  },
];

export const track: Track = {
  id: "workplace",
  title: "Workplace Craft",
  blurb:
    "Code review, debugging method, design docs, incidents, and estimation — the day-to-day performance layer.",
  topics,
};

export { questions };
