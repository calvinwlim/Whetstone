import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "spec-driven-development",
    track: "code-craft",
    title: "Spec-Driven Development",
    blurb: "Deciding what you are building before you build it.",
    lesson: `Most rework comes from building the wrong thing correctly. A spec is the cheapest place to discover that.

**A specification says what, not how.** Inputs, outputs, behaviour at the edges, what happens on failure, and what is explicitly out of scope. If a reader can implement it two materially different ways and both satisfy the document, it is not finished.

**Acceptance criteria make "done" checkable.** *Given-When-Then* — the Gherkin format from behaviour-driven development — forces each criterion into a testable shape: given some state, when something happens, then this is observably true. Criteria written as "the feature should work well" cannot be verified and will be argued about at review.

**Non-goals are the highest-value section and the one people skip.** Writing "this does not handle offline editing" closes a discussion before it opens and stops scope expanding to fill the review meeting.

**An architecture decision record (ADR)** captures one decision: the context, the options, what was chosen, and the consequences accepted. Its value shows up months later, when someone asks why a strange choice was made — the conclusion alone ages badly, because the reader cannot tell whether the constraints still hold.

**Contract-first** applies the same idea to interfaces: agree the schema before either side implements. Consumers can build against a mock immediately, and the interface gets designed rather than emerging from whatever the handler happened to return.

**A spike is the escape hatch.** When you genuinely cannot specify something because of an unknown, timebox an experiment to answer the one question, throw the code away, and then write the spec. The failure mode is a spike that quietly becomes the implementation.

**The spec is not a contract you must not change.** It is a tool for finding disagreement early. Discovering mid-build that it was wrong is the process working.`,
    resources: [
      {
        label: "ADR — Architecture decision records",
        url: "https://adr.github.io/",
      },
      {
        label: "Cucumber — Gherkin reference",
        url: "https://cucumber.io/docs/gherkin/reference/",
      },
    ],
  },
  {
    id: "design-patterns",
    track: "code-craft",
    title: "Design Patterns",
    blurb: "The named solutions people assume you know.",
    lesson: `Patterns are named, recurring solutions. Their real value is vocabulary: "let's make that a Strategy" communicates a whole design in three words.

**Creational.** *Factory Method* defers which concrete class to instantiate. *Builder* constructs complex objects step by step, which beats a constructor with nine optional parameters. *Singleton* guarantees one instance — and is the most criticised pattern in the catalogue, because it is global mutable state that also makes testing hard, since you cannot substitute it.

**Structural.** *Adapter* wraps an interface you cannot change into one your code expects — the pattern behind almost every third-party integration. *Decorator* adds behaviour by wrapping rather than subclassing, so you can compose logging, caching, and retry independently. *Facade* puts a simple interface in front of a complicated subsystem.

**Behavioural.** *Strategy* makes an algorithm swappable at runtime, and is the standard answer to a long conditional selecting between behaviours. *Observer* lets objects subscribe to events rather than being called directly — the shape underneath every event emitter. *Template Method* fixes the skeleton of an algorithm and lets subclasses fill in steps. *Command* turns a request into an object, which is what makes undo and queuing possible.

**Two more you meet constantly outside the original catalogue.** *Repository* abstracts data access behind a collection-like interface, so business logic does not know about SQL. *Dependency Injection* passes collaborators in rather than constructing them internally, which is what makes a class testable at all.

**The failure mode is pattern-hunting.** Patterns are for recognising a problem you already have. Applying them speculatively produces indirection with no benefit — an AbstractFactoryStrategyBuilder for something that should have been a function.`,
    resources: [
      {
        label: "Refactoring Guru — Design patterns",
        url: "https://refactoring.guru/design-patterns",
      },
    ],
  },
  {
    id: "code-quality",
    track: "code-craft",
    title: "Code Quality & Refactoring",
    blurb: "SOLID, smells, and the named moves for improving code safely.",
    lesson: `Quality is not beauty. It is how cheaply the next person can change this code without breaking it.

**Coupling and cohesion are the two measures that matter most.** *Cohesion* is how related the things inside a module are; *coupling* is how much modules depend on each other. You want high cohesion and low coupling. Most other guidance is a special case of this.

**SOLID**, briefly and honestly: *Single Responsibility* — a class should have one reason to change. *Open-Closed* — extend behaviour without editing existing code. *Liskov Substitution* — a subtype must be usable anywhere its parent is, which is why a Square that breaks Rectangle's behaviour is the classic violation. *Interface Segregation* — many small interfaces beat one fat one. *Dependency Inversion* — depend on abstractions, not concretions.

**Code smells are named symptoms, not rules.** *God object* — one class that knows everything. *Primitive obsession* — passing strings and ints where a type would carry meaning, so nothing stops you swapping two arguments. *Shotgun surgery* — one conceptual change requiring edits in twelve files, a coupling problem. *Feature envy* — a method more interested in another object's data than its own. *Magic number* — an unexplained literal.

**Refactoring moves have names too,** and using them signals you are making a known, safe transformation rather than rewriting: *Extract Method*, *Rename*, *Inline*, *Introduce Parameter Object*, *Replace Conditional with Polymorphism*. The definition matters: refactoring changes structure without changing behaviour. If behaviour changes, it is not a refactor, and calling it one is how untested rewrites get merged.

**Cyclomatic complexity** counts independent paths through a function, which is roughly the number of tests needed to cover it. It is a useful smell detector and a terrible target.

**DRY has a limit.** Two pieces of code that look alike but change for different reasons should stay separate — deduplicating them couples two things that were independent, and the cure is worse than the repetition.`,
    resources: [
      {
        label: "Refactoring Guru — Code smells",
        url: "https://refactoring.guru/refactoring/smells",
      },
      {
        label: "Martin Fowler — Refactoring catalogue",
        url: "https://refactoring.com/catalog/",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------------- Spec-driven development ----------------
  {
    id: "cc-spec-001",
    type: "mcq",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 2,
    prompt: "What should a specification describe?",
    options: [
      { id: "a", text: "What the system must do, including edge and failure behaviour" },
      { id: "b", text: "How the code should be structured internally" },
      { id: "c", text: "Which libraries and frameworks to use" },
      { id: "d", text: "The order in which files will be written" },
    ],
    answer: "a",
    explanation:
      "A spec constrains behaviour and leaves implementation open, which is what lets the person building it make good local decisions. If two reasonable engineers could read it and build materially different behaviour, it is not finished.",
    concepts: ["Specification", "Acceptance criteria", "Requirements"],
    tags: ["spec", "fundamentals"],
  },
  {
    id: "cc-spec-002",
    type: "mcq",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 3,
    context:
      "An acceptance criterion reads: \"Search should be fast and return relevant results.\"",
    prompt:
      "What is wrong with the acceptance criterion 'search should be fast and relevant'?",
    options: [
      {
        id: "a",
        text: "Neither condition is checkable — rewrite as Given-When-Then with measurable outcomes",
      },
      { id: "b", text: "It is too long and should be split" },
      { id: "c", text: "It describes implementation rather than behaviour" },
      { id: "d", text: "Nothing — relevance is inherently subjective" },
    ],
    answer: "a",
    explanation:
      "\"Fast\" and \"relevant\" cannot be verified, so the criterion will be argued about at review. Given-When-Then forces a testable shape: given a catalogue of 10,000 products, when a user searches for an exact SKU, then that product is the first result within 200ms.",
    concepts: ["Given-When-Then", "Acceptance criteria", "Behaviour-driven development"],
    tags: ["spec", "criteria"],
  },
  {
    id: "cc-spec-003",
    type: "mcq",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 4,
    context:
      "Eight months on, nobody remembers why an unusual data model was chosen, and someone proposes replacing it.",
    prompt: "What document would have prevented the guesswork?",
    options: [
      {
        id: "a",
        text: "An architecture decision record capturing the context, options, and consequences",
      },
      { id: "b", text: "More detailed API documentation" },
      { id: "c", text: "A longer commit message on the original change" },
      { id: "d", text: "A diagram of the final schema" },
    ],
    answer: "a",
    explanation:
      "An ADR records why, not just what. The conclusion alone ages badly because a reader cannot tell whether the constraints still hold. With the context written down, the question becomes checkable: if those constraints are gone, replacing it may be right.",
    concepts: ["Architecture decision record", "Design rationale", "Non-goals"],
    tags: ["adr"],
  },
  {
    id: "cc-spec-004",
    type: "mcq",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 3,
    prompt: "What is a non-goals section for?",
    options: [
      {
        id: "a",
        text: "Bounding the work so review does not expand into everything adjacent",
      },
      { id: "b", text: "Listing features postponed to a later release" },
      { id: "c", text: "Recording requirements the team disagreed about" },
      { id: "d", text: "Describing what the previous system failed to do" },
    ],
    answer: "a",
    explanation:
      "Without them, a review fills with every neighbouring concern anyone can imagine. \"This does not address offline editing\" closes that thread before it opens. It is about scope, not a backlog of deferred work.",
    concepts: ["Non-goals", "Scope creep", "Specification"],
    tags: ["spec", "scope"],
  },
  {
    id: "cc-spec-005",
    type: "short",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 3,
    context:
      "You cannot specify a feature because of one technical unknown, so you timebox an experiment purely to answer it and throw the code away.",
    prompt: "What is this timeboxed experiment called? (One word.)",
    answers: ["spike", "a spike", "spikes", "spike solution"],
    typoTolerance: true,
    explanation:
      "A spike. Its output is an answer, not code you keep — the failure mode is a spike quietly becoming the implementation, which means untested exploratory code ships as though it had been designed.",
    concepts: ["Spike", "Timebox", "Throwaway prototype"],
    tags: ["spec", "spike"],
  },

  // ---------------- Design patterns ----------------
  {
    id: "cc-pat-001",
    type: "mcq",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 3,
    context:
      "A method contains a long if/else chain selecting between shipping cost calculations, and a new carrier is added every few months.",
    prompt:
      "Which pattern replaces an if/else chain that grows with every new carrier?",
    options: [
      {
        id: "a",
        text: "Strategy — make the algorithm an interchangeable object chosen at runtime",
      },
      { id: "b", text: "Singleton — ensure one calculator instance exists" },
      { id: "c", text: "Observer — notify subscribers when the cost changes" },
      { id: "d", text: "Facade — hide the calculation behind a simpler interface" },
    ],
    answer: "a",
    explanation:
      "A conditional selecting between behaviours that keeps growing is the canonical Strategy signal. Each carrier becomes its own class implementing a shared interface, so adding one stops meaning editing a method everything else depends on — which is the Open-Closed principle in practice.",
    concepts: ["Strategy pattern", "Open-Closed principle", "Polymorphism"],
    tags: ["patterns", "strategy"],
  },
  {
    id: "cc-pat-002",
    type: "matching",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 4,
    prompt: "Match each pattern to what it does.",
    pairs: [
      { left: "Adapter", right: "Wraps an interface you cannot change into the one you need" },
      { left: "Decorator", right: "Adds behaviour by wrapping, so concerns compose independently" },
      { left: "Observer", right: "Lets objects subscribe to events instead of being called directly" },
      { left: "Repository", right: "Hides data access behind a collection-like interface" },
      { left: "Builder", right: "Constructs a complex object step by step" },
    ],
    explanation:
      "Adapter is the pattern behind nearly every third-party integration, and Decorator is why logging, caching, and retry can be layered without any of them knowing about the others. Recognising them by name is most of their value.",
    concepts: ["Adapter pattern", "Decorator pattern", "Observer pattern", "Repository pattern"],
    tags: ["patterns", "catalogue"],
  },
  {
    id: "cc-pat-003",
    type: "mcq",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 4,
    prompt: "Why is Singleton the most criticised pattern in the catalogue?",
    options: [
      {
        id: "a",
        text: "It is global mutable state, and it cannot be substituted, which makes tests order-dependent",
      },
      { id: "b", text: "It uses more memory than alternatives" },
      { id: "c", text: "It cannot be implemented safely in most languages" },
      { id: "d", text: "It was removed from the Gang of Four catalogue" },
    ],
    answer: "a",
    explanation:
      "Hidden global state couples everything that touches it, and because the instance is fetched rather than injected you cannot swap it for a test double. Tests then share state and start depending on execution order. Dependency injection gives you one instance without either problem.",
    concepts: ["Singleton pattern", "Global state", "Dependency injection"],
    tags: ["patterns", "antipattern"],
  },
  {
    id: "cc-pat-004",
    type: "mcq",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 3,
    prompt: "What does dependency injection actually buy you?",
    options: [
      {
        id: "a",
        text: "Collaborators are passed in, so they can be substituted — which is what makes a class testable",
      },
      { id: "b", text: "It removes the need for interfaces" },
      { id: "c", text: "It makes object creation faster" },
      { id: "d", text: "It guarantees only one instance of each dependency" },
    ],
    answer: "a",
    explanation:
      "A class that constructs its own database client cannot be tested without a database. Taking it as a parameter means a test can pass a fake. It is also the mechanism behind the Dependency Inversion principle — depending on an abstraction you were handed rather than a concrete type you built.",
    concepts: ["Dependency injection", "Dependency inversion", "Test double"],
    tags: ["patterns", "di"],
  },
  {
    id: "cc-pat-005",
    type: "mcq",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 4,
    context:
      "A codebase has AbstractHandlerFactoryProvider classes wrapping logic that could be a function.",
    prompt: "What has gone wrong?",
    options: [
      {
        id: "a",
        text: "Patterns applied speculatively rather than to a problem that exists, adding indirection with no benefit",
      },
      { id: "b", text: "The wrong patterns were chosen for the problem" },
      { id: "c", text: "Patterns should never be used in modern codebases" },
      { id: "d", text: "The naming convention is the only issue" },
    ],
    answer: "a",
    explanation:
      "Patterns are for recognising a problem you already have — repeated conditionals, an interface you cannot change, behaviour that must compose. Reaching for them before the problem appears buys flexibility nobody needs at the cost of indirection everybody pays for.",
    concepts: ["Over-engineering", "YAGNI", "Accidental complexity"],
    tags: ["patterns", "judgement"],
  },
  {
    id: "cc-pat-006",
    type: "short",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 2,
    context:
      "You need to use a third-party library whose interface does not match what your code expects, and you cannot change either side.",
    prompt: "Which pattern wraps one interface to look like another? (One word.)",
    answers: ["adapter", "adaptor", "adapter pattern", "wrapper"],
    typoTolerance: true,
    explanation:
      "Adapter, sometimes called a wrapper. It is the most-used structural pattern in real codebases, and it doubles as an anti-corruption layer — the third party's model stops leaking into yours.",
    concepts: ["Adapter pattern", "Anti-corruption layer"],
    tags: ["patterns", "fundamentals"],
  },

  // ---------------- Code quality ----------------
  {
    id: "cc-qual-001",
    type: "mcq",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 3,
    prompt: "What is the relationship you want between coupling and cohesion?",
    options: [
      { id: "a", text: "High cohesion within a module, low coupling between modules" },
      { id: "b", text: "High coupling and high cohesion" },
      { id: "c", text: "Low cohesion and low coupling" },
      { id: "d", text: "They measure the same property from different angles" },
    ],
    answer: "a",
    explanation:
      "Cohesion is how related the contents of a module are; coupling is how much modules depend on each other. High cohesion means a module has one clear job; low coupling means changing it does not ripple. Most other design advice is a special case of these two.",
    concepts: ["Coupling", "Cohesion", "Modularity"],
    tags: ["design", "fundamentals"],
  },
  {
    id: "cc-qual-002",
    type: "matching",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 4,
    prompt: "Match each SOLID principle to what it asks of you.",
    pairs: [
      { left: "Single Responsibility", right: "A class should have one reason to change" },
      { left: "Open-Closed", right: "Extend behaviour without editing existing code" },
      { left: "Liskov Substitution", right: "A subtype must work anywhere its parent does" },
      { left: "Interface Segregation", right: "Many small interfaces beat one fat one" },
      { left: "Dependency Inversion", right: "Depend on abstractions, not concrete types" },
    ],
    explanation:
      "Liskov is the one worth understanding beyond the slogan: a Square subclassing Rectangle breaks it, because setting width on a Square also changes height, and any code written against Rectangle's contract now misbehaves.",
    concepts: [
      "SOLID principles",
      "Single Responsibility principle",
      "Liskov Substitution principle",
    ],
    tags: ["solid"],
  },
  {
    id: "cc-qual-003",
    type: "mcq",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 4,
    context:
      "Adding a new field to an order requires edits in twelve files across four modules.",
    prompt: "Which smell is this, and what does it indicate?",
    options: [
      {
        id: "a",
        text: "Shotgun surgery — one conceptual change is spread across too many places, a coupling problem",
      },
      { id: "b", text: "God object — one class knows too much" },
      { id: "c", text: "Feature envy — a method uses another object's data more than its own" },
      { id: "d", text: "Primitive obsession — types are too weak" },
    ],
    answer: "a",
    explanation:
      "Shotgun surgery means knowledge about one concept is scattered, so every change to it touches everywhere. It is the mirror image of a God object, where everything is in one place. Both are coupling failures, in opposite directions.",
    concepts: ["Shotgun surgery", "Code smell", "Coupling"],
    tags: ["smells"],
  },
  {
    id: "cc-qual-004",
    type: "mcq",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 3,
    prompt: "What is the precise definition of refactoring?",
    options: [
      {
        id: "a",
        text: "Changing internal structure without changing observable behaviour",
      },
      { id: "b", text: "Rewriting code to be faster" },
      { id: "c", text: "Cleaning up code while fixing bugs in it" },
      { id: "d", text: "Any improvement made to existing code" },
    ],
    answer: "a",
    explanation:
      "Behaviour staying fixed is what makes refactoring safe and what lets tests verify it. If behaviour changes it is a rewrite, and calling it a refactor is how untested changes get waved through review. Fix bugs and refactor in separate commits.",
    concepts: ["Refactoring", "Extract Method", "Behaviour preservation"],
    tags: ["refactoring", "definitions"],
  },
  {
    id: "cc-qual-005",
    type: "mcq",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 4,
    context:
      "Two functions in different modules look nearly identical. A developer extracts a shared helper.",
    prompt: "When is that the wrong move?",
    options: [
      {
        id: "a",
        text: "When the two change for different reasons — deduplicating couples things that were independent",
      },
      { id: "b", text: "When the functions are in different files" },
      { id: "c", text: "When the shared helper would need a parameter" },
      { id: "d", text: "Never — duplication should always be removed" },
    ],
    answer: "a",
    explanation:
      "DRY is about knowledge, not text. Code that looks alike today but answers to different requirements will diverge, and the shared helper accumulates flags to serve both. Incidental duplication is cheaper than the wrong abstraction.",
    concepts: ["DRY principle", "Incidental duplication", "Premature abstraction"],
    tags: ["dry", "judgement"],
  },
  {
    id: "cc-qual-006",
    type: "short",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 3,
    context:
      "User ids, order ids, and email addresses are all passed around as plain strings, so nothing stops two arguments being swapped.",
    prompt: "What smell is this? (Two words: primitive ____.)",
    answers: ["obsession", "primitive obsession"],
    typoTolerance: true,
    explanation:
      "Primitive obsession. Wrapping them in dedicated types makes the compiler catch a swapped argument that would otherwise be a runtime bug, and gives the domain concept somewhere to live.",
    concepts: ["Primitive obsession", "Value object", "Type safety"],
    tags: ["smells"],
  },
  {
    id: "cc-qual-007",
    type: "mcq",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 4,
    prompt:
      "Cyclomatic complexity counts independent paths through a function. Why is it a poor target?",
    options: [
      {
        id: "a",
        text: "It is easily gamed by splitting functions arbitrarily, which can hurt readability",
      },
      { id: "b", text: "It cannot be measured reliably" },
      { id: "c", text: "It only applies to object-oriented code" },
      { id: "d", text: "It correlates with nothing useful" },
    ],
    answer: "a",
    explanation:
      "Hitting a threshold by chopping a coherent function into fragments that are only called once makes the code harder to follow while the metric improves. It is a good smell detector — a function scoring 40 is worth looking at — and a bad goal.",
    concepts: ["Cyclomatic complexity", "Goodhart's law", "Code metrics"],
    tags: ["metrics"],
  },
  {
    id: "cc-spec-006",
    type: "ordering",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 2,
    prompt:
      "Put the steps of turning a vague request into a workable specification in order.",
    items: [
      "Restate the problem in the requester's own words and confirm you have it right",
      "Name who the change is for and what they will be able to do afterwards",
      "Write the acceptance criteria as concrete examples with expected outcomes",
      "List the cases you are deliberately not handling",
      "Take it back to the requester and check the examples match what they meant",
    ],
    explanation:
      "The examples are the load-bearing part, because prose hides disagreement and an example cannot: two people can both agree that 'search should handle typos' and disagree about every single input. The final step exists because a specification's characteristic failure is being internally consistent and about the wrong problem.",
    concepts: ["Acceptance criteria", "Specification by example", "Non-goals", "Given-When-Then"],
    tags: ["method", "examples"],
  },
  {
    id: "cc-spec-007",
    type: "multi",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 3,
    prompt:
      "Which belong in a specification rather than in an implementation plan? Select all that apply.",
    options: [
      { id: "a", text: "The observable behaviour a user should get" },
      { id: "b", text: "The boundary cases, including what happens on invalid input" },
      { id: "c", text: "What is explicitly out of scope" },
      { id: "d", text: "Which database tables will be added" },
      { id: "e", text: "Which library will parse the input" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "A specification describes the outside of the system, which is what lets it stay true when the inside is rewritten — and that is the whole reason it is worth keeping. Naming tables and libraries freezes decisions before you have the information to make them well, and turns every later change into a specification revision.",
    concepts: ["Specification", "Black-box behaviour", "Implementation detail", "Non-goals"],
    tags: ["scope", "what-versus-how"],
  },
  {
    id: "cc-spec-008",
    type: "matching",
    track: "code-craft",
    topic: "spec-driven-development",
    difficulty: 3,
    prompt: "Match each specification artefact to the question it settles.",
    pairs: [
      {
        left: "Acceptance criteria",
        right: "How will we know this is finished and correct?",
      },
      {
        left: "Non-goals",
        right: "What are we deliberately not doing in this piece of work?",
      },
      {
        left: "Architecture decision record",
        right: "Why did we choose this, and what did we reject?",
      },
      { left: "Spike", right: "What do we not yet know well enough to plan?" },
      {
        left: "Glossary of domain terms",
        right: "What does each of these words mean here, precisely?",
      },
    ],
    explanation:
      "Each exists because one specific argument keeps recurring. The glossary is the least written and often the most valuable: a large share of requirement disputes turn out to be two people using one word for two different things, and no amount of detail elsewhere resolves that.",
    concepts: ["Acceptance criteria", "Architecture decision record", "Non-goals", "Ubiquitous language"],
    tags: ["artefacts", "clarity"],
  },
  {
    id: "cc-pat-007",
    type: "multi",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 3,
    context:
      "A base class has grown to five levels of subclass. A behaviour that two unrelated leaves both need has nowhere to live except the base.",
    prompt:
      "Why is composition usually preferred to deep inheritance? Select all that apply.",
    options: [
      { id: "a", text: "Behaviours combine freely, rather than only along one chain of ancestors" },
      { id: "b", text: "A subclass inherits everything, including what it does not want and cannot remove" },
      { id: "c", text: "The relationship is chosen at runtime rather than fixed by the class hierarchy" },
      { id: "d", text: "Composition removes the need for interfaces" },
      { id: "e", text: "Inheritance always performs worse at runtime" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Inheritance forces every axis of variation through one hierarchy, so the moment two axes are independent, the tree must duplicate or the base must absorb both. Composition gives each axis its own object. The tell is a subclass overriding a method to do nothing — it inherited something unwanted, which is a Liskov violation waiting to be found.",
    concepts: ["Composition over inheritance", "Liskov Substitution principle", "Fragile base class", "Strategy pattern"],
    tags: ["inheritance", "composition"],
  },
  {
    id: "cc-pat-008",
    type: "short",
    track: "code-craft",
    topic: "design-patterns",
    difficulty: 3,
    context:
      "Callers are littered with checks for absence. So instead of returning nothing, the source returns an object with the same interface that harmlessly does nothing — an empty collection, a logger that discards, a discount of zero.",
    prompt: "What is this pattern called? (Two words.)",
    answers: ["null object", "null object pattern", "nullobject", "the null object pattern"],
    typoTolerance: true,
    explanation:
      "The Null Object pattern. It deletes a branch from every caller by making absence a valid value of the same type, which is why returning an empty list rather than null is the version most people already use without naming it. It is wrong wherever absence is genuinely exceptional and doing nothing quietly would hide a bug.",
    concepts: ["Null object pattern", "Special case pattern", "Cyclomatic complexity", "Defensive programming"],
    tags: ["absence", "branching"],
  },
  {
    id: "cc-qual-008",
    type: "multi",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 3,
    prompt: "Which comments earn their place in a codebase? Select all that apply.",
    options: [
      { id: "a", text: "Why a non-obvious approach was chosen over the obvious one" },
      { id: "b", text: "A link to the ticket or standard behind an odd-looking requirement" },
      {
        id: "c",
        text: "A constraint the code cannot express, such as a caller that must already hold a lock",
      },
      { id: "d", text: "A restatement of what the next line does" },
      { id: "e", text: "A record of who changed the line and when" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Every comment that survives says something the code cannot. A restatement is worse than nothing: it can go stale while the code stays correct, at which point it actively misleads. Version control records authorship better than a comment ever will. If you find yourself explaining what, rename something instead.",
    concepts: ["Code comment", "Self-documenting code", "Comment rot", "Naming"],
    tags: ["comments", "documentation"],
  },
  {
    id: "cc-qual-009",
    type: "ordering",
    track: "code-craft",
    topic: "code-quality",
    difficulty: 3,
    prompt:
      "Put the steps of safely changing code you do not fully understand in order.",
    items: [
      "Write tests that pin the current behaviour, including the parts that look wrong",
      "Refactor without changing behaviour, until the change you want becomes easy",
      "Make the change",
      "Run the tests, which now cover the old behaviour and the new",
      "Remove the scaffolding the refactor no longer needs",
    ],
    explanation:
      "This is Kent Beck's rule — make the change easy, then make the easy change — and the first step is what makes it safe rather than brave. Characterisation tests pin behaviour rather than assert correctness, deliberately including behaviour that looks like a bug, because something may depend on it and you are not changing it yet.",
    concepts: ["Characterisation test", "Refactoring", "Behaviour preservation", "Legacy code"],
    tags: ["legacy", "refactoring"],
  },
];
