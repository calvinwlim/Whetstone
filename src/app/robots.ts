import type { MetadataRoute } from "next";
import { SITE_URL, isIndexable } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal surfaces. Nothing here is useful without a session, and the
      // auth callback should never be followed by a crawler.
      disallow: [
        "/drill",
        "/path",
        "/stats",
        "/settings",
        "/profile",
        "/sign-in",
        "/auth/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
