import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "concurrency",
    track: "code-craft",
    title: "Concurrency in Application Code",
    blurb: "Races, locks, and why async is not the same as parallel.",
    lesson: `Concurrency is about a program making progress on several things; parallelism is about doing them at literally the same instant. A single-threaded event loop is concurrent and not parallel, which is why one blocking call stalls everything.

**A race condition** is when the result depends on timing. The classic is read-modify-write: two requests read a balance of 100, both subtract 10, both write 90, and one withdrawal vanished. Nothing crashed and the data is now wrong — which is what makes races so unpleasant to find.

**A critical section** is the code that must not run concurrently. A *mutex* enforces one holder at a time; a *semaphore* allows up to N, which is how connection pools bound concurrency.

**Deadlock** needs four conditions together: mutual exclusion, hold-and-wait, no preemption, and circular wait. Break any one and it cannot happen — which is why "always acquire locks in the same order" works, since it removes circular wait. *Livelock* is subtler: threads keep responding to each other and none makes progress.

**Optimistic versus pessimistic locking.** Pessimistic takes the lock up front and blocks others. Optimistic assumes conflict is rare, does the work, and checks at write time — usually with a version column — retrying if something changed underneath. Optimistic wins when contention is low, which is most of the time.

**Async/await is not concurrency by itself.** It is a way to write non-blocking code readably. Awaiting sequentially in a loop is as slow as blocking; the gain comes from starting work then awaiting together. And a CPU-bound loop blocks an event loop completely, because there is no yield point.

**Immutability is the cheapest concurrency strategy available.** Data that cannot change needs no lock, which is why functional approaches scale across threads so easily.

**Idempotency matters here too:** with retries in the picture, an operation that is safe to apply twice removes an entire category of concurrency bug.`,
    resources: [
      {
        label: "MDN — Concurrency model and the event loop",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop",
      },
    ],
  },
  {
    id: "error-handling",
    track: "code-craft",
    title: "Error Handling",
    blurb: "Failing usefully, and where to put the recovery.",
    lesson: `Error handling is a design decision about where failure is dealt with, not a formality bolted on at the end.

**Fail fast.** Detect an invalid state at the earliest point and stop. Code that limps on with bad data produces a failure far from its cause, and the stack trace points at the symptom rather than the bug.

**Exceptions versus result types.** Exceptions separate the happy path from error handling and are invisible in a function signature, so a caller cannot tell what might be thrown. Result types make failure part of the return value, so the compiler forces you to deal with it, at the cost of noisier code. Neither is universally right; consistency within a codebase matters more than the choice.

**Distinguish expected failures from bugs.** A user submitting an invalid email is an expected outcome and belongs in the return type. A null where the invariants say null is impossible is a bug, and should be loud. Treating both as exceptions means the log fills with normal events and real problems disappear into the noise.

**Swallowing exceptions is the worst common practice in the language.** An empty catch block converts a failure into wrong behaviour later, with the evidence deleted. If you genuinely can ignore it, say why in a comment.

**Handle errors where you can actually do something.** Catching, logging, and rethrowing at every layer produces the same error logged six times and no decision made. Let it propagate to the level that can retry, fall back, or tell the user.

**Retries belong at exactly one level.** Retry at the HTTP client, the service, and the job runner and three attempts become twenty-seven. Pick a layer, use exponential backoff with jitter, and cap it.

**Only retry what is safe to repeat.** That means idempotent operations, or non-idempotent ones carrying an idempotency key. Retrying a payment without one is how customers get charged twice.

**Graceful degradation** beats total failure: a recommendations service being down should mean no recommendations, not no page.`,
    resources: [
      {
        label: "AWS — Timeouts, retries and backoff with jitter",
        url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
      },
    ],
  },
  {
    id: "domain-modelling",
    track: "code-craft",
    title: "Domain Modelling",
    blurb: "Making the code speak the language of the problem.",
    lesson: `Domain modelling is the work of making your types and names match how the business actually thinks, so that reading the code teaches you the domain.

**Ubiquitous language** means one vocabulary shared by engineers and domain experts. If they say "policy" and the code says "contract", every conversation carries a translation step, and translation is where misunderstandings live. Rename the code.

**Entity versus value object.** An *entity* has identity that persists through change — a User is the same user after changing their email. A *value object* is defined entirely by its attributes: two Money objects of 10 GBP are interchangeable, and it should be immutable. Getting this backwards produces either identity bugs or pointless database rows.

**An aggregate** is a cluster of objects treated as one unit for changes, with a root that is the only entry point. An Order with its OrderLines is the standard example: you do not modify a line directly, you tell the Order. The point is that invariants — "an order's total must equal the sum of its lines" — have exactly one place they can be enforced.

**Invariants are the heart of it.** A rule that must always hold should be impossible to violate, not merely checked in the service layer. If an Order cannot exist without a customer, the constructor should require one rather than a validator flagging it later.

**An anaemic domain model** is classes of getters and setters with all the behaviour in service classes. It is not wrong so much as a missed opportunity: business rules end up scattered across services, so the same rule gets implemented twice, slightly differently.

**A bounded context** is where one model applies. "Customer" in billing and "Customer" in support are genuinely different things with different fields and rules, and forcing them into one shared class produces an object that serves neither. Draw the boundary and translate between them.`,
    resources: [
      {
        label: "Martin Fowler — Domain-driven design",
        url: "https://martinfowler.com/tags/domain%20driven%20design.html",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------------- Concurrency ----------------
  {
    id: "cc-conc-001",
    type: "mcq",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 3,
    context:
      "Two requests read a balance of 100, each subtract 10, and each write 90. One withdrawal has vanished.",
    prompt: "What is this, and what is the general shape of the fix?",
    options: [
      {
        id: "a",
        text: "A read-modify-write race — make the update atomic, or use a lock or a version check",
      },
      { id: "b", text: "A deadlock between the two requests" },
      { id: "c", text: "A caching problem; the balance was stale" },
      { id: "d", text: "A rounding error in the subtraction" },
    ],
    answer: "a",
    explanation:
      "The read and the write are separate steps and another actor slipped between them. Fixes: do it in one atomic statement (UPDATE ... SET balance = balance - 10), take a lock, or use optimistic concurrency with a version column and retry on conflict. Nothing errors, which is what makes races so hard to find.",
    concepts: ["Race condition", "Read-modify-write", "Atomic operation"],
    tags: ["races", "fundamentals"],
  },
  {
    id: "cc-conc-002",
    type: "mcq",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 4,
    prompt:
      "Why does 'always acquire locks in the same order' prevent deadlock?",
    options: [
      {
        id: "a",
        text: "It removes circular wait, one of the four conditions deadlock requires",
      },
      { id: "b", text: "It makes lock acquisition faster" },
      { id: "c", text: "It guarantees only one lock is ever held" },
      { id: "d", text: "It converts deadlocks into livelocks" },
    ],
    answer: "a",
    explanation:
      "Deadlock needs mutual exclusion, hold-and-wait, no preemption, and circular wait simultaneously. A consistent global ordering makes a cycle impossible, so the condition cannot be met. Breaking any one of the four works — this is just the cheapest to enforce by convention.",
    concepts: ["Deadlock", "Circular wait", "Lock ordering"],
    tags: ["deadlock"],
  },
  {
    id: "cc-conc-003",
    type: "mcq",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 4,
    context:
      "A handler awaits ten independent API calls one after another in a loop. Each takes 200ms.",
    prompt:
      "What is the problem with awaiting ten independent API calls in a loop?",
    options: [
      {
        id: "a",
        text: "Sequential awaits give no concurrency — start them together and await the set for 200ms instead of 2s",
      },
      { id: "b", text: "Async functions cannot be used in loops" },
      { id: "c", text: "The event loop is blocked by the awaits" },
      { id: "d", text: "Nothing — this is the correct use of async/await" },
    ],
    answer: "a",
    explanation:
      "Awaiting inside the loop makes each call wait for the previous one, so async bought nothing. Because they are independent, kick them all off and await them together — Promise.all or equivalent — and total time becomes the slowest single call. Note awaits do not block the event loop; a CPU-bound loop does.",
    concepts: ["Async/await", "Concurrency versus parallelism", "Promise.all"],
    tags: ["async"],
  },
  {
    id: "cc-conc-004",
    type: "mcq",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 4,
    prompt: "When is optimistic locking the better choice over pessimistic?",
    options: [
      {
        id: "a",
        text: "When conflicts are rare — no one blocks, and the occasional loser retries",
      },
      { id: "b", text: "When many writers contend for the same row constantly" },
      { id: "c", text: "When the operation must never be retried" },
      { id: "d", text: "When the database does not support transactions" },
    ],
    answer: "a",
    explanation:
      "Optimistic concurrency does the work and checks a version at write time, so nobody waits on a lock. Under heavy contention it degrades badly, because most writers do the work then throw it away — that is where pessimistic locking wins.",
    concepts: ["Optimistic locking", "Pessimistic locking", "Version column"],
    tags: ["locking"],
  },
  {
    id: "cc-conc-005",
    type: "short",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 3,
    context:
      "A primitive that permits at most N concurrent holders, which is how a connection pool caps simultaneous database use.",
    prompt: "What is this primitive called? (One word.)",
    answers: ["semaphore", "semaphores", "counting semaphore"],
    typoTolerance: true,
    explanation:
      "A semaphore. A mutex is the special case where N is one. Bounding concurrency this way is also a form of bulkhead — one runaway workload cannot consume every connection.",
    concepts: ["Semaphore", "Mutex", "Connection pool"],
    tags: ["primitives", "fundamentals"],
  },
  {
    id: "cc-conc-006",
    type: "mcq",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 3,
    prompt: "Why does immutability make concurrent code simpler?",
    options: [
      {
        id: "a",
        text: "Data that cannot change needs no synchronisation, so races on it are impossible",
      },
      { id: "b", text: "Immutable objects are always faster to access" },
      { id: "c", text: "It prevents deadlocks between threads" },
      { id: "d", text: "It removes the need for error handling" },
    ],
    answer: "a",
    explanation:
      "Every concurrency hazard involves shared mutable state — remove the mutability and there is nothing to coordinate. It costs allocation, which is usually a far better trade than lock contention and the bugs that come with it.",
    concepts: ["Immutability", "Shared mutable state", "Thread safety"],
    tags: ["immutability"],
  },

  // ---------------- Error handling ----------------
  {
    id: "cc-err-001",
    type: "mcq",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 2,
    context: "A catch block is empty except for a comment saying nothing.",
    prompt: "Why is this among the worst things in a codebase?",
    options: [
      {
        id: "a",
        text: "It converts a failure into wrong behaviour later, having deleted the evidence",
      },
      { id: "b", text: "It slows the program down" },
      { id: "c", text: "It prevents the compiler from optimising" },
      { id: "d", text: "It is fine as long as the error is rare" },
    ],
    answer: "a",
    explanation:
      "The program continues in a state the author never anticipated, and the only record of why is gone. Debugging then starts from a symptom with no trail. If an error genuinely can be ignored, the comment should say what and why.",
    concepts: ["Swallowing exceptions", "Fail fast", "Error propagation"],
    tags: ["errors", "antipattern"],
  },
  {
    id: "cc-err-002",
    type: "mcq",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 4,
    context:
      "An HTTP client retries three times, the service wrapping it retries three times, and the job runner retries three times.",
    prompt:
      "What is the effect of three retry layers stacked on top of one another?",
    options: [
      {
        id: "a",
        text: "Up to 27 attempts — retries multiply across layers and can amplify an outage",
      },
      { id: "b", text: "Nine attempts, since the layers add" },
      { id: "c", text: "Three attempts; the outermost retry wins" },
      { id: "d", text: "No effect, provided each layer uses backoff" },
    ],
    answer: "a",
    explanation:
      "Nested retries compound multiplicatively, so a struggling dependency receives far more load precisely when it can least handle it. Retry at exactly one layer, with exponential backoff and jitter, and let the others propagate.",
    concepts: ["Retry amplification", "Exponential backoff", "Jitter"],
    tags: ["retries"],
  },
  {
    id: "cc-err-003",
    type: "mcq",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 3,
    prompt:
      "What is the main argument for result types over exceptions?",
    options: [
      {
        id: "a",
        text: "Failure becomes part of the signature, so the compiler forces the caller to handle it",
      },
      { id: "b", text: "They are faster at runtime in all languages" },
      { id: "c", text: "They remove the need to log errors" },
      { id: "d", text: "They make stack traces more detailed" },
    ],
    answer: "a",
    explanation:
      "An exception is invisible in a signature, so a caller cannot know what might be thrown without reading the implementation. A result type makes the failure explicit and unignorable, at the cost of more verbose code on the happy path. Consistency within a codebase matters more than which you pick.",
    concepts: ["Result type", "Checked exception", "Explicit error handling"],
    tags: ["errors", "design"],
  },
  {
    id: "cc-err-004",
    type: "mcq",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 4,
    context:
      "Every layer catches exceptions, logs them, and rethrows. Production logs show the same error six times per failure.",
    prompt: "What is the guidance?",
    options: [
      {
        id: "a",
        text: "Handle errors where you can act on them — logging without deciding is noise",
      },
      { id: "b", text: "Log at debug level in inner layers instead" },
      { id: "c", text: "Catch only at the outermost layer and never log elsewhere" },
      { id: "d", text: "Use a single global exception handler and remove all try/catch" },
    ],
    answer: "a",
    explanation:
      "Catching to log and rethrow adds noise without a decision. Let it propagate to a layer that can retry, fall back, or tell the user, and log it once there — with the context that layer has. Adding context on the way up is fine; duplicating the same message is not.",
    concepts: ["Error propagation", "Exception handling", "Structured logging"],
    tags: ["errors", "logging"],
  },
  {
    id: "cc-err-005",
    type: "multi",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 4,
    prompt:
      "Which are safe to retry automatically? Select all that apply.",
    options: [
      { id: "a", text: "A GET request that timed out" },
      { id: "b", text: "A PUT that replaces a resource at a known id" },
      { id: "c", text: "A POST carrying an idempotency key" },
      { id: "d", text: "A POST creating a payment with no idempotency key" },
      { id: "e", text: "A request that returned 400 Bad Request" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Retry what is safe to apply twice. GET and PUT are idempotent by definition, and a POST becomes safe once a key lets the server recognise the repeat. A bare payment POST risks double-charging, and a 400 will fail identically forever — retrying it just wastes capacity.",
    concepts: ["Idempotency", "Idempotency key", "Retry safety"],
    tags: ["retries", "idempotency"],
  },
  {
    id: "cc-err-006",
    type: "mcq",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 3,
    context:
      "The recommendations service is down. The product page returns a 500.",
    prompt:
      "What should a product page do when the recommendations service is down?",
    options: [
      {
        id: "a",
        text: "Graceful degradation — render the page without recommendations",
      },
      { id: "b", text: "Retry recommendations until they succeed" },
      { id: "c", text: "Return a 503 so clients know to retry" },
      { id: "d", text: "Cache the last recommendations forever" },
    ],
    answer: "a",
    explanation:
      "A non-essential dependency should never be able to take down the page. Identify which dependencies are critical, and for the rest have a fallback — an empty section, cached data, or a default. That decision belongs in the design, not in an incident.",
    concepts: ["Graceful degradation", "Fallback", "Critical dependency"],
    tags: ["resilience"],
  },

  // ---------------- Domain modelling ----------------
  {
    id: "cc-dom-001",
    type: "mcq",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 3,
    prompt: "What distinguishes an entity from a value object?",
    options: [
      {
        id: "a",
        text: "An entity has identity that survives change; a value object is defined entirely by its attributes",
      },
      { id: "b", text: "An entity is stored in a database and a value object is not" },
      { id: "c", text: "An entity is mutable and a value object is a struct" },
      { id: "d", text: "An entity has methods and a value object has only data" },
    ],
    answer: "a",
    explanation:
      "A User remains the same user after changing their email — that is identity. Two Money objects of 10 GBP are interchangeable, so identity is meaningless and they should be immutable. Persistence is a consequence of the distinction, not the definition.",
    concepts: ["Entity", "Value object", "Domain-driven design"],
    tags: ["ddd", "fundamentals"],
  },
  {
    id: "cc-dom-002",
    type: "mcq",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 4,
    context:
      "Domain experts say \"policy\". The codebase calls the same thing a \"contract\".",
    prompt: "Why does this matter more than it looks?",
    options: [
      {
        id: "a",
        text: "Every conversation carries a translation step, and translation is where misunderstandings enter",
      },
      { id: "b", text: "It makes the code harder to compile" },
      { id: "c", text: "Renaming would break the database schema" },
      { id: "d", text: "It only matters if the team is large" },
    ],
    answer: "a",
    explanation:
      "A shared vocabulary — ubiquitous language — means a requirement can be read straight into the code and back. Two names for one concept guarantees someone eventually maps them wrongly, and it hides the moment when the two really have diverged into different concepts.",
    concepts: ["Ubiquitous language", "Domain-driven design", "Bounded context"],
    tags: ["ddd", "language"],
  },
  {
    id: "cc-dom-003",
    type: "mcq",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 4,
    context:
      "An Order must always have a total equal to the sum of its lines. Code in three services recalculates it.",
    prompt: "What does treating Order as an aggregate root change?",
    options: [
      {
        id: "a",
        text: "Lines are only modified through the Order, so the invariant has exactly one place it can be enforced",
      },
      { id: "b", text: "Orders and lines are stored in the same table" },
      { id: "c", text: "Lines become value objects automatically" },
      { id: "d", text: "The total is computed lazily on read" },
    ],
    answer: "a",
    explanation:
      "An aggregate defines a consistency boundary with a single entry point. Nothing reaches inside to change a line, so the rule cannot be violated or reimplemented differently in three places. That is the entire purpose — invariants get one home.",
    concepts: ["Aggregate root", "Invariant", "Consistency boundary"],
    tags: ["ddd", "aggregates"],
  },
  {
    id: "cc-dom-004",
    type: "mcq",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 4,
    context:
      "\"Customer\" in billing needs payment terms and a VAT number. \"Customer\" in support needs contact history and a satisfaction score. They share one class with every field on it.",
    prompt:
      "What is the problem with one Customer class serving both billing and support?",
    options: [
      {
        id: "a",
        text: "They are different concepts in different bounded contexts, forced into a model that serves neither",
      },
      { id: "b", text: "The class needs to be split by field type" },
      { id: "c", text: "Support should query the billing service instead" },
      { id: "d", text: "Nothing — one customer should have one representation" },
    ],
    answer: "a",
    explanation:
      "A shared class collects every field either side needs, so most are null in any given use and no rule holds universally. Bounded contexts let each keep the model it needs, with an explicit translation between them — which also makes it visible when the two genuinely diverge.",
    concepts: ["Bounded context", "Shared kernel", "Anti-corruption layer"],
    tags: ["ddd", "boundaries"],
  },
  {
    id: "cc-dom-005",
    type: "short",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 4,
    context:
      "Domain classes contain only getters and setters, with every business rule living in service classes.",
    prompt: "What is this model called? (Two words: ____ domain model.)",
    answers: ["anaemic", "anemic", "anaemic domain model", "anemic domain model"],
    typoTolerance: true,
    explanation:
      "An anaemic domain model. It works, and it scatters rules across services so the same rule gets implemented twice with slightly different edge cases. Behaviour placed next to the data it governs has one home.",
    concepts: ["Anaemic domain model", "Rich domain model", "Encapsulation"],
    tags: ["ddd", "antipattern"],
  },
  {
    id: "cc-dom-006",
    type: "mcq",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 3,
    context:
      "An Order cannot meaningfully exist without a customer, but the constructor allows one to be created without.",
    prompt: "What is the better design?",
    options: [
      {
        id: "a",
        text: "Require the customer in the constructor, so an invalid Order cannot be constructed at all",
      },
      { id: "b", text: "Add a validate() method callers should remember to call" },
      { id: "c", text: "Check for a customer in the service layer before saving" },
      { id: "d", text: "Default the customer to a placeholder record" },
    ],
    answer: "a",
    explanation:
      "Make illegal states unrepresentable. A rule enforced by a validator depends on every caller remembering to invoke it; a rule enforced by the constructor cannot be skipped. The placeholder is worse still — it makes invalid data look valid to everything downstream.",
    concepts: ["Invariant", "Make illegal states unrepresentable", "Encapsulation"],
    tags: ["ddd", "invariants"],
  },
  {
    id: "cc-conc-007",
    type: "mcq",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 4,
    context:
      "A single-threaded server handles thousands of concurrent requests happily. One endpoint runs a synchronous CPU-bound calculation taking 400ms, and every other request's latency degrades while it runs.",
    prompt:
      "Why does one CPU-bound handler degrade every other request on a single-threaded server?",
    options: [
      {
        id: "a",
        text: "The event loop is the only thread — while it computes, no other callback runs, however ready it is",
      },
      { id: "b", text: "The calculation holds a lock that every other handler needs" },
      { id: "c", text: "The runtime deprioritises requests arriving during a long operation" },
      { id: "d", text: "Garbage collection runs after every long operation" },
    ],
    answer: "a",
    explanation:
      "Async concurrency interleaves waiting, not computing. It is excellent while the work is I/O, because the thread is free during the wait, and it has nothing whatsoever to offer when the work is arithmetic. Move CPU-bound work to a worker thread, a separate process, or a queue, and leave the loop to orchestrate waits.",
    concepts: ["Event loop", "Concurrency versus parallelism", "CPU-bound versus I/O-bound", "Worker thread"],
    tags: ["event-loop", "blocking"],
  },
  {
    id: "cc-conc-008",
    type: "multi",
    track: "code-craft",
    topic: "concurrency",
    difficulty: 4,
    context:
      "Every request handler in a pool of 20 threads calls a downstream service that has become slow but not unavailable.",
    prompt:
      "Why does one slow dependency take out a service with plenty of spare CPU? Select all that apply.",
    options: [
      { id: "a", text: "Every thread ends up blocked on the same call, leaving none for unrelated requests" },
      { id: "b", text: "With no timeout on the call, a blocked thread is never returned to the pool" },
      { id: "c", text: "Requests keep arriving and time out while queued for a thread" },
      { id: "d", text: "The slow dependency consumes the caller's CPU while the caller waits" },
      { id: "e", text: "The thread pool automatically shrinks under load" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "This is resource exhaustion rather than a capacity problem, which is why adding CPU changes nothing and adding threads only postpones it. The defences are a timeout on every outbound call, a bulkhead so one dependency can consume only part of the pool, and a circuit breaker that stops making the call once it is clearly failing.",
    concepts: ["Thread pool exhaustion", "Bulkhead pattern", "Timeout", "Circuit breaker"],
    tags: ["exhaustion", "pools"],
  },
  {
    id: "cc-err-007",
    type: "matching",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 3,
    prompt: "Match each failure to the response it deserves.",
    pairs: [
      {
        left: "A user submitted an invalid email address",
        right: "Reject with a clear message — this is expected input",
      },
      {
        left: "A downstream call timed out",
        right: "Retry with backoff, then degrade or fail the request",
      },
      {
        left: "A required configuration value is missing at startup",
        right: "Refuse to start at all",
      },
      {
        left: "An invariant the code guarantees is violated",
        right: "Crash loudly, because continuing would corrupt data",
      },
      {
        left: "A non-essential recommendation service is down",
        right: "Render the page without it and carry on",
      },
    ],
    explanation:
      "The useful split is expected against unexpected. Expected failures are part of the domain and belong in the return type; unexpected ones mean an assumption you rely on is broken, and the safest thing is to stop. The damage comes from treating them alike — crashing on a bad email, or continuing past a broken invariant.",
    concepts: ["Expected versus unexpected failure", "Fail fast", "Graceful degradation", "Invariant"],
    tags: ["classification", "response"],
  },
  {
    id: "cc-err-008",
    type: "multi",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 3,
    prompt:
      "What should an error message shown to a user contain? Select all that apply.",
    options: [
      { id: "a", text: "What went wrong, in terms of what the user was trying to do" },
      { id: "b", text: "What they can do about it, if anything" },
      { id: "c", text: "An identifier they can quote, which correlates to the logs" },
      { id: "d", text: "The exception class and the line it was raised on" },
      { id: "e", text: "An apology, and nothing further" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The identifier is the piece most often missing, and it is what turns an unhelpful report into a searchable one: the user sees a reference, the log holds the detail, and neither leaks into the other. Internals in a user-facing message help an attacker and nobody else, and an apology with no next step is a dead end.",
    concepts: ["Error message design", "Correlation id", "Information disclosure", "Actionable error"],
    tags: ["messages", "users"],
  },
  {
    id: "cc-err-009",
    type: "short",
    track: "code-craft",
    topic: "error-handling",
    difficulty: 3,
    context:
      "A component tree renders and one component throws. Instead of the whole page going blank, a wrapper catches the error, reports it, and renders a fallback in that component's place.",
    prompt: "What is this containment mechanism called? (Two words.)",
    answers: ["error boundary", "error boundaries", "errorboundary", "error-boundary"],
    typoTolerance: true,
    explanation:
      "An error boundary — fault isolation applied to a component tree, so a thrown error costs you one subtree instead of the whole page. Place them where a partial page is still useful, around a widget rather than around everything: a boundary only at the root converts a blank page into a slightly nicer blank page.",
    concepts: ["Error boundary", "Fault isolation", "Bulkhead pattern", "Graceful degradation"],
    tags: ["containment", "ui"],
  },
  {
    id: "cc-dom-007",
    type: "short",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 4,
    context:
      "Rather than checking that a string is a valid email and passing the string along, a function takes the string and returns an EmailAddress type — so anything holding one carries proof it was checked, and the check happens once, at the edge.",
    prompt: "What principle does this describe? (Three words.)",
    answers: [
      "parse don't validate",
      "parse dont validate",
      "parse, don't validate",
      "parse not validate",
      "parse rather than validate",
    ],
    typoTolerance: true,
    explanation:
      "Parse, don't validate. A validation returns a boolean and throws the knowledge away, so every function downstream must either re-check or trust a comment. Parsing returns a new type carrying the proof, which pushes the check to the boundary and makes the unchecked case impossible to construct rather than merely unlikely.",
    concepts: ["Parse, don't validate", "Type-driven design", "Make illegal states unrepresentable", "Value object"],
    tags: ["types", "boundaries"],
  },
  {
    id: "cc-dom-008",
    type: "multi",
    track: "code-craft",
    topic: "domain-modelling",
    difficulty: 3,
    prompt:
      "Which rules belong in the domain model rather than at the HTTP boundary? Select all that apply.",
    options: [
      { id: "a", text: "An order cannot be dispatched before it has been paid for" },
      { id: "b", text: "A discount cannot exceed the order total" },
      { id: "c", text: "A subscription cannot be cancelled twice" },
      { id: "d", text: "The request body is valid JSON" },
      { id: "e", text: "The date field parses as a date" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The split is whether a rule concerns the shape of a message or the meaning of the business. Shape checks belong at the edge and change when the API does. The other three are true however the request arrived, so leaving them in a controller means the next caller — a background job, a CLI, an import — quietly gets to break them.",
    concepts: ["Invariant", "Domain model", "Boundary validation", "Anaemic domain model"],
    tags: ["validation", "layering"],
  },
];
