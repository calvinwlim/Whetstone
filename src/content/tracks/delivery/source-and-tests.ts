import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "version-control",
    track: "delivery",
    title: "Version Control",
    blurb: "Branching, history, and the commands worth understanding before you run them.",
    lesson: `Git is the tool every software engineer touches daily and the one most people learn only as far as they must.

**Branching strategies.** *Trunk-based development* keeps everyone committing to one branch, many times a day, behind feature flags where needed. Integration pain stays small because it happens constantly. *Feature branching* isolates work until it is finished, which feels safer and produces exactly the large, painful merges the isolation was meant to avoid. *GitFlow* adds release and hotfix branches on top; it suits versioned software you ship on a schedule and is heavy for continuous delivery.

**Merge versus rebase.** A *merge commit* preserves what actually happened, including the fact that two lines of work existed in parallel. *Rebase* replays your commits on top of the target branch, producing a linear history that reads as though you worked sequentially. Rebase makes history easier to read and rewrites commit hashes, which is why the rule is: rebase your own unpushed work, never rebase what others have pulled.

**The one that bites.** *Force-pushing* a shared branch rewrites history other people have based work on. If you must, \`--force-with-lease\` refuses when someone else has pushed since you last fetched, which turns silent data loss into an error.

**Commands worth knowing properly.** \`git bisect\` binary-searches history for the commit that introduced a bug — roughly seven checkouts for a hundred commits. \`git cherry-pick\` copies one commit onto another branch. \`git reflog\` records where HEAD has been, and is how you recover work you thought a bad reset destroyed.

**Squashing** collapses a messy branch into one commit at merge time. It keeps the main history readable and discards the detail of how you got there, which is usually the right trade for a feature branch and the wrong one for a long-lived refactor.`,
    resources: [
      { label: "Pro Git book", url: "https://git-scm.com/book/en/v2" },
      {
        label: "Trunk Based Development",
        url: "https://trunkbaseddevelopment.com/",
      },
    ],
  },
  {
    id: "testing",
    track: "delivery",
    title: "Testing",
    blurb: "What to test at which level, and what a passing suite does not tell you.",
    lesson: `Tests exist to let you change code without fear. Everything about how you write them follows from that.

**The test pyramid** describes proportions: many fast *unit tests* covering logic in isolation, fewer *integration tests* checking that pieces fit together, and a small number of *end-to-end tests* exercising a real user journey. Inverting it — mostly end-to-end — gives you a suite that is slow, flaky, and tells you something broke without telling you what. The *test trophy* is a popular variant arguing integration tests deserve the most weight.

**Test doubles have distinct names, and interviewers use them precisely.** A *stub* returns canned answers. A *mock* is preloaded with expectations and asserts it was called correctly. A *fake* is a working lightweight implementation, like an in-memory repository. A *spy* records calls without changing behaviour. Reaching for a mock when a fake would do is how test suites end up asserting on their own mocks rather than on behaviour.

**Arrange, Act, Assert** is the structure that keeps a test readable: set up state, perform one action, check one outcome. A test whose name contains "and" is usually two tests.

**Coverage is a signal, not a target.** It tells you which lines ran, not whether anything was verified — a test with no assertions still produces coverage. Chasing a percentage produces tests written to touch lines. Low coverage in a critical path is still worth knowing about.

**Flaky tests are worse than missing ones,** because a suite that fails randomly trains the team to ignore red. Quarantine and fix them; do not re-run until green.

**Test behaviour, not implementation.** A test coupled to how the code works breaks on every refactor and passes when the behaviour is wrong.`,
    resources: [
      {
        label: "Martin Fowler — Test double",
        url: "https://martinfowler.com/bliki/TestDouble.html",
      },
      {
        label: "Google Testing Blog",
        url: "https://testing.googleblog.com/",
      },
    ],
  },
  {
    id: "ci-cd",
    track: "delivery",
    title: "CI/CD Pipelines",
    blurb: "What runs between pushing code and it reaching users.",
    lesson: `**Continuous integration** means everyone merges to a shared branch frequently and an automated build verifies each merge. The value is the frequency: integrating daily makes conflicts small, and the build is what makes daily integration safe.

**Continuous delivery versus continuous deployment.** Delivery means every passing build is *releasable* — the remaining step is a human choosing to press the button. Deployment removes the button: passing the pipeline ships to production. They are constantly used interchangeably and the distinction is exactly what an interviewer is checking.

**A pipeline is a sequence of stages,** each a gate. Typically: install dependencies, lint, typecheck, unit tests, build, integration tests, deploy to a staging environment, smoke test, deploy to production. Order matters — run the cheap, fast checks first so a formatting error fails in twenty seconds rather than after a fifteen-minute test run. This is *fail fast* applied to CI.

**A build artifact should be built once and promoted.** Rebuilding per environment means the thing you tested is not the thing you shipped. Build one artifact, then move it through environments with configuration supplied externally.

**Deployment strategies.** *Blue-green* runs two identical environments and switches traffic, making rollback a switch back. *Canary* sends a small percentage of traffic to the new version and watches error rates before widening. *Rolling* replaces instances gradually. All three exist so that a bad release affects some users briefly rather than all users indefinitely.

**Caching and matrix builds** are the two levers on pipeline speed: cache dependencies between runs, and run independent jobs in parallel rather than in sequence.

**DORA metrics** — deployment frequency, lead time for changes, change failure rate, and time to restore — are the standard way delivery performance gets measured.`,
    resources: [
      {
        label: "Martin Fowler — Continuous integration",
        url: "https://martinfowler.com/articles/continuousIntegration.html",
      },
      {
        label: "DORA — DevOps metrics",
        url: "https://dora.dev/guides/dora-metrics-four-keys/",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------------- Version control ----------------
  {
    id: "dl-vcs-001",
    type: "mcq",
    track: "delivery",
    topic: "version-control",
    difficulty: 1,
    prompt: "What does a merge commit record that a rebase does not?",
    options: [
      { id: "a", text: "That two lines of work existed in parallel and were joined" },
      { id: "b", text: "Which files changed in the branch" },
      { id: "c", text: "The author of each original commit" },
      { id: "d", text: "The order commits were written in" },
    ],
    answer: "a",
    explanation:
      "A merge commit has two parents, so the branching is visible in history forever. Rebase replays your commits onto the target and produces a straight line, which reads more cleanly and discards the fact that the work happened alongside something else.",
    concepts: ["Merge commit", "Rebase", "Fast-forward merge"],
    tags: ["git", "fundamentals"],
  },
  {
    id: "dl-vcs-002",
    type: "mcq",
    track: "delivery",
    topic: "version-control",
    difficulty: 3,
    context:
      "You rebased a branch that two colleagues had already pulled, then force-pushed it.",
    prompt: "What have you done to them?",
    options: [
      {
        id: "a",
        text: "Rewritten commits they have based work on, so their branches now conflict with history that no longer exists",
      },
      { id: "b", text: "Nothing — rebasing only affects your local copy" },
      { id: "c", text: "Deleted their commits from the remote permanently" },
      { id: "d", text: "Triggered an automatic merge on their machines" },
    ],
    answer: "a",
    explanation:
      "Rebase produces new commits with new hashes, so their history and yours have diverged for the same logical work. The rule is to rebase only what nobody else has pulled. When you must force-push a shared branch, --force-with-lease refuses if someone pushed since your last fetch.",
    concepts: ["Rebase", "Force push", "--force-with-lease"],
    tags: ["git", "collaboration"],
  },
  {
    id: "dl-vcs-003",
    type: "matching",
    track: "delivery",
    topic: "version-control",
    difficulty: 3,
    prompt: "Match each Git command to what it is for.",
    pairs: [
      { left: "git bisect", right: "Binary-search history for the commit that introduced a bug" },
      { left: "git cherry-pick", right: "Copy a single commit onto the current branch" },
      { left: "git reflog", right: "Recover work after a bad reset by finding where HEAD was" },
      { left: "git stash", right: "Set aside uncommitted changes to return to later" },
    ],
    explanation:
      "Bisect and reflog are the two most underused. Bisect finds a regression in roughly log2(n) checkouts — about seven for a hundred commits — and reflog is why almost nothing in Git is truly lost, including commits you thought a hard reset destroyed.",
    concepts: ["git bisect", "git cherry-pick", "git reflog", "git stash"],
    tags: ["git", "commands"],
  },
  {
    id: "dl-vcs-004",
    type: "mcq",
    track: "delivery",
    topic: "version-control",
    difficulty: 4,
    prompt:
      "What is the central claim of trunk-based development, and what makes it workable?",
    options: [
      {
        id: "a",
        text: "Integrate constantly so conflicts stay small; feature flags let unfinished work ship dormant",
      },
      { id: "b", text: "Long-lived branches are safer because work is isolated until finished" },
      { id: "c", text: "Every developer works in their own fork and merges monthly" },
      { id: "d", text: "Releases are cut from a dedicated branch per version" },
    ],
    answer: "a",
    explanation:
      "Merge pain grows superlinearly with branch age, so the fix is to stop letting branches age. Feature flags are what make it possible to merge incomplete work safely — without them, trunk-based development means shipping half-built features.",
    concepts: ["Trunk-based development", "Feature flag", "Merge conflict"],
    tags: ["branching"],
  },
  {
    id: "dl-vcs-005",
    type: "short",
    track: "delivery",
    topic: "version-control",
    difficulty: 3,
    context:
      "A regression appeared somewhere in the last 500 commits and you have a script that can tell good from bad.",
    prompt: "Which Git command finds the offending commit in about nine steps?",
    answers: ["bisect", "git bisect", "git-bisect"],
    typoTolerance: true,
    explanation:
      "git bisect. It performs a binary search over history, so 500 commits takes about nine checkouts rather than 500. With `git bisect run <script>` it finds the commit unattended.",
    concepts: ["git bisect", "Binary search", "Regression"],
    tags: ["git", "debugging"],
  },
  {
    id: "dl-vcs-006",
    type: "mcq",
    track: "delivery",
    topic: "version-control",
    difficulty: 2,
    prompt: "When is squashing a branch into one commit the right call?",
    options: [
      {
        id: "a",
        text: "When the intermediate commits are noise and only the finished change matters to history",
      },
      { id: "b", text: "Always — linear history is objectively better" },
      { id: "c", text: "Never — every commit is valuable history" },
      { id: "d", text: "Only when the branch has merge conflicts" },
    ],
    answer: "a",
    explanation:
      "Squashing trades detail for readability. \"fix typo\", \"wip\", \"actually fix it\" help nobody six months later. A long refactor where each step was deliberate is the case against — there, the intermediate commits are the documentation.",
    concepts: ["Squash merge", "Atomic commit"],
    tags: ["git", "history"],
  },

  // ---------------- Testing ----------------
  {
    id: "dl-test-001",
    type: "matching",
    track: "delivery",
    topic: "testing",
    difficulty: 3,
    prompt: "Match each test double to what it does.",
    pairs: [
      { left: "Stub", right: "Returns canned answers to calls" },
      { left: "Mock", right: "Preloaded with expectations and asserts it was called correctly" },
      { left: "Fake", right: "A working lightweight implementation, such as an in-memory store" },
      { left: "Spy", right: "Records how it was called without changing behaviour" },
    ],
    explanation:
      "The distinction interviewers probe is stub versus mock: a stub feeds the test data, a mock is itself the thing being asserted on. Over-using mocks produces suites that verify their own setup rather than behaviour — a fake is usually the better default.",
    concepts: ["Test double", "Stub", "Mock", "Fake", "Spy"],
    tags: ["testing", "doubles"],
  },
  {
    id: "dl-test-002",
    type: "mcq",
    track: "delivery",
    topic: "testing",
    difficulty: 3,
    context: "A team reports 95% code coverage.",
    prompt: "What does that number actually tell you?",
    options: [
      {
        id: "a",
        text: "Which lines executed during the suite — not that anything was verified",
      },
      { id: "b", text: "That 95% of behaviour is correct" },
      { id: "c", text: "That 95% of bugs would be caught" },
      { id: "d", text: "That the test pyramid is correctly proportioned" },
    ],
    answer: "a",
    explanation:
      "A test that calls a function and asserts nothing still produces coverage. That is why coverage is a useful signal in one direction only: low coverage on a critical path is worth investigating, while a high number proves little. Making it a target reliably produces tests written to touch lines.",
    concepts: ["Code coverage", "Goodhart's law", "Assertion"],
    tags: ["testing", "coverage"],
  },
  {
    id: "dl-test-003",
    type: "mcq",
    track: "delivery",
    topic: "testing",
    difficulty: 4,
    context:
      "A suite is mostly end-to-end tests. It takes 40 minutes and fails randomly about once in five runs.",
    prompt: "What is the diagnosis?",
    options: [
      {
        id: "a",
        text: "An inverted test pyramid — push coverage down to fast unit and integration tests",
      },
      { id: "b", text: "Insufficient test coverage; add more end-to-end tests" },
      { id: "c", text: "The CI runner needs more memory" },
      { id: "d", text: "End-to-end tests should never be used" },
    ],
    answer: "a",
    explanation:
      "End-to-end tests touch the most moving parts, so they are the slowest and the most prone to flake. A few are genuinely valuable for critical journeys. When they are the bulk of the suite you get slow feedback that nobody trusts — and a suite that fails randomly trains the team to ignore red.",
    concepts: ["Test pyramid", "Flaky test", "End-to-end test"],
    tags: ["testing", "pyramid"],
  },
  {
    id: "dl-test-004",
    type: "ordering",
    track: "delivery",
    topic: "testing",
    difficulty: 2,
    prompt: "Put the red-green-refactor cycle in order.",
    items: [
      "Write a failing test for the behaviour you want",
      "Watch it fail for the reason you expect",
      "Write the simplest code that makes it pass",
      "Confirm it passes and nothing else broke",
      "Refactor with the test holding the behaviour still",
    ],
    explanation:
      "Watching it fail is the step people skip, and it is the one that proves the test can actually catch the bug. A test written after the code passes immediately, which demonstrates nothing about whether it works.",
    concepts: ["Test-driven development", "Red-green-refactor", "Regression test"],
    tags: ["tdd"],
  },
  {
    id: "dl-test-005",
    type: "mcq",
    track: "delivery",
    topic: "testing",
    difficulty: 4,
    context:
      "A test breaks every time the implementation is refactored, though the behaviour is unchanged.",
    prompt:
      "What is wrong with a test that breaks on every refactor of unchanged behaviour?",
    options: [
      {
        id: "a",
        text: "It asserts on implementation details rather than observable behaviour",
      },
      { id: "b", text: "It needs more mocks to isolate it properly" },
      { id: "c", text: "It belongs at the end-to-end level instead" },
      { id: "d", text: "Nothing — tests are expected to change with the code" },
    ],
    answer: "a",
    explanation:
      "A test coupled to internals inverts the value of testing: it fires when nothing is broken and stays quiet when behaviour actually changes. More mocks make it worse by coupling the test to the call graph. Assert on inputs and outputs.",
    concepts: ["Behaviour-driven testing", "Test brittleness", "Refactoring"],
    tags: ["testing", "design"],
  },
  {
    id: "dl-test-006",
    type: "short",
    track: "delivery",
    topic: "testing",
    difficulty: 2,
    context:
      "A test passes and fails intermittently with no code change, usually because of timing or shared state.",
    prompt: "What is such a test called? (One word.)",
    answers: ["flaky", "flaky test", "flakey", "intermittent"],
    typoTolerance: true,
    explanation:
      "A flaky test. It is worse than no test, because a suite that fails randomly teaches everyone to re-run rather than investigate — and the day it catches something real, it gets re-run too.",
    concepts: ["Flaky test", "Test isolation", "Race condition"],
    tags: ["testing"],
  },
  {
    id: "dl-test-007",
    type: "mcq",
    track: "delivery",
    topic: "testing",
    difficulty: 3,
    prompt:
      "What does the Arrange-Act-Assert structure buy a test?",
    options: [
      {
        id: "a",
        text: "One clear setup, one action, and one verified outcome — so a failure names one thing",
      },
      { id: "b", text: "Faster execution by grouping setup" },
      { id: "c", text: "Automatic isolation between tests" },
      { id: "d", text: "Compatibility across testing frameworks" },
    ],
    answer: "a",
    explanation:
      "The structure enforces one behaviour per test, which is what makes a red test informative. If a test needs two acts or two unrelated assertions, it is two tests — and a name containing \"and\" is usually the tell.",
    concepts: ["Arrange-Act-Assert", "Unit test", "Test naming"],
    tags: ["testing", "structure"],
  },

  // ---------------- CI/CD ----------------
  {
    id: "dl-ci-001",
    type: "mcq",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 2,
    prompt:
      "What is the difference between continuous delivery and continuous deployment?",
    options: [
      {
        id: "a",
        text: "Delivery makes every passing build releasable; deployment ships it automatically with no human step",
      },
      { id: "b", text: "Delivery covers testing and deployment covers building" },
      { id: "c", text: "They are two names for the same practice" },
      { id: "d", text: "Delivery applies to libraries and deployment to services" },
    ],
    answer: "a",
    explanation:
      "Both require a pipeline you trust. The difference is whether a human presses the button. Continuous deployment demands stronger automated verification, because nothing stands between a merge and production.",
    concepts: [
      "Continuous integration",
      "Continuous delivery",
      "Continuous deployment",
    ],
    tags: ["ci-cd", "fundamentals"],
  },
  {
    id: "dl-ci-002",
    type: "ordering",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 3,
    prompt: "Order these pipeline stages so the cheapest checks fail first.",
    items: [
      "Install dependencies",
      "Lint and typecheck",
      "Unit tests",
      "Build the artifact",
      "Integration tests",
      "Deploy to staging and smoke test",
    ],
    explanation:
      "Fail fast applied to CI: a formatting error should cost twenty seconds, not a fifteen-minute test run. Ordering by cost also means the feedback a developer gets most often is the feedback that arrives soonest.",
    concepts: ["Pipeline stage", "Fail fast", "Smoke test"],
    tags: ["ci-cd", "pipeline"],
  },
  {
    id: "dl-ci-003",
    type: "mcq",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 4,
    context:
      "A pipeline rebuilds the application separately for staging and for production.",
    prompt:
      "Why is it a problem to rebuild an application separately for each environment?",
    options: [
      {
        id: "a",
        text: "The artifact tested in staging is not the artifact shipped to production",
      },
      { id: "b", text: "It doubles the build minutes used" },
      { id: "c", text: "Staging and production must use different artifacts" },
      { id: "d", text: "It prevents caching dependencies" },
    ],
    answer: "a",
    explanation:
      "Two builds can differ through dependency drift, a changed base image, or a build-time environment variable — so staging verified something else. Build once, promote the same artifact, and inject configuration at runtime. Wasted minutes are a real but secondary cost.",
    concepts: ["Build artifact", "Build once, deploy many", "Immutable artifact"],
    tags: ["ci-cd", "artifacts"],
  },
  {
    id: "dl-ci-004",
    type: "matching",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 3,
    prompt: "Match each deployment strategy to how it works.",
    pairs: [
      { left: "Blue-green", right: "Two identical environments; switch traffic between them" },
      { left: "Canary", right: "Send a small share of traffic to the new version and watch" },
      { left: "Rolling", right: "Replace instances gradually until all run the new version" },
      { left: "Recreate", right: "Stop the old version, then start the new one" },
    ],
    explanation:
      "The first three exist so a bad release harms some users briefly rather than all users for as long as it takes to notice. Blue-green makes rollback a traffic switch; canary catches problems on a small blast radius; recreate is the only one with guaranteed downtime.",
    concepts: ["Blue-green deployment", "Canary release", "Rolling deployment"],
    tags: ["ci-cd", "deployment"],
  },
  {
    id: "dl-ci-005",
    type: "multi",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 4,
    prompt: "Which genuinely speed up a slow pipeline? Select all that apply.",
    options: [
      { id: "a", text: "Caching dependencies between runs" },
      { id: "b", text: "Running independent jobs in parallel" },
      { id: "c", text: "Ordering fast checks before slow ones" },
      { id: "d", text: "Running only the tests affected by the change" },
      { id: "e", text: "Skipping tests on the main branch to ship faster" },
    ],
    answers: ["a", "b", "c", "d"],
    tags: ["ci-cd", "performance"],
    explanation:
      "The first four cut wall-clock time without cutting verification. Skipping tests on main removes the check at exactly the point where it matters most — that is not a faster pipeline, it is no pipeline.",
    concepts: ["Build cache", "Matrix build", "Test impact analysis"],
  },
  {
    id: "dl-ci-006",
    type: "short",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 3,
    context:
      "Deployment frequency, lead time for changes, change failure rate, and time to restore service.",
    prompt: "What are these four measures collectively called? (One word.)",
    answers: ["dora", "dora metrics", "four keys", "dora four keys"],
    typoTolerance: true,
    explanation:
      "The DORA metrics, from the DevOps Research and Assessment programme. Two measure speed and two measure stability, which is the point — they are designed to be read together so a team cannot ship faster by shipping worse.",
    concepts: ["DORA metrics", "Lead time for changes", "Change failure rate"],
    tags: ["ci-cd", "metrics"],
  },
  {
    id: "dl-ci-007",
    type: "mcq",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 4,
    context:
      "A canary release shows a slightly elevated error rate, but well within normal daily variance.",
    prompt: "What does a canary need to be useful here?",
    options: [
      {
        id: "a",
        text: "Enough traffic and time for the signal to clear the noise, with defined promote or roll back criteria",
      },
      { id: "b", text: "A larger percentage of traffic immediately" },
      { id: "c", text: "A second canary in a different region" },
      { id: "d", text: "Nothing — any elevation should trigger a rollback" },
    ],
    answer: "a",
    explanation:
      "A canary is a statistical comparison. Too little traffic or too short a window and you cannot distinguish a real regression from ordinary variance, so the decision becomes a guess. Deciding the thresholds before you start is what stops it becoming a vibe check.",
    concepts: ["Canary release", "Error budget", "Statistical significance"],
    tags: ["ci-cd", "canary"],
  },
  {
    id: "dl-vcs-007",
    type: "multi",
    track: "delivery",
    topic: "version-control",
    difficulty: 3,
    prompt:
      "What makes a commit message useful to someone reading it a year later? Select all that apply.",
    options: [
      { id: "a", text: "A subject line saying what changed, readable in a one-line log" },
      { id: "b", text: "A body explaining why, since the diff already shows what" },
      { id: "c", text: "A reference to the issue or incident that prompted it" },
      { id: "d", text: "A list of every file the commit touches" },
      { id: "e", text: "The author's name and the date the change was made" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The commit log is the only documentation guaranteed to still exist and still be attached to the code. Its value is almost entirely in the why, because the what is recoverable from the diff and the metadata is recorded for you. The test: would someone running git blame on a confusing line learn anything?",
    concepts: ["Commit message", "git blame", "Atomic commit", "Change rationale"],
    tags: ["commits", "history"],
  },
  {
    id: "dl-vcs-008",
    type: "matching",
    track: "delivery",
    topic: "version-control",
    difficulty: 3,
    prompt: "Match each Git operation to what it does to history.",
    pairs: [
      { left: "git revert", right: "Adds a new commit that undoes an earlier one" },
      {
        left: "git reset --hard",
        right: "Moves the branch pointer and discards the working tree",
      },
      {
        left: "git rebase",
        right: "Replays commits onto a new base, giving them new ids",
      },
      { left: "git merge", right: "Joins two histories with a commit that has two parents" },
      {
        left: "git commit --amend",
        right: "Replaces the most recent commit with a different one",
      },
    ],
    explanation:
      "The dividing line is whether the operation is append-only. Revert and merge add; reset, rebase, and amend rewrite, producing commits with new ids. Rewriting is fine on a branch only you have. On a shared branch it forces everyone else to reconcile against a history that no longer matches the one they pulled.",
    concepts: ["git revert", "git rebase", "History rewriting", "Force push"],
    tags: ["history", "commands"],
  },
  {
    id: "dl-vcs-009",
    type: "ordering",
    track: "delivery",
    topic: "version-control",
    difficulty: 2,
    prompt: "Put the steps of resolving a merge conflict in order.",
    items: [
      "Read both sides and work out what each change was trying to do",
      "Decide what the combined behaviour should be, rather than picking a side",
      "Edit the file to that result and remove the conflict markers",
      "Mark the file resolved and complete the merge",
      "Run the tests, because a cleanly merged file can still be semantically wrong",
    ],
    explanation:
      "The last step exists because Git merges text, not meaning. Two changes can merge with no conflict at all and still break together — one renames a function, the other adds a call to the old name in a file the first never touched — and that is exactly the case a conflict-free merge will not warn you about.",
    concepts: ["Merge conflict", "Semantic conflict", "Conflict markers", "Continuous integration"],
    tags: ["merging", "conflicts"],
  },
  {
    id: "dl-test-008",
    type: "short",
    track: "delivery",
    topic: "testing",
    difficulty: 4,
    context:
      "Instead of a handful of hand-picked cases, a test states an invariant — reversing a list twice returns the original — and the framework generates hundreds of random inputs, shrinking any failure to its smallest form.",
    prompt: "What style of testing is this? (Two words.)",
    answers: [
      "property based testing",
      "property-based testing",
      "property based",
      "property testing",
      "property based tests",
    ],
    typoTolerance: true,
    explanation:
      "Property-based testing. It finds the inputs you would never have thought of, which is exactly the set your example tests are missing — empty collections, boundary values, awkward Unicode. Shrinking is what makes it usable in practice: a failure on a 400-element list is reported as the two-element case that actually breaks.",
    concepts: ["Property-based testing", "Invariant", "Shrinking", "Fuzzing"],
    tags: ["properties", "generative"],
  },
  {
    id: "dl-test-009",
    type: "multi",
    track: "delivery",
    topic: "testing",
    difficulty: 3,
    prompt: "Which practices make a test suite deterministic? Select all that apply.",
    options: [
      { id: "a", text: "Injecting the clock, so 'now' is a value the test controls" },
      { id: "b", text: "Seeding the random number generator, or injecting the source of randomness" },
      { id: "c", text: "Having each test set up and tear down its own data rather than sharing a fixture" },
      { id: "d", text: "Adding a short sleep before assertions that sometimes fail" },
      { id: "e", text: "Retrying a failing test up to three times before reporting it" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The two rejected options are how a flaky test becomes permanent: a sleep makes the race less likely without removing it, and an automatic retry converts a real intermittent bug into a green pipeline. Both work by hiding the signal. The first three remove the non-determinism, by turning ambient state into an explicit input.",
    concepts: ["Deterministic test", "Dependency injection", "Test isolation", "Flaky test"],
    tags: ["determinism", "flakiness"],
  },
  {
    id: "dl-test-010",
    type: "mcq",
    track: "delivery",
    topic: "testing",
    difficulty: 4,
    context:
      "Two services are each tested against a mock of the other. Both suites are green, and the integration breaks in staging because the mocks encode an agreement neither service actually keeps.",
    prompt: "What kind of test catches a mock that has drifted from the real service?",
    options: [
      {
        id: "a",
        text: "A contract test, where the consumer's expectations are verified against the real provider",
      },
      { id: "b", text: "More unit tests on both sides of the boundary" },
      { id: "c", text: "A snapshot test of each service's response body" },
      { id: "d", text: "A higher coverage threshold enforced on both services" },
    ],
    answer: "a",
    explanation:
      "A mock records one team's belief about another team's behaviour, and nothing verifies that belief. A contract test makes it executable: the consumer publishes what it depends on, and the provider's pipeline fails the moment it stops honouring that. An end-to-end suite catches this too — later, more slowly, and with a far worse failure message.",
    concepts: ["Consumer-driven contract testing", "Test double", "Integration test", "Service boundary"],
    tags: ["contracts", "mocks"],
  },
  {
    id: "dl-ci-008",
    type: "multi",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 3,
    prompt:
      "Which properties make a CI pipeline worth trusting? Select all that apply.",
    options: [
      { id: "a", text: "A red build means something is genuinely broken, every time" },
      { id: "b", text: "Re-running the same commit produces the same result" },
      { id: "c", text: "It is fast enough that people wait for it rather than route around it" },
      { id: "d", text: "Every check is advisory, so a red build never blocks a merge" },
      { id: "e", text: "It runs only on the main branch, after the merge has landed" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "These are one property in three forms: the pipeline has to be believed. A suite with known-flaky tests trains people to re-run until green, which is the same as having no suite. A slow one trains them to merge and check later. Running only after merge makes main the place breakage is discovered, once everyone has pulled it.",
    concepts: ["Build reproducibility", "Flaky test", "Pipeline latency", "Merge gate"],
    tags: ["trust", "pipelines"],
  },
  {
    id: "dl-ci-009",
    type: "mcq",
    track: "delivery",
    topic: "ci-cd",
    difficulty: 4,
    context:
      "A deploy goes out at 17:00 and error rates climb. The team believes it knows the cause, and that a fix would take twenty minutes to write and test.",
    prompt: "Should the team roll back, or roll forward with the fix?",
    options: [
      {
        id: "a",
        text: "Roll back — it is the change with a known outcome, and the fix can ship calmly afterwards",
      },
      { id: "b", text: "Roll forward, because a rollback would also revert the other changes in the release" },
      { id: "c", text: "Roll forward, because twenty minutes beats the time a rollback usually takes" },
      { id: "d", text: "Wait, to see whether the error rate settles on its own" },
    ],
    answer: "a",
    explanation:
      "A rollback returns you to a state that was demonstrably working an hour ago, which is the only outcome here you can predict. Twenty minutes is an estimate made under pressure by someone who has just been wrong about this code once. Roll forward only when rolling back is genuinely impossible — which is an argument for making rollback cheap.",
    concepts: ["Rollback", "Roll forward", "Mean time to recovery", "Irreversible migration"],
    tags: ["incidents", "deploys"],
  },
];
