import type { Metadata, Viewport } from "next";
import { Archivo, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import { ProgressProvider } from "@/components/progress-provider";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Drill — daily practice for engineers",
  description:
    "A daily drill for system design, technical communication, DSA concepts, and workplace craft.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edeff2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1720" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ProgressProvider>
          <NavBar />
          <main className="flex-1 w-full max-w-3xl mx-auto px-5 pb-24 pt-6 sm:px-8">
            {children}
          </main>
        </ProgressProvider>
      </body>
    </html>
  );
}
