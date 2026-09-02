import type { Metadata } from "next";
import { Landing } from "@/components/landing";

/** The front door at a fixed address.
 *
 *  `/` shows this to anyone who has not answered anything and their dashboard
 *  once they have, which is right for the daily habit but means that after
 *  your first drill you can never see it again. This route always shows it.
 *
 *  Not indexed, and absent from the sitemap: `/` already serves this exact
 *  content to crawlers, so listing it twice would just split the signal
 *  between two URLs. The canonical points home for the same reason. */
export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return <Landing />;
}
