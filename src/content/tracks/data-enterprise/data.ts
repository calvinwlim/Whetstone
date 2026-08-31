import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "schema-design",
    track: "data-enterprise",
    title: "Schema Design",
    blurb: "Normal forms, keys, and constraints — the part that is hardest to change later.",
    lesson: `Schema is the most expensive thing in an application to get wrong, because every piece of code and every row already written depends on it.

**Normalisation, practically.** *First normal form* means atomic values — no comma-separated lists in a column, no repeating groups. *Second* means no non-key column depends on only part of a composite key. *Third* means no non-key column depends on another non-key column: storing \`customer_id\`, \`customer_name\`, and \`customer_city\` on an order puts the customer's details in every order they ever place, so a change of city means updating a million rows or, more likely, updating some of them.

The working rule: **normalise to third normal form, then denormalise deliberately and knowingly.** Denormalisation is a legitimate performance decision and it is also a consistency obligation you have chosen to take on.

**Let the database enforce what must be true.** A foreign key, a unique constraint, a check constraint, and NOT NULL are enforced for every writer, including the migration script someone runs by hand at 11pm and the bug you have not written yet. Application-level validation covers only the paths you remembered. Constraints are also documentation that cannot go stale.

**Keys.** A *natural* key is meaningful data — an email, an ISBN. A *surrogate* key is a generated identifier with no meaning. Prefer surrogates as primary keys, because natural keys change: people change email addresses, countries reissue codes, and a primary key that changes cascades everywhere. Keep the natural key as a unique constraint, which is what you actually wanted.

**Nullable columns are a design decision.** NULL means "unknown", and a column that is nullable because it was easier at the time forces every reader to handle a case that never legitimately occurs.

**Model the relationship, not the screen.** Schemas shaped around the first UI that needed them age badly. Ask what is true about the domain: does an order have one address or many, can a user belong to several organisations, is this relationship exclusive.`,
    resources: [
      {
        label: "PostgreSQL — Constraints",
        url: "https://www.postgresql.org/docs/current/ddl-constraints.html",
      },
    ],
  },
  {
    id: "migrations",
    track: "data-enterprise",
    title: "Schema Migrations",
    blurb: "Changing a live schema without an outage.",
    lesson: `A migration is a deploy where the data has to survive. The rule that makes it safe: **never require a schema change and a code change to land at the same instant**, because they cannot.

**Expand and contract** (also called parallel change) is the pattern. Suppose you are renaming a column:

1. **Expand** — add the new column, nullable, changing nothing else. Old code is unaffected.
2. **Dual-write** — deploy code that writes both columns and still reads the old one.
3. **Backfill** — copy existing rows in batches, throttled so you do not saturate the database.
4. **Switch reads** — deploy code that reads the new column. Now verify.
5. **Contract** — stop writing the old column, then drop it in a later deploy.

Every step is independently deployable and independently revertible, which is the entire point. A single migration that renames the column breaks every running instance of the old code the moment it lands.

**Know which operations lock.** Adding a nullable column is usually cheap. Adding a NOT NULL column with a default rewrote the whole table on older Postgres versions and is cheap on newer ones — the version matters. Creating an index locks writes unless you build it concurrently. Changing a column type generally rewrites the table. On a big table, any of these is an outage in the shape of a migration.

**Backfills are jobs, not statements.** A single UPDATE across ten million rows holds locks, bloats the write-ahead log, and blocks replication. Batch it, commit between batches, and make it resumable.

**Every migration needs a reverse.** Not always a literal down-migration — dropping a column cannot be undone — but a rehearsed answer to "we deployed this and it is wrong". Usually that means the destructive step is last and separate.`,
    resources: [
      {
        label: "Martin Fowler — Parallel change",
        url: "https://martinfowler.com/bliki/ParallelChange.html",
      },
      {
        label: "PostgreSQL — ALTER TABLE",
        url: "https://www.postgresql.org/docs/current/sql-altertable.html",
      },
    ],
  },
  {
    id: "db-security",
    track: "data-enterprise",
    title: "Database Security",
    blurb: "Encryption, least privilege, and limiting what one compromise reaches.",
    lesson: `Database security is mostly about assuming something upstream will eventually be compromised, and limiting what that reaches.

**Encryption, and what each kind actually protects.** *In transit* (TLS) protects against network interception. *At rest* protects against someone obtaining the disk or a backup file — it does nothing against an attacker with valid database credentials, because the database decrypts for them exactly as it does for you. *Application-level* or *column-level* encryption is the one that limits a compromised database: the ciphertext is useless without a key the database does not hold. Reserve it for genuinely sensitive fields, because you cannot index or search encrypted columns normally.

**Least privilege is the highest-value control.** Your application should not connect as a superuser. A read-only user for analytics, a migration user that is the only one able to alter schema, and an application user that can read and write rows but not drop tables — that structure means a SQL injection in a reporting endpoint cannot destroy anything.

**Row-level security** pushes authorisation into the database, so a policy decides which rows a session may see. It is particularly valuable in multi-tenant systems, because tenant isolation stops depending on every query remembering its \`WHERE tenant_id\` clause. Forgetting that clause once is a cross-tenant data leak.

**Audit logging** answers who read or changed what. It is a detection and compliance control rather than a preventive one, and it is only useful if the logs go somewhere the database user cannot edit.

**Backups are part of your attack surface.** They contain everything the database does, are frequently stored with weaker controls, and are the copy that gets left on someone's laptop. Encrypt them, restrict access, and — the part everyone skips — **test the restore**, because an untested backup is a hope rather than a control.`,
    resources: [
      {
        label: "PostgreSQL — Row security policies",
        url: "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      },
      {
        label: "OWASP — Database security cheat sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html",
      },
    ],
  },
  {
    id: "data-privacy",
    track: "data-enterprise",
    depth: true,
    title: "Data Privacy & Retention",
    blurb: "Handling personal data as an engineering constraint, not a legal footnote.",
    lesson: `Privacy regulation turns into concrete engineering requirements, and the ones that bite are architectural rather than procedural.

**Data minimisation.** The cheapest way to protect data is not to hold it. Every personal field you collect is something to secure, audit, retain correctly, and delete on request. "We might want it later" is how organisations accumulate liability.

**Know where personal data lives.** You cannot honour a deletion request against a system you have not inventoried, and personal data spreads: the primary table, the analytics warehouse, search indexes, caches, logs, backups, and the third parties you forward it to. Most failures to delete are failures to know.

**Pseudonymisation is not anonymisation.** Replacing a name with an identifier is *pseudonymisation* — reversible with the mapping, and still personal data under most regimes. *Anonymisation* means the individual cannot be re-identified by any reasonably likely means, which is genuinely hard: sparse behavioural data re-identifies people surprisingly easily even without direct identifiers.

**The right to erasure collides with your architecture,** and this is the interesting engineering problem. Soft deletes preserve the row you were asked to remove. Append-only event logs and event sourcing are built never to forget. Backups contain the data by design. The usual resolutions are *crypto-shredding* — encrypt each subject's data with a per-subject key and destroy the key — or tombstoning plus a documented backup expiry window.

**Retention is a schedule you implement, not a policy you write.** Keeping data forever because deleting it was never built is the default outcome, and the one that gets found in an audit. Automated expiry is the only version that actually happens.

**Logs are a leak vector.** Request bodies, error payloads, and analytics events routinely capture personal data into a system with wide read access and long retention. Redact at the point of logging.`,
    resources: [
      {
        label: "ICO — Guide to data protection",
        url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Schema design ----------
  {
    id: "de-schema-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "schema-design",
    difficulty: 3,
    context:
      "An orders table stores customer_id, customer_name, and customer_city on every row.",
    prompt: "Which normal form does this violate, and what is the consequence?",
    options: [
      {
        id: "a",
        text: "Third — non-key columns depend on customer_id, so a customer's details are duplicated across every order",
      },
      { id: "b", text: "First — the values are not atomic" },
      { id: "c", text: "Second — there is a partial dependency on a composite key" },
      { id: "d", text: "None — this is correct denormalisation for read performance" },
    ],
    answer: "a",
    explanation:
      "Third normal form forbids a non-key column depending on another non-key column. Here name and city depend on customer_id, so changing a customer's city means updating every order they have ever placed — and inevitably updating only some of them. It can be a deliberate denormalisation, but then the sync obligation is yours.",
    concepts: ["Third normal form", "Transitive dependency", "Denormalisation"],
    tags: ["normalisation", "3nf"],
  },
  {
    id: "de-schema-002",
    type: "mcq",
    track: "data-enterprise",
    topic: "schema-design",
    difficulty: 3,
    prompt: "Why prefer a surrogate primary key over a natural one like an email address?",
    options: [
      {
        id: "a",
        text: "Natural keys change, and a changing primary key cascades through every reference",
      },
      { id: "b", text: "Natural keys cannot be indexed efficiently" },
      { id: "c", text: "Surrogate keys enforce uniqueness better" },
      { id: "d", text: "Natural keys cannot be used in foreign keys" },
    ],
    answer: "a",
    explanation:
      "People change email addresses, companies rebrand, and identifiers get reissued. A primary key that changes forces an update everywhere it is referenced. Use a surrogate key for identity and keep the natural key as a unique constraint — which was the actual requirement.",
    concepts: ["Surrogate key", "Natural key", "Primary key"],
    tags: ["keys"],
  },
  {
    id: "de-schema-003",
    type: "multi",
    track: "data-enterprise",
    topic: "schema-design",
    difficulty: 4,
    prompt:
      "Why enforce rules with database constraints rather than only in application code? Select all that apply.",
    options: [
      { id: "a", text: "They apply to every writer, including scripts and manual fixes" },
      { id: "b", text: "They cannot drift out of date the way documentation does" },
      { id: "c", text: "They fail closed when application validation has a gap" },
      { id: "d", text: "They make queries faster in all cases" },
      { id: "e", text: "They remove the need for any application-level validation" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The value is that a constraint holds regardless of which code path wrote the row. They are not a performance feature — though a unique constraint does create an index — and you still want application validation to give users good errors before the database rejects the write.",
    concepts: ["Database constraint", "Foreign key", "Referential integrity"],
    tags: ["constraints"],
  },
  {
    id: "de-schema-004",
    type: "short",
    track: "data-enterprise",
    topic: "schema-design",
    difficulty: 2,
    context:
      "A column stores a comma-separated list of tag names in a single text field.",
    prompt: "Which normal form does this break? (Answer with the number, e.g. '2'.)",
    answers: ["1", "1nf", "first", "first normal form", "1st"],
    typoTolerance: true,
    explanation:
      "First normal form requires atomic values. A delimited list means you cannot index, join, or constrain individual tags, and every query does string matching. The fix is a separate row per tag, usually through a join table.",
    concepts: ["First normal form", "Atomic value", "Join table"],
    tags: ["normalisation", "1nf"],
  },

  // ---------- Migrations ----------
  {
    id: "de-mig-001",
    type: "ordering",
    track: "data-enterprise",
    topic: "migrations",
    difficulty: 4,
    prompt: "Order the steps of renaming a column with zero downtime.",
    items: [
      "Add the new column, nullable, changing nothing else",
      "Deploy code that writes both columns and reads the old one",
      "Backfill existing rows in throttled batches",
      "Deploy code that reads the new column",
      "Stop writing the old column, then drop it",
    ],
    explanation:
      "This is expand and contract. Every step is independently deployable and revertible, and at no point do running instances of old code encounter a schema they do not understand. A single rename migration breaks every instance still running the previous deploy.",
    concepts: ["Expand and contract", "Parallel change", "Backfill"],
    tags: ["expand-contract"],
  },
  {
    id: "de-mig-002",
    type: "mcq",
    track: "data-enterprise",
    topic: "migrations",
    difficulty: 4,
    context:
      "A migration runs a single UPDATE across 40 million rows to populate a new column.",
    prompt: "What goes wrong?",
    options: [
      {
        id: "a",
        text: "It holds locks, bloats the write-ahead log, and blocks replication for the duration",
      },
      { id: "b", text: "UPDATE cannot modify more than a million rows at once" },
      { id: "c", text: "The new column will contain NULLs regardless" },
      { id: "d", text: "Nothing, provided the column is indexed first" },
    ],
    answer: "a",
    explanation:
      "One enormous transaction is the problem, not the total work. Batch it, commit between batches, throttle to leave capacity for real traffic, and make it resumable so a failure halfway does not mean starting over. Backfills are jobs, not statements.",
    concepts: ["Backfill", "Write-ahead log", "Lock contention"],
    tags: ["backfill"],
  },
  {
    id: "de-mig-003",
    type: "mcq",
    track: "data-enterprise",
    topic: "migrations",
    difficulty: 4,
    context:
      "You need to add an index to a large, busy Postgres table.",
    prompt: "What should you be careful about?",
    options: [
      {
        id: "a",
        text: "A normal CREATE INDEX blocks writes — build it concurrently instead",
      },
      { id: "b", text: "Indexes cannot be added to tables containing data" },
      { id: "c", text: "The index must be created before any rows exist" },
      { id: "d", text: "Adding an index requires a full table rewrite" },
    ],
    answer: "a",
    explanation:
      "A standard index build takes a lock that blocks writes for its duration, which on a large table is an outage. Building concurrently avoids that at the cost of being slower and needing a check afterwards, since a concurrent build can fail and leave an invalid index behind.",
    concepts: ["CREATE INDEX CONCURRENTLY", "Table lock", "Online schema change"],
    tags: ["indexes", "locking"],
  },
  {
    id: "de-mig-004",
    type: "mcq",
    track: "data-enterprise",
    topic: "migrations",
    difficulty: 5,
    prompt:
      "Why is 'never require a schema change and a code change to land simultaneously' the core rule of safe migrations?",
    options: [
      {
        id: "a",
        text: "Deploys are gradual, so old and new code run against the same schema at once",
      },
      { id: "b", text: "Databases cannot apply schema changes during active connections" },
      { id: "c", text: "Migrations always run after the application has fully restarted" },
      { id: "d", text: "It is a convention with no technical basis" },
    ],
    answer: "a",
    explanation:
      "During any rolling deploy — and during any rollback — both versions of the code are live simultaneously. The schema must therefore be compatible with both, which is exactly what expand and contract guarantees by never removing anything until nothing reads it.",
    concepts: ["Rolling deployment", "Expand and contract", "Schema compatibility"],
    tags: ["rolling-deploy"],
  },

  // ---------- Database security ----------
  {
    id: "de-dbsec-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "db-security",
    difficulty: 4,
    context:
      "A database has encryption at rest enabled. An attacker obtains valid application database credentials.",
    prompt: "What does encryption at rest protect here?",
    options: [
      {
        id: "a",
        text: "Nothing — the database decrypts for any authenticated session; it protects stolen disks and backups",
      },
      { id: "b", text: "All data, since it is encrypted on disk" },
      { id: "c", text: "Only indexed columns remain protected" },
      { id: "d", text: "It prevents the attacker from connecting at all" },
    ],
    answer: "a",
    explanation:
      "Encryption at rest defends against physical media and backup files, not against credentialed access — the engine decrypts transparently for anyone who can log in. Limiting what a compromised credential reaches requires least privilege and, for the most sensitive fields, application-level encryption the database cannot undo.",
    concepts: ["Encryption at rest", "Transparent data encryption", "Application-level encryption"],
    tags: ["encryption"],
  },
  {
    id: "de-dbsec-002",
    type: "mcq",
    track: "data-enterprise",
    topic: "db-security",
    difficulty: 4,
    context:
      "A multi-tenant app filters by tenant_id in application queries. One reporting query omits the filter.",
    prompt: "Which database feature would have prevented the cross-tenant leak?",
    options: [
      {
        id: "a",
        text: "Row-level security policies enforcing tenant scoping in the database itself",
      },
      { id: "b", text: "Column-level encryption on tenant data" },
      { id: "c", text: "A foreign key from rows to the tenants table" },
      { id: "d", text: "Read-only replicas for reporting" },
    ],
    answer: "a",
    explanation:
      "Relying on every query to remember a WHERE clause means isolation fails the first time someone forgets — and someone will. Row-level security moves the rule into the database so it applies to every query including ad-hoc ones. Replicas and foreign keys do nothing about which rows are returned.",
    concepts: ["Row-level security", "Tenant isolation", "Multi-tenancy"],
    tags: ["rls", "multi-tenancy"],
  },
  {
    id: "de-dbsec-003",
    type: "multi",
    track: "data-enterprise",
    topic: "db-security",
    difficulty: 3,
    prompt:
      "Which are sound least-privilege practices for database access? Select all that apply.",
    options: [
      { id: "a", text: "The application connects as a non-superuser" },
      { id: "b", text: "A separate read-only user for analytics and reporting" },
      { id: "c", text: "A distinct migration user that alone may alter schema" },
      { id: "d", text: "One shared credential so access is easy to audit" },
      { id: "e", text: "Granting DROP to the application user for cleanup jobs" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Separating roles by what each genuinely needs means a compromise in one path cannot do everything. A single shared credential makes auditing worse, not better, because you cannot attribute anything — and an application user with DROP turns an injection bug into data loss.",
    concepts: ["Least privilege", "Database role", "Privilege separation"],
    tags: ["least-privilege"],
  },
  {
    id: "de-dbsec-004",
    type: "mcq",
    track: "data-enterprise",
    topic: "db-security",
    difficulty: 3,
    prompt: "What makes a backup strategy real rather than theoretical?",
    options: [
      {
        id: "a",
        text: "Restores are tested regularly, and backups are encrypted with restricted access",
      },
      { id: "b", text: "Backups run nightly and are retained for a year" },
      { id: "c", text: "Backups are stored in a different region" },
      { id: "d", text: "Backups are taken from a read replica to avoid load" },
    ],
    answer: "a",
    explanation:
      "An untested backup is a hope. Plenty of organisations discover at the worst moment that their backups were empty, corrupt, or missing a critical table. Backups also carry the full dataset with typically weaker controls, so encryption and access restriction matter as much as the backup itself.",
    concepts: ["Backup restore testing", "Disaster recovery", "Encryption at rest"],
    tags: ["backups"],
  },

  // ---------- Data privacy ----------
  {
    id: "de-priv-001",
    type: "mcq",
    track: "data-enterprise",
    topic: "data-privacy",
    difficulty: 4,
    context:
      "A user exercises their right to erasure. Your system uses soft deletes and an append-only event log.",
    prompt: "What is the architectural tension, and a common resolution?",
    options: [
      {
        id: "a",
        text: "Both are designed never to forget — crypto-shredding, destroying that subject's encryption key, resolves it",
      },
      { id: "b", text: "No tension — setting deleted_at satisfies erasure" },
      { id: "c", text: "Event logs are exempt from erasure requirements" },
      { id: "d", text: "Rewriting history in the event log is the standard fix" },
    ],
    answer: "a",
    explanation:
      "Soft deletes keep the row and event logs are immutable by design, so neither actually removes anything. Encrypting each subject's data under a per-subject key and destroying the key renders it unrecoverable without rewriting immutable history — which is why crypto-shredding became the common answer.",
    concepts: ["Right to erasure", "Crypto-shredding", "Soft delete"],
    tags: ["erasure", "crypto-shredding"],
  },
  {
    id: "de-priv-002",
    type: "mcq",
    track: "data-enterprise",
    topic: "data-privacy",
    difficulty: 4,
    prompt: "What is the difference between pseudonymisation and anonymisation?",
    options: [
      {
        id: "a",
        text: "Pseudonymised data can be re-linked with the mapping and remains personal data; anonymised data cannot be re-identified",
      },
      { id: "b", text: "They are two words for the same technique" },
      { id: "c", text: "Pseudonymisation encrypts, anonymisation hashes" },
      { id: "d", text: "Anonymisation is reversible, pseudonymisation is not" },
    ],
    answer: "a",
    explanation:
      "Replacing a name with an identifier reduces exposure but keeps the data personal, because the link still exists somewhere. True anonymisation means no reasonably likely means of re-identification, which is harder than it sounds — sparse behavioural data can identify individuals with very few data points.",
    concepts: ["Pseudonymisation", "Anonymisation", "Re-identification"],
    tags: ["anonymisation"],
  },
  {
    id: "de-priv-003",
    type: "multi",
    track: "data-enterprise",
    topic: "data-privacy",
    difficulty: 4,
    prompt:
      "Where does personal data typically escape a deletion process? Select all that apply.",
    options: [
      { id: "a", text: "Analytics warehouses and derived tables" },
      { id: "b", text: "Search indexes and caches" },
      { id: "c", text: "Application logs and error payloads" },
      { id: "d", text: "Backups" },
      { id: "e", text: "The primary transactional table" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "The primary table is the one everyone remembers. Personal data spreads into every derived and operational system, and logs are the most commonly overlooked because nobody thinks of them as a data store. Deleting reliably requires an inventory of everywhere it flows.",
    concepts: ["Data inventory", "Right to erasure", "Derived data"],
    tags: ["deletion", "inventory"],
  },
  {
    id: "de-priv-004",
    type: "mcq",
    track: "data-enterprise",
    topic: "data-privacy",
    difficulty: 3,
    prompt: "Why is data minimisation the most effective privacy control?",
    options: [
      {
        id: "a",
        text: "Data you never collected cannot be breached, mis-shared, retained wrongly, or need deleting",
      },
      { id: "b", text: "It reduces database storage costs" },
      { id: "c", text: "It is the only control regulators check" },
      { id: "d", text: "It removes the need for encryption" },
    ],
    answer: "a",
    explanation:
      "Every other control is ongoing effort applied to data you hold. Not holding it removes the obligation entirely. \"We might want it later\" is the reasoning behind most accumulated liability, and later rarely arrives.",
    concepts: ["Data minimisation", "Personally identifiable information"],
    tags: ["minimisation"],
  },
];
