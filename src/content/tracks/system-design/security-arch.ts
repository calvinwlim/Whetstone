import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "security",
    track: "system-design",
    title: "Security Fundamentals",
    blurb: "The defaults you are expected to know without being asked.",
    lesson: `Security rarely gets its own interview, and it comes up inside every design one. These are the defaults you should reach for without prompting.

**Authentication vs authorisation.** Authentication establishes *who you are*; authorisation decides *what you may do*. They map to HTTP status codes: 401 means we do not know who you are, 403 means we know and you still may not. Confusing the two is the most common mistake in this area.

**Sessions vs tokens.** A server-side session is trivially revocable — delete the row — but needs a shared store. A JWT is stateless and scales beautifully, and cannot be revoked before it expires without reintroducing exactly the store you were avoiding. The usual compromise is short-lived access tokens plus a revocable refresh token.

**Storing passwords.** Never plaintext, never a fast hash. MD5 and SHA-256 are designed to be fast, which is the opposite of what you want — use bcrypt, scrypt, or Argon2, which are deliberately slow and salted per user so a leaked database cannot be attacked with precomputed tables.

**Injection is a parameterisation problem, not an escaping problem.** Parameterised queries keep data and code separate so input can never become SQL. Hand-rolled escaping is a losing game. The same logic applies to output: XSS is prevented by encoding on output plus a Content Security Policy, not by trying to sanitise every input.

**Least privilege, everywhere.** Every credential, service account, and token should have the narrowest scope and shortest life that does the job. A read-only replica credential cannot drop your tables.

**Two patterns worth naming.** The *valet key* hands the client a scoped, time-limited credential to talk directly to a resource — a presigned upload URL is exactly this. The *gatekeeper* puts a hardened broker in front of a service so untrusted input is validated before it reaches anything that matters.

**Secrets never live in source control.** Environment variables at minimum, a managed secret store when you can, and rotation when one leaks — which you should assume will happen.`,
    resources: [
      {
        label: "OWASP Top Ten",
        url: "https://owasp.org/www-project-top-ten/",
      },
      {
        label: "OWASP — Password storage cheat sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
      },
    ],
  },
  {
    id: "arch-patterns",
    track: "system-design",
    title: "Architecture Patterns",
    blurb: "Named patterns interviewers probe by name.",
    lesson: `A handful of patterns come up by name often enough that recognising them is worth more than deriving them on the spot.

**CQRS** separates the write model from the read model, so each can be shaped and scaled for its own job. It shines when reads and writes have wildly different volumes or shapes. It costs you a synchronisation path and the eventual consistency that comes with it, so applying it everywhere is a common over-correction.

**Event sourcing** stores the sequence of changes rather than current state, and derives state by replaying them. You get a complete audit trail and the ability to reconstruct any past state, and you take on schema evolution for events that live forever, plus snapshots so replay does not get slower every year. It pairs naturally with CQRS but does not require it.

**Materialised view** precomputes an expensive query into a table you can read cheaply. It is the database's own version of caching, with the same bargain: fast reads, in exchange for owning the refresh.

**Strangler fig** replaces a legacy system incrementally by routing slices of traffic to the new implementation until nothing reaches the old one. It is the pattern that makes big rewrites survivable, because every step is small and reversible.

**Sidecar** runs supporting behaviour — proxying, telemetry, secret rotation — in a process alongside the service rather than inside it, so it can be updated independently and shared across services in different languages.

**Backend for frontend** gives each client type its own tailored API layer, so a mobile app is not forced to consume a shape designed for a desktop web app.

**Anti-corruption layer** translates between your model and an external or legacy one, so their design decisions do not leak into yours.

**Leader election** picks one node to perform work that must happen exactly once across a cluster, such as running a scheduled job.`,
    resources: [
      {
        label: "Azure — Cloud design patterns",
        url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/",
      },
      {
        label: "Martin Fowler — Strangler fig application",
        url: "https://martinfowler.com/bliki/StranglerFigApplication.html",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Security ----------
  {
    id: "sd-sec-001",
    type: "mcq",
    track: "system-design",
    topic: "security",
    difficulty: 2,
    prompt: "What is the difference between authentication and authorisation?",
    options: [
      {
        id: "a",
        text: "Authentication establishes who you are; authorisation decides what you may do",
      },
      { id: "b", text: "Authentication is for users, authorisation is for services" },
      { id: "c", text: "They are two names for the same check" },
      { id: "d", text: "Authentication happens at the API, authorisation at the database" },
    ],
    answer: "a",
    explanation:
      "Identity first, permissions second. The HTTP codes follow: 401 means we cannot tell who you are, 403 means we can and you still may not do this. Some APIs deliberately return 404 rather than 403 so they do not reveal that a resource exists.",
    concepts: ["Authentication", "Authorisation", "HTTP 401 Unauthorized"],
    tags: ["authn-authz", "fundamentals"],
  },
  {
    id: "sd-sec-002",
    type: "mcq",
    track: "system-design",
    topic: "security",
    difficulty: 3,
    prompt: "Why is SHA-256 a poor choice for hashing passwords?",
    options: [
      {
        id: "a",
        text: "It is designed to be fast, so an attacker with the hashes can try billions of guesses per second",
      },
      { id: "b", text: "It produces collisions too easily" },
      { id: "c", text: "It cannot be salted" },
      { id: "d", text: "Its output is too short to be secure" },
    ],
    answer: "a",
    explanation:
      "Speed is the flaw. General-purpose hashes are built to be fast, which is exactly what an offline attacker wants. bcrypt, scrypt, and Argon2 are deliberately slow and memory-hard, with a tunable cost you raise as hardware improves. SHA-256 can be salted; being salted does not fix being fast.",
    concepts: ["bcrypt", "Argon2", "Password hashing", "Salt"],
    tags: ["passwords", "hashing"],
  },
  {
    id: "sd-sec-003",
    type: "mcq",
    track: "system-design",
    topic: "security",
    difficulty: 3,
    prompt: "What actually prevents SQL injection?",
    options: [
      {
        id: "a",
        text: "Parameterised queries, which keep user data from ever being parsed as SQL",
      },
      { id: "b", text: "Escaping quotes in user input before concatenating" },
      { id: "c", text: "Rejecting inputs containing SQL keywords" },
      { id: "d", text: "Running the database with a read-only user" },
    ],
    answer: "a",
    explanation:
      "Parameterisation separates code from data structurally, so input cannot change the shape of the query no matter what it contains. Manual escaping and keyword blocklists are both games of catch-up you eventually lose. A least-privilege database user limits the damage but does not prevent the injection.",
    concepts: ["SQL injection", "Parameterised query", "Prepared statement"],
    tags: ["injection"],
  },
  {
    id: "sd-sec-004",
    type: "matching",
    track: "system-design",
    topic: "security",
    difficulty: 4,
    prompt: "Match each vulnerability to its primary defence.",
    pairs: [
      { left: "SQL injection", right: "Parameterised queries" },
      { left: "Cross-site scripting", right: "Output encoding plus a Content Security Policy" },
      { left: "Cross-site request forgery", right: "SameSite cookies and anti-forgery tokens" },
      { left: "Credential stuffing", right: "Rate limiting and multi-factor authentication" },
    ],
    explanation:
      "Each defence works at the point where trust is actually violated. Note that XSS is fixed on output, not input — the same string is harmless in a database and dangerous in an HTML attribute, so encoding belongs where the context is known.",
    concepts: ["Cross-site scripting", "Cross-site request forgery", "Credential stuffing", "SameSite cookie"],
    tags: ["owasp"],
  },
  {
    id: "sd-sec-005",
    type: "mcq",
    track: "system-design",
    topic: "security",
    difficulty: 4,
    context:
      "A team chose stateless JWTs for sessions. Security asks how a compromised token is revoked before it expires.",
    prompt: "What is the honest answer?",
    options: [
      {
        id: "a",
        text: "It cannot be, without a revocation store — which reintroduces the state JWTs were chosen to avoid",
      },
      { id: "b", text: "Rotate the signing key, which revokes only that token" },
      { id: "c", text: "JWTs expire immediately when a user logs out" },
      { id: "d", text: "Revoke it at the load balancer" },
    ],
    answer: "a",
    explanation:
      "Statelessness is the whole feature and the whole limitation: a valid signature is sufficient, so nothing consults a database to ask whether the token is still allowed. Rotating the signing key revokes every token at once, which is a blunt instrument. The standard compromise is short-lived access tokens with a revocable refresh token.",
    concepts: ["JSON Web Token", "Token revocation", "Refresh token"],
    tags: ["jwt", "sessions"],
  },
  {
    id: "sd-sec-006",
    type: "short",
    track: "system-design",
    topic: "security",
    difficulty: 3,
    context:
      "Rather than proxying an upload through your API, you issue the client a scoped, time-limited credential to write directly to object storage.",
    prompt: "What is this pattern called? (Two words.)",
    answers: ["valet key", "valet key pattern", "valetkey", "the valet key"],
    typoTolerance: true,
    explanation:
      "The valet key pattern — a presigned upload URL is the everyday example. The client gets exactly one narrow permission for a short window, and your API stays out of the bandwidth path entirely.",
    concepts: ["Valet key pattern", "Presigned URL"],
    tags: ["valet-key", "patterns"],
  },
  {
    id: "sd-sec-007",
    type: "multi",
    track: "system-design",
    topic: "security",
    difficulty: 3,
    prompt: "Which are sound practices for handling secrets? Select all that apply.",
    options: [
      { id: "a", text: "Keep them out of source control entirely" },
      { id: "b", text: "Scope each credential to the narrowest permission that works" },
      { id: "c", text: "Rotate them, and assume a leak will eventually happen" },
      { id: "d", text: "Commit them encrypted so the team can share them easily" },
      { id: "e", text: "Reuse one high-privilege credential to reduce sprawl" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Keep them out, scope them tight, rotate them. Committing them encrypted still puts them in every clone and every backup forever, and one shared high-privilege credential means any single compromise is total and you cannot tell which service leaked it.",
    concepts: ["Secrets management", "Least privilege", "Secret rotation"],
    tags: ["secrets", "least-privilege"],
  },

  // ---------- Architecture patterns ----------
  {
    id: "sd-arch-001",
    type: "mcq",
    track: "system-design",
    topic: "arch-patterns",
    difficulty: 4,
    context:
      "A system takes a modest number of complex writes and serves an enormous volume of reads that need a completely different shape.",
    prompt: "Which pattern fits, and what does it cost?",
    options: [
      {
        id: "a",
        text: "CQRS — separate read and write models, at the cost of a sync path and eventual consistency",
      },
      { id: "b", text: "Event sourcing — store events instead of state, at the cost of storage" },
      { id: "c", text: "Sharding — partition by key, at the cost of cross-shard queries" },
      { id: "d", text: "Sidecar — move read logic beside the service, at the cost of a process" },
    ],
    answer: "a",
    explanation:
      "Different shapes and volumes on each side is the exact signal for CQRS: model each for its own job rather than compromising on one schema. The cost is real — you now maintain a projection and accept a window where the read side lags. Applying CQRS where reads and writes look alike is a classic over-correction.",
    concepts: ["CQRS", "Read model", "Eventual consistency"],
    tags: ["cqrs"],
  },
  {
    id: "sd-arch-002",
    type: "mcq",
    track: "system-design",
    topic: "arch-patterns",
    difficulty: 4,
    prompt:
      "What obligation does event sourcing create that storing current state does not?",
    options: [
      {
        id: "a",
        text: "Event schemas live forever and must stay readable, and replay needs snapshots to stay fast",
      },
      { id: "b", text: "Writes must be synchronous across all consumers" },
      { id: "c", text: "It prevents keeping any derived read model" },
      { id: "d", text: "Events cannot be stored in a relational database" },
    ],
    answer: "a",
    explanation:
      "Because state is derived by replaying history, every event format you have ever written must remain interpretable — you cannot migrate the past away. And replay time grows with history, so you add periodic snapshots. In exchange you get a genuine audit trail and the ability to reconstruct any past state.",
    concepts: ["Event sourcing", "Snapshot", "Schema evolution"],
    tags: ["event-sourcing"],
  },
  {
    id: "sd-arch-003",
    type: "matching",
    track: "system-design",
    topic: "arch-patterns",
    difficulty: 4,
    prompt: "Match each architecture pattern to what it does.",
    pairs: [
      { left: "Strangler fig", right: "Replaces a legacy system incrementally by rerouting slices of traffic" },
      { left: "Sidecar", right: "Runs supporting behaviour in a process beside the service" },
      { left: "Backend for frontend", right: "Gives each client type its own tailored API layer" },
      { left: "Anti-corruption layer", right: "Translates between your model and an external one" },
      { left: "Leader election", right: "Picks one node to do work that must happen exactly once" },
    ],
    explanation:
      "These come up by name, so recognising them is worth more than deriving them live. Strangler fig in particular is the answer to almost any \"how would you migrate off this?\" question, because it makes every step small and reversible.",
    concepts: ["Strangler fig pattern", "Sidecar pattern", "Backend for frontend", "Anti-corruption layer"],
    tags: ["catalogue"],
  },
  {
    id: "sd-arch-004",
    type: "mcq",
    track: "system-design",
    topic: "arch-patterns",
    difficulty: 3,
    context:
      "A ten-year-old monolith must be replaced. A full rewrite and cutover has been proposed.",
    prompt: "What is the safer approach and why?",
    options: [
      {
        id: "a",
        text: "Strangler fig — route one slice at a time to the new system, so every step is small and reversible",
      },
      { id: "b", text: "Rewrite fully, then cut over during a maintenance window" },
      { id: "c", text: "Freeze the monolith and build the replacement alongside it" },
      { id: "d", text: "Wrap the monolith in an API and leave it in place permanently" },
    ],
    answer: "a",
    explanation:
      "Big-bang rewrites fail because the risk all lands on one date, and the old system keeps changing while you build. Strangler fig moves traffic incrementally, so each slice is independently verifiable and independently revertible, and you are delivering value long before the last piece is done.",
    concepts: ["Strangler fig pattern", "Incremental migration"],
    tags: ["strangler-fig", "migration"],
  },
  {
    id: "sd-arch-005",
    type: "mcq",
    track: "system-design",
    topic: "arch-patterns",
    difficulty: 3,
    prompt:
      "A materialised view makes an expensive query cheap. What is the corresponding obligation?",
    options: [
      {
        id: "a",
        text: "Keeping it refreshed, and accepting that it is stale between refreshes",
      },
      { id: "b", text: "Dropping the underlying tables it is built from" },
      { id: "c", text: "Serving all writes through the view" },
      { id: "d", text: "Rebuilding every index on the base tables" },
    ],
    answer: "a",
    explanation:
      "It is precomputation, so it is the same bargain as any cache: you trade freshness and a refresh obligation for read speed. The question that decides whether it is worth it is how stale the data may be and how expensive the refresh is relative to the query you avoided.",
    concepts: ["Materialised view", "Precomputation", "Cache invalidation"],
    tags: ["materialised-view"],
  },
  {
    id: "sd-arch-006",
    type: "short",
    track: "system-design",
    topic: "arch-patterns",
    difficulty: 4,
    context:
      "A scheduled job must run exactly once across a cluster of identical nodes, not once per node.",
    prompt: "Which pattern solves this? (Two words.)",
    answers: ["leader election", "leader-election", "leader elect", "election"],
    typoTolerance: true,
    explanation:
      "Leader election: nodes coordinate to pick one to hold the role, and only that node runs the job. Implementations lean on a consensus store or a lease with a TTL — and the subtle part is fencing, so a leader that pauses and wakes up after losing its lease cannot still act as leader.",
    concepts: ["Leader election", "Distributed lock", "Fencing token"],
    tags: ["leader-election"],
  },
];
