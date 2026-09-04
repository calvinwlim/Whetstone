import type { Question } from "@/content/types";

/** Difficulty 5. The top band exists so sustained high accuracy has somewhere
 *  to escalate to, rather than plateauing on level-4 material. */
export const questions: Question[] = [
  {
    id: "ad-cons-001",
    type: "mcq",
    track: "system-design",
    topic: "consistency",
    difficulty: 5,
    context:
      "Two users in different regions each book the last seat on a flight at the same instant. The system uses multi-leader replication with last-write-wins conflict resolution.",
    prompt: "What is the fundamental problem?",
    options: [
      {
        id: "a",
        text: "Last-write-wins silently discards one booking; the constraint needs one writer",
      },
      { id: "b", text: "Replication lag will resolve itself once the two regions sync" },
      { id: "c", text: "The clocks need synchronising to a much finer precision" },
      { id: "d", text: "Both bookings will be rejected once the conflict is detected" },
    ],
    answer: "a",
    explanation:
      "Last-write-wins is a conflict resolution strategy that always produces a winner and therefore always loses data — here, a customer holds a confirmed booking that no longer exists. Tighter clocks do not help, because the problem is not ordering but that the invariant 'one seat, one booking' cannot be enforced by any strategy that lets two leaders accept writes independently. Inventory needs single-writer serialisation, or reservations with explicit conflict handling.",
    concepts: ["Last-write-wins", "Conflict resolution", "Multi-leader replication"],
    tags: ["conflict-resolution", "invariants"],
  },
  {
    id: "ad-shard-001",
    type: "mcq",
    track: "system-design",
    topic: "sharding",
    difficulty: 5,
    context:
      "A sharded system must move a large tenant to a different shard while continuing to serve reads and writes with no downtime.",
    prompt:
      "Which sequence safely moves a tenant between shards with no downtime?",
    options: [
      {
        id: "a",
        text: "Dual-write to both, backfill, verify parity, cut reads over, then stop the old",
      },
      { id: "b", text: "Copy the data across, then update the routing table in one step" },
      { id: "c", text: "Update the routing table first, then copy the data across behind it" },
      { id: "d", text: "Take a brief write lock on the tenant, copy, then release it" },
    ],
    answer: "a",
    explanation:
      "The dual-write and backfill pattern keeps both copies live so you can verify they agree before anything depends on the new one, and every step is individually reversible. Copying then switching loses writes that landed during the copy; switching first sends reads to data that is not there yet; and a write lock is downtime by another name, which the requirement rules out.",
    concepts: ["Dual write", "Resharding", "Zero-downtime migration"],
    tags: ["resharding", "migration"],
  },
  {
    id: "ad-ms-001",
    type: "multi",
    track: "system-design",
    topic: "microservices",
    difficulty: 5,
    context:
      "A service calls three downstream dependencies. One begins responding in 30 seconds instead of 50ms.",
    prompt:
      "Which measures prevent this from taking down the calling service? Select all that apply.",
    options: [
      { id: "a", text: "A timeout shorter than the caller's own budget" },
      { id: "b", text: "A circuit breaker that fails fast after repeated failures" },
      { id: "c", text: "A bulkhead isolating that dependency's connection pool" },
      { id: "d", text: "Retrying the slow calls more aggressively" },
      { id: "e", text: "Increasing the caller's thread pool size" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Timeouts bound the damage, circuit breakers stop paying the cost once failure is established, and bulkheads keep one sick dependency from consuming every connection the service has. Aggressive retries add load to something already struggling, and a bigger thread pool just means more threads stuck waiting — it delays the collapse rather than preventing it.",
    concepts: ["Timeout", "Circuit breaker", "Bulkhead pattern"],
    tags: ["resilience", "cascading-failure"],
  },
  {
    id: "ad-db-001",
    type: "mcq",
    track: "system-design",
    topic: "databases",
    difficulty: 5,
    context:
      "Two concurrent transactions each read that two doctors are on call, and each then marks a different doctor as off-call. Both commit. Nobody is on call.",
    prompt: "What anomaly is this, and what prevents it?",
    options: [
      {
        id: "a",
        text: "Write skew — prevented by serializable isolation, or by locking the rows read",
      },
      { id: "b", text: "A dirty read of uncommitted data — prevented by read committed" },
      { id: "c", text: "A non-repeatable read of the rota — prevented by repeatable read" },
      { id: "d", text: "A lost update — prevented by optimistic locking on a version" },
    ],
    answer: "a",
    explanation:
      "Write skew is the subtle one: both transactions read a shared premise, then write to disjoint rows, so nothing conflicts and both commit — while together they violate an invariant neither broke alone. Repeatable read does not stop it, because no row was read and then modified by the other transaction. You need serializable isolation, or you must materialise the conflict by locking the rows the decision was based on.",
    concepts: ["Write skew", "Serializable isolation", "Materialising conflicts"],
    tags: ["write-skew", "isolation"],
  },
  {
    id: "ad-trade-001",
    type: "mcq",
    track: "communication",
    topic: "tradeoffs",
    difficulty: 5,
    context:
      "Deep in a design interview you realise a decision you made twenty minutes ago was wrong, and the rest of your design was built on it.",
    prompt: "What is the strongest move?",
    options: [
      {
        id: "a",
        text: "Say what you got wrong, what it invalidates, and what you would change — then adjust",
      },
      { id: "b", text: "Continue, since changing course now will look disorganised" },
      { id: "c", text: "Quietly adjust the later parts so they no longer depend on it" },
      { id: "d", text: "Ask the interviewer whether they would like you to change it" },
    ],
    answer: "a",
    explanation:
      "Catching your own error and scoping its blast radius is a senior signal, not a failure — it is exactly what you would need to do in a real design review. Pressing on knowingly is worse than the original mistake, and quietly patching around it leaves an inconsistency the interviewer will find. Handing the decision to the interviewer avoids making the judgement call being assessed.",
    concepts: ["Self-correction", "Blast radius", "Design review"],
    tags: ["self-correction"],
  },
  {
    id: "ad-est-001",
    type: "mcq",
    track: "workplace",
    topic: "estimation",
    difficulty: 5,
    context:
      "You are asked to commit to a date for work that depends on a third-party API whose behaviour you cannot verify without building against it.",
    prompt: "What is the most professional response?",
    options: [
      {
        id: "a",
        text: "Give a conditional estimate, name the unknown, and propose a timeboxed spike to resolve it before committing",
      },
      { id: "b", text: "Give a padded date that assumes the worst case" },
      { id: "c", text: "Decline to estimate until the dependency is documented" },
      { id: "d", text: "Give the optimistic date and flag risk if it slips" },
    ],
    answer: "a",
    explanation:
      "A spike converts an unknown into a known for a bounded cost, and a conditional estimate gives the planner something to act on now. Padding hides the risk inside a number people will treat as a commitment; refusing to estimate pushes the uncertainty onto someone with less information; and an optimistic date defers the bad news to the point where it is most expensive.",
    concepts: ["Spike", "Conditional estimate", "Timebox"],
    tags: ["uncertainty", "spikes"],
  },
];
