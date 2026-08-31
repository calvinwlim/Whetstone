import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "product-metrics",
    track: "sql-analytics",
    title: "Product Metrics",
    blurb: "Defining what to measure, and noticing when a number is lying to you.",
    lesson: `Analytics interviews rarely ask you to compute something. They ask you to *define* it, and the definition is where the judgement is.

**Every metric needs a precise definition before it means anything.** "Active users" is not a metric until you say what counts as active — opened the app, or performed a meaningful action? Over what window? Does a background sync count? Two teams reporting DAU from different definitions is the most common source of arguments about numbers.

**DAU over MAU is the standard stickiness ratio** — of the people who used the product this month, what share use it on a given day. Around 20% means a typical user shows up roughly six days a month. It is only meaningful for products people *should* use daily; applying it to something inherently occasional, like a tax tool, produces a number that looks alarming and means nothing.

**Retention is the honest metric,** because acquisition can be bought and retention cannot. *N-day* retention asks whether a user returned on exactly day N; *rolling* or *unbounded* retention asks whether they returned on day N **or later**, which is far kinder and often more appropriate for products with a weekly rhythm. Quoting one while people assume the other is a common way to mislead without lying.

**Cohort analysis** groups users by when they joined and follows each group over time. It separates "the product is improving" from "we acquired a different kind of user", which an aggregate average cannot do.

**Funnels** measure conversion between steps. The useful question is rarely the overall rate — it is which step has the steepest drop and whether that drop is the same for every segment.

**Beware vanity metrics.** Totals that only ever go up — cumulative signups, page views — cannot go down and so cannot tell you that something got worse. Prefer rates, ratios, and cohorts.

**Every primary metric wants a guardrail.** Optimising engagement without watching unsubscribes, or conversion without watching refunds, is how a team ships a win that costs money.`,
    resources: [
      {
        label: "Amplitude — North star metric",
        url: "https://amplitude.com/blog/product-north-star-metric",
      },
    ],
  },
  {
    id: "statistics-basics",
    track: "sql-analytics",
    title: "Statistics Basics",
    blurb: "The handful of ideas that come up constantly, stated correctly.",
    lesson: `You do not need much statistics for a data interview. You need a small set of ideas stated precisely, because the questions are usually testing whether you can state them precisely.

**Mean versus median.** The mean is pulled by outliers; the median is not. Income, session duration, and revenue per user are all right-skewed, so the mean sits well above the typical experience. If someone quotes an average for skewed data, the median is the more honest number — and the distribution is more honest than either.

**A p-value is the probability of observing a result at least this extreme *if the null hypothesis were true*.** It is **not** the probability that the null hypothesis is true, and it is not the probability your result happened by chance. Getting this wrong is the single most common statistics error in interviews, and stating it correctly is a strong signal.

**Type I error** is a false positive: concluding there is an effect when there is not. **Type II** is a false negative: missing a real effect. **Power** is the probability of detecting an effect that genuinely exists, and it is what sample size buys you.

**A 95% confidence interval** means that if you repeated the procedure many times, about 95% of the intervals produced would contain the true value. It is a statement about the procedure, not a 95% probability that this particular interval contains it.

**Correlation is not causation,** and the specific reasons matter more than the slogan: there may be a confounder driving both, the direction may be reversed, or the sample may be selected in a way that manufactures the relationship.

**Simpson's paradox** is when a trend present in every subgroup reverses in the aggregate, usually because group sizes differ. It is the reason "always check the segments" is good advice rather than a platitude.

**Survivorship bias** is drawing conclusions from the things that made it through — studying successful startups tells you little without the failures that did the same things.`,
    resources: [
      {
        label: "Seeing Theory — Visual introduction to probability and statistics",
        url: "https://seeing-theory.brown.edu/",
      },
    ],
  },
  {
    id: "ab-testing",
    track: "sql-analytics",
    title: "A/B Testing",
    blurb: "Running an experiment that supports the conclusion you draw from it.",
    lesson: `An A/B test is a randomised experiment, and most of what goes wrong is decided before any data arrives.

**Randomisation is what makes the comparison valid.** Assigning users at random means the groups differ only by chance, so a difference in outcome can be attributed to the treatment. Assigning by anything correlated with behaviour — signup date, region, device — destroys that and the test measures the assignment rule.

**Fix the sample size in advance.** A power calculation combines your baseline rate, the minimum effect worth detecting, the significance level, and the desired power. Running until you like the answer is not an experiment.

**Peeking is the most common way to get a false positive.** Checking significance repeatedly and stopping when p first drops below 0.05 dramatically inflates the false positive rate, because with enough looks a random walk crosses the threshold eventually. Either commit to the planned duration or use a method designed for sequential testing.

**Multiple comparisons do the same thing across metrics.** Test twenty metrics at 0.05 and you expect one false positive by construction. Declare the primary metric before you start; treat the rest as exploratory.

**Statistical significance is not practical significance.** With a large enough sample, a 0.01% improvement becomes significant and is still not worth shipping. Ask what effect size would actually change the decision.

**Novelty and primacy effects** distort early results in opposite directions: existing users click a new thing because it is new, or resist it because it is different. Both fade, which is why very short tests on established products mislead.

**Interference breaks the independence assumption.** In marketplaces and social products, treating one user affects others — a treated seller takes demand from a control seller — so the control group is no longer clean.

**A sample ratio mismatch is a stop sign.** If a 50/50 split arrives 52/48, something is wrong with assignment or logging, and the results should not be trusted until you know what.`,
    resources: [
      {
        label: "Microsoft — Trustworthy online controlled experiments",
        url: "https://exp-platform.com/",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Product metrics ----------
  {
    id: "an-metric-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "product-metrics",
    difficulty: 3,
    context:
      "You are asked to report daily active users. Two teams already publish different DAU figures.",
    prompt: "What is the most likely cause?",
    options: [
      {
        id: "a",
        text: "They define 'active' differently — the definition is the metric",
      },
      { id: "b", text: "One team's query has a join bug" },
      { id: "c", text: "Different time zones in the reporting window" },
      { id: "d", text: "One is sampling and the other is not" },
    ],
    answer: "a",
    explanation:
      "Any of these can happen, and differing definitions is overwhelmingly the usual one: does opening the app count, or must the user do something? Does a background sync count? Time zone is part of that same definitional problem. A metric without an agreed definition is not a metric.",
    concepts: ["Daily active users", "Metric definition", "Stickiness"],
    tags: ["definitions", "dau"],
  },
  {
    id: "an-metric-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "product-metrics",
    difficulty: 4,
    prompt:
      "What is the difference between N-day retention and rolling retention?",
    options: [
      {
        id: "a",
        text: "N-day asks whether the user returned on exactly day N; rolling asks whether they returned on day N or any day after",
      },
      { id: "b", text: "N-day covers new users and rolling covers all users" },
      { id: "c", text: "Rolling retention is measured weekly rather than daily" },
      { id: "d", text: "They are two names for the same measure" },
    ],
    answer: "a",
    explanation:
      "Rolling retention is always the higher number, sometimes dramatically, and is often more appropriate for products used weekly rather than daily. Because they can differ so much, quoting one while the audience assumes the other is a common way to mislead without saying anything untrue.",
    concepts: ["N-day retention", "Rolling retention", "Cohort"],
    tags: ["retention"],
  },
  {
    id: "an-metric-003",
    type: "mcq",
    track: "sql-analytics",
    topic: "product-metrics",
    difficulty: 4,
    context:
      "Average session length across all users has been flat for six months, but the product has changed considerably.",
    prompt: "What analysis would reveal more?",
    options: [
      {
        id: "a",
        text: "Cohort analysis — new and existing users may be moving in opposite directions and cancelling out",
      },
      { id: "b", text: "Increasing the reporting frequency to weekly" },
      { id: "c", text: "Switching from mean to total session length" },
      { id: "d", text: "Removing outlier sessions from the average" },
    ],
    answer: "a",
    explanation:
      "A flat aggregate frequently hides two moving populations. Splitting by join cohort separates \"the product changed\" from \"the mix of users changed\", which an overall average structurally cannot show. This is Simpson's paradox territory.",
    concepts: ["Cohort analysis", "Simpson's paradox", "Segmentation"],
    tags: ["cohorts"],
  },
  {
    id: "an-metric-004",
    type: "multi",
    track: "sql-analytics",
    topic: "product-metrics",
    difficulty: 4,
    prompt:
      "Which are vanity metrics — numbers that cannot tell you something got worse? Select all that apply.",
    options: [
      { id: "a", text: "Cumulative total signups" },
      { id: "b", text: "Total page views since launch" },
      { id: "c", text: "Total registered accounts" },
      { id: "d", text: "Week-four retention by cohort" },
      { id: "e", text: "Conversion rate through the checkout funnel" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Cumulative totals only go up, so they cannot signal a problem — they look like progress during a decline. Rates, ratios, and cohort measures can move in both directions, which is exactly what makes them useful for decisions.",
    concepts: ["Vanity metric", "Actionable metric", "Cohort analysis"],
    tags: ["vanity-metrics"],
  },
  {
    id: "an-metric-005",
    type: "short",
    track: "sql-analytics",
    topic: "product-metrics",
    difficulty: 3,
    context:
      "A team optimises for engagement time. You want a second metric that would reveal if they achieved it by making the product annoying to escape.",
    prompt: "What is such a protective metric called? (One word.)",
    answers: ["guardrail", "guardrails", "guardrail metric", "counter-metric", "counter metric"],
    typoTolerance: true,
    explanation:
      "A guardrail metric — something you watch to ensure a win on the primary metric was not bought at an unacceptable cost. Unsubscribes, refunds, complaint volume, and latency are common ones. Any single metric optimised alone eventually gets gamed.",
    concepts: ["Guardrail metric", "Goodhart's law", "Counter metric"],
    tags: ["guardrails"],
  },

  // ---------- Statistics ----------
  {
    id: "an-stat-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "statistics-basics",
    difficulty: 4,
    prompt: "What does a p-value of 0.03 mean?",
    options: [
      {
        id: "a",
        text: "If the null hypothesis were true, there is a 3% chance of seeing a result at least this extreme",
      },
      { id: "b", text: "There is a 3% chance the null hypothesis is true" },
      { id: "c", text: "There is a 97% chance the effect is real" },
      { id: "d", text: "The result occurred by chance 3% of the time" },
    ],
    answer: "a",
    explanation:
      "The p-value is conditional *on the null being true* — it says nothing directly about the probability that the null is true, which would require a prior. This is the most commonly misstated idea in statistics, and stating it correctly is a strong signal in an interview.",
    concepts: ["p-value", "Null hypothesis", "Statistical significance"],
    tags: ["p-value"],
  },
  {
    id: "an-stat-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "statistics-basics",
    difficulty: 3,
    context:
      "Revenue per user is strongly right-skewed: most users spend little and a few spend enormously.",
    prompt: "Which summary best represents a typical user?",
    options: [
      {
        id: "a",
        text: "The median, since the mean is pulled upward by the high spenders",
      },
      { id: "b", text: "The mean, since it uses all the data" },
      { id: "c", text: "The mode, since it is the most frequent value" },
      { id: "d", text: "The range, since it shows the full spread" },
    ],
    answer: "a",
    explanation:
      "With right skew the mean sits above what most users experience, so quoting it as typical is misleading. The median is more representative — and reporting percentiles is better than either, because the shape of the distribution is usually the actual finding.",
    concepts: ["Median", "Right-skewed distribution", "Percentile"],
    tags: ["mean-median", "skew"],
  },
  {
    id: "an-stat-003",
    type: "matching",
    track: "sql-analytics",
    topic: "statistics-basics",
    difficulty: 4,
    prompt: "Match each concept to its definition.",
    pairs: [
      { left: "Type I error", right: "Concluding there is an effect when there is none" },
      { left: "Type II error", right: "Missing an effect that genuinely exists" },
      { left: "Statistical power", right: "The probability of detecting a real effect" },
      { left: "Simpson's paradox", right: "A trend in every subgroup reverses in the aggregate" },
    ],
    explanation:
      "Type I is the false positive you control with your significance level; Type II is the false negative you control with sample size, since power is what extra data buys. Simpson's paradox is why checking segments is a habit rather than an optional extra.",
    concepts: ["Type I error", "Type II error", "Statistical power", "Simpson's paradox"],
    tags: ["errors", "power"],
  },
  {
    id: "an-stat-004",
    type: "mcq",
    track: "sql-analytics",
    topic: "statistics-basics",
    difficulty: 4,
    context:
      "A study of successful companies finds they all had bold, risk-taking leadership, and concludes that boldness causes success.",
    prompt: "What is the flaw?",
    options: [
      {
        id: "a",
        text: "Survivorship bias — the failed companies that were equally bold were never examined",
      },
      { id: "b", text: "The sample size was too small" },
      { id: "c", text: "Boldness cannot be measured objectively" },
      { id: "d", text: "Correlation was computed incorrectly" },
    ],
    answer: "a",
    explanation:
      "Selecting on the outcome means you cannot learn what distinguishes success from failure. If bold leadership is equally common among companies that collapsed, it predicts nothing. Any conclusion drawn only from survivors needs the comparison group to mean anything.",
    concepts: ["Survivorship bias", "Selection bias"],
    tags: ["survivorship-bias"],
  },
  {
    id: "an-stat-005",
    type: "mcq",
    track: "sql-analytics",
    topic: "statistics-basics",
    difficulty: 5,
    context:
      "A treatment shows a higher recovery rate than the control in both mild and severe patient groups, yet a lower rate overall.",
    prompt: "What is happening?",
    options: [
      {
        id: "a",
        text: "Simpson's paradox — the treatment group contained far more severe cases, which have worse outcomes regardless",
      },
      { id: "b", text: "The subgroup results must have been calculated incorrectly" },
      { id: "c", text: "The sample was too small to be reliable" },
      { id: "d", text: "The overall figure is the correct one to report" },
    ],
    answer: "a",
    explanation:
      "Both figures are arithmetically correct — the aggregate is a weighted average, and unequal group sizes can flip it. Here the subgroup results are the meaningful ones, because they compare like with like. It is the standard argument for always inspecting segments before reporting an aggregate.",
    concepts: ["Simpson's paradox", "Confounding variable", "Weighted average"],
    tags: ["simpsons-paradox"],
  },
  {
    id: "an-stat-006",
    type: "short",
    track: "sql-analytics",
    topic: "statistics-basics",
    difficulty: 4,
    context:
      "Two variables move together, but a third unmeasured variable is actually driving both.",
    prompt: "What is that third variable called? (One word.)",
    answers: ["confounder", "confounding", "confound", "confounding variable", "lurking variable"],
    typoTolerance: true,
    explanation:
      "A confounder. Ice cream sales and drowning deaths correlate because both rise with temperature. It is one of the three standard reasons correlation fails to imply causation, alongside reverse causation and selection effects.",
    concepts: ["Confounding variable", "Correlation versus causation", "Reverse causation"],
    tags: ["confounding", "causation"],
  },

  // ---------- A/B testing ----------
  {
    id: "an-ab-001",
    type: "mcq",
    track: "sql-analytics",
    topic: "ab-testing",
    difficulty: 4,
    context:
      "A team checks the dashboard daily and stops the test the moment p drops below 0.05.",
    prompt: "What is wrong with this?",
    options: [
      {
        id: "a",
        text: "Peeking inflates the false positive rate far above 5% — with enough looks, a random walk crosses the threshold eventually",
      },
      { id: "b", text: "Nothing — reaching significance is the stopping criterion" },
      { id: "c", text: "The significance level should have been 0.01" },
      { id: "d", text: "Daily checks introduce a time-of-day confound" },
    ],
    answer: "a",
    explanation:
      "The 5% guarantee applies to a single test at a predetermined sample size. Testing repeatedly and stopping on the first success is optional stopping, and it can push the real false positive rate above 20%. Either commit to the planned duration or use a sequential method designed for it.",
    concepts: ["Peeking problem", "Optional stopping", "Sequential testing"],
    tags: ["peeking", "stopping"],
  },
  {
    id: "an-ab-002",
    type: "mcq",
    track: "sql-analytics",
    topic: "ab-testing",
    difficulty: 4,
    context:
      "A 50/50 split delivers 51.8% of users to treatment and 48.2% to control across a large sample.",
    prompt: "What should you do?",
    options: [
      {
        id: "a",
        text: "Treat it as a sample ratio mismatch, investigate assignment and logging, and do not trust the results yet",
      },
      { id: "b", text: "Proceed — small imbalances are expected" },
      { id: "c", text: "Reweight the groups and continue the analysis" },
      { id: "d", text: "Extend the test until the ratio evens out" },
    ],
    answer: "a",
    explanation:
      "At large samples a split that far from 50/50 is very unlikely by chance, so it signals a bug: assignment filtering differently, one arm failing to log, or a redirect dropping users. Whatever caused it probably biased the population too, so reweighting papers over the real problem.",
    concepts: ["Sample ratio mismatch", "Randomisation", "Experiment validity"],
    tags: ["srm", "validity"],
  },
  {
    id: "an-ab-003",
    type: "mcq",
    track: "sql-analytics",
    topic: "ab-testing",
    difficulty: 4,
    context:
      "A redesign shows a strong lift in week one that fades to nothing by week four.",
    prompt: "What is the most likely explanation?",
    options: [
      {
        id: "a",
        text: "Novelty effect — users engaged because it was new, not because it was better",
      },
      { id: "b", text: "The sample size was too small in week one" },
      { id: "c", text: "Seasonality across the four weeks" },
      { id: "d", text: "The treatment stopped being applied" },
    ],
    answer: "a",
    explanation:
      "Novelty inflates early results on established products; primacy does the opposite, where users resist an unfamiliar change before adapting. Both are why a two-day test on a mature product is close to worthless — you must run long enough for the behaviour to settle.",
    concepts: ["Novelty effect", "Primacy effect", "Experiment duration"],
    tags: ["novelty-effect"],
  },
  {
    id: "an-ab-004",
    type: "mcq",
    track: "sql-analytics",
    topic: "ab-testing",
    difficulty: 5,
    context:
      "A marketplace tests a feature that helps sellers get more visibility. Treatment sellers gain sales; control sellers lose them.",
    prompt: "Why is this test invalid as designed?",
    options: [
      {
        id: "a",
        text: "Interference — treating one group changed outcomes for the control, so the groups are not independent",
      },
      { id: "b", text: "The sample size was insufficient for a marketplace" },
      { id: "c", text: "Sellers should have been assigned by category rather than randomly" },
      { id: "d", text: "The metric should have been revenue rather than sales" },
    ],
    answer: "a",
    explanation:
      "Buyer demand is finite, so visibility gained by treatment sellers is taken from control sellers. The control is no longer a clean counterfactual and the measured lift overstates the true effect — possibly to zero, if it is pure redistribution. Marketplaces and social products usually need cluster or geographic randomisation.",
    concepts: ["Interference", "Network effect", "Cluster randomisation"],
    tags: ["interference", "network-effects"],
  },
  {
    id: "an-ab-005",
    type: "multi",
    track: "sql-analytics",
    topic: "ab-testing",
    difficulty: 4,
    prompt:
      "Which should be decided before an experiment starts? Select all that apply.",
    options: [
      { id: "a", text: "The primary metric" },
      { id: "b", text: "The minimum effect size worth detecting" },
      { id: "c", text: "The sample size and planned duration" },
      { id: "d", text: "The guardrail metrics being watched" },
      { id: "e", text: "Which segments showed the strongest result" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Everything that could be chosen to favour a conclusion must be fixed in advance. Segment analysis after the fact is fine as exploration and generates hypotheses — but presenting a segment discovered after seeing the data as a confirmed finding is exactly the multiple comparisons problem.",
    concepts: ["Pre-registration", "Multiple comparisons problem", "Minimum detectable effect"],
    tags: ["design", "pre-registration"],
  },
  {
    id: "an-ab-006",
    type: "mcq",
    track: "sql-analytics",
    topic: "ab-testing",
    difficulty: 4,
    context:
      "With 4 million users per arm, a 0.02% conversion improvement reaches p < 0.001.",
    prompt: "Should you ship it?",
    options: [
      {
        id: "a",
        text: "Not on this basis alone — it is statistically significant but may be practically meaningless against its costs",
      },
      { id: "b", text: "Yes — a very low p-value means a large effect" },
      { id: "c", text: "Yes — any positive significant result should ship" },
      { id: "d", text: "No — results below 0.1% are always noise" },
    ],
    answer: "a",
    explanation:
      "Significance says the effect is probably real; it says nothing about whether it is worth having. With a big enough sample, arbitrarily tiny effects become significant. The decision needs the effect size weighed against complexity, maintenance, and any guardrail cost.",
    concepts: ["Practical significance", "Statistical significance", "Effect size"],
    tags: ["practical-significance"],
  },
];
