import type { NextConfig } from "next";
import { CANONICAL_HOST } from "./src/lib/site";

const isDev = process.env.NODE_ENV === "development";

/** Content Security Policy.
 *
 *  The app loads no third-party script, stylesheet, font or image: next/font
 *  self-hosts at build time, the social images are generated here, and the
 *  only outbound hosts are Supabase and, when a crash is actually being
 *  reported, Rollbar. So 'self' is very nearly the whole policy, and the
 *  directives that cost nothing to lock down are locked down.
 *
 *  script-src keeps 'unsafe-inline' because Next.js inlines its bootstrap and
 *  flight data. The alternative is per-request nonces, and Next can only
 *  inject those into a dynamically rendered page -- a nonce has to differ per
 *  request, and these pages are built once, at build time. Adopting it would
 *  mean giving up the static prerender on all 93 of them. That trade is not
 *  worth it here, but be honest about what is lost: this policy stops a script
 *  being loaded from another origin, and does not stop an inline one. It is worth having anyway, because the
 *  directives below are what actually close the injection routes React does
 *  not already close:
 *
 *    base-uri     stops an injected <base> repointing every relative URL
 *    form-action  stops an injected form posting credentials elsewhere
 *    object-src   kills <object>/<embed> plugin content outright
 *    frame-ancestors  clickjacking, and the modern spelling of X-Frame-Options
 */
function contentSecurityPolicy(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'unsafe-eval' is React Refresh in dev only; it never ships.
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    // Supabase auth and the progress/leaderboard tables; api.rollbar.com is
    // where a caught crash gets posted, confirmed against the installed
    // rollbar package's own source rather than assumed. The websocket entry
    // is the dev server's hot reload.
    "connect-src": [
      "'self'",
      "https://*.supabase.co",
      "https://api.rollbar.com",
      ...(isDev ? ["ws://localhost:*"] : []),
    ],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
  };

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

/** Baseline hardening. HSTS is deliberately absent: Vercel already sends it,
 *  and .dev is on the HSTS preload list, so browsers refuse plaintext for this
 *  domain before a request is made. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Superseded by frame-ancestors above; kept for browsers that predate it.
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

/** One address for the site.
 *
 *  The *.vercel.app alias serves production byte-for-byte, is behind no robots
 *  rule, and was competing with the custom domain for the same queries. A 308
 *  to the canonical host is what consolidates them.
 *
 *  Matched on the exact alias rather than "any host that is not canonical".
 *  The obvious guard -- skip this unless VERCEL_ENV is production -- does not
 *  work: `vercel env pull` writes VERCEL_ENV=production into .env.local, so the
 *  rule fired on localhost and sent development traffic to the live site with a
 *  permanently cacheable redirect. Naming the one host to redirect cannot do
 *  that to localhost, and leaves preview deployments (whetstone-git-*) alone. */
const PRODUCTION_ALIAS = "whetstone-mu.vercel.app";

function canonicalHostRedirect() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: PRODUCTION_ALIAS }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    },
  ];
}

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return canonicalHostRedirect();
  },
};

export default nextConfig;
