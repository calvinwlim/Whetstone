/** The canonical origin, used by metadataBase, the sitemap, robots, and the
 *  generated social images. Everything that needs an absolute URL reads it
 *  from here so a rename means editing one place. */

/** The host the site is actually served from in production.
 *
 *  Hardcoded rather than left to Vercel's guess. VERCEL_PROJECT_PRODUCTION_URL
 *  is the *.vercel.app alias, not the custom domain, so relying on it made
 *  every page on whetstonehq.dev advertise a canonical URL on another origin
 *  -- which tells a search engine the domain you paid for is the copy.
 *
 *  Change this and the redirect in next.config.ts together; they are the two
 *  halves of "there is exactly one address for this site". */
export const CANONICAL_HOST = "www.whetstonehq.dev";

function resolveSiteUrl(): string {
  // An explicit value still wins, so a fork or a staging domain needs no code
  // change.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  // NODE_ENV is checked as well as VERCEL_ENV because `vercel env pull` writes
  // VERCEL_ENV=production into .env.local, so VERCEL_ENV alone is true during
  // local development and would make dev pages advertise production URLs.
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    return `https://${CANONICAL_HOST}`;
  }

  // Preview deployments genuinely are their own origin, and should describe
  // themselves as such -- they are excluded from indexing below.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV && vercel) {
    return `https://${vercel.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Whetstone";

export const SITE_DESCRIPTION =
  "A daily drill for system design, APIs, SQL, technical communication, and the rest of what a software engineer is actually asked about.";

/** Preview deployments serve the same content on a different origin. Letting
 *  them be indexed would compete with production for the same queries, so
 *  anything that is not the production deployment asks not to be crawled. */
export function isIndexable(): boolean {
  const env = process.env.VERCEL_ENV;
  return env === undefined || env === "production";
}
