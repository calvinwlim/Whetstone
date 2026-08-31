import type { Question, Topic } from "@/content/types";

export const topics: Topic[] = [
  {
    id: "frontend-security",
    track: "frontend",
    title: "Frontend Security",
    blurb: "XSS, CSRF, CORS, and where to put a token — the four things people get wrong.",
    lesson: `Browser security has a specific shape: the attacker's code runs in your user's session, with your user's cookies.

**XSS is code execution in your origin.** *Stored* XSS is persisted and served to everyone; *reflected* comes back from the request; *DOM-based* never reaches the server at all, because a client-side sink like \`innerHTML\` executes attacker input directly.

Modern frameworks escape by default — React escapes any string rendered as a child — so almost all XSS in a React codebase enters through a deliberate bypass: \`dangerouslySetInnerHTML\`, a \`javascript:\` URL in an \`href\`, or injecting into a script context. If you must render user HTML, sanitise it with a maintained library rather than a regular expression.

**Content Security Policy is the second line.** It tells the browser which sources may execute, so an injection that gets through has nothing to run. It only works if you avoid \`unsafe-inline\` — a policy containing it permits precisely the attack it was meant to stop. Use nonces or hashes, and roll it out in report-only mode first.

**CSRF only exists because cookies are sent automatically.** An attacker's page submits a request to your site and the browser attaches the session cookie. \`SameSite=Lax\` is the modern default and blocks the cross-site cases that matter; \`Strict\` is stronger and breaks inbound links; anti-forgery tokens remain the belt-and-braces answer. If you authenticate with an \`Authorization\` header instead, CSRF largely disappears — nothing attaches that automatically.

**CORS protects users, not your server.** It is enforced *by the browser*, and only for browser-initiated cross-origin requests. It does not stop curl, a script, or anything without an origin to enforce. Loosening CORS does not expose your API; failing to authorise requests does. The corollary: never treat a passing CORS check as an authorisation check.

**Where to store a token.** \`localStorage\` is readable by any script in your origin, so a single XSS exfiltrates it. An \`httpOnly\` cookie is invisible to JavaScript but sent automatically, so it needs \`SameSite\` and \`Secure\`. The prevailing answer is an httpOnly, Secure, SameSite cookie holding a short-lived token — you trade an XSS problem for a CSRF problem that has a well-understood fix.

**Clickjacking** is your page framed invisibly over an attacker's. \`frame-ancestors\` in CSP is the current control.`,
    resources: [
      {
        label: "OWASP — XSS prevention cheat sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
      },
      {
        label: "MDN — Content Security Policy",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
      },
    ],
  },
  {
    id: "accessibility",
    track: "frontend",
    title: "Accessibility",
    blurb: "Building interfaces that work without a mouse, without sight, and without assumptions.",
    lesson: `Accessibility is mostly a series of small correct decisions, and the largest one is using the element that already does the job.

**Semantic HTML first.** A \`<button>\` is focusable, activates on Enter and Space, announces itself as a button, and works with every assistive technology — for free. A \`<div onClick>\` has none of that and needs a role, a tabindex, and keyboard handlers to reach parity, which is why the rule of thumb is that **no ARIA is better than bad ARIA**. ARIA describes; it never adds behaviour.

**Keyboard operability is the baseline test,** and the fastest audit you can run: put the mouse away and use the feature. Every interactive element must be reachable, the focus indicator must be visible, and the tab order must follow the visual order. Modals must trap focus while open and return it to the trigger on close — otherwise a keyboard user is dropped back at the top of the document.

**Forms need real labels.** A \`<label>\` associated with its control gives a screen reader the name and makes the label click into a larger tap target. Placeholder text is not a label: it disappears on input, usually fails contrast, and is announced inconsistently. Errors must be associated with their field and announced, not merely coloured red.

**Colour is never the only signal.** Pair it with text, an icon, or a pattern. Contrast wants 4.5:1 for normal text and 3:1 for large text and meaningful UI boundaries — and low-contrast grey-on-grey is the single most common accessibility failure in otherwise careful design.

**Structure carries meaning.** Headings in order describe the page for anyone navigating by heading, landmarks let people jump to the main content, and \`alt\` text conveys *purpose* — decorative images take an empty alt so they are skipped rather than described.

**Respect stated preferences.** \`prefers-reduced-motion\` is a real accessibility need for vestibular disorders, not a nicety.`,
    resources: [
      {
        label: "WAI — WCAG 2 at a glance",
        url: "https://www.w3.org/WAI/standards-guidelines/wcag/glance/",
      },
      {
        label: "MDN — ARIA",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA",
      },
    ],
  },
];

export const questions: Question[] = [
  // ---------- Frontend security ----------
  {
    id: "fe-sec-001",
    type: "mcq",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 3,
    context:
      "A React app renders user-submitted content. React escapes strings by default.",
    prompt: "Where is XSS still most likely to enter?",
    options: [
      {
        id: "a",
        text: "Deliberate bypasses — dangerouslySetInnerHTML, javascript: URLs, or injection into a script context",
      },
      { id: "b", text: "Anywhere user content appears as a text child" },
      { id: "c", text: "In server-rendered HTML only" },
      { id: "d", text: "It cannot — React makes XSS impossible" },
    ],
    answer: "a",
    explanation:
      "Default escaping covers the common path, so the remaining risk is where you opt out. A user-controlled href beginning javascript: is the one people forget, because it does not look like injecting HTML. If you must render user HTML, sanitise with a maintained library.",
    concepts: ["Cross-site scripting", "dangerouslySetInnerHTML", "Output encoding"],
    tags: ["xss", "react"],
  },
  {
    id: "fe-sec-002",
    type: "mcq",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 4,
    context:
      "A team adds a Content Security Policy that includes script-src 'self' 'unsafe-inline'.",
    prompt: "What have they achieved?",
    options: [
      {
        id: "a",
        text: "Very little against XSS — unsafe-inline permits exactly the injected inline scripts CSP exists to block",
      },
      { id: "b", text: "Full XSS protection, since scripts are limited to their own origin" },
      { id: "c", text: "Protection against CSRF but not XSS" },
      { id: "d", text: "Protection only for scripts loaded from a CDN" },
    ],
    answer: "a",
    explanation:
      "Injected XSS payloads are typically inline scripts, so allowing inline scripts defeats the point. It is an extremely common configuration because removing inline scripts is real work. Use nonces or hashes instead, and deploy in report-only mode first to find what breaks.",
    concepts: ["Content Security Policy", "unsafe-inline", "CSP nonce"],
    tags: ["csp"],
  },
  {
    id: "fe-sec-003",
    type: "mcq",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 4,
    prompt: "What does CORS actually protect, and what does it not?",
    options: [
      {
        id: "a",
        text: "It protects users from cross-origin reads by other sites; it does not protect your API from non-browser clients",
      },
      { id: "b", text: "It prevents unauthorised access to your API from any client" },
      { id: "c", text: "It encrypts cross-origin requests" },
      { id: "d", text: "It stops your server receiving requests from other origins" },
    ],
    answer: "a",
    explanation:
      "CORS is enforced by the browser, for browser-initiated requests, on behalf of the user. curl ignores it entirely. Loosening CORS does not expose your API — failing to authorise does. Treating a passing CORS check as authorisation is the dangerous misreading.",
    concepts: ["Cross-Origin Resource Sharing", "Same-origin policy", "Preflight request"],
    tags: ["cors"],
  },
  {
    id: "fe-sec-004",
    type: "mcq",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 4,
    prompt:
      "Why is an httpOnly cookie generally preferred over localStorage for session tokens?",
    options: [
      {
        id: "a",
        text: "JavaScript cannot read it, so a single XSS cannot exfiltrate the token",
      },
      { id: "b", text: "Cookies are encrypted and localStorage is not" },
      { id: "c", text: "Cookies cannot be sent cross-origin under any circumstances" },
      { id: "d", text: "localStorage is cleared when the tab closes" },
    ],
    answer: "a",
    explanation:
      "Anything in localStorage is one XSS away from being stolen, and a stolen token is usable from anywhere until it expires. An httpOnly cookie is invisible to script, and in exchange is sent automatically — so you take on CSRF, which SameSite and anti-forgery tokens solve well.",
    concepts: ["httpOnly cookie", "Token storage", "Cross-site scripting"],
    tags: ["token-storage"],
  },
  {
    id: "fe-sec-005",
    type: "matching",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 4,
    prompt: "Match each browser attack to its primary defence.",
    pairs: [
      { left: "Cross-site scripting", right: "Contextual output encoding plus a strict CSP" },
      { left: "Cross-site request forgery", right: "SameSite cookies and anti-forgery tokens" },
      { left: "Clickjacking", right: "frame-ancestors in CSP" },
      { left: "Compromised third-party script", right: "Subresource integrity and fewer dependencies" },
    ],
    explanation:
      "Each defence works where the trust is actually broken. Worth noting CSRF exists only because credentials are attached automatically — an app authenticating with an Authorization header is largely immune by construction.",
    concepts: ["Cross-site scripting", "Cross-site request forgery", "Clickjacking", "Subresource integrity"],
    tags: ["catalogue"],
  },
  {
    id: "fe-sec-006",
    type: "mcq",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 5,
    context:
      "An app is authenticated purely with a bearer token in an Authorization header, added by JavaScript.",
    prompt: "How does its CSRF exposure compare to a cookie-based app?",
    options: [
      {
        id: "a",
        text: "Largely immune — browsers do not attach Authorization headers automatically, so a forged cross-site request is unauthenticated",
      },
      { id: "b", text: "Identical, since the browser still sends the request" },
      { id: "c", text: "Worse, because headers are easier to forge than cookies" },
      { id: "d", text: "Unchanged; CSRF depends on the HTTP method, not the credential" },
    ],
    answer: "a",
    explanation:
      "CSRF depends on ambient authority — credentials the browser attaches without the page asking. A header set by your own JavaScript is not ambient, so the attacker's page cannot cause it to be sent. The trade is that the token now lives somewhere script can reach, which is the XSS exposure.",
    concepts: ["Cross-site request forgery", "Ambient authority", "Bearer token"],
    tags: ["csrf", "tradeoffs"],
  },
  {
    id: "fe-sec-007",
    type: "short",
    track: "frontend",
    topic: "frontend-security",
    difficulty: 3,
    context:
      "Attacker input never reaches the server; it is read from the URL by client-side code and passed to innerHTML, where it executes.",
    prompt: "Which type of XSS is this? (One word.)",
    answers: ["dom", "dom-based", "dom based", "dom xss", "dom-based xss"],
    typoTolerance: true,
    explanation:
      "DOM-based XSS. It is notable because server-side scanning and WAFs never see the payload — the vulnerability is entirely in the client-side sink. Auditing means finding the sinks: innerHTML, document.write, eval, and framework bypasses.",
    concepts: ["DOM-based XSS", "Client-side sink", "innerHTML"],
    tags: ["xss"],
  },

  // ---------- Accessibility ----------
  {
    id: "fe-a11y-001",
    type: "mcq",
    track: "frontend",
    topic: "accessibility",
    difficulty: 2,
    context:
      "A developer builds a clickable control as a div with an onClick handler.",
    prompt: "What does that lose compared with a button element?",
    options: [
      {
        id: "a",
        text: "Focusability, keyboard activation, and its announced role — all free with a button",
      },
      { id: "b", text: "Nothing, provided a click handler is attached" },
      { id: "c", text: "Only the default browser styling" },
      { id: "d", text: "Only the ability to submit a form" },
    ],
    answer: "a",
    explanation:
      "A native button is in the tab order, fires on Enter and Space, and announces itself. Recreating that on a div takes a role, a tabindex, and keyboard handlers — and it usually gets partially done, which is why the guidance is to use the semantic element.",
    concepts: ["Semantic HTML", "Focusable element", "Keyboard accessibility"],
    tags: ["semantic-html"],
  },
  {
    id: "fe-a11y-002",
    type: "mcq",
    track: "frontend",
    topic: "accessibility",
    difficulty: 3,
    prompt: "Why is 'no ARIA is better than bad ARIA' the standard advice?",
    options: [
      {
        id: "a",
        text: "ARIA changes what is announced without adding behaviour, so an incorrect role actively misleads",
      },
      { id: "b", text: "ARIA attributes slow down rendering" },
      { id: "c", text: "Screen readers ignore ARIA entirely" },
      { id: "d", text: "ARIA is deprecated in favour of semantic HTML" },
    ],
    answer: "a",
    explanation:
      "ARIA is a description layer. Labelling a div as a button tells assistive technology it behaves like one, and it still will not respond to Enter or Space — so the user is told something false. Native semantics carry behaviour and description together; ARIA is for the gaps.",
    concepts: ["ARIA", "Accessible name", "Semantic HTML"],
    tags: ["aria"],
  },
  {
    id: "fe-a11y-003",
    type: "mcq",
    track: "frontend",
    topic: "accessibility",
    difficulty: 3,
    context: "A modal dialog opens.",
    prompt: "What must happen to focus?",
    options: [
      {
        id: "a",
        text: "It moves into the dialog, is trapped while open, and returns to the trigger on close",
      },
      { id: "b", text: "It stays where it was, so the page behind is not disturbed" },
      { id: "c", text: "It moves to the top of the document" },
      { id: "d", text: "Focus handling is only relevant for screen reader users" },
    ],
    answer: "a",
    explanation:
      "Without moving focus in, a keyboard user is still behind the dialog and can tab into content they cannot see. Without trapping it, they tab straight out. Without returning it on close, they are dumped at the document start and lose their place — this is a mouse-user problem too.",
    concepts: ["Focus management", "Focus trap", "Modal dialog"],
    tags: ["focus-management"],
  },
  {
    id: "fe-a11y-004",
    type: "multi",
    track: "frontend",
    topic: "accessibility",
    difficulty: 3,
    prompt:
      "Which are genuine accessibility requirements rather than preferences? Select all that apply.",
    options: [
      { id: "a", text: "A visible focus indicator on interactive elements" },
      { id: "b", text: "Form controls associated with real labels" },
      { id: "c", text: "Information conveyed by more than colour alone" },
      { id: "d", text: "Contrast of at least 4.5:1 for normal text" },
      { id: "e", text: "Animations on every state change to signal what happened" },
    ],
    answers: ["a", "b", "c", "d"],
    explanation:
      "The first four map directly to WCAG success criteria. Motion is the opposite of a requirement — it can trigger vestibular symptoms, which is why prefers-reduced-motion exists and why animation should never be the only signal that something changed.",
    concepts: ["WCAG", "Colour contrast ratio", "Focus indicator"],
    tags: ["wcag"],
  },
  {
    id: "fe-a11y-005",
    type: "mcq",
    track: "frontend",
    topic: "accessibility",
    difficulty: 3,
    prompt: "Why is placeholder text not an acceptable substitute for a label?",
    options: [
      {
        id: "a",
        text: "It disappears once typing starts, usually fails contrast, and is announced inconsistently",
      },
      { id: "b", text: "Placeholders cannot be styled" },
      { id: "c", text: "Screen readers always ignore placeholder text" },
      { id: "d", text: "Placeholders are not supported on all input types" },
    ],
    answer: "a",
    explanation:
      "The moment a user starts typing, the only description of the field is gone — which hurts anyone who is interrupted, not just users of assistive technology. A real label also gives a larger click target and a reliable accessible name.",
    concepts: ["Form label", "Placeholder text", "Accessible name"],
    tags: ["forms", "labels"],
  },
  {
    id: "fe-a11y-006",
    type: "short",
    track: "frontend",
    topic: "accessibility",
    difficulty: 3,
    context:
      "An image is purely decorative and conveys nothing the surrounding text does not already say.",
    prompt: "What should its alt attribute be?",
    answers: [
      "empty",
      "empty string",
      "blank",
      "\"\"",
      "alt=\"\"",
      "an empty string",
      "nothing",
    ],
    typoTolerance: true,
    explanation:
      "An empty alt, which tells assistive technology to skip it. Omitting the attribute entirely is different and worse — some screen readers then announce the filename. Alt text should carry purpose, so a decorative image's purpose is genuinely nothing.",
    concepts: ["Alt text", "Decorative image", "Screen reader"],
    tags: ["images", "alt-text"],
  },
];
