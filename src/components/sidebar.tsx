"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { TRACKS } from "@/content";

/** Stroke icons sized to the 14px label text beside them. Inline rather than a
 *  dependency: there are a handful of them and they never change. */
function Icon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  today: "M3 6h10M3 6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm3-4v3m4-3v3",
  topics: "M2.5 4h11M2.5 8h11M2.5 12h7",
  stats: "M3 13V7m5 6V3m5 10v-4",
  leaderboard:
    "M5 2.5h6v3.5a3 3 0 1 1-6 0V2.5Zm0 1H3.5v1a2 2 0 0 0 2 2m5.5-3H12.5v1a2 2 0 0 1-2 2M8 9v2.5M6 13.5h4",
  settings: "M2.5 5h11M2.5 11h11M6 3v4m4 2v4",
  path: "M4 13.5V9a2 2 0 0 1 2-2h4a2 2 0 0 0 2-2V2.5M4 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm8-11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
} as const;

const LINKS = [
  { href: "/", label: "Today", icon: ICONS.today },
  { href: "/path", label: "Path", icon: ICONS.path },
  { href: "/topics", label: "Topics", icon: ICONS.topics },
  { href: "/stats", label: "Stats", icon: ICONS.stats },
  { href: "/leaderboard", label: "Leaderboard", icon: ICONS.leaderboard },
  { href: "/settings", label: "Settings", icon: ICONS.settings },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  /** Lets the mobile drawer close itself when a link is followed. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  // The topic in the URL, so its track can start expanded rather than making
  // you re-find where you already are.
  const currentTopicId = pathname.startsWith("/topics/")
    ? pathname.slice("/topics/".length)
    : null;

  const currentTrackId = useMemo(() => {
    if (!currentTopicId) return null;
    return (
      TRACKS.find((track) =>
        track.topics.some((topic) => topic.id === currentTopicId),
      )?.id ?? null
    );
  }, [currentTopicId]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleTrack(trackId: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto overscroll-contain py-3">
      <nav className={open ? "px-3" : "px-2"}>
        <ul className="space-y-0.5">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={open ? undefined : link.label}
                  className={`flex items-center gap-2.5 rounded-control py-2 text-sm font-medium transition-colors ${
                    open ? "px-2.5" : "justify-center px-0"
                  } ${
                    active
                      ? "bg-shell-2 text-shell-text"
                      : "text-shell-text-2 hover:bg-shell-2/60 hover:text-shell-text"
                  }`}
                >
                  <Icon path={link.icon} />
                  {open ? <span>{link.label}</span> : null}
                  {!open ? <span className="sr-only">{link.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* The corpus is a tree, so it is shown as one. Collapsed to the rail
          there is no room for it, and the links above are enough. */}
      {open ? (
        <div className="mt-4 min-h-0 flex-1 px-3">
          <p className="label px-2.5 text-shell-text-2">Tracks</p>
          <ul className="mt-1 space-y-0.5 pb-2">
            {TRACKS.map((track) => {
              const isOpen =
                expanded.has(track.id) ||
                (!expanded.size && track.id === currentTrackId);

              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => toggleTrack(track.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-1.5 rounded-control px-2.5 py-1.5 text-left text-sm text-shell-text-2 transition-colors hover:bg-shell-2/60 hover:text-shell-text"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden
                      className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      fill="currentColor"
                    >
                      <path d="M6 4l4 4-4 4z" />
                    </svg>
                    <span className="min-w-0 flex-1 truncate">
                      {track.title}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums opacity-60">
                      {track.topics.length}
                    </span>
                  </button>

                  {isOpen ? (
                    <ul className="mb-1 ml-[1.1rem] border-l border-shell-border pl-2">
                      {track.topics.map((topic) => {
                        const active = topic.id === currentTopicId;
                        return (
                          <li key={topic.id}>
                            <Link
                              href={`/topics/${topic.id}`}
                              onClick={onNavigate}
                              aria-current={active ? "page" : undefined}
                              className={`block truncate rounded-control px-2 py-1.5 text-[0.8125rem] transition-colors ${
                                active
                                  ? "bg-shell-2 text-shell-text"
                                  : "text-shell-text-2 hover:bg-shell-2/60 hover:text-shell-text"
                              }`}
                            >
                              {topic.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
