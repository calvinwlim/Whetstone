import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "ml-basics",
    track: "ai-engineering",
    title: "Machine Learning Basics",
    blurb: "The vocabulary and the traps, without the maths.",
    lesson: `You do not need to derive gradient descent to work usefully alongside ML. You do need the vocabulary, and you need to recognise the handful of mistakes that make a model look better than it is.

**The split.** Data is divided into training, validation, and test sets. You fit on training, tune on validation, and touch test *once*, at the end. Every time you look at the test set and change something, you leak a little information into your model and your reported number drifts away from reality.

**Overfitting and underfitting.** An overfit model has memorised the training data, including its noise — near-perfect training scores, poor performance on anything new. An underfit model is too simple to capture the real pattern and does badly on both. The gap between training and validation performance is the diagnostic.

**Metrics, and why accuracy lies.** If 99% of transactions are legitimate, a model that predicts "legitimate" every time is 99% accurate and completely useless. *Precision* asks: of the things we flagged, how many were real? *Recall* asks: of the real ones, how many did we catch? They trade off against each other, and *F1* is their harmonic mean. Which one matters is a product decision — a cancer screen wants recall, a spam filter wants precision.

**Data leakage** is the most common way a model looks brilliant in development and fails in production: some feature encodes the answer. A "customer_called_support" flag predicting churn is really recording that they already churned. Anything computed after the moment of prediction is leakage.

**Class imbalance** distorts both training and evaluation. The responses are resampling, class weighting, or picking a metric that is not fooled — and always checking the confusion matrix rather than a single number.

**Training data is the product.** Model architecture is usually the least interesting lever available to you; data quality, labelling consistency, and feature choice dominate results.`,
    resources: [
      {
        label: "Google — Machine Learning Crash Course",
        url: "https://developers.google.com/machine-learning/crash-course",
      },
      {
        label: "scikit-learn — Model evaluation",
        url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
      },
    ],
  },
  {
    id: "llm-fundamentals",
    track: "ai-engineering",
    title: "LLM Fundamentals",
    blurb: "Tokens, context, and choosing between prompting, RAG, and fine-tuning.",
    lesson: `Working with language models is mostly about managing context and cost, and knowing which lever to reach for.

**Tokens are the unit of everything.** Models read and write tokens, not words — roughly a token per three-quarters of an English word. You are billed per token, latency scales with tokens, and the *context window* caps how many can be in play at once. A long conversation does not "remember" anything; the whole history is re-sent every turn, which is why costs grow quadratically in a naive chat loop.

**Three ways to make a model do your task, in ascending cost:**

*Prompting* — instructions and examples in the context. Instant to iterate, no training, and limited by context size.

*RAG* — retrieve relevant documents at request time and put them in context. The right answer when knowledge changes often, because updating the knowledge base is an indexing job, not a training run. It grounds answers in sources you can cite.

*Fine-tuning* — adjust the model's weights on your examples. It teaches *form*, style, and task shape far better than it teaches *facts*, and facts you fine-tune in go stale and cannot be cited. Reach for it when you need consistent structure or a specialised behaviour, not to load a knowledge base.

The common mistake is fine-tuning to inject knowledge that RAG should supply.

**Temperature** controls randomness in sampling. Zero is near-deterministic, which is what you want for extraction and classification; higher values suit generation where variety helps. Deterministic is not the same as correct.

**Structured output.** When you need machine-readable results, constrain the output with a schema rather than parsing prose and hoping. It removes a whole class of brittle string handling.`,
    resources: [
      {
        label: "Anthropic — Prompt engineering overview",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
      },
      {
        label: "Vercel AI SDK — Structured output",
        url: "https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- ML basics ----------
  {
    id: "ai-ml-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 2,
    context:
      "A fraud model reports 99.2% accuracy. Fraud accounts for 0.8% of transactions.",
    prompt: "Why is that number meaningless on its own?",
    options: [
      {
        id: "a",
        text: "Predicting \"not fraud\" every time scores 99.2% while catching nothing",
      },
      { id: "b", text: "Accuracy cannot be computed on imbalanced data" },
      { id: "c", text: "The model is overfitting to the majority class" },
      { id: "d", text: "99.2% is too low for fraud detection" },
    ],
    answer: "a",
    explanation:
      "With severe class imbalance, accuracy just reports the size of the majority class. You need precision and recall on the minority class, and the confusion matrix behind them. This is the single most common way an ML result is oversold.",
    concepts: ["Class imbalance", "Accuracy paradox", "Confusion matrix"],
    tags: ["metrics", "imbalance"],
  },
  {
    id: "ai-ml-002",
    type: "mcq",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 3,
    context:
      "A churn model performs superbly in testing. A feature is `support_tickets_last_30d`, counted at the time of analysis rather than at the time of prediction.",
    prompt:
      "What is wrong with a feature counted at analysis time rather than prediction time?",
    options: [
      {
        id: "a",
        text: "Data leakage — the feature encodes information from after the prediction point",
      },
      { id: "b", text: "Overfitting to the training set" },
      { id: "c", text: "Class imbalance in the churn label" },
      { id: "d", text: "The feature is simply uninformative" },
    ],
    answer: "a",
    explanation:
      "Customers about to churn raise tickets, so the feature partly encodes the outcome. In production the model would not have that information at prediction time, so performance collapses. The test is always: would this value have been available, with this value, at the moment we need to predict?",
    concepts: ["Data leakage", "Target leakage", "Feature engineering"],
    tags: ["leakage"],
  },
  {
    id: "ai-ml-003",
    type: "matching",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 3,
    prompt: "Match each evaluation metric to the question it answers.",
    pairs: [
      { left: "Precision", right: "Of what we flagged, how much was real?" },
      { left: "Recall", right: "Of what was real, how much did we catch?" },
      { left: "F1", right: "The harmonic mean balancing the two" },
      { left: "Accuracy", right: "What fraction of all predictions were right?" },
    ],
    explanation:
      "Which one you optimise is a product decision, not a technical one. Screening for a serious disease wants recall — a missed case is far worse than a false alarm. A spam filter wants precision, because deleting real mail is worse than letting spam through.",
    concepts: ["Precision", "Recall", "F1 score"],
    tags: ["metrics"],
  },
  {
    id: "ai-ml-004",
    type: "mcq",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 3,
    context:
      "A model scores 0.98 on training data and 0.61 on data it has not seen.",
    prompt: "What does the gap indicate?",
    options: [
      {
        id: "a",
        text: "Overfitting — the model memorised the training data including its noise",
      },
      { id: "b", text: "Underfitting — the model is too simple" },
      { id: "c", text: "Data leakage in the validation set" },
      { id: "d", text: "The validation set is too small to be meaningful" },
    ],
    answer: "a",
    explanation:
      "A large train-to-validation gap is the signature of overfitting. Underfitting looks different — poor scores on both. The usual responses are more or better data, regularisation, a simpler model, or early stopping.",
    concepts: ["Overfitting", "Underfitting", "Regularisation"],
    tags: ["overfitting"],
  },
  {
    id: "ai-ml-005",
    type: "mcq",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 4,
    prompt: "Why should the test set be evaluated only once, at the very end?",
    options: [
      {
        id: "a",
        text: "Repeatedly tuning against it leaks its information into your choices, so the score stops estimating real performance",
      },
      { id: "b", text: "Test sets degrade after repeated reads" },
      { id: "c", text: "It is a convention with no practical effect" },
      { id: "d", text: "Multiple evaluations make the metric harder to compute" },
    ],
    answer: "a",
    explanation:
      "Every decision made after looking at the test set is a small fit to that set. Do it enough times and your reported number describes how well you tuned to those specific rows rather than how the model will behave on new data. That is what the validation set is for.",
    concepts: ["Test set", "Validation set", "Data leakage"],
    tags: ["evaluation", "splits"],
  },
  {
    id: "ai-ml-006",
    type: "short",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 2,
    context:
      "A model performs well on data it was trained on but poorly on new data, because it learned noise rather than the underlying pattern.",
    prompt: "What is this called? (One word.)",
    answers: ["overfitting", "overfit", "over-fitting", "over fitting"],
    typoTolerance: true,
    explanation:
      "Overfitting. Its opposite is underfitting, where the model is too simple to capture the pattern and does poorly everywhere. The gap between training and validation scores is how you tell them apart.",
    concepts: ["Overfitting", "Generalisation"],
    tags: ["overfitting", "fundamentals"],
  },
  {
    id: "ai-ml-007",
    type: "multi",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 4,
    prompt:
      "Which are reasonable responses to severe class imbalance? Select all that apply.",
    options: [
      { id: "a", text: "Resample — oversample the minority or undersample the majority" },
      { id: "b", text: "Apply class weights so minority errors cost more" },
      { id: "c", text: "Evaluate with precision, recall, and the confusion matrix rather than accuracy" },
      { id: "d", text: "Collect more data indiscriminately" },
      { id: "e", text: "Drop the minority class to balance the dataset" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Resampling and class weighting address training; changing the metric addresses evaluation, and you need both. More data of the same distribution keeps the same imbalance, and dropping the minority class deletes the only thing you were trying to detect.",
    concepts: ["Class imbalance", "Resampling", "Class weighting"],
    tags: ["imbalance"],
  },

  // ---------- LLM fundamentals ----------
  {
    id: "ai-llm-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 3,
    context:
      "Your product needs answers grounded in a knowledge base that changes several times a day, with citations.",
    prompt: "Prompting, RAG, or fine-tuning?",
    options: [
      {
        id: "a",
        text: "RAG — updating an index is cheap, and retrieved documents give you citations",
      },
      { id: "b", text: "Fine-tuning — bake the knowledge into the weights" },
      { id: "c", text: "Prompting — put the whole knowledge base in the system prompt" },
      { id: "d", text: "Fine-tune daily on the changed documents" },
    ],
    answer: "a",
    explanation:
      "Changing knowledge plus a citation requirement points squarely at retrieval. Fine-tuned facts go stale immediately, cannot be cited, and require a training run per update. Stuffing everything into the prompt does not scale past the context window and pays for the whole base on every request.",
    concepts: ["Retrieval-augmented generation", "Fine-tuning", "Grounding"],
    tags: ["rag", "fine-tuning"],
  },
  {
    id: "ai-llm-002",
    type: "mcq",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 4,
    prompt: "What is fine-tuning genuinely good at, compared to RAG?",
    options: [
      {
        id: "a",
        text: "Teaching consistent form, style, and task shape rather than supplying facts",
      },
      { id: "b", text: "Keeping the model current with changing information" },
      { id: "c", text: "Providing citations for its answers" },
      { id: "d", text: "Reducing the size of the context window needed at inference" },
    ],
    answer: "a",
    explanation:
      "Fine-tuning shifts behaviour: output format, tone, domain conventions, a narrow task done consistently. It is a poor knowledge store — facts baked into weights cannot be updated, audited, or cited. The classic mistake is fine-tuning to inject a knowledge base that retrieval should serve.",
    concepts: ["Fine-tuning", "Retrieval-augmented generation"],
    tags: ["fine-tuning"],
  },
  {
    id: "ai-llm-003",
    type: "mcq",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 4,
    context:
      "A naive chat implementation re-sends the entire conversation history on every turn.",
    prompt: "What happens to cost as the conversation grows?",
    options: [
      {
        id: "a",
        text: "It grows quadratically — each turn re-pays for all previous tokens",
      },
      { id: "b", text: "It stays constant, since only the new message is billed" },
      { id: "c", text: "It grows linearly with the number of turns" },
      { id: "d", text: "It falls, because caching makes repeated tokens free" },
    ],
    answer: "a",
    explanation:
      "Turn N sends roughly N turns of history, so total tokens across a conversation grow with the square of its length. The mitigations are summarising older turns, truncating with a sliding window, or prompt caching where the provider supports it.",
    concepts: ["Context window", "Token", "Prompt caching"],
    tags: ["context", "cost"],
  },
  {
    id: "ai-llm-004",
    type: "mcq",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 3,
    context:
      "You need the model to return data your code will parse and act on.",
    prompt: "What is the robust approach?",
    options: [
      {
        id: "a",
        text: "Constrain generation to a schema, so the output is valid by construction",
      },
      { id: "b", text: "Ask for JSON in the prompt and parse defensively" },
      { id: "c", text: "Request prose and extract fields with regular expressions" },
      { id: "d", text: "Set temperature to zero so the format never varies" },
    ],
    answer: "a",
    explanation:
      "Schema-constrained output removes the failure mode rather than handling it. Asking nicely for JSON works most of the time, and most of the time is a bad guarantee for a parser. Temperature zero makes output stable, not structurally valid.",
    concepts: ["Structured output", "JSON Schema", "Constrained decoding"],
    tags: ["structured-output"],
  },
  {
    id: "ai-llm-005",
    type: "mcq",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 3,
    prompt: "What does temperature control, and what does setting it to zero not give you?",
    options: [
      {
        id: "a",
        text: "Randomness in sampling — zero makes output near-deterministic, not correct",
      },
      { id: "b", text: "How much context the model can use — zero disables retrieval" },
      { id: "c", text: "How long the response will be" },
      { id: "d", text: "How confident the model is in its answer" },
    ],
    answer: "a",
    explanation:
      "Low temperature makes the model consistently pick its highest-probability continuation, which is what you want for extraction and classification. It reproduces the same answer, including the same wrong answer. Determinism is a debugging convenience, not a correctness guarantee.",
    concepts: ["Temperature", "Sampling", "Determinism"],
    tags: ["temperature", "sampling"],
  },
  {
    id: "ai-llm-006",
    type: "short",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 2,
    context:
      "Models process text in units that are roughly three-quarters of an English word. Pricing, latency, and the context limit are all measured in them.",
    prompt: "What is this unit called?",
    answers: ["token", "tokens", "a token"],
    typoTolerance: true,
    explanation:
      "Tokens. Everything that matters operationally is denominated in them, which is why prompt size is an engineering concern rather than a stylistic one.",
    concepts: ["Token", "Tokenisation", "Context window"],
    tags: ["tokens", "fundamentals"],
  },
  {
    id: "ai-llm-007",
    type: "ordering",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 4,
    prompt:
      "Order these approaches from cheapest to most expensive to adopt and maintain.",
    items: [
      "Improve the prompt",
      "Add few-shot examples to the context",
      "Add retrieval over your own documents",
      "Fine-tune a model on task examples",
      "Train a model from scratch",
    ],
    explanation:
      "Work down this list, not up. Most problems that get escalated to fine-tuning are solved by a clearer prompt or better retrieval, and each step down adds infrastructure, a data pipeline, and a thing that goes stale.",
    concepts: ["Prompt engineering", "Few-shot learning", "Retrieval-augmented generation", "Fine-tuning"],
    tags: ["cost", "approach"],
  },
  {
    id: "ai-ml-008",
    type: "ordering",
    track: "ai-engineering",
    topic: "ml-basics",
    difficulty: 3,
    prompt:
      "Put the steps of preparing and training a supervised model in order, so nothing leaks.",
    items: [
      "Split the data into training, validation, and test sets before inspecting it",
      "Fit any scaler or encoder on the training split alone",
      "Apply that fitted transformation to the validation and test splits",
      "Train and tune against the validation split",
      "Evaluate once on the test split, and report that number",
    ],
    explanation:
      "Every step is arranged to keep the test data out of every decision. Fitting a scaler across the whole dataset is the leak that catches people most often: it is one line, and it quietly passes information about the test distribution into training, so the model looks better offline than it will ever be in production.",
    concepts: ["Data leakage", "Train-validation-test split", "Feature scaling", "Generalisation"],
    tags: ["leakage", "workflow"],
  },
  {
    id: "ai-llm-008",
    type: "matching",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 3,
    prompt: "Match each generation parameter to what it controls.",
    pairs: [
      {
        left: "Temperature",
        right: "How much the probability distribution is flattened before sampling",
      },
      {
        left: "Top-p",
        right: "How much of the probability mass the sample is drawn from",
      },
      {
        left: "Max tokens",
        right: "How long the output may get before it is cut off",
      },
      { left: "Stop sequences", right: "Strings that end generation when they are produced" },
      {
        left: "Seed",
        right: "Which pseudo-random draw is repeated, where the provider supports it",
      },
    ],
    explanation:
      "Temperature and top-p both narrow randomness, by different means, which is why turning both down hard is how you end up with repetitive output. None of them makes generation deterministic on its own — batching, hardware, and floating point ordering still vary, so temperature zero reduces variance rather than removing it.",
    concepts: ["Temperature", "Nucleus sampling", "Stop sequence", "Determinism"],
    tags: ["sampling", "parameters"],
  },
  {
    id: "ai-llm-009",
    type: "multi",
    track: "ai-engineering",
    topic: "llm-fundamentals",
    difficulty: 3,
    prompt:
      "Which changes reduce the cost of an LLM feature without changing the model? Select all that apply.",
    options: [
      { id: "a", text: "Putting the stable part of the prompt first, so it can be cached across calls" },
      { id: "b", text: "Trimming or summarising conversation history rather than resending all of it" },
      { id: "c", text: "Capping the output length for tasks whose answers are naturally short" },
      { id: "d", text: "Lowering the temperature" },
      { id: "e", text: "Streaming the response to the client" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Cost is tokens in plus tokens out, so only changes to token counts or their price move it. Temperature changes which token gets chosen, never how many. Streaming changes when the user sees output and bills identically — a real improvement, aimed at a different problem entirely.",
    concepts: ["Prompt caching", "Context window management", "Token cost", "Perceived latency"],
    tags: ["cost", "tokens"],
  },
];
