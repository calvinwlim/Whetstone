"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/components/progress-provider";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/topics", label: "Topics" },
  { href: "/stats", label: "Stats" },
  { href: "/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Streak and XP live in the header rather than in a hero block, so they are
 *  visible on every screen and no page has to spend space announcing them. */
function StatusChips() {
  const { streak, state, hydrated } = useProgress();

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="flex items-center gap-1 rounded-lg bg-amber-wash px-2 py-1 text-sm font-semibold text-amber-deep"
        title={`${streak} day streak`}
      >
        <span aria-hidden>🔥</span>
        <span className="tabular-nums">{hydrated ? streak : 0}</span>
        <span className="sr-only">day streak</span>
      </span>
      <span
        className="hidden items-center gap-1 rounded-lg bg-surface px-2 py-1 text-sm font-semibold text-text-2 sm:flex"
        title="Total XP"
      >
        <span className="tabular-nums">
          {(hydrated ? state.totalXp : 0).toLocaleString()}
        </span>
        <span className="text-xs font-medium">XP</span>
      </span>
    </div>
  );
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-bg">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-lg bg-green text-sm font-bold text-white"
            >
              W
            </span>
            <span className="text-base font-semibold">Whetstone</span>
          </Link>

          <nav className="hidden flex-1 gap-0.5 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(pathname, link.href)
                    ? "bg-surface-2 text-text"
                    : "text-text-2 hover:bg-surface hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto sm:ml-0">
            <StatusChips />
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg sm:hidden">
        <div className="flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`flex-1 border-t-2 px-2 py-3 text-center text-xs font-medium ${
                isActive(pathname, link.href)
                  ? "border-green text-text"
                  : "border-transparent text-text-2"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
