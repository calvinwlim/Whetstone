"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/topics", label: "Topics" },
  { href: "/stats", label: "Stats" },
  { href: "/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="block h-4 w-1.5 rounded-[1px] bg-amber"
            />
            <span className="readout text-lg tracking-tight">Drill</span>
          </Link>

          <nav className="hidden gap-1 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive(pathname, link.href)
                    ? "bg-sunken text-text"
                    : "text-muted hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Thumb-reachable navigation on a phone, where most sessions happen. */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-rule bg-paper sm:hidden">
        <div className="flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`flex-1 border-t-2 px-2 py-3 text-center text-xs ${
                isActive(pathname, link.href)
                  ? "border-amber text-text"
                  : "border-transparent text-muted"
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
