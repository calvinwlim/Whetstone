import type { Metadata, Viewport } from "next";
import { Rubik, JetBrains_Mono } from "next/font/google";
import { ProgressProvider } from "@/components/progress-provider";
import { AppShell } from "@/components/app-shell";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  isIndexable,
} from "@/lib/site";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Pages supply their own name; the suffix is added once, here.
    default: "Whetstone — daily practice for engineers",
    template: "%s — Whetstone",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  // Preview deployments serve identical content on another origin, so only
  // production asks to be indexed.
  robots: isIndexable()
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: "Whetstone — daily practice for engineers",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Whetstone — daily practice for engineers",
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16191d" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full">
        <ProgressProvider>
          <AppShell>{children}</AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
