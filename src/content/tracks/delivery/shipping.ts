import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "cloud-deployment",
    track: "delivery",
    title: "Deploying to the Cloud",
    blurb: "Getting an application running somewhere other than your laptop.",
    lesson: `Deployment from an application developer's seat is mostly about making your app portable and configurable, then letting a platform run it.

**The twelve-factor app** is the checklist most modern platforms assume. The parts that bite: *config comes from the environment*, not from files checked into the repo, so one artifact runs in every environment. *Processes are stateless* — anything written to local disk vanishes, because the filesystem is ephemeral and the next request may land on a different instance. *Backing services are attached resources*, addressed by URL, so swapping a local database for a hosted one is a config change.

**Containers** package your app with its dependencies into an *image*, so the thing that ran on your machine is the thing that runs in production. That is *immutable infrastructure*: you do not patch a running server, you build a new image and replace it. Rollback becomes redeploying the previous image.

**Configuration versus secrets.** Both come from the environment; only one is safe to log, print in an error, or show in a dashboard. Secrets belong in a managed store with restricted access and rotation, not in the same place as your feature flags.

**Scaling.** *Horizontal* scaling adds instances and requires statelessness; *vertical* scaling makes one instance bigger and eventually runs out of machine. Platforms scale horizontally, which is why session state in memory is the classic thing that breaks on the second instance.

**Serverless** trades always-on capacity for per-request billing and automatic scaling, at the cost of *cold starts* — the latency of spinning up an instance that was not already running — and time limits on execution.

**Health checks** come in two kinds and conflating them causes outages. A *liveness* probe asks "is this process wedged and in need of a restart?". A *readiness* probe asks "should this instance receive traffic right now?". An instance warming up is not ready, and restarting it does not help.`,
    resources: [
      { label: "The Twelve-Factor App", url: "https://12factor.net/" },
      {
        label: "Kubernetes — Liveness and readiness probes",
        url: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
      },
    ],
  },
  {
    id: "feature-flags",
    track: "delivery",
    title: "Feature Flags",
    blurb: "Separating deploying code from releasing behaviour.",
    lesson: `A feature flag decouples *deploy* from *release*. The code ships dark, and a runtime switch decides who sees it. That separation is what makes trunk-based development and continuous deployment practical, because unfinished work can merge without being visible.

**The kinds are worth naming, because they have different lifespans.** *Release toggles* hide work in progress and should be removed once the feature is fully on — days or weeks. *Operational toggles*, or kill switches, let you disable an expensive or risky subsystem under load, and live as long as the subsystem does. *Experiment toggles* drive A/B tests and die when the experiment concludes. *Permission toggles* gate features by plan or role and are effectively permanent.

**Progressive rollout** turns a release into a dial: one percent, then ten, then fifty, watching error rates and latency at each step. If something is wrong, the blast radius is bounded and the fix is turning the dial back — no rollback, no redeploy.

**Dark launching** runs new code in production without exposing its output: you call the new path, discard the result, and compare it to the old one. It gives you real production traffic against untested code with no user-visible risk.

**Flag debt is the real cost.** Every flag is a branch in your code and a multiplier on the states you must reason about. Ten flags is a thousand possible combinations, almost none of which are tested. Flags that outlive their purpose are how a codebase becomes impossible to reason about, so a release toggle needs a removal date the way a TODO needs an owner.

**Flags are not free at runtime either.** Evaluation should be fast, local, and fail safe — if the flag service is unreachable, the application must still start and take a sensible default.`,
    resources: [
      {
        label: "Martin Fowler — Feature toggles",
        url: "https://martinfowler.com/articles/feature-toggles.html",
      },
    ],
  },
  {
    id: "dependencies",
    track: "delivery",
    title: "Dependencies & Supply Chain",
    blurb: "Versioning, lockfiles, and the code you did not write but do ship.",
    lesson: `Most of what you deploy is code somebody else wrote. Managing that is a first-class engineering concern.

**Semantic versioning** encodes intent in \`MAJOR.MINOR.PATCH\`: major means a breaking change, minor adds functionality compatibly, patch fixes bugs compatibly. Range specifiers build on it — a caret (\`^1.2.3\`) accepts minor and patch updates, a tilde (\`~1.2.3\`) accepts only patch. The convention only helps to the extent maintainers honour it, which is why lockfiles exist.

**A lockfile records the exact resolved version of every package, including transitive ones.** Without it, two installs a week apart produce different dependency trees, and "works on my machine" becomes literally true. Commit it, and use the CI-specific install command (\`npm ci\`, \`pnpm install --frozen-lockfile\`) so a build fails rather than silently resolving something new.

**Transitive dependencies are where the risk concentrates.** You choose ten packages and install four hundred. Most of what ships is code you never evaluated, from maintainers you have never heard of.

**Supply chain attacks** exploit exactly that. *Typosquatting* registers names close to popular packages. *Dependency confusion* publishes a public package matching your private internal name, hoping the resolver prefers the public registry. A *compromised maintainer account* pushes a malicious patch release that everyone on a caret range picks up automatically. Installation itself can run scripts, so the damage happens before your code executes.

**An SBOM** — software bill of materials — is the inventory of everything you ship, and it is what makes "are we affected by this CVE?" answerable in minutes rather than days.

**Keep dependencies current in small increments.** A dependency two years stale is not a stable dependency, it is a migration you have deferred, and the security patch will arrive when you least want the work.`,
    resources: [
      { label: "Semantic Versioning", url: "https://semver.org/" },
      {
        label: "OWASP — Dependency-Check",
        url: "https://owasp.org/www-project-dependency-check/",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------------- Cloud deployment ----------------
  {
    id: "dl-cloud-001",
    type: "mcq",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 2,
    context:
      "An app writes uploaded files to local disk. It works on one instance, then breaks when a second is added.",
    prompt:
      "Which principle is violated by writing uploaded files to local disk?",
    options: [
      {
        id: "a",
        text: "Processes should be stateless with an ephemeral filesystem — shared state belongs in a backing service",
      },
      { id: "b", text: "The instances need a shared session cookie" },
      { id: "c", text: "The load balancer should use sticky sessions" },
      { id: "d", text: "Files should be written asynchronously" },
    ],
    answer: "a",
    explanation:
      "Requests land on whichever instance the balancer picks, so a file written by one is invisible to the others — and vanishes when the container is replaced. Object storage is the fix. Sticky sessions paper over it and reintroduce the problem the moment an instance restarts.",
    concepts: ["Twelve-factor app", "Stateless process", "Ephemeral filesystem"],
    tags: ["12factor", "state"],
  },
  {
    id: "dl-cloud-002",
    type: "mcq",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 3,
    prompt:
      "What is the difference between a liveness probe and a readiness probe?",
    options: [
      {
        id: "a",
        text: "Liveness asks whether to restart the process; readiness asks whether to send it traffic",
      },
      { id: "b", text: "Liveness runs at startup and readiness runs continuously" },
      { id: "c", text: "Liveness checks the app and readiness checks the database" },
      { id: "d", text: "They are the same check under two names" },
    ],
    answer: "a",
    explanation:
      "Conflating them causes outages. An instance still warming a cache is not ready but is perfectly alive — restarting it just makes it start over. Worse, if a liveness probe depends on a shared database, one database blip restarts every instance at once.",
    concepts: ["Liveness probe", "Readiness probe", "Health check"],
    tags: ["health-checks"],
  },
  {
    id: "dl-cloud-003",
    type: "mcq",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 3,
    prompt: "What does immutable infrastructure mean in practice?",
    options: [
      {
        id: "a",
        text: "You never patch a running instance — you build a new image and replace it",
      },
      { id: "b", text: "Infrastructure cannot be changed once provisioned" },
      { id: "c", text: "Configuration is baked into the application code" },
      { id: "d", text: "Servers are never restarted" },
    ],
    answer: "a",
    explanation:
      "Every running instance came from a known image, so there is no configuration drift and no server that is subtly different because someone SSH'd in during an incident. Rollback becomes redeploying the previous image rather than undoing a change by hand.",
    concepts: ["Immutable infrastructure", "Container image", "Configuration drift"],
    tags: ["containers"],
  },
  {
    id: "dl-cloud-004",
    type: "mcq",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 4,
    context:
      "A serverless endpoint is fast under steady traffic but occasionally takes over a second for no obvious reason.",
    prompt:
      "Why would a serverless endpoint occasionally take a second under steady traffic?",
    options: [
      {
        id: "a",
        text: "A cold start — an instance had to be created because none was warm",
      },
      { id: "b", text: "The database connection pool is exhausted" },
      { id: "c", text: "The CDN is missing on those requests" },
      { id: "d", text: "The function exceeded its memory limit" },
    ],
    answer: "a",
    explanation:
      "Serverless platforms scale to zero, so a request arriving with no warm instance pays for initialisation. It is intermittent by nature and shows up in the tail rather than the median. Smaller bundles and lighter initialisation reduce it; provisioned concurrency removes it at a cost.",
    concepts: ["Cold start", "Serverless", "Tail latency"],
    tags: ["serverless"],
  },
  {
    id: "dl-cloud-005",
    type: "multi",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 3,
    prompt:
      "Which belong in environment configuration rather than in the repository? Select all that apply.",
    options: [
      { id: "a", text: "Database connection strings" },
      { id: "b", text: "API keys and tokens" },
      { id: "c", text: "The base URL of an external service, which differs per environment" },
      { id: "d", text: "Feature flag defaults that differ between staging and production" },
      { id: "e", text: "The application's routing table" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Anything that varies by environment or must stay secret comes from the environment, which is what lets one artifact run everywhere. Routing is application behaviour — putting it in config means the thing you tested is not the thing that runs.",
    concepts: ["Environment variable", "Secrets management", "Twelve-factor config"],
    tags: ["config"],
  },
  {
    id: "dl-cloud-006",
    type: "short",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 2,
    context:
      "Adding more instances of a service rather than making one instance bigger.",
    prompt: "What is this kind of scaling called? (One word.)",
    answers: ["horizontal", "horizontally", "horizontal scaling", "scale out"],
    typoTolerance: true,
    explanation:
      "Horizontal scaling, or scaling out. It requires stateless processes, since any instance must be able to serve any request. Vertical scaling — a bigger machine — needs no code changes and eventually hits the largest machine available.",
    concepts: ["Horizontal scaling", "Vertical scaling", "Stateless process"],
    tags: ["scaling", "fundamentals"],
  },

  // ---------------- Feature flags ----------------
  {
    id: "dl-flag-001",
    type: "mcq",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 2,
    prompt: "What do feature flags fundamentally decouple?",
    options: [
      { id: "a", text: "Deploying code from releasing the behaviour to users" },
      { id: "b", text: "The frontend from the backend" },
      { id: "c", text: "Testing from deployment" },
      { id: "d", text: "Configuration from secrets" },
    ],
    answer: "a",
    explanation:
      "Code can ship dark and be switched on later, for some users or all. That separation is what makes trunk-based development workable — unfinished work merges without becoming visible — and it turns a release into a dial rather than an event.",
    concepts: ["Feature flag", "Deploy versus release", "Dark launch"],
    tags: ["flags", "fundamentals"],
  },
  {
    id: "dl-flag-002",
    type: "matching",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 4,
    prompt: "Match each kind of toggle to its expected lifespan.",
    pairs: [
      { left: "Release toggle", right: "Days or weeks, removed once the feature is fully on" },
      { left: "Operational toggle", right: "As long as the subsystem it can disable exists" },
      { left: "Experiment toggle", right: "Until the experiment reaches a conclusion" },
      { left: "Permission toggle", right: "Effectively permanent, gating by plan or role" },
    ],
    explanation:
      "Lifespan is the useful axis because it tells you which flags are debt. A release toggle still present a year later is a branch in your code nobody remembers the purpose of; a permission toggle is simply how the product works.",
    concepts: ["Release toggle", "Kill switch", "Flag debt"],
    tags: ["flags", "taxonomy"],
  },
  {
    id: "dl-flag-003",
    type: "mcq",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 4,
    context: "A codebase has accumulated ten long-lived release toggles.",
    prompt: "What is the concrete cost?",
    options: [
      {
        id: "a",
        text: "Up to 1,024 combinations of behaviour, almost none of which are tested",
      },
      { id: "b", text: "Ten extra network calls per request" },
      { id: "c", text: "Ten additional deployment environments to maintain" },
      { id: "d", text: "Nothing, provided each flag defaults to off" },
    ],
    answer: "a",
    explanation:
      "Flags multiply rather than add: each is a branch, so n flags give 2^n possible states. You test a handful and ship the rest untried. That combinatorial blow-up is why release toggles need removal dates and why flag cleanup is real work rather than tidying.",
    concepts: ["Flag debt", "Combinatorial explosion", "Release toggle"],
    tags: ["flags", "debt"],
  },
  {
    id: "dl-flag-004",
    type: "mcq",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 4,
    prompt:
      "The flag service becomes unreachable at startup. What should the application do?",
    options: [
      {
        id: "a",
        text: "Start with sensible cached or default values — flag evaluation must fail safe",
      },
      { id: "b", text: "Refuse to start until flags can be fetched" },
      { id: "c", text: "Enable every flag so no feature is missing" },
      { id: "d", text: "Disable every flag including permission toggles" },
    ],
    answer: "a",
    explanation:
      "A flag system that can take your application down has made reliability worse, not better. Defaults compiled in, plus a cached last-known-good set, mean an outage in the flag service degrades behaviour rather than preventing startup. Enabling everything would ship unreleased features.",
    concepts: ["Fail safe", "Graceful degradation", "Feature flag"],
    tags: ["flags", "resilience"],
  },
  {
    id: "dl-flag-005",
    type: "short",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 3,
    context:
      "New code runs in production against real traffic, but its output is discarded and compared against the old path rather than shown to users.",
    prompt: "What is this technique called? (Two words.)",
    answers: ["dark launch", "dark launching", "dark-launch", "shadow traffic", "shadowing"],
    typoTolerance: true,
    explanation:
      "Dark launching, sometimes called shadowing. You get real production load and real data against untested code with zero user-visible risk, which is the only honest way to know whether a rewrite behaves like the thing it replaces.",
    concepts: ["Dark launch", "Shadow traffic", "Progressive delivery"],
    tags: ["flags", "release"],
  },

  // ---------------- Dependencies ----------------
  {
    id: "dl-dep-001",
    type: "mcq",
    track: "delivery",
    topic: "dependencies",
    difficulty: 2,
    prompt: "In semantic versioning, what does a change from 2.4.1 to 3.0.0 signal?",
    options: [
      { id: "a", text: "A breaking change — upgrading may require code changes" },
      { id: "b", text: "A large number of new features" },
      { id: "c", text: "A security patch of high severity" },
      { id: "d", text: "A complete rewrite of the package" },
    ],
    answer: "a",
    explanation:
      "Major means the public contract changed incompatibly. It says nothing about size — a one-line rename is a major bump if it breaks callers. The convention only helps as far as maintainers honour it, which is precisely why lockfiles exist.",
    concepts: ["Semantic versioning", "Breaking change", "Major version"],
    tags: ["semver", "fundamentals"],
  },
  {
    id: "dl-dep-002",
    type: "mcq",
    track: "delivery",
    topic: "dependencies",
    difficulty: 3,
    context:
      "Two developers install the same project a week apart and get different behaviour. The lockfile is in .gitignore.",
    prompt:
      "Why would two installs of the same project a week apart behave differently?",
    options: [
      {
        id: "a",
        text: "Version ranges resolve to whatever is newest at install time, so their dependency trees differ",
      },
      { id: "b", text: "Their package manager versions differ" },
      { id: "c", text: "One of them installed with the wrong Node version" },
      { id: "d", text: "The registry served a corrupted package" },
    ],
    answer: "a",
    explanation:
      "A caret range accepts any compatible newer release, including transitive ones you never chose. The lockfile pins the entire resolved tree so installs are reproducible — commit it, and use a frozen-lockfile install in CI so a build fails rather than quietly resolving something new.",
    concepts: ["Lockfile", "Transitive dependency", "Reproducible build"],
    tags: ["lockfile"],
  },
  {
    id: "dl-dep-003",
    type: "matching",
    track: "delivery",
    topic: "dependencies",
    difficulty: 4,
    prompt: "Match each supply chain attack to how it works.",
    pairs: [
      { left: "Typosquatting", right: "Registering a name close to a popular package" },
      { left: "Dependency confusion", right: "Publishing a public package matching a private internal name" },
      { left: "Compromised maintainer", right: "Pushing a malicious patch release that ranges pick up automatically" },
      { left: "Protestware", right: "A maintainer deliberately sabotaging their own package" },
    ],
    explanation:
      "All four exploit the same thing: you install hundreds of packages you never evaluated, and installation can execute scripts before your code runs. Pinning versions, reviewing new dependencies, and disabling install scripts where practical are the defences.",
    concepts: ["Typosquatting", "Dependency confusion", "Supply chain attack"],
    tags: ["supply-chain", "security"],
  },
  {
    id: "dl-dep-004",
    type: "mcq",
    track: "delivery",
    topic: "dependencies",
    difficulty: 4,
    context:
      "A CVE is announced in a widely used library. Leadership asks whether you are affected.",
    prompt: "What makes that answerable in minutes rather than days?",
    options: [
      {
        id: "a",
        text: "An SBOM — a maintained inventory of every component you ship, including transitive ones",
      },
      { id: "b", text: "A list of your direct dependencies" },
      { id: "c", text: "The lockfile alone" },
      { id: "d", text: "Your container registry's image list" },
    ],
    answer: "a",
    explanation:
      "Direct dependencies are the small part; vulnerabilities usually sit several levels down. An SBOM records the full resolved set per artifact, so the question becomes a lookup. A lockfile gets you close for one project and does not span every service you run.",
    concepts: ["SBOM", "CVE", "Transitive dependency"],
    tags: ["supply-chain", "inventory"],
  },
  {
    id: "dl-dep-005",
    type: "mcq",
    track: "delivery",
    topic: "dependencies",
    difficulty: 3,
    prompt:
      "Why keep dependencies current in small increments rather than upgrading in a big batch every couple of years?",
    options: [
      {
        id: "a",
        text: "Deferred upgrades compound into a migration, and the forcing security patch arrives at the worst time",
      },
      { id: "b", text: "Newer versions are always faster" },
      { id: "c", text: "Package managers refuse very old versions" },
      { id: "d", text: "It reduces the number of transitive dependencies" },
    ],
    answer: "a",
    explanation:
      "A dependency two years stale is not stable, it is a migration you have postponed — and you will be forced into it by a vulnerability, under time pressure, across several major versions at once. Small regular upgrades keep each one boring.",
    concepts: ["Dependency drift", "Technical debt", "Patch cadence"],
    tags: ["maintenance"],
  },
  {
    id: "dl-dep-006",
    type: "short",
    track: "delivery",
    topic: "dependencies",
    difficulty: 2,
    context:
      "The file that records the exact resolved version of every package, direct and transitive, so installs are reproducible.",
    prompt: "What is this file generically called? (One word.)",
    answers: ["lockfile", "lock file", "lock-file", "lockfiles"],
    typoTolerance: true,
    explanation:
      "A lockfile — package-lock.json, pnpm-lock.yaml, Cargo.lock, poetry.lock. Commit it, and install from it in CI, or the build resolves fresh versions and you have tested something other than what ships.",
    concepts: ["Lockfile", "Reproducible build", "Dependency resolution"],
    tags: ["lockfile", "fundamentals"],
  },
  {
    id: "dl-cloud-007",
    type: "ordering",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 3,
    prompt: "Put the steps a process should take on receiving a shutdown signal in order.",
    items: [
      "The process receives SIGTERM",
      "It starts failing its readiness probe, so no new traffic is routed to it",
      "It finishes the requests already in flight",
      "It closes database connections and flushes buffers",
      "It exits cleanly, before the grace period runs out",
    ],
    explanation:
      "The second step is the one teams miss, and skipping it is why deploys emit a burst of errors: SIGTERM and the load balancer's deregistration are not synchronised, so a process that exits immediately drops requests already routed to it. Exiting before the grace period matters too — after it, SIGKILL finishes nothing.",
    concepts: ["Graceful shutdown", "SIGTERM", "Readiness probe", "Grace period"],
    tags: ["shutdown", "deploys"],
  },
  {
    id: "dl-cloud-008",
    type: "multi",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 4,
    prompt:
      "Which conditions have to hold for horizontal autoscaling to actually work? Select all that apply.",
    options: [
      { id: "a", text: "Instances are stateless, so any of them can serve any request" },
      { id: "b", text: "Startup is fast enough that new capacity arrives before the spike passes" },
      { id: "c", text: "Downstream dependencies can absorb the extra connections" },
      { id: "d", text: "The scale-up threshold is set as low as possible, so it reacts early" },
      { id: "e", text: "CPU is the scaling signal, whatever the service actually spends time on" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The third is what turns a scaling event into an outage: doubling the application tier doubles the connections against a database whose limit did not move. A threshold set too low produces thrashing, and CPU is the wrong signal for a service that spends its time waiting on I/O, where queue depth or latency says far more.",
    concepts: ["Horizontal autoscaling", "Connection pool exhaustion", "Scaling signal", "Thrashing"],
    tags: ["autoscaling", "capacity"],
  },
  {
    id: "dl-cloud-009",
    type: "short",
    track: "delivery",
    topic: "cloud-deployment",
    difficulty: 3,
    context:
      "Someone edits a security group by hand in the console to unblock an incident. It is never written back into the Terraform configuration, so the next apply silently reverts it.",
    prompt:
      "What is this divergence between declared and actual infrastructure called? (Two words.)",
    answers: [
      "configuration drift",
      "config drift",
      "infrastructure drift",
      "state drift",
      "drift",
    ],
    typoTolerance: true,
    explanation:
      "Configuration drift. The manual change is usually not the mistake — unblocking an incident by hand is often right — the mistake is not closing the loop afterwards, which leaves the code lying about production. Run a plan on a schedule and alert on any diff, so drift surfaces in hours rather than during an unrelated deploy weeks later.",
    concepts: ["Configuration drift", "Infrastructure as code", "Declarative configuration", "Reconciliation"],
    tags: ["iac", "drift"],
  },
  {
    id: "dl-flag-006",
    type: "mcq",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 4,
    context:
      "A percentage rollout evaluates a fresh random number on every request. Users see the new interface on one page load and the old one on the next.",
    prompt: "What is wrong with evaluating a percentage rollout randomly per request?",
    options: [
      {
        id: "a",
        text: "Assignment must be a deterministic hash of a stable identifier, so a user always lands in the same bucket",
      },
      { id: "b", text: "The random number generator is not uniform enough for this" },
      { id: "c", text: "The rollout percentage is too low to be stable" },
      { id: "d", text: "The flag should be evaluated on the client rather than the server" },
    ],
    answer: "a",
    explanation:
      "A percentage rollout is a sampling decision, and it has to be the same decision every time for the same user — otherwise you get neither a coherent experience nor a usable measurement, because the treatment and control groups reshuffle continuously and no comparison between them means anything. Hash the user id together with the flag key.",
    concepts: ["Deterministic bucketing", "Percentage rollout", "Sticky assignment", "Experiment validity"],
    tags: ["rollout", "bucketing"],
  },
  {
    id: "dl-flag-007",
    type: "ordering",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 2,
    prompt: "Put the life of a release toggle in order.",
    items: [
      "Add the flag defaulting to off, and ship the code behind it",
      "Turn it on for the team internally and check the behaviour",
      "Roll it out to a small percentage of users and watch the metrics",
      "Raise the percentage in stages until it reaches everyone",
      "Delete the flag and the old code path once it has been fully on for a while",
    ],
    explanation:
      "The final step is the one that never happens, and it is where flag debt comes from: every surviving flag doubles the number of code paths anyone reasoning about the system has to hold at once. Give release toggles an expiry date when you create them, and treat an expired flag as a bug rather than a preference.",
    concepts: ["Release toggle", "Flag debt", "Progressive delivery", "Code path explosion"],
    tags: ["lifecycle", "rollout"],
  },
  {
    id: "dl-flag-008",
    type: "multi",
    track: "delivery",
    topic: "feature-flags",
    difficulty: 3,
    prompt:
      "Which changes are worth putting behind a feature flag? Select all that apply.",
    options: [
      { id: "a", text: "A rewrite of a critical path, so it can be switched off instantly" },
      { id: "b", text: "A change whose effect you want to measure against current behaviour" },
      { id: "c", text: "An integration with a third party that may need disabling during their outage" },
      { id: "d", text: "A typo fix in a button label" },
      { id: "e", text: "A migration that has already dropped the old column" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "A flag earns its keep when you would genuinely want to change the answer at runtime without deploying. A typo fix has nothing worth toggling and adds a code path forever. The migration is the instructive one: a flag switches between two things that both still work, so it cannot protect you once the alternative has been destroyed.",
    concepts: ["Feature flag", "Kill switch", "Reversibility", "Flag debt"],
    tags: ["when-to-flag", "reversibility"],
  },
  {
    id: "dl-dep-007",
    type: "multi",
    track: "delivery",
    topic: "dependencies",
    difficulty: 3,
    prompt:
      "What is worth checking before adding a dependency to a project? Select all that apply.",
    options: [
      { id: "a", text: "How much of it you need, against how much you would have to write yourself" },
      { id: "b", text: "Whether it is maintained, and what happens to you if it stops being" },
      { id: "c", text: "What it pulls in transitively, and what those packages run at install time" },
      { id: "d", text: "How many stars it has on its repository" },
      { id: "e", text: "Whether its author has published other popular packages" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The question is what you are taking on, not how popular it is: every dependency is code you will ship, patch, and eventually migrate off. The transitive check matters most and is done least — one small package can bring dozens of others, and an install script in any of them runs with your developer's permissions.",
    concepts: ["Transitive dependency", "Install script", "Maintenance burden", "Supply chain attack"],
    tags: ["evaluation", "adding"],
  },
  {
    id: "dl-dep-008",
    type: "mcq",
    track: "delivery",
    topic: "dependencies",
    difficulty: 4,
    context:
      "A scanner reports a critical vulnerability in a package four levels down the dependency tree. The advisory concerns a parsing function your application never calls.",
    prompt: "How should a critical advisory in an unreachable code path be handled?",
    options: [
      {
        id: "a",
        text: "Assess reachability, upgrade on the normal cadence, and record why it was not urgent",
      },
      { id: "b", text: "Ship an emergency patch, because the severity rating is critical" },
      { id: "c", text: "Suppress the alert permanently, because the code is not reachable" },
      { id: "d", text: "Remove the top-level dependency that pulled it in" },
    ],
    answer: "a",
    explanation:
      "Severity describes the vulnerability, not your exposure — a critical flaw in a path you never execute is not a critical risk to you. Treating every advisory as an emergency exhausts a team and teaches it to ignore the scanner, which is how the reachable one gets missed. Record the reasoning, because reachability changes the moment someone calls that function.",
    concepts: ["Reachability analysis", "CVE severity", "Vulnerability triage", "Alert fatigue"],
    tags: ["cve", "triage"],
  },
];
