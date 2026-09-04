import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "api-auth",
    track: "api-integration",
    title: "OAuth2 & OIDC",
    blurb: "Delegated access, and the difference between proving identity and granting permission.",
    lesson: `OAuth2 is an **authorisation** framework: it lets an application act on a user's behalf without ever seeing their password. It is not an authentication protocol, and treating it as one is the source of a whole class of bugs.

**OpenID Connect** is the thin identity layer built on top. It adds an **ID token** — a JWT containing verified claims about *who the user is* — plus a userinfo endpoint and a standard discovery document. If you want to log someone in, you want OIDC. If you want to call an API on their behalf, you want OAuth2. Most real systems want both, which is why they arrive together.

**The flows, and which to use:**

*Authorisation Code with PKCE* is the answer for anything with a user — server-rendered apps, SPAs, and mobile. The client redirects to the provider, the user authenticates there, and an authorisation code comes back which the client exchanges for tokens. PKCE binds that exchange to the client that started it, so an intercepted code is useless. It is now recommended for confidential clients too, not just public ones.

*Client Credentials* is for machine-to-machine, where there is no user at all — a service authenticating as itself.

*Device Authorisation* covers input-constrained devices: a TV or CLI shows a code, you authorise on your phone.

*Implicit* and *Resource Owner Password Credentials* are both deprecated. Implicit returned tokens in the URL fragment where they leak into history and logs; the password grant requires the app to handle the user's actual credentials, defeating the point.

**Tokens.** An access token is a short-lived bearer credential — whoever holds it can use it, so treat it like a password in transit and at rest. A refresh token is longer-lived and exchanged for new access tokens, and should be revocable.

**Validate properly on the resource server.** Check the signature, the issuer, the expiry, and — the one most often skipped — the **audience**. Without an audience check, a token minted for a different service is happily accepted by yours.

**Scopes bound what a token can do**, and are not a substitute for checking that *this* user may act on *this* object.`,
    resources: [
      {
        label: "OAuth 2.0 Security Best Current Practice",
        url: "https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics",
      },
      {
        label: "OpenID Connect Core",
        url: "https://openid.net/specs/openid-connect-core-1_0.html",
      },
    ],
  },
  {
    id: "api-owasp",
    track: "api-integration",
    title: "API Security Risks",
    blurb: "The OWASP API Top 10, and why authorisation dominates it.",
    lesson: `API vulnerabilities look different from classic web ones. There is less injection and far more **authorisation** — because an API exposes objects and operations directly, and each one has to independently decide whether this caller may touch it.

**Broken object level authorisation (BOLA)** is the most common and most damaging. \`GET /orders/1234\` authenticates the caller, then returns order 1234 without checking they own it. Changing the id walks the whole table. Also known as IDOR. Unguessable ids are not a fix — that is obscurity, not authorisation. Every object access needs an ownership check at the point of access.

**Broken function level authorisation** is the same failure applied to operations: an admin endpoint that is merely undocumented rather than actually protected.

**Broken object property level authorisation** covers two familiar bugs. *Excessive data exposure* is returning the whole record and letting the client hide fields — the data is in the response whatever the UI does. *Mass assignment* is binding request JSON straight onto a model, so a caller who adds \`"role": "admin"\` gets exactly that. Bind to an explicit allowlist of fields.

**Unrestricted resource consumption** is missing rate limits, unbounded page sizes, and queries a caller can make arbitrarily expensive.

**Server-side request forgery** appears anywhere your API fetches a URL the caller supplied.

**Improper inventory management** is the quiet one: forgotten \`/v1\` endpoints still running unpatched next to \`/v3\`, staging hosts exposed to the internet, undocumented internal APIs. You cannot secure what nobody remembers exists, which is why an inventory is a security control.

**Unsafe consumption of APIs** — trusting a third-party response because it came from a partner. Validate what comes back as carefully as what comes in.`,
    resources: [
      {
        label: "OWASP API Security Top 10",
        url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/",
      },
    ],
  },
  {
    id: "api-governance",
    track: "api-integration",
    title: "Versioning & Governance",
    blurb: "Changing an interface other teams depend on, without breaking them.",
    lesson: `Once an API has consumers you do not control, every change is a negotiation. Governance is what keeps that from becoming either paralysis or breakage.

**Prefer evolution to versioning.** Additive change costs nothing: new optional fields, new endpoints, new enum values that old clients can ignore. A surprising share of "we need v2" is really a handful of additive changes plus a rename someone wanted. Every version you publish is a version you maintain.

**When you must version,** the two common approaches are a URL segment (\`/v2/orders\`) and a header or media type. URL versioning is blunt, obvious, trivially cacheable, and easy to route — which is why most public APIs use it despite purists disliking it. Header versioning keeps URLs stable and is harder to debug by hand.

**Deprecation is a process, not an announcement.** Publish a policy with a real timeline, signal it in the response — \`Deprecation\` and \`Sunset\` headers exist for this — instrument which consumers are still calling the old path, and contact them directly. Turning something off because the date passed, without checking who is still on it, is how you cause an incident on purpose.

**Know what you have.** An inventory of every API, its version, its owner, and its consumers is the precondition for everything else. Teams that cannot answer "who calls this?" cannot safely change anything, so they stop changing things, and the estate ossifies.

**Consistency is a feature.** A style guide covering naming, pagination, error shapes, filtering, and date formats means a developer who has used one of your APIs can predict the next. Enforce it by linting the spec in CI, not by review comments — automated rules are applied evenly and do not depend on who reviewed it.`,
    resources: [
      {
        label: "Google — API design guide",
        url: "https://cloud.google.com/apis/design",
      },
      {
        label: "RFC 8594 — The Sunset HTTP header",
        url: "https://datatracker.ietf.org/doc/html/rfc8594",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- OAuth2 / OIDC ----------
  {
    id: "api-auth-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 3,
    prompt: "What is the relationship between OAuth2 and OpenID Connect?",
    options: [
      {
        id: "a",
        text: "OAuth2 handles authorisation; OIDC adds an identity layer on top with an ID token",
      },
      { id: "b", text: "They are competing standards for the same problem" },
      { id: "c", text: "OIDC is the older protocol that OAuth2 replaced" },
      { id: "d", text: "OAuth2 authenticates users and OIDC authorises API access" },
    ],
    answer: "a",
    explanation:
      "OAuth2 answers \"may this app do this on the user's behalf\" and deliberately says nothing about who the user is. OIDC adds that: an ID token carrying verified claims, plus discovery and a userinfo endpoint. Using bare OAuth2 as a login mechanism is a classic error — an access token proves someone granted access, not who is holding it.",
    concepts: ["OAuth 2.0", "OpenID Connect", "ID token"],
    tags: ["oidc", "fundamentals"],
  },
  {
    id: "api-auth-002",
    type: "matching",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 4,
    prompt: "Match each OAuth2 flow to the situation it is designed for.",
    pairs: [
      { left: "Authorisation Code + PKCE", right: "Any application acting for a signed-in user" },
      { left: "Client Credentials", right: "Machine-to-machine with no user involved" },
      { left: "Device Authorisation", right: "TVs and CLIs that cannot show a browser well" },
      { left: "Implicit", right: "Deprecated: returned tokens in the URL fragment" },
    ],
    explanation:
      "Authorisation Code with PKCE is now the recommendation for public and confidential clients alike. Implicit and the password grant are both deprecated — implicit leaked tokens into browser history and logs, and the password grant required the app to handle real credentials, which is precisely what OAuth exists to avoid.",
    concepts: ["Authorization Code flow", "Client Credentials flow", "Device Authorization flow", "Implicit flow"],
    tags: ["flows"],
  },
  {
    id: "api-auth-003",
    type: "mcq",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 4,
    prompt: "What does PKCE protect against?",
    options: [
      {
        id: "a",
        text: "An intercepted authorisation code being exchanged by an attacker, by binding the exchange to the client that started it",
      },
      { id: "b", text: "Access tokens being stolen from browser storage" },
      { id: "c", text: "Brute-force attacks against the token endpoint" },
      { id: "d", text: "Replay of refresh tokens after logout" },
    ],
    answer: "a",
    explanation:
      "The client generates a secret verifier, sends its hash when starting the flow, and presents the original when redeeming the code. An attacker who captures the code cannot exchange it without the verifier. This mattered most for mobile apps, where redirect interception was practical — and it is now recommended everywhere.",
    concepts: ["PKCE", "Authorization code interception"],
    tags: ["pkce"],
  },
  {
    id: "api-auth-004",
    type: "mcq",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 5,
    context:
      "A resource server validates a JWT's signature, issuer, and expiry, then serves the request. Tokens minted for a different service in the same organisation are accepted.",
    prompt:
      "Which JWT check is missing when tokens minted for another service are accepted?",
    options: [
      {
        id: "a",
        text: "The audience claim — which service the token was actually issued for",
      },
      { id: "b", text: "The subject claim identifying the user" },
      { id: "c", text: "The issued-at timestamp" },
      { id: "d", text: "The token type header" },
    ],
    answer: "a",
    explanation:
      "Same issuer and a valid signature mean the token is genuine, not that it was meant for you. Without an audience check, a token a user granted to a low-privilege internal tool is replayable against a sensitive service. It is the most commonly skipped validation step.",
    concepts: ["Audience claim", "JSON Web Token", "Token validation"],
    tags: ["jwt", "audience", "validation"],
  },
  {
    id: "api-auth-005",
    type: "multi",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 4,
    prompt:
      "What must a resource server verify on an incoming JWT access token? Select all that apply.",
    options: [
      { id: "a", text: "The signature, against the issuer's published keys" },
      { id: "b", text: "The issuer claim" },
      { id: "c", text: "The audience claim" },
      { id: "d", text: "That it has not expired" },
      { id: "e", text: "That the algorithm header says the token is trustworthy" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Signature, issuer, audience, expiry. The last option is an actual historical vulnerability: trusting the token's own `alg` header let attackers set it to `none` or downgrade the algorithm. The server must decide which algorithms it accepts, never the token.",
    concepts: ["JWT signature verification", "alg=none attack", "Issuer claim"],
    tags: ["jwt", "validation"],
  },
  {
    id: "api-auth-006",
    type: "short",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 3,
    context:
      "A machine needs to call an API as itself, with no user involved and no browser redirect.",
    prompt: "Which OAuth2 grant applies? (Two words.)",
    answers: [
      "client credentials",
      "client credentials grant",
      "client-credentials",
      "client credential",
    ],
    typoTolerance: true,
    explanation:
      "The Client Credentials grant — the service authenticates with its own id and secret and receives a token representing itself. There is no user, so there is nothing to consent and no redirect.",
    concepts: ["Client Credentials flow", "Machine-to-machine authentication"],
    tags: ["flows"],
  },

  // ---------- OWASP API risks ----------
  {
    id: "api-sec-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 3,
    context:
      "GET /api/orders/1043 returns the order. Changing the id to 1044 returns another customer's order. The caller is authenticated.",
    prompt: "What is this, and what fixes it?",
    options: [
      {
        id: "a",
        text: "Broken object level authorisation — check that this user owns this object at the point of access",
      },
      { id: "b", text: "Broken authentication — require a stronger login" },
      { id: "c", text: "Excessive data exposure — return fewer fields" },
      { id: "d", text: "Security misconfiguration — restrict the endpoint by IP" },
    ],
    answer: "a",
    explanation:
      "BOLA, also called IDOR, and the most common serious API flaw. Authentication established who is calling; nothing established that they may see this particular object. The check must happen on every object access — and switching to UUIDs is obscurity, not a fix.",
    concepts: ["Broken Object Level Authorization", "IDOR", "Object-level authorisation"],
    tags: ["bola", "idor"],
  },
  {
    id: "api-sec-002",
    type: "mcq",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 4,
    context:
      "A profile update endpoint binds the request JSON directly onto the user model. A caller includes \"role\": \"admin\".",
    prompt: "What is the vulnerability and the correct fix?",
    options: [
      {
        id: "a",
        text: "Mass assignment — bind only an explicit allowlist of updatable fields",
      },
      { id: "b", text: "Injection — escape the values before saving" },
      { id: "c", text: "Broken authentication — verify the session again before updating" },
      { id: "d", text: "Excessive data exposure — omit role from responses" },
    ],
    answer: "a",
    explanation:
      "Automatic binding is convenient precisely because it accepts whatever arrives, including fields the client should never control. Denylisting sensitive fields fails the moment someone adds a new one, so bind to an explicit allowlist — or a dedicated request type containing only what may change.",
    concepts: ["Mass assignment", "Allowlist binding", "Over-posting"],
    tags: ["mass-assignment"],
  },
  {
    id: "api-sec-003",
    type: "mcq",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 3,
    context:
      "An endpoint returns the full user record including email, phone, and internal flags. The web UI displays only the name.",
    prompt:
      "Is it a problem for an endpoint to return more fields than the UI displays?",
    options: [
      {
        id: "a",
        text: "Yes — the data is in the response regardless of what the UI renders; filter server-side",
      },
      { id: "b", text: "No — the client controls what users see" },
      { id: "c", text: "Only if the endpoint is unauthenticated" },
      { id: "d", text: "Only if the response is cached" },
    ],
    answer: "a",
    explanation:
      "Excessive data exposure. Anyone can open developer tools or call the endpoint directly, so client-side filtering is presentation, not protection. Return only what the caller is entitled to, shaped by their permissions rather than by what one screen happens to need.",
    concepts: ["Excessive data exposure", "Response filtering"],
    tags: ["data-exposure"],
  },
  {
    id: "api-sec-004",
    type: "matching",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 4,
    prompt: "Match each API security risk to its description.",
    pairs: [
      { left: "Broken object level authorisation", right: "Any authenticated user can access another user's object by id" },
      { left: "Broken function level authorisation", right: "A regular user can call an admin-only operation" },
      { left: "Mass assignment", right: "Request fields bind to model properties the client should not control" },
      { left: "Improper inventory management", right: "Old or undocumented endpoints still running unpatched" },
      { left: "Unsafe consumption of APIs", right: "Trusting a third-party response without validating it" },
    ],
    explanation:
      "Authorisation failures dominate this list because APIs expose objects and operations directly, so each one must independently decide whether this caller may proceed. Inventory management is the sleeper — you cannot patch or protect an endpoint nobody remembers exists.",
    concepts: ["Broken Object Level Authorization", "Broken Function Level Authorization", "Mass assignment", "Improper inventory management"],
    tags: ["owasp", "catalogue"],
  },
  {
    id: "api-sec-005",
    type: "multi",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 4,
    prompt:
      "Which defend against unrestricted resource consumption? Select all that apply.",
    options: [
      { id: "a", text: "Rate limits per authenticated client" },
      { id: "b", text: "A maximum page size the caller cannot exceed" },
      { id: "c", text: "Query cost limits or depth limits on flexible queries" },
      { id: "d", text: "Timeouts on expensive operations" },
      { id: "e", text: "Returning 200 with an empty body when overloaded" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Each bounds what a single caller can consume. The last is actively harmful: reporting success while doing nothing means clients cannot distinguish \"no results\" from \"we refused\", so they neither retry nor alert — a silent failure is worse than a 429.",
    concepts: ["Unrestricted resource consumption", "Rate limiting", "Query cost limit"],
    tags: ["resource-consumption"],
  },
  {
    id: "api-sec-006",
    type: "short",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 3,
    context:
      "An old /v1 endpoint is still running, unpatched and undocumented, alongside the current /v3. Nobody on the team knew it was live.",
    prompt: "Which OWASP API risk category is this? (Two words: improper ____ management.)",
    answers: ["inventory", "inventory management", "asset", "api inventory"],
    typoTolerance: true,
    explanation:
      "Improper inventory management. It is unglamorous and routinely how breaches happen: the current version is well defended while a forgotten one next to it is not. Maintaining a catalogue of every API, version, owner, and consumer is a genuine security control.",
    concepts: ["Improper inventory management", "Shadow API", "API inventory"],
    tags: ["inventory"],
  },

  // ---------- Governance ----------
  {
    id: "api-gov-001",
    type: "mcq",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 3,
    context:
      "A team wants to publish v2 because they need three new fields and one renamed field.",
    prompt: "What is the better approach?",
    options: [
      {
        id: "a",
        text: "Add the three fields additively and keep the old name as an alias — a rename rarely justifies a version",
      },
      { id: "b", text: "Publish v2 and deprecate v1 immediately" },
      { id: "c", text: "Publish v2 and maintain both indefinitely" },
      { id: "d", text: "Rename the field in place and notify consumers" },
    ],
    answer: "a",
    explanation:
      "Additive change is free; the rename is the only breaking part, and supporting both names costs far less than a parallel version. Every version you publish is one you maintain, document, patch, and eventually run a migration for. Renaming in place breaks everyone immediately.",
    concepts: ["API evolution", "Backwards compatibility", "Field alias"],
    tags: ["versioning", "evolution"],
  },
  {
    id: "api-gov-002",
    type: "ordering",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 4,
    prompt: "Order the steps of retiring an API version responsibly.",
    items: [
      "Publish the replacement and a migration guide",
      "Announce a deprecation date and signal it in response headers",
      "Instrument which consumers are still calling the old version",
      "Contact the remaining consumers directly",
      "Turn it off",
    ],
    explanation:
      "The step teams skip is instrumentation, and it is the one that prevents the incident. A date and an announcement tell you nothing about who is actually still calling — turning something off on schedule without checking is causing an outage deliberately.",
    concepts: ["Deprecation policy", "Sunset header", "Consumer instrumentation"],
    tags: ["deprecation"],
  },
  {
    id: "api-gov-003",
    type: "mcq",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 3,
    prompt:
      "Why enforce an API style guide by linting the specification in CI rather than in code review?",
    options: [
      {
        id: "a",
        text: "Automated rules are applied evenly and immediately, instead of depending on who reviewed it",
      },
      { id: "b", text: "Linting catches security vulnerabilities that reviewers miss" },
      { id: "c", text: "It removes the need for API review altogether" },
      { id: "d", text: "Style consistency matters more than interface design" },
    ],
    answer: "a",
    explanation:
      "Conventions enforced by people drift with reviewer, mood, and deadline, and inconsistency across an estate is exactly what makes a set of APIs unpleasant to consume. Linting frees review to focus on the thing a machine cannot judge: whether the interface is well designed.",
    concepts: ["API style guide", "Spectral linting", "API governance"],
    tags: ["style-guide", "consistency"],
  },
  {
    id: "api-gov-004",
    type: "mcq",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 4,
    prompt:
      "What is the practical argument for URL-based versioning over header-based, despite the latter being more RESTful?",
    options: [
      {
        id: "a",
        text: "It is visible, cacheable, routable, and debuggable by hand",
      },
      { id: "b", text: "It allows more versions to coexist" },
      { id: "c", text: "It avoids breaking changes entirely" },
      { id: "d", text: "Header versioning cannot be used with HTTPS" },
    ],
    answer: "a",
    explanation:
      "You can see the version in a log line, route it at the load balancer, cache it without a Vary header, and reproduce a call by pasting a URL. Header versioning keeps URLs stable and is theoretically cleaner, and most public APIs still choose the URL because operability wins.",
    concepts: ["URL versioning", "Header versioning", "API versioning"],
    tags: ["versioning"],
  },
  {
    id: "api-gov-005",
    type: "multi",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 4,
    prompt:
      "What belongs in an API inventory for an organisation of any size? Select all that apply.",
    options: [
      { id: "a", text: "Every API and the versions currently running" },
      { id: "b", text: "An owning team for each" },
      { id: "c", text: "Known consumers of each version" },
      { id: "d", text: "Which environments each is exposed in" },
      { id: "e", text: "Lines of code in each implementation" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Those four answer the questions that block every change and every incident: what exists, who owns it, who would break, and whether it is reachable from outside. Implementation size tells you nothing about risk or blast radius.",
    concepts: ["API inventory", "Service ownership", "Consumer mapping"],
    tags: ["inventory", "governance"],
  },
  {
    id: "api-auth-007",
    type: "mcq",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 4,
    context:
      "A user's session must end the moment their account is disabled. Access tokens are self-contained JWTs with a one-hour lifetime, and resource servers validate them without ever calling the issuer.",
    prompt: "Why can a stateless JWT not be revoked, and what is the usual answer?",
    options: [
      {
        id: "a",
        text: "Validation is local, so nothing consults the issuer — shorten the lifetime, and check a revocation list where it matters",
      },
      { id: "b", text: "Rotate the signing key, which is the normal way to end one user's session" },
      { id: "c", text: "JWTs expire automatically the moment the user record changes" },
      { id: "d", text: "The client is responsible for discarding the token" },
    ],
    answer: "a",
    explanation:
      "The property that makes a JWT fast is precisely the property that makes it unrevokable: nobody asks the issuer. The practical settlement is a short access token plus a refresh token checked centrally, so a disabled account stays live for at most one access token lifetime. Rotating the signing key works, and signs out everybody.",
    concepts: ["Token revocation", "Stateless token", "Refresh token", "Token lifetime"],
    tags: ["jwt", "revocation"],
  },
  {
    id: "api-auth-008",
    type: "multi",
    track: "api-integration",
    topic: "api-auth",
    difficulty: 3,
    prompt:
      "Which statements about OAuth2 scopes are correct? Select all that apply.",
    options: [
      {
        id: "a",
        text: "A scope bounds what a token may do, drawn from what its holder is already permitted to do",
      },
      { id: "b", text: "Granting a scope does not grant permission the user does not have" },
      {
        id: "c",
        text: "The resource server must still check that this caller may act on this specific object",
      },
      { id: "d", text: "A scope replaces the need for role or permission checks" },
      { id: "e", text: "A scope identifies who the user is" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "A scope is a ceiling on delegation rather than a grant of authority: 'read:invoices' lets an application read the invoices its user could already read, and nothing more. Treating the scope as the authorisation decision is how object-level checks get skipped, which is the top entry on the OWASP API risk list.",
    concepts: ["OAuth scope", "Delegated authorisation", "Broken Object Level Authorization", "Principle of least privilege"],
    tags: ["scopes", "authorisation"],
  },
  {
    id: "api-sec-007",
    type: "ordering",
    track: "api-integration",
    topic: "api-owasp",
    difficulty: 3,
    prompt: "Put the checks an API endpoint should run on a request in order.",
    items: [
      "Authenticate the caller and establish who they are",
      "Check this caller may invoke this operation at all",
      "Validate the body against the schema, rejecting unknown fields",
      "Load the object the request names",
      "Check this caller may act on that specific object",
      "Bind only the fields this caller is permitted to change",
    ],
    explanation:
      "The fifth step is Broken Object Level Authorization, the most exploited API flaw there is, and it is genuinely separate from the second: being allowed to call GET /invoices/{id} is not being allowed to read invoice 91. The last guards against mass assignment, where binding the whole body lets a caller set a field no form ever exposed.",
    concepts: ["Broken Object Level Authorization", "Broken Function Level Authorization", "Mass assignment", "Schema validation"],
    tags: ["owasp", "request-pipeline"],
  },
  {
    id: "api-gov-006",
    type: "multi",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 3,
    prompt: "What does a public API need beyond working endpoints? Select all that apply.",
    options: [
      { id: "a", text: "A changelog, so a consumer can see what changed and when" },
      { id: "b", text: "A stated deprecation policy, so consumers know how much notice they get" },
      { id: "c", text: "A sandbox or test credentials, so integration can be built without real data" },
      { id: "d", text: "A guarantee that the response shape will never change" },
      { id: "e", text: "An SDK in every language a consumer might use" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "All three are promises about change rather than features, and they are what makes an API safe to build on: consumers are not asking you to freeze, they are asking to know what happens next. Promising never to change is a promise nobody keeps, and it merely postpones the conversation until it is an emergency.",
    concepts: ["Deprecation policy", "API changelog", "Developer experience", "Sandbox environment"],
    tags: ["consumers", "promises"],
  },
  {
    id: "api-gov-007",
    type: "matching",
    track: "api-integration",
    topic: "api-governance",
    difficulty: 3,
    prompt: "Match each versioning decision to the consequence it carries.",
    pairs: [
      {
        left: "Publishing a new major version at /v2",
        right: "You now operate both versions until v1 is retired",
      },
      { left: "An additive change within v1", right: "No existing consumer has to do anything" },
      {
        left: "Renaming a field within v1",
        right: "Every consumer reading that field breaks at once",
      },
      {
        left: "Selecting the version by request header",
        right: "The URL stays clean, and the header is easy to forget to set",
      },
      {
        left: "No versioning scheme at all",
        right: "Every change becomes a negotiation with every consumer",
      },
    ],
    explanation:
      "The cost of a major version is operating two of everything, which is why teams work so hard at staying additive. The header row names the real objection to the more RESTful option: an unset header has to default to something, and defaulting to the latest version breaks people silently.",
    concepts: ["API versioning", "URL versioning", "Header versioning", "Additive change"],
    tags: ["versioning", "consequences"],
  },
];
