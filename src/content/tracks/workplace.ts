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
    prompt: "What is the efficient approach?",
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
    tags: ["communication", "re-estimation"],
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
