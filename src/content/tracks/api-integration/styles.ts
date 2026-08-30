import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "rest-soap",
    track: "api-integration",
    title: "REST, SOAP & API Styles",
    blurb: "Why enterprises still run SOAP, and when each style is the right answer.",
    lesson: `"Use REST" is the default answer and it is often wrong, particularly inside large organisations.

**SOAP** is a protocol, not a style. Messages are XML documents with an *envelope* containing an optional header and a body, and errors come back as a structured *SOAP Fault* rather than a status code. A **WSDL** document describes the service formally — operations, types, bindings — which means clients can be generated from it, strongly typed, with the contract enforced by machine rather than convention.

It is transport-agnostic: SOAP over HTTP is common, but SOAP over message queues is why it persists in banking and telecom. The **WS-\*** family adds message-level security, reliable messaging, and distributed transactions as standards rather than as things each team reinvents. WS-Security signs and encrypts the *message*, so it survives being relayed through intermediaries — which TLS, protecting only the hop, does not.

SOAP is verbose, heavier to parse, and unpleasant from a browser. It is also still the correct answer when you need a formal contract, message-level security, or integration with systems that already speak it.

**REST** is an architectural style over HTTP: resources identified by URLs, manipulated with standard verbs, with the protocol's caching, status codes, and tooling for free. It has no built-in contract — OpenAPI is a convention layered on top, not part of the style.

**gRPC** is for service-to-service: binary protobuf over HTTP/2, generated clients, real streaming, and an interface definition that is genuinely enforced. Awkward from a browser without a proxy.

**GraphQL** solves over-fetching for many differently-shaped clients, and moves complexity into caching and query cost control.

**The honest heuristic:** public and browser-facing, REST. Internal service-to-service at volume, gRPC. Many client shapes over one graph of data, GraphQL. Enterprise integration, formal contracts, or an existing SOAP estate — SOAP, without embarrassment.`,
    resources: [
      {
        label: "W3C — SOAP specification",
        url: "https://www.w3.org/TR/soap12/",
      },
      {
        label: "MDN — REST",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/REST",
      },
    ],
  },
  {
    id: "api-contracts",
    track: "api-integration",
    title: "API Contracts & OpenAPI",
    blurb: "Making the interface a machine-checkable artefact instead of a document.",
    lesson: `An API contract is only real if something enforces it. Documentation drifts; a specification that generates and validates does not.

**OpenAPI** describes an HTTP API in a machine-readable document: paths, operations, parameters, request and response schemas, auth. Once that exists you get client SDKs, server stubs, mock servers, request validation, and documentation from a single source.

**Spec-first versus code-first.** Writing the spec before the implementation forces the interface to be designed rather than to emerge from whatever the handler happened to return, and it lets consumers build against a mock immediately. Generating the spec from code annotations is lower friction and tends to document what you built rather than what you agreed. Both work; the failure mode is having the spec in neither place and calling a wiki page the contract.

**Validate at the boundary.** If requests are checked against the schema at the edge, a whole category of defensive code disappears from your handlers, and rejections are consistent and explainable. The same schema drives your types, so drift between what you validate and what you assume becomes impossible.

**Contract testing** catches the thing integration tests usually miss: a provider changing a response in a way that breaks a consumer nobody remembered. Each consumer records what it depends on, and the provider's build fails when it violates any of those expectations. It is how you get confidence without spinning up every service together.

**Backwards compatibility is a property of the schema.** Adding an optional field or a new endpoint is safe. Removing a field, renaming one, narrowing a type, or making an optional parameter required are all breaking, however small the diff looks. If the spec is machine-readable, a diff tool can tell you which of those you just did.`,
    resources: [
      {
        label: "OpenAPI Specification",
        url: "https://spec.openapis.org/oas/latest.html",
      },
      {
        label: "Pact — Contract testing",
        url: "https://docs.pact.io/",
      },
    ],
  },
  {
    id: "webhooks",
    track: "api-integration",
    title: "Webhooks & Event Delivery",
    blurb: "Pushing events to other people's systems, reliably and safely.",
    lesson: `A webhook inverts the integration: instead of a consumer polling you, you call them when something happens. It removes polling latency and wasted requests, and it hands you every problem of being an HTTP client to an endpoint you do not control.

**Receivers must verify.** Your endpoint is on the public internet and anyone can POST to it. Providers sign the payload — typically HMAC-SHA256 over the raw body with a shared secret — and you must verify that signature *before* parsing or acting. Two details matter: compute the HMAC over the exact raw bytes, because re-serialising the JSON changes the signature, and use a constant-time comparison.

**Include a timestamp and reject old ones,** or a captured request can be replayed indefinitely against you.

**Delivery is at-least-once.** Networks fail after your handler committed but before the response arrived, so every consumer will eventually see duplicates. Providers send an event id; receivers must be idempotent, either by recording processed ids or by making the operation naturally repeatable.

**Ordering is not guaranteed.** Retries and parallel delivery mean "updated" can arrive before "created". Include a sequence number or a version on the resource and ignore anything older than what you have already applied.

**Respond fast, process later.** Acknowledge with a 2xx as soon as the payload is verified and durably queued, then do the work asynchronously. Providers time out aggressively and treat slowness as failure, so processing inline earns you retries you did not need and a duplicate storm on a slow day.

**Senders need discipline too:** exponential backoff with jitter, a cap on attempts, a dead letter path, and somewhere the consumer can see and replay failures. And treat the destination URL as untrusted — a user-supplied webhook target pointed at an internal address is a classic SSRF.`,
    resources: [
      {
        label: "Stripe — Webhooks",
        url: "https://docs.stripe.com/webhooks",
      },
      {
        label: "OWASP — SSRF prevention",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- REST / SOAP ----------
  {
    id: "api-style-001",
    type: "mcq",
    track: "api-integration",
    topic: "rest-soap",
    difficulty: 3,
    prompt: "What does a WSDL document provide that a plain REST API does not?",
    options: [
      {
        id: "a",
        text: "A formal machine-readable contract from which typed clients can be generated",
      },
      { id: "b", text: "Encryption of the message payload" },
      { id: "c", text: "Guaranteed message delivery" },
      { id: "d", text: "Caching semantics for responses" },
    ],
    answer: "a",
    explanation:
      "WSDL formally describes operations, types, and bindings, so clients are generated rather than hand-written and the contract is enforced by machine. REST has no equivalent in the style itself — OpenAPI provides it, but as a convention layered on top rather than part of REST.",
    tags: ["soap", "wsdl"],
  },
  {
    id: "api-style-002",
    type: "mcq",
    track: "api-integration",
    topic: "rest-soap",
    difficulty: 4,
    context:
      "A message passes through several intermediaries before reaching its destination, and must remain signed and confidential the whole way.",
    prompt: "Why is TLS alone insufficient, and what addresses it?",
    options: [
      {
        id: "a",
        text: "TLS protects each hop only, so intermediaries see plaintext — WS-Security secures the message itself",
      },
      { id: "b", text: "TLS cannot be used with XML payloads" },
      { id: "c", text: "TLS certificates expire too frequently for enterprise use" },
      { id: "d", text: "Nothing is needed; TLS is end-to-end by design" },
    ],
    answer: "a",
    explanation:
      "TLS is transport-level and terminates at each hop, so every relay along the path handles plaintext. WS-Security signs and encrypts at the message level, so protection travels with the message regardless of how many systems forward it. This is a large part of why SOAP persists in regulated industries.",
    tags: ["ws-security", "soap"],
  },
  {
    id: "api-style-003",
    type: "matching",
    track: "api-integration",
    topic: "rest-soap",
    difficulty: 3,
    prompt: "Match each API style to the situation it suits best.",
    pairs: [
      { left: "REST", right: "Public, browser-facing, wants HTTP caching and tooling" },
      { left: "SOAP", right: "Formal contracts and message-level security in enterprise integration" },
      { left: "gRPC", right: "High-volume internal service-to-service calls" },
      { left: "GraphQL", right: "Many differently-shaped clients over one data graph" },
    ],
    explanation:
      "None of these is obsolete; they optimise for different things. Dismissing SOAP as legacy misreads why it exists — transport independence, a formal contract, and message-level security are genuine requirements in banking, telecom, and government.",
    tags: ["selection"],
  },
  {
    id: "api-style-004",
    type: "short",
    track: "api-integration",
    topic: "rest-soap",
    difficulty: 3,
    context:
      "A SOAP service reports an application error. Rather than an HTTP status code, it returns a structured element inside the response body.",
    prompt: "What is that element called? (Two words.)",
    answers: ["soap fault", "fault", "soap-fault", "a soap fault"],
    typoTolerance: true,
    explanation:
      "A SOAP Fault, carried in the envelope body with a code, reason, and optional detail. Because SOAP is transport-agnostic it cannot rely on HTTP status codes — the error has to live in the message.",
    tags: ["soap", "errors"],
  },
  {
    id: "api-style-005",
    type: "multi",
    track: "api-integration",
    topic: "rest-soap",
    difficulty: 4,
    prompt:
      "Which are genuine reasons an enterprise might still choose SOAP today? Select all that apply.",
    options: [
      { id: "a", text: "A formal, generated, machine-enforced contract" },
      { id: "b", text: "Message-level security that survives intermediaries" },
      { id: "c", text: "Transport independence, including message queues" },
      { id: "d", text: "Existing systems and partners that already speak it" },
      { id: "e", text: "Smaller payloads and faster parsing than JSON" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "The first four are real engineering reasons, not inertia. Payload size is where SOAP loses badly — XML envelopes are verbose and comparatively slow to parse, which is exactly why REST and JSON took over everywhere those constraints did not apply.",
    tags: ["soap", "enterprise"],
  },
  {
    id: "api-style-006",
    type: "mcq",
    track: "api-integration",
    topic: "rest-soap",
    difficulty: 2,
    prompt: "What is the fundamental difference between REST and SOAP?",
    options: [
      {
        id: "a",
        text: "REST is an architectural style over HTTP; SOAP is a protocol with its own message format",
      },
      { id: "b", text: "REST is newer, so SOAP is deprecated" },
      { id: "c", text: "REST uses JSON and SOAP uses XML — that is the whole difference" },
      { id: "d", text: "REST is stateless and SOAP is stateful" },
    ],
    answer: "a",
    explanation:
      "The format difference is the visible consequence, not the substance. SOAP defines an envelope, an error model, and a contract language, and works over any transport. REST is a set of constraints on how you use HTTP, which is why it inherits HTTP's caching and status codes for free.",
    tags: ["fundamentals"],
  },

  // ---------- Contracts ----------
  {
    id: "api-contract-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-contracts",
    difficulty: 3,
    prompt: "What does spec-first API development buy over generating the spec from code?",
    options: [
      {
        id: "a",
        text: "The interface is designed deliberately, and consumers can build against a mock before it exists",
      },
      { id: "b", text: "It removes the need for integration tests" },
      { id: "c", text: "It produces smaller response payloads" },
      { id: "d", text: "It guarantees backwards compatibility automatically" },
    ],
    answer: "a",
    explanation:
      "Spec-first makes the contract a design decision rather than a byproduct of the handler, and it unblocks consumers immediately via mocks. Code-first is lower friction and tends to document whatever you happened to build. The real failure is having the contract in neither place.",
    tags: ["spec-first", "openapi"],
  },
  {
    id: "api-contract-002",
    type: "multi",
    track: "api-integration",
    topic: "api-contracts",
    difficulty: 4,
    prompt:
      "Which changes to a published API schema are breaking? Select all that apply.",
    options: [
      { id: "a", text: "Making a previously optional request field required" },
      { id: "b", text: "Removing a field from a response" },
      { id: "c", text: "Narrowing a field's type from string to enum" },
      { id: "d", text: "Adding a new optional request field" },
      { id: "e", text: "Adding a new endpoint" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Anything that invalidates a request a client could previously send, or removes something a client could previously read, is breaking. Narrowing a type is the one people miss — existing callers sending a legal string now fail validation. Purely additive changes are safe.",
    tags: ["compatibility"],
  },
  {
    id: "api-contract-003",
    type: "mcq",
    track: "api-integration",
    topic: "api-contracts",
    difficulty: 4,
    context:
      "A provider changes a response field. Every service's own tests pass, and a downstream consumer breaks in production.",
    prompt: "What practice catches this?",
    options: [
      {
        id: "a",
        text: "Consumer-driven contract testing — the provider's build fails when it violates a recorded consumer expectation",
      },
      { id: "b", text: "More thorough unit tests on the provider" },
      { id: "c", text: "End-to-end tests running every service together" },
      { id: "d", text: "Semantic versioning of the provider's package" },
    ],
    answer: "a",
    explanation:
      "Each service passing its own tests is exactly the situation contract testing exists for: nobody's tests encode what the *other* side relies on. Consumers publish their expectations and the provider verifies against all of them. Full end-to-end suites can catch it too, at far higher cost and flakiness.",
    tags: ["contract-testing"],
  },
  {
    id: "api-contract-004",
    type: "mcq",
    track: "api-integration",
    topic: "api-contracts",
    difficulty: 3,
    prompt:
      "What is the benefit of validating requests against the schema at the API boundary?",
    options: [
      {
        id: "a",
        text: "Handlers can assume well-formed input, and rejections are consistent and explainable",
      },
      { id: "b", text: "It removes the need for authentication checks" },
      { id: "c", text: "It makes responses smaller" },
      { id: "d", text: "It guarantees the business logic is correct" },
    ],
    answer: "a",
    explanation:
      "Validating once at the edge deletes a layer of defensive checks from every handler and makes error responses uniform. Driving your types from the same schema also means the shape you validate and the shape you assume cannot drift apart.",
    tags: ["validation"],
  },
  {
    id: "api-contract-005",
    type: "short",
    track: "api-integration",
    topic: "api-contracts",
    difficulty: 2,
    context:
      "A machine-readable document describing an HTTP API's paths, parameters, schemas, and auth, from which SDKs, mocks, and docs can all be generated.",
    prompt: "What is this specification called? (One word is enough.)",
    answers: ["openapi", "open api", "swagger", "openapi spec", "open-api"],
    typoTolerance: true,
    explanation:
      "OpenAPI, formerly Swagger — a name still attached to much of its tooling. Its value is that it is one source generating clients, servers, mocks, validation, and documentation, so they cannot disagree.",
    tags: ["openapi"],
  },

  // ---------- Webhooks ----------
  {
    id: "api-hook-001",
    type: "mcq",
    track: "api-integration",
    topic: "webhooks",
    difficulty: 3,
    context:
      "Your webhook endpoint is publicly reachable. Anyone can POST to it.",
    prompt: "What must you do before acting on a payload?",
    options: [
      {
        id: "a",
        text: "Verify the signature over the raw request body using a constant-time comparison",
      },
      { id: "b", text: "Check that the source IP is on an allowlist" },
      { id: "c", text: "Confirm the payload parses as valid JSON" },
      { id: "d", text: "Look up the event id to confirm it exists" },
    ],
    answer: "a",
    explanation:
      "Signature verification is the only check that proves the payload came from someone holding the shared secret. Two details bite people: compute the HMAC over the exact raw bytes, since re-serialising the JSON changes the result, and compare in constant time. IP allowlists are brittle and secondary.",
    tags: ["signatures", "security"],
  },
  {
    id: "api-hook-002",
    type: "mcq",
    track: "api-integration",
    topic: "webhooks",
    difficulty: 4,
    context:
      "Your handler does 8 seconds of processing before responding. The provider times out at 5 seconds and retries. You start seeing duplicate processing.",
    prompt: "What is the correct design?",
    options: [
      {
        id: "a",
        text: "Verify, durably queue, return 2xx immediately, and process asynchronously",
      },
      { id: "b", text: "Ask the provider to raise its timeout" },
      { id: "c", text: "Optimise the handler to finish under 5 seconds" },
      { id: "d", text: "Ignore retries, since the first attempt eventually completes" },
    ],
    answer: "a",
    explanation:
      "Providers treat slowness as failure, so any inline processing is a duration you are betting against. Acknowledge as soon as the event is safely recorded and do the work off the request path. Optimising helps until the work grows again; the queue fixes the shape of the problem.",
    tags: ["async", "timeouts"],
  },
  {
    id: "api-hook-003",
    type: "mcq",
    track: "api-integration",
    topic: "webhooks",
    difficulty: 4,
    context:
      "A resource's 'updated' webhook sometimes arrives before its 'created' webhook.",
    prompt: "What is going on, and how do you handle it?",
    options: [
      {
        id: "a",
        text: "Ordering is not guaranteed — use a version or sequence number and ignore anything older than what you have applied",
      },
      { id: "b", text: "The provider has a bug and should be asked to fix delivery order" },
      { id: "c", text: "Process events in the order they arrive and accept the inconsistency" },
      { id: "d", text: "Buffer all events for a minute and sort by timestamp before processing" },
    ],
    answer: "a",
    explanation:
      "Retries and parallel delivery make reordering normal rather than exceptional. Carrying a version on the resource lets the receiver discard stale updates deterministically. Buffering and sorting only narrows the window and adds latency to everything.",
    tags: ["ordering", "idempotency"],
  },
  {
    id: "api-hook-004",
    type: "mcq",
    track: "api-integration",
    topic: "webhooks",
    difficulty: 5,
    context:
      "Users can register a webhook URL. Someone registers an address pointing at your internal metadata service.",
    prompt: "What is the vulnerability and the defence?",
    options: [
      {
        id: "a",
        text: "SSRF — validate and resolve the destination, block private and link-local ranges, and send from an egress-restricted path",
      },
      { id: "b", text: "Cross-site request forgery — require an anti-forgery token" },
      { id: "c", text: "Open redirect — validate the URL scheme only" },
      { id: "d", text: "No vulnerability; outbound requests are inherently safe" },
    ],
    answer: "a",
    explanation:
      "Server-side request forgery: you are making requests to an attacker-chosen address from inside your network. Scheme validation alone is not enough, because DNS can resolve a public-looking name to a private address — you must check the resolved IP, and re-check on redirects.",
    tags: ["ssrf", "security"],
  },
  {
    id: "api-hook-005",
    type: "ordering",
    track: "api-integration",
    topic: "webhooks",
    difficulty: 4,
    prompt: "Order the steps of correctly handling an inbound webhook.",
    items: [
      "Read the raw request body without parsing it",
      "Verify the signature and reject a stale timestamp",
      "Check the event id against already-processed events",
      "Durably record the event and return 2xx",
      "Process the event asynchronously",
    ],
    explanation:
      "Order matters at every step. Parsing before verifying means acting on unverified input; verifying after re-serialising breaks the signature; and acknowledging before the event is durably recorded means a crash loses it with no retry coming.",
    tags: ["handling"],
  },
  {
    id: "api-hook-006",
    type: "short",
    track: "api-integration",
    topic: "webhooks",
    difficulty: 3,
    context:
      "A provider includes a signed timestamp alongside the payload signature, and receivers reject requests older than a few minutes.",
    prompt: "Which attack does this prevent?",
    answers: ["replay", "replay attack", "replay attacks", "a replay attack"],
    typoTolerance: true,
    explanation:
      "Replay. A validly signed request stays valid forever unless something bounds its lifetime, so a captured payload could be resent indefinitely. Signing a timestamp and enforcing a short window closes that.",
    tags: ["replay", "security"],
  },
];
