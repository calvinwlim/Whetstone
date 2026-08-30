import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "enterprise-identity",
    track: "data-enterprise",
    title: "Enterprise Identity",
    blurb: "SSO, SAML, directories, and the part that actually matters — deprovisioning.",
    lesson: `In a large organisation, identity is centralised infrastructure. Your application does not own accounts; it trusts an identity provider and enforces what that provider says.

**Single sign-on** means one authentication serves many applications. The application (the *service provider*) redirects to the *identity provider*, the user authenticates there, and comes back with a signed assertion of who they are. Your app never handles the password, which is the security win — and it means account lifecycle is centrally controlled, which is the operational win.

**SAML** is the long-standing enterprise standard: XML assertions, signed, usually delivered by browser POST. It is verbose and awkward compared to modern alternatives, and it is what large organisations already run, so it remains a hard requirement in enterprise sales. **OIDC** does the same job with JSON and JWTs and is the better choice where you can choose.

**LDAP and Active Directory** are directory services — the authoritative store of users, groups, and attributes. They answer "who exists and what groups are they in", which is usually the input to your authorisation.

**SCIM** automates provisioning: when HR creates an employee, accounts appear in connected applications, and when someone leaves, they are removed. Without it, provisioning is a ticket and deprovisioning is a ticket that nobody files.

**Deprovisioning is the security-critical half and the one that fails.** Leavers keep access because a manual step was missed, and orphaned accounts with valid credentials are a standard finding in every access audit. Automated deprovisioning is worth more than most preventive controls.

**RBAC versus ABAC.** Role-based access assigns permissions to roles and roles to people — simple, auditable, and prone to role explosion as exceptions accumulate. Attribute-based evaluates policies over attributes of the user, resource, and context: "a manager may approve expenses in their own department under £5,000". More expressive, harder to reason about, and much harder to answer "who can do X" from.`,
    resources: [
      {
        label: "OASIS — SAML 2.0",
        url: "https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html",
      },
      {
        label: "SCIM — System for Cross-domain Identity Management",
        url: "https://scim.cloud/",
      },
    ],
  },
  {
    id: "enterprise-integration",
    track: "data-enterprise",
    title: "Enterprise Integration & Data",
    blurb: "Moving data between systems that were never designed to talk.",
    lesson: `Enterprise integration is the work of connecting systems you did not build, cannot change, and cannot turn off.

**Point-to-point does not scale.** Ten systems each talking directly to the others is up to forty-five integrations, each with its own format and failure mode. The traditional answer was an **enterprise service bus** — a central component doing routing, transformation, and protocol mediation. It genuinely reduces the connection count and it becomes a bottleneck, a single point of failure, and a place where business logic accumulates until nobody dares change it. The modern equivalent is an event backbone: systems publish events, consumers subscribe, and the broker stays deliberately simple.

**A canonical data model** defines one shared representation of core entities so each system translates once, to and from the canonical form, rather than to every other system. The tradeoff is real: the canonical model becomes a committee artefact that fits nobody perfectly and changes slowly.

**Master data management** decides which system is authoritative for each core entity — customer, product, employee. Most integration pain traces back to two systems both believing they own the customer record.

**ETL versus ELT.** Traditionally you extracted, *transformed*, then loaded, because storage and compute in the warehouse were expensive. Modern warehouses invert this: load raw, transform inside the warehouse with SQL. ELT keeps the raw data so you can re-derive when the logic turns out to be wrong, which it does.

**Warehouse, lake, lakehouse.** A *warehouse* is structured and schema-on-write — you decide the shape before loading, and queries are fast and governed. A *lake* stores raw files, schema-on-read, cheap and flexible, and degrades into a swamp without discipline. A *lakehouse* aims for lake economics with warehouse guarantees.

**OLTP is not OLAP.** Transactional systems handle many small reads and writes; analytical systems scan enormous ranges of few columns. Running heavy analytics on your production database is the most common cause of mysterious latency in an otherwise healthy application.`,
    resources: [
      {
        label: "Enterprise Integration Patterns",
        url: "https://www.enterpriseintegrationpatterns.com/patterns/messaging/",
      },
    ],
  },
  {
    id: "multi-tenancy",
    track: "data-enterprise",
    title: "Multi-Tenancy",
    blurb: "Serving many customers from one system, and choosing how much to isolate them.",
    lesson: `Multi-tenancy is one decision with long consequences: how much do tenants share?

**Shared database, shared schema.** Every table carries a \`tenant_id\`. Cheapest to run, simplest to deploy, best resource utilisation. Isolation depends entirely on every query filtering correctly, so one forgotten \`WHERE\` clause is a cross-tenant breach — which is exactly the case for enforcing it with row-level security rather than discipline. Per-tenant restore is painful, because one tenant's data is interleaved with everyone's.

**Shared database, schema per tenant.** Stronger separation and per-tenant backup becomes tractable. Migrations now run N times, and schema drift between tenants becomes possible, which is its own class of incident.

**Database per tenant.** Strongest isolation, easiest compliance story, trivial per-tenant restore and per-tenant scaling. Operationally heaviest: migrations across thousands of databases, connection pool pressure, and a far worse cost profile for small tenants.

**Most products start shared and move large or regulated tenants to dedicated databases,** which is a sensible endpoint — a hybrid where the model is a property of the tenant rather than of the product.

**The noisy neighbour problem is inherent to sharing.** One tenant running an enormous report degrades everyone. Per-tenant rate limits, query cost caps, and separate pools for heavy tenants are the defences, and they need to exist before the incident.

**Design for the tenant dimension early.** Retrofitting \`tenant_id\` into a schema, every query, every cache key, and every background job is one of the more painful migrations there is — and until it is complete, every one of those places is a potential leak.`,
    resources: [
      {
        label: "Azure — Multitenant architecture guidance",
        url: "https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Enterprise identity ----------
  {
    id: "de-id-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-identity",
    difficulty: 3,
    prompt: "In SSO terms, what is your application called and what does it do?",
    options: [
      {
        id: "a",
        text: "The service provider — it redirects to the identity provider and trusts the signed assertion that comes back",
      },
      { id: "b", text: "The identity provider — it authenticates the user directly" },
      { id: "c", text: "The directory — it stores users and groups" },
      { id: "d", text: "The relying directory — it queries LDAP on each request" },
    ],
    answer: "a",
    explanation:
      "Your app is the service provider. It never sees the password; it receives a signed assertion asserting who the user is and what groups they belong to. That is the security benefit, and it also means account lifecycle stays centrally controlled.",
    tags: ["sso", "saml"],
  },
  {
    id: "de-id-002",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-identity",
    difficulty: 4,
    context:
      "An access audit finds several former employees still have working accounts in a connected application.",
    prompt: "What was missing?",
    options: [
      {
        id: "a",
        text: "Automated deprovisioning — SCIM or equivalent removing access when the directory record is disabled",
      },
      { id: "b", text: "Stronger password complexity requirements" },
      { id: "c", text: "Multi-factor authentication on the application" },
      { id: "d", text: "Shorter session timeouts" },
    ],
    answer: "a",
    explanation:
      "Deprovisioning is the half of identity management that fails, because it depends on someone remembering a manual step for a person who has already left. Orphaned accounts with valid credentials are a standard audit finding. MFA and password rules do nothing about an account that should not exist.",
    tags: ["scim", "deprovisioning"],
  },
  {
    id: "de-id-003",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-identity",
    difficulty: 4,
    prompt: "What is the main practical drawback of RBAC as an organisation grows?",
    options: [
      {
        id: "a",
        text: "Role explosion — exceptions accumulate until there are nearly as many roles as people",
      },
      { id: "b", text: "It cannot express read versus write permissions" },
      { id: "c", text: "It requires a separate directory service" },
      { id: "d", text: "Roles cannot be audited" },
    ],
    answer: "a",
    explanation:
      "Every \"like a manager, but also able to X\" becomes a new role, and the set stops being comprehensible. ABAC handles those cases as policy over attributes instead — at the cost of it becoming much harder to answer \"who can do X?\", which is the question auditors actually ask.",
    tags: ["rbac", "abac"],
  },
  {
    id: "de-id-004",
    type: "matching",
    track: "data-enterprise",
    topic: "enterprise-identity",
    difficulty: 4,
    prompt: "Match each enterprise identity technology to its role.",
    pairs: [
      { left: "SAML", right: "XML assertions for browser-based SSO" },
      { left: "OIDC", right: "JSON and JWT identity layer over OAuth2" },
      { left: "LDAP / Active Directory", right: "Authoritative store of users, groups, and attributes" },
      { left: "SCIM", right: "Automated account provisioning and removal" },
    ],
    explanation:
      "They solve adjacent problems and are frequently deployed together: a directory holds the truth, SAML or OIDC conveys it at login, and SCIM keeps account existence in step with it. SAML persists because enterprises already run it, not because it is pleasant.",
    tags: ["catalogue"],
  },

  // ---------- Enterprise integration ----------
  {
    id: "de-int-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-integration",
    difficulty: 4,
    prompt:
      "What problem does an enterprise service bus solve, and what problem does it create?",
    options: [
      {
        id: "a",
        text: "It cuts point-to-point connections, and becomes a bottleneck where business logic accumulates",
      },
      { id: "b", text: "It removes the need for data transformation entirely" },
      { id: "c", text: "It guarantees exactly-once delivery between all systems" },
      { id: "d", text: "It eliminates the need for a canonical data model" },
    ],
    answer: "a",
    explanation:
      "Connecting ten systems point-to-point is up to forty-five integrations; a hub reduces that dramatically. The failure mode is centralisation: routing, transformation, and eventually business rules collect in a component every team depends on and none owns. Modern designs keep the broker dumb and push logic to the edges.",
    tags: ["esb"],
  },
  {
    id: "de-int-002",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-integration",
    difficulty: 4,
    prompt: "Why did modern data platforms shift from ETL to ELT?",
    options: [
      {
        id: "a",
        text: "Warehouse storage and compute got cheap, so loading raw and transforming in place preserves the ability to re-derive",
      },
      { id: "b", text: "Transformation logic became unnecessary" },
      { id: "c", text: "ELT loads data faster than ETL by skipping validation" },
      { id: "d", text: "ETL cannot handle streaming sources" },
    ],
    answer: "a",
    explanation:
      "ETL transformed first because warehouse resources were expensive, and that discarded whatever the transformation dropped. ELT keeps the raw data, so when the business logic turns out to be wrong — and it does — you re-derive rather than re-ingest from systems that may no longer have it.",
    tags: ["etl-elt"],
  },
  {
    id: "de-int-003",
    type: "mcq",
    track: "data-enterprise",
    topic: "enterprise-integration",
    difficulty: 3,
    context:
      "An analyst runs a large aggregation query against the production transactional database. Application latency spikes.",
    prompt: "What is the underlying mismatch?",
    options: [
      {
        id: "a",
        text: "OLTP is tuned for many small operations; analytical scans compete for the same resources",
      },
      { id: "b", text: "The query was missing an index" },
      { id: "c", text: "The database needs more connections in the pool" },
      { id: "d", text: "Analysts should not have read access" },
    ],
    answer: "a",
    explanation:
      "Transactional and analytical workloads want opposite things — small indexed lookups versus scanning many rows across few columns — and they fight over buffer cache and I/O. The answer is a replica or a warehouse, not another index.",
    tags: ["oltp-olap"],
  },
  {
    id: "de-int-004",
    type: "matching",
    track: "data-enterprise",
    topic: "enterprise-integration",
    difficulty: 4,
    prompt: "Match each data platform concept to its defining property.",
    pairs: [
      { left: "Data warehouse", right: "Structured and schema-on-write, governed and fast to query" },
      { left: "Data lake", right: "Raw files, schema-on-read, cheap and flexible" },
      { left: "Lakehouse", right: "Lake economics with warehouse-style guarantees" },
      { left: "Master data management", right: "Decides which system is authoritative for a core entity" },
    ],
    explanation:
      "Schema-on-write versus schema-on-read is the real axis: pay the modelling cost up front and get governance, or defer it and get flexibility plus the risk of a swamp. MDM is separate and underrated — most integration pain is two systems both believing they own the customer.",
    tags: ["platforms"],
  },
  {
    id: "de-int-005",
    type: "short",
    track: "data-enterprise",
    topic: "enterprise-integration",
    difficulty: 4,
    context:
      "Rather than each system translating to every other system's format, all systems translate to and from one shared representation of core entities.",
    prompt: "What is that shared representation called? (Two words: canonical ____.)",
    answers: ["data model", "model", "canonical data model", "data-model"],
    typoTolerance: true,
    explanation:
      "A canonical data model. It turns an N-times-M translation problem into N translations. The cost is that the shared model is negotiated across teams, fits nobody exactly, and changes at committee speed.",
    tags: ["canonical-model"],
  },

  // ---------- Multi-tenancy ----------
  {
    id: "de-tenant-001",
    type: "matching",
    track: "data-enterprise",
    topic: "multi-tenancy",
    difficulty: 4,
    prompt: "Match each multi-tenancy model to its defining tradeoff.",
    pairs: [
      { left: "Shared schema with tenant_id", right: "Cheapest and densest; isolation depends on every query filtering" },
      { left: "Schema per tenant", right: "Better separation; migrations run once per tenant" },
      { left: "Database per tenant", right: "Strongest isolation; heaviest operational burden" },
    ],
    explanation:
      "It is one axis: isolation versus cost and operational effort. Many products end up hybrid — shared by default, dedicated databases for large or regulated customers — which makes the model a property of the tenant rather than of the product.",
    tags: ["isolation"],
  },
  {
    id: "de-tenant-002",
    type: "mcq",
    track: "data-enterprise",
    topic: "multi-tenancy",
    difficulty: 4,
    context:
      "A shared-schema product must restore one tenant's data to a point in time after they deleted records by mistake.",
    prompt: "Why is this hard?",
    options: [
      {
        id: "a",
        text: "That tenant's rows are interleaved with everyone else's, so a restore cannot simply roll back the database",
      },
      { id: "b", text: "Shared-schema databases cannot be backed up" },
      { id: "c", text: "Point-in-time recovery is unavailable in shared schemas" },
      { id: "d", text: "Row-level security prevents restores" },
    ],
    answer: "a",
    explanation:
      "Restoring the database would roll back every tenant. You have to restore to a side copy and selectively extract one tenant's rows, respecting every foreign key. This is a real operational cost of the cheapest model, and a large part of why big customers end up on dedicated databases.",
    tags: ["restore", "operations"],
  },
  {
    id: "de-tenant-003",
    type: "mcq",
    track: "data-enterprise",
    topic: "multi-tenancy",
    difficulty: 5,
    context:
      "A single-tenant product must become multi-tenant. The team plans to add tenant_id to the main tables.",
    prompt: "What is most likely to be underestimated?",
    options: [
      {
        id: "a",
        text: "Every query, cache key, background job, and export must also become tenant-aware, and each is a potential leak until it is",
      },
      { id: "b", text: "The storage cost of an extra column" },
      { id: "c", text: "The time to run the schema migration" },
      { id: "d", text: "Choosing between an integer and a UUID for tenant_id" },
    ],
    answer: "a",
    explanation:
      "The column is the easy part. The tenant dimension has to reach every query, every cache key, every scheduled job, every export and report, and every admin tool — and until each one is converted, it is a cross-tenant data path. This is why designing for tenancy early is worth so much.",
    tags: ["migration", "retrofit"],
  },
  {
    id: "de-tenant-004",
    type: "multi",
    track: "data-enterprise",
    topic: "multi-tenancy",
    difficulty: 4,
    prompt:
      "Which defend against one tenant degrading service for others? Select all that apply.",
    options: [
      { id: "a", text: "Per-tenant rate limits" },
      { id: "b", text: "Query cost or row limits on expensive operations" },
      { id: "c", text: "Separate resource pools for heavy tenants" },
      { id: "d", text: "Moving the largest tenants to dedicated databases" },
      { id: "e", text: "Increasing overall database capacity" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "The problem is a lack of isolation, so the answers are all forms of bounding or separating. Adding capacity buys time and the noisy tenant absorbs that too — it changes when the incident happens, not whether.",
    tags: ["noisy-neighbour"],
  },
];
