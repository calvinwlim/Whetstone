import type { Metadata, Viewport } from "next";
import { Rubik, JetBrains_Mono } from "next/font/google";
import { ProgressProvider } from "@/components/progress-provider";
import { NavBar } from "@/components/nav-bar";
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
  title: "Drill — daily practice for engineers",
  description:
    "A daily drill for system design, technical communication, DSA concepts, and workplace craft.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#14171a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ProgressProvider>
          <NavBar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pb-10">
            {children}
          </main>
        </ProgressProvider>
      </body>
    </html>
  );
}
