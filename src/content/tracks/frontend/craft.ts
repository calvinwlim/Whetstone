import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "frontend-performance",
    track: "frontend",
    title: "Frontend Performance",
    blurb: "Core Web Vitals, and what actually moves them.",
    lesson: `Frontend performance has settled on three user-centred metrics, and knowing what each one measures tells you what to fix.

**Largest Contentful Paint** measures loading: when the biggest element in the viewport finishes rendering. Good is 2.5 seconds or less. It is usually dominated by the hero image or heading, so the fixes are getting that resource discovered and delivered early — preloading it, not lazy-loading it, and shortening the chain of requests before it.

**Interaction to Next Paint** measures responsiveness: the delay between a user interacting and the screen updating, across the whole visit. Good is 200 milliseconds or less. It replaced First Input Delay because FID only measured the *first* interaction and only the delay before handling began, which flattered slow applications. INP is usually hurt by long JavaScript tasks blocking the main thread — the fix is doing less work, breaking up long tasks, and deferring what is not needed for the interaction.

**Cumulative Layout Shift** measures visual stability. Good is 0.1 or less. The causes are boringly consistent: images and embeds without explicit dimensions, content injected above existing content, and web fonts that reflow text when they swap. Reserving space is nearly the whole solution.

**JavaScript is the expensive part of a page.** Bytes must be downloaded, parsed, compiled, and executed, and unlike images that work happens on the main thread where it blocks interaction. Code splitting so a route only loads what it needs, tree shaking, and simply having fewer dependencies all move the number.

**Images are usually the largest bytes.** Modern formats, correctly sized variants, explicit dimensions, and lazy-loading everything except the LCP element.

**Fonts cause both delay and shift.** \`font-display: swap\` shows text immediately in a fallback, preloading the file shortens the swap, and a closely matched fallback metric limits the reflow when it arrives.

**Measure in the field, not only on your machine.** Lab tools tell you what is possible on a fast laptop; real-user data tells you what your users experience on a mid-range phone.`,
    resources: [
      {
        label: "web.dev — Core Web Vitals",
        url: "https://web.dev/articles/vitals",
      },
      {
        label: "web.dev — Optimize INP",
        url: "https://web.dev/articles/optimize-inp",
      },
    ],
  },
  {
    id: "frontend-architecture",
    track: "frontend",
    title: "Frontend Architecture",
    blurb: "Rendering strategies, and the state distinction that simplifies everything.",
    lesson: `Two decisions shape a frontend codebase more than any others: where rendering happens, and how you think about state.

**Rendering strategies.** *Client-side rendering* ships an empty shell and builds the page in the browser — simple to host, poor for first paint and for anything that needs indexing. *Server-side rendering* builds HTML per request, so content arrives fast and personalised, at the cost of server work on every view. *Static generation* renders at build time: the fastest and cheapest thing possible, limited to content known in advance. *Incremental regeneration* serves static pages and refreshes them on a schedule or on demand, which covers most content that changes occasionally.

These are per-route decisions, not per-application ones. A marketing page wants static; a dashboard wants client-side or server-rendered; a product page wants incremental.

**The state distinction that matters most:** *server state* is a cache of data that lives somewhere else. *Client state* is genuinely owned by the UI — which tab is open, what is in this form, is the menu expanded.

Most frontend complexity comes from treating server state as client state: fetching into a global store, then hand-writing loading flags, error flags, staleness, refetching, and invalidation. That is a caching problem, and caching problems have known solutions. Using a data-fetching library for server state and keeping your store for genuine client state removes a startling amount of code.

**Colocate state as low as possible.** Lift it only when something above genuinely needs it. State that lives higher than necessary re-renders more of the tree than necessary and makes components harder to move.

**Hydration is not free.** Server-rendered HTML appears fast and is not interactive until its JavaScript has downloaded and run — a page can look ready and ignore clicks, which users experience as broken rather than slow. Shipping less JavaScript, or none for static regions, is the direct fix.`,
    resources: [
      {
        label: "Next.js — Rendering",
        url: "https://nextjs.org/docs/app/building-your-application/rendering",
      },
      {
        label: "TanStack Query — Overview",
        url: "https://tanstack.com/query/latest/docs/framework/react/overview",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Performance ----------
  {
    id: "fe-perf-001",
    type: "matching",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 3,
    prompt: "Match each Core Web Vital to what it measures.",
    pairs: [
      { left: "Largest Contentful Paint", right: "When the biggest visible element finishes rendering" },
      { left: "Interaction to Next Paint", right: "How quickly the screen updates after user input" },
      { left: "Cumulative Layout Shift", right: "How much content moves unexpectedly while loading" },
    ],
    explanation:
      "Loading, responsiveness, and visual stability — three different user complaints, so three different sets of fixes. Diagnosing the wrong one is why teams optimise bundle size and see no change in a score driven by an unsized hero image.",
    concepts: ["Largest Contentful Paint", "Interaction to Next Paint", "Cumulative Layout Shift"],
    tags: ["core-web-vitals"],
  },
  {
    id: "fe-perf-002",
    type: "mcq",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 4,
    prompt: "Why did INP replace First Input Delay as a Core Web Vital?",
    options: [
      {
        id: "a",
        text: "FID measured only the first interaction and only the delay before handling began, which flattered slow apps",
      },
      { id: "b", text: "FID could not be measured on mobile devices" },
      { id: "c", text: "INP is easier to compute in lab conditions" },
      { id: "d", text: "FID measured layout shifts rather than input" },
    ],
    answer: "a",
    explanation:
      "FID ignored everything after the first interaction and stopped counting once the handler started, so an app that took a second to actually update the screen could still score well. INP measures the full interaction-to-paint duration across the whole visit, which is what users actually feel.",
    concepts: ["Interaction to Next Paint", "First Input Delay", "Main thread blocking"],
    tags: ["inp", "metrics"],
  },
  {
    id: "fe-perf-003",
    type: "multi",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 3,
    prompt:
      "Which commonly cause Cumulative Layout Shift? Select all that apply.",
    options: [
      { id: "a", text: "Images without width and height attributes" },
      { id: "b", text: "Banners or ads injected above existing content" },
      { id: "c", text: "Web fonts swapping in and reflowing text" },
      { id: "d", text: "Large JavaScript bundles" },
      { id: "e", text: "Slow server response times" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "CLS is about space not being reserved before content arrives. Bundle size and server latency hurt other metrics — INP and LCP respectively — but do not move things around. Reserving space for anything that loads late is close to the whole fix.",
    concepts: ["Cumulative Layout Shift", "Layout shift", "font-display"],
    tags: ["cls"],
  },
  {
    id: "fe-perf-004",
    type: "mcq",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 4,
    context:
      "The hero image is the largest element in the viewport and has loading=\"lazy\".",
    prompt:
      "What is the effect of lazy-loading the largest image in the viewport?",
    options: [
      {
        id: "a",
        text: "LCP gets worse — the browser defers the very resource the metric is waiting on",
      },
      { id: "b", text: "LCP improves, since fewer resources load up front" },
      { id: "c", text: "No effect; lazy loading only applies below the fold" },
      { id: "d", text: "CLS improves because the image loads later" },
    ],
    answer: "a",
    explanation:
      "Lazy loading is for content below the fold. Applying it to the LCP element delays discovery and download of exactly the thing being measured. That element should be eagerly loaded and often preloaded — and `loading=\"lazy\"` applies wherever you put it, not only below the fold.",
    concepts: ["Largest Contentful Paint", "Lazy loading", "Resource preloading"],
    tags: ["lcp", "images"],
  },
  {
    id: "fe-perf-005",
    type: "mcq",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 4,
    prompt:
      "Why is a kilobyte of JavaScript more costly than a kilobyte of image?",
    options: [
      {
        id: "a",
        text: "It must be parsed, compiled, and executed on the main thread, where it blocks interaction",
      },
      { id: "b", text: "JavaScript cannot be compressed" },
      { id: "c", text: "Images are always served from a CDN" },
      { id: "d", text: "JavaScript is downloaded more times than images" },
    ],
    answer: "a",
    explanation:
      "Both cost download, but an image is decoded off the main thread and then it is done. Script has to be parsed, compiled, and run where it competes with the user's input handling — which is why bundle size shows up in responsiveness metrics and image size mostly does not.",
    concepts: ["Main thread", "Parse and compile time", "Bundle size"],
    tags: ["javascript", "main-thread"],
  },
  {
    id: "fe-perf-006",
    type: "short",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 3,
    context:
      "A custom font blocks text from rendering until it downloads, leaving users staring at invisible text.",
    prompt: "Which CSS descriptor renders fallback text immediately instead? (font-____)",
    answers: ["display", "font-display", "display: swap", "swap"],
    typoTolerance: true,
    explanation:
      "font-display, usually set to swap. It trades a flash of unstyled text for text being readable immediately. Preloading the font shortens the swap window, and matching the fallback's metrics limits the reflow when the real font arrives.",
    concepts: ["font-display", "Flash of invisible text", "Font preloading"],
    tags: ["fonts"],
  },

  // ---------- Architecture ----------
  {
    id: "fe-arch-001",
    type: "mcq",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 4,
    context:
      "A team fetches API data into a global store, then hand-writes loading flags, error flags, refetching, and invalidation for each resource.",
    prompt: "What is the underlying mistake?",
    options: [
      {
        id: "a",
        text: "Treating server state as client state — it is a cache, and caching has known solutions",
      },
      { id: "b", text: "Using a global store at all" },
      { id: "c", text: "Fetching on the client rather than the server" },
      { id: "d", text: "Not normalising the data before storing it" },
    ],
    answer: "a",
    explanation:
      "Data that lives on a server and is mirrored locally is a cache, with all the usual concerns — staleness, revalidation, deduplication, invalidation. Reimplementing that per resource is where a lot of frontend complexity comes from. Use a data-fetching library for server state and keep the store for state the UI genuinely owns.",
    concepts: ["Server state", "Client state", "Cache invalidation"],
    tags: ["state-management"],
  },
  {
    id: "fe-arch-002",
    type: "matching",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 4,
    prompt: "Match each rendering strategy to when it fits best.",
    pairs: [
      { left: "Static generation", right: "Content known at build time; fastest and cheapest to serve" },
      { left: "Server-side rendering", right: "Personalised or frequently changing content needed on first paint" },
      { left: "Incremental regeneration", right: "Mostly static content that changes occasionally" },
      { left: "Client-side rendering", right: "Highly interactive views behind a login, where first paint matters less" },
    ],
    explanation:
      "These are per-route decisions. A single application will usually want static marketing pages, incrementally regenerated product pages, and a client-rendered dashboard — choosing one strategy for everything is what forces the compromise.",
    concepts: ["Static site generation", "Server-side rendering", "Incremental static regeneration", "Client-side rendering"],
    tags: ["rendering"],
  },
  {
    id: "fe-arch-003",
    type: "mcq",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 4,
    context:
      "A server-rendered page appears almost instantly, but clicks do nothing for a further second.",
    prompt:
      "Why would a server-rendered page appear instantly but ignore clicks for a second?",
    options: [
      {
        id: "a",
        text: "Hydration — the markup is present but not interactive until its JavaScript downloads and runs",
      },
      { id: "b", text: "The server is still streaming the response" },
      { id: "c", text: "CSS has not finished loading" },
      { id: "d", text: "The click handlers are attached on a timer" },
    ],
    answer: "a",
    explanation:
      "Server rendering separates looking ready from being ready, and users read an unresponsive page as broken rather than slow. The fixes all reduce or defer JavaScript: shipping none for static regions, splitting by route, and prioritising the code behind whatever users click first.",
    concepts: ["Hydration", "Time to Interactive", "Server-side rendering"],
    tags: ["hydration"],
  },
  {
    id: "fe-arch-004",
    type: "mcq",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 3,
    prompt: "Why colocate state as low in the component tree as possible?",
    options: [
      {
        id: "a",
        text: "It limits how much of the tree re-renders and keeps components movable",
      },
      { id: "b", text: "State higher in the tree cannot be updated" },
      { id: "c", text: "It removes the need for a state management library" },
      { id: "d", text: "Lower state persists across navigation" },
    ],
    answer: "a",
    explanation:
      "State lifted higher than necessary re-renders everything beneath it and couples a component to an ancestor, so it cannot be reused or moved without dragging that ancestor along. Lift only when something above genuinely needs to read it.",
    concepts: ["State colocation", "Prop drilling", "Re-render"],
    tags: ["state", "components"],
  },
  {
    id: "fe-arch-005",
    type: "ordering",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 4,
    prompt:
      "Order these rendering strategies from least to most server work per request.",
    items: [
      "Static generation",
      "Incremental regeneration",
      "Server-side rendering",
    ],
    explanation:
      "Static does the work once at build time. Incremental does it occasionally and serves the cached result in between. Server-side rendering does it for every request, which buys personalisation and freshness and costs compute that scales with traffic. Client-side rendering sits outside this axis — it moves the work to the user's device instead.",
    concepts: ["Static site generation", "Incremental static regeneration", "Server-side rendering"],
    tags: ["rendering", "cost"],
  },
  {
    id: "fe-perf-007",
    type: "matching",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 3,
    prompt: "Match each resource hint to what it asks the browser to do.",
    pairs: [
      {
        left: "preload",
        right: "Fetch this now at high priority — this page definitely needs it",
      },
      {
        left: "prefetch",
        right: "Fetch this at idle priority for a navigation that may come next",
      },
      {
        left: "preconnect",
        right: "Do the DNS, TCP, and TLS work for this origin ahead of time",
      },
      { left: "dns-prefetch", right: "Resolve this hostname early, and nothing more" },
      { left: "fetchpriority=low", right: "Fetch it, but behind everything that matters" },
    ],
    explanation:
      "The pair worth separating is preload and prefetch: preload asserts that this page needs the resource, so preloading something unused costs bandwidth and delays what was needed. Preconnect is the cheapest and most neglected — a third-party origin costs three round trips before its first byte arrives.",
    concepts: ["Resource hints", "preload", "preconnect", "Critical rendering path"],
    tags: ["hints", "loading"],
  },
  {
    id: "fe-perf-008",
    type: "mcq",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 3,
    context:
      "A page's HTML arrives quickly, then nothing is painted for another 600ms while a large stylesheet downloads.",
    prompt:
      "Why does a stylesheet delay the first paint when the HTML has already arrived?",
    options: [
      {
        id: "a",
        text: "CSS is render-blocking — the browser will not paint until it knows the styles, rather than show unstyled content",
      },
      { id: "b", text: "The stylesheet must be parsed before the HTML parser can continue" },
      { id: "c", text: "Browsers fetch stylesheets ahead of the HTML document" },
      { id: "d", text: "CSS parsing shares a thread with image decoding" },
    ],
    answer: "a",
    explanation:
      "The browser has the DOM and refuses to paint it, judging a flash of unstyled content worse than a delay. Inline the styles needed above the fold and load the rest without blocking. Contrast this with a synchronous script, which blocks the parser itself and so stops the DOM being built at all — a different and worse problem.",
    concepts: ["Render-blocking resource", "Critical CSS", "Critical rendering path", "Flash of unstyled content"],
    tags: ["css", "first-paint"],
  },
  {
    id: "fe-perf-009",
    type: "short",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 3,
    context:
      "The HTML loads a JavaScript bundle, which fetches a config file, which finally reveals the URL of the data the page needs. Nothing renders until all three finish, in sequence.",
    prompt:
      "What is this pattern of sequentially dependent requests called? (Either common name is accepted.)",
    answers: [
      "request waterfall",
      "waterfall",
      "network waterfall",
      "request chain",
      "critical request chain",
      "chained requests",
    ],
    typoTolerance: true,
    explanation:
      "A request waterfall, or critical request chain. Its cost is round trips rather than bytes: three chained requests over a 150ms connection is 450ms before anything can begin, however small the files are. Break it by discovering URLs earlier — inline the config, preload the data endpoint, or compose on the server.",
    concepts: ["Request waterfall", "Critical request chain", "Round-trip time", "Resource hints"],
    tags: ["waterfall", "round-trips"],
  },
  {
    id: "fe-perf-010",
    type: "multi",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 3,
    context:
      "A page scores 98 in a local Lighthouse run. Real users call it slow, and field data shows a poor Largest Contentful Paint at the 75th percentile.",
    prompt:
      "Why can a lab score be excellent while real users experience a slow page? Select all that apply.",
    options: [
      { id: "a", text: "The lab run uses one device, network, and location; real users span all of them" },
      { id: "b", text: "Field metrics report a 75th percentile across a population, not one measurement" },
      { id: "c", text: "Real sessions carry extensions, consent banners, and third-party scripts a lab run does not" },
      { id: "d", text: "Lighthouse measures different metrics from the ones users experience" },
      { id: "e", text: "A high lab score means the field data must be miscollected" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "Lab data is a controlled experiment and field data is a measurement of reality, so they answer different questions: lab tells you whether a change helped, field tells you what users actually get. When they disagree, field wins — and the gap usually names its own cause, whether a device class, a country, or a route the lab never loaded.",
    concepts: ["Real user monitoring", "Lab data versus field data", "Core Web Vitals", "75th percentile"],
    tags: ["measurement", "rum"],
  },
  {
    id: "fe-perf-011",
    type: "mcq",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 4,
    context:
      "A table renders 20,000 rows. Scrolling is smooth on a development machine and unusable on a mid-range phone; memory is high and the first render takes seconds.",
    prompt: "What is the standard fix for rendering a list of 20,000 rows?",
    options: [
      {
        id: "a",
        text: "Windowing — render only the visible rows plus a small buffer, recycling nodes while scrolling",
      },
      { id: "b", text: "Memoise each row so it does not re-render unnecessarily" },
      { id: "c", text: "Debounce the scroll handler" },
      { id: "d", text: "Move the row components into a web worker" },
    ],
    answer: "a",
    explanation:
      "The cost is the DOM nodes themselves: layout, style, and memory scale with how many exist, not how many are visible. Memoisation only avoids re-rendering nodes that should not have been created, and a worker cannot touch the DOM at all. Windowing's own price is that find-in-page and select-all stop seeing the whole list.",
    concepts: ["List virtualisation", "Windowing", "DOM node count", "Memoisation"],
    tags: ["virtualisation", "long-lists"],
  },
  {
    id: "fe-perf-012",
    type: "ordering",
    track: "frontend",
    topic: "frontend-performance",
    difficulty: 2,
    prompt: "Put the steps of investigating a slow page in order.",
    items: [
      "Check field data to confirm real users are affected, and which ones",
      "Reproduce it with throttling matched to the affected device and network",
      "Read the network waterfall to see what is holding up the first paint",
      "Profile the main thread to find what is holding up interaction",
      "Change one thing and measure the same metric again",
    ],
    explanation:
      "The order stops you optimising something that was never the problem. Opening a profiler first is the usual mistake: it shows the slowest function, which can account for none of what users feel if the page spent 800ms waiting on a request chain before any of your code ran.",
    concepts: ["Real user monitoring", "Network waterfall", "Main thread profiling", "Network throttling"],
    tags: ["method", "diagnosis"],
  },
  {
    id: "fe-arch-006",
    type: "mcq",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 3,
    context:
      "A component keeps the filtered list in state and recomputes it inside an effect whenever the source list or the filter changes.",
    prompt:
      "What is wrong with holding a filtered list in state and syncing it in an effect?",
    options: [
      {
        id: "a",
        text: "It is derived data — computing it during render removes a state variable, an effect, and a class of stale-value bug",
      },
      { id: "b", text: "Effects run more slowly than computing the value during render" },
      { id: "c", text: "The filtered list should be memoised into a ref instead" },
      { id: "d", text: "Filtering belongs on the server, not in the component" },
    ],
    answer: "a",
    explanation:
      "Any state that can be computed from other state is a copy that can disagree with its source, and the effect keeping them in step also costs an extra render pass. Ask of every state variable whether it could be derived — deriving it makes the inconsistent state unrepresentable rather than merely unlikely.",
    concepts: ["Derived state", "Single source of truth", "Impossible states", "Memoisation"],
    tags: ["state", "effects"],
  },
  {
    id: "fe-arch-007",
    type: "multi",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 3,
    prompt:
      "Which pieces of interface state belong in the URL? Select all that apply.",
    options: [
      { id: "a", text: "The active filter and sort order on a list view" },
      { id: "b", text: "Which page of a paginated result is showing" },
      { id: "c", text: "Which tab of a settings page is open" },
      { id: "d", text: "Whether a tooltip is currently visible" },
      { id: "e", text: "The half-typed contents of a search box before submission" },
    ],
    answers: ["a", "b", "c"],
    explanation:
      "The test is whether a user would reasonably expect to share the link, bookmark it, or return to it with the back button. Everything passing that test is navigation, and putting it in the URL buys shareability, history, and survival across a reload for free. Transient interaction state fails it and would only pollute history.",
    concepts: ["URL as state", "Deep linking", "Browser history", "Shareable state"],
    tags: ["url", "state"],
  },
  {
    id: "fe-arch-008",
    type: "short",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 3,
    context:
      "Clicking 'like' updates the count in the interface immediately, before the server confirms anything. If the request fails, the interface rolls the change back and shows an error.",
    prompt: "What is this interface update pattern called? (Two words.)",
    answers: [
      "optimistic update",
      "optimistic updates",
      "optimistic ui",
      "optimistic rendering",
      "optimistic update pattern",
    ],
    typoTolerance: true,
    explanation:
      "An optimistic update. It buys perceived performance by betting on the common case, and the bet is only sound where failure is rare, rollback is possible, and being briefly wrong is cheap. A like qualifies. A payment confirmation does not, because there is no honest state to roll back to.",
    concepts: ["Optimistic update", "Perceived performance", "Rollback", "Idempotency"],
    tags: ["optimistic", "latency"],
  },
  {
    id: "fe-arch-009",
    type: "mcq",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 4,
    context:
      "A list of editable rows uses the array index as its key. A row is deleted from the middle, and text a user had typed into the row below now appears in the wrong row.",
    prompt: "Why does an array index as a list key corrupt component state?",
    options: [
      {
        id: "a",
        text: "The key is how the framework decides which component is which, so reusing index 3 for a different item reuses the old component and its state",
      },
      { id: "b", text: "Numeric keys are slower to compare than string keys" },
      { id: "c", text: "Deleting from the middle of an array is not supported" },
      { id: "d", text: "The list must be re-sorted after every deletion" },
    ],
    answer: "a",
    explanation:
      "A key is an identity claim, and an index claims that position 3 is always the same thing — true right up until the list is reordered or spliced, at which point state stays attached to the position instead of the item. Use a stable id from the data; index keys are only safe for a list that never reorders, filters, or removes.",
    concepts: ["Reconciliation", "List key", "Component identity", "Stable identifier"],
    tags: ["keys", "reconciliation"],
  },
  {
    id: "fe-arch-010",
    type: "matching",
    track: "frontend",
    topic: "frontend-architecture",
    difficulty: 3,
    prompt: "Match each kind of state to where it should live.",
    pairs: [
      {
        left: "Data fetched from an API",
        right: "A server-state cache with its own staleness rules",
      },
      { left: "Whether one dropdown is open", right: "Local state inside that component" },
      {
        left: "The signed-in user",
        right: "A shared store or context read across the whole application",
      },
      {
        left: "An in-progress form's contents",
        right: "Local state in the form, lifted only once something else needs it",
      },
      {
        left: "A chosen colour theme",
        right: "Persisted per device, then read into a shared store on load",
      },
    ],
    explanation:
      "Most state management pain comes from putting one of these in the wrong place, and usually the first: server data in a global store turns cache invalidation into a manual job the whole application has to remember. Ask what owns the truth and who needs to read it, and the location follows.",
    concepts: ["Server state", "State colocation", "Global store", "Cache invalidation"],
    tags: ["state", "placement"],
  },
];
