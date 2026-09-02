/** The canonical origin, used by metadataBase, the sitemap, robots, and the
 *  generated social images. Everything that needs an absolute URL reads it
 *  from here so a rename means editing one place. */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  // Vercel exposes the production alias at build time, so a deploy gets the
  // right origin without a variable having to be set by hand.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

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
