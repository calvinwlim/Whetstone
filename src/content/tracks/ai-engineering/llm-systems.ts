import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "ai-systems",
    track: "ai-engineering",
    title: "AI & LLM Systems",
    blurb: "Retrieval, serving, and evaluation — the 2026 addition to the design loop.",
    lesson: `LLM features now show up in design interviews as their own question. The good news is that most of it is ordinary systems work with unfamiliar names.

**Frame the task before the model.** The most common failure is talking about model choice before defining what the system must do, what "good" means, and what data exists. Spend the first minutes on the task, the success metric, and the failure cost — the same scoping discipline any design question needs.

**RAG is a retrieval problem wearing an AI hat.** Retrieval-augmented generation embeds your documents, finds the ones similar to the query, and passes them to the model as context. Quality is dominated by retrieval, not generation: if the right chunk is not retrieved, no model will answer correctly.

*Chunking* is the lever people underrate. Chunks that are too small lose the context that makes them meaningful; too large and the relevant sentence is diluted among irrelevant text while you burn context window. *Hybrid search* — dense vectors plus keyword — matters because embeddings are bad at exact identifiers like SKUs and error codes. *Re-ranking* runs a slower, more accurate model over the top-k candidates to fix the ordering that fast approximate search got roughly right.

**Vector search is approximate.** Indexes like HNSW trade recall for latency, so "did we retrieve the right document" is a tunable, measurable property rather than a guarantee.

**Serving has its own shape.** Generation runs in two phases: *prefill* processes the whole prompt in parallel and is compute-bound, then *decode* emits one token at a time and is bound by memory bandwidth. The **KV cache** stores attention state for tokens already processed so each new token does not recompute the whole prompt — it is why long prompts cost memory, not just compute. *Continuous batching* raises GPU throughput by packing concurrent requests, at some cost to individual latency. Streaming tokens does not make generation faster; it makes *time to first token* the number the user feels.

**Evaluate like a system, not a demo.** Hold out a reference set and measure retrieval recall separately from answer quality, so you know which half is failing. Automated judging is useful and biased — sample and read real outputs. Guardrails on input and output, plus a path to refuse when retrieval is weak, beat hoping the model behaves.`,
    resources: [
      {
        label: "Anthropic — Contextual retrieval",
        url: "https://www.anthropic.com/news/contextual-retrieval",
      },
      {
        label: "Vercel AI SDK",
        url: "https://sdk.vercel.ai/docs",
      },
    ],
  },
];

export const questions: Question[] = [
  {
    id: "sd-ai-001",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 3,
    context:
      "A RAG-based support assistant gives confidently wrong answers. Logs show the relevant document was never among the retrieved chunks.",
    prompt: "Where should you focus?",
    options: [
      {
        id: "a",
        text: "Retrieval — chunking, embeddings, and ranking, since the model never saw the answer",
      },
      { id: "b", text: "The generation prompt, to instruct the model more firmly" },
      { id: "c", text: "A larger model with a bigger context window" },
      { id: "d", text: "Lowering temperature to reduce creativity" },
    ],
    answer: "a",
    explanation:
      "If the right chunk was not retrieved, no amount of prompting or model capability recovers it — the information simply was not there. RAG quality is dominated by retrieval, which is why you measure retrieval recall separately from answer quality: it tells you which half of the system to fix.",
    tags: ["rag", "retrieval"],
  },
  {
    id: "sd-ai-002",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 4,
    context:
      "Users search a product catalogue by exact SKU. Pure vector search returns semantically similar products but not the exact one.",
    prompt: "What fixes this?",
    options: [
      {
        id: "a",
        text: "Hybrid search — combine keyword matching with vector similarity and fuse the rankings",
      },
      { id: "b", text: "A larger embedding model" },
      { id: "c", text: "Increasing the number of retrieved chunks" },
      { id: "d", text: "Re-embedding the catalogue more frequently" },
    ],
    answer: "a",
    explanation:
      "Embeddings capture meaning, and a SKU has no meaning to capture — it is an identifier. That is the one thing keyword search does perfectly. Hybrid retrieval runs both and fuses the results, which is why production search over catalogues, code, and error codes is almost never pure vector.",
    tags: ["hybrid-search", "vector"],
  },
  {
    id: "sd-ai-003",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 4,
    prompt: "What does the KV cache do during LLM generation?",
    options: [
      {
        id: "a",
        text: "Stores attention state for tokens already processed, so each new token does not recompute the whole prompt",
      },
      { id: "b", text: "Caches complete responses so identical prompts skip generation" },
      { id: "c", text: "Stores embeddings for the retrieval index" },
      { id: "d", text: "Holds model weights in GPU memory between requests" },
    ],
    answer: "a",
    explanation:
      "Without it, generating token N would reprocess all N-1 previous tokens, making long outputs quadratic. It is also why long prompts are expensive in GPU *memory* rather than just compute, and why KV cache size often limits how many requests you can serve concurrently. Caching whole responses is a separate, useful trick.",
    tags: ["serving", "kv-cache"],
  },
  {
    id: "sd-ai-004",
    type: "matching",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 4,
    prompt: "Match each RAG component to its job.",
    pairs: [
      { left: "Chunking", right: "Splits documents into retrievable units" },
      { left: "Embedding model", right: "Turns text into vectors for similarity search" },
      { left: "Vector index", right: "Finds approximate nearest neighbours quickly" },
      { left: "Re-ranker", right: "Reorders top candidates with a slower, more accurate model" },
      { left: "Generator", right: "Writes the final answer from the retrieved context" },
    ],
    explanation:
      "The two-stage shape is deliberate: a fast approximate search casts a wide net, then an expensive re-ranker fixes the ordering over a small candidate set. Running the accurate model over the whole corpus would be correct and unaffordable.",
    tags: ["rag", "architecture"],
  },
  {
    id: "sd-ai-005",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 4,
    context:
      "A team increases chunk size substantially to give the model more context. Answer quality gets worse.",
    prompt: "What is the most likely reason?",
    options: [
      {
        id: "a",
        text: "Larger chunks dilute the relevant passage among irrelevant text, weakening both retrieval and generation",
      },
      { id: "b", text: "Embedding models reject inputs over a fixed length" },
      { id: "c", text: "Larger chunks always exceed the context window" },
      { id: "d", text: "Vector indexes cannot store long vectors" },
    ],
    answer: "a",
    explanation:
      "A chunk gets one embedding, so a long chunk's vector is an average over many topics and matches queries less sharply. It also spends context window on text that does not help. Chunk size is a genuine tuning parameter with a real optimum, not a bigger-is-better dial.",
    tags: ["chunking", "rag"],
  },
  {
    id: "sd-ai-006",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 3,
    context:
      "A chat feature feels slow even though total generation time is acceptable.",
    prompt: "Which change most improves how fast it feels, without making generation faster?",
    options: [
      {
        id: "a",
        text: "Stream tokens as they are produced, so time to first token drops",
      },
      { id: "b", text: "Increase the batch size to raise throughput" },
      { id: "c", text: "Cache the model weights in memory" },
      { id: "d", text: "Reduce the maximum output length" },
    ],
    answer: "a",
    explanation:
      "Streaming changes nothing about total time and everything about perceived latency — the user starts reading immediately instead of watching a spinner. Time to first token is the metric that tracks the felt experience; larger batches usually make individual latency slightly worse while raising aggregate throughput.",
    tags: ["streaming", "latency"],
  },
  {
    id: "sd-ai-007",
    type: "multi",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 4,
    prompt:
      "Which belong in an evaluation plan for a RAG system? Select all that apply.",
    options: [
      { id: "a", text: "Retrieval recall measured separately from answer quality" },
      { id: "b", text: "A held-out reference set with known-good answers" },
      { id: "c", text: "Sampling and reading real outputs by hand" },
      { id: "d", text: "Groundedness — whether the answer is supported by retrieved context" },
      { id: "e", text: "Model parameter count as a quality proxy" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "Separating retrieval from generation tells you which half to fix; a reference set makes changes comparable; reading real outputs catches what automated judging misses; and groundedness is the direct measure of whether the system is inventing things. Parameter count predicts nothing about your task.",
    tags: ["evaluation"],
  },
  {
    id: "sd-ai-008",
    type: "short",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 4,
    context:
      "Generation has two phases: the prompt is processed in parallel and is compute-bound, then tokens are emitted one at a time, bound by memory bandwidth.",
    prompt: "What is the first phase called?",
    answers: ["prefill", "pre-fill", "prefill phase", "the prefill"],
    typoTolerance: true,
    explanation:
      "Prefill, followed by decode. They have genuinely different bottlenecks, which is why serving stacks schedule them separately — and why a long prompt with a short answer has a completely different cost profile from a short prompt with a long answer.",
    tags: ["serving", "prefill-decode"],
  },
  {
    id: "sd-ai-009",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 5,
    context:
      "An assistant must never invent policy details. Retrieval sometimes returns nothing relevant.",
    prompt: "What is the most robust design response?",
    options: [
      {
        id: "a",
        text: "Detect weak retrieval and refuse or escalate, rather than generating from an empty context",
      },
      { id: "b", text: "Instruct the model in the prompt not to hallucinate" },
      { id: "c", text: "Lower the temperature to zero" },
      { id: "d", text: "Use the largest available model" },
    ],
    answer: "a",
    explanation:
      "If retrieval found nothing, the model has nothing to ground an answer in, and asking it nicely not to invent one is not a control. Thresholding on retrieval score and routing to a refusal or a human is an actual system behaviour you can test. Temperature zero makes output deterministic, not correct.",
    tags: ["guardrails", "hallucination"],
  },
  {
    id: "sd-ai-010",
    type: "mcq",
    track: "ai-engineering",
    topic: "ai-systems",
    difficulty: 2,
    prompt: "What does retrieval-augmented generation do?",
    options: [
      {
        id: "a",
        text: "Finds relevant documents and passes them to the model as context for the answer",
      },
      { id: "b", text: "Fine-tunes the model on your documents" },
      { id: "c", text: "Compresses documents so more fit in the context window" },
      { id: "d", text: "Trains a new embedding model per query" },
    ],
    answer: "a",
    explanation:
      "RAG grounds the model in your data at request time, without changing the model. That is its main advantage over fine-tuning: your knowledge base can change every minute, and updating it is an indexing job rather than a training run.",
    tags: ["rag", "fundamentals"],
  },
];
