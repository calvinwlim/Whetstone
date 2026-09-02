import type { MetadataRoute } from "next";
import { ALL_TOPICS } from "@/content";
import { SITE_URL } from "@/lib/site";

/** Only the pages a stranger could usefully land on. The drill, stats,
 *  settings and profile are personal surfaces behind no useful query, and
 *  listing them would just spend crawl budget.
 *
 *  lastModified is deliberately omitted: content lives in the repo with no
 *  per-topic edit date, and stamping every URL with the build time would tell
 *  crawlers all 79 pages change on every deploy, which is false. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/topics`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    ...ALL_TOPICS.map((topic) => ({
      url: `${SITE_URL}/topics/${topic.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
