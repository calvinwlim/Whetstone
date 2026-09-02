"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Field } from "@/components/field";
import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  fetchBoard,
  type BoardRow,
  type RankBy,
} from "@/lib/supabase/leaderboard-remote";

const RANKS: { id: RankBy; label: string; note: string }[] = [
  { id: "xp", label: "XP", note: "Total earned, all time." },
  { id: "streak", label: "Streak", note: "Consecutive days hitting your goal." },
];

export default function LeaderboardPage() {
  const supabase = getBrowserSupabase();
  const [rankBy, setRankBy] = useState<RankBy>("xp");
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [resolved, setResolved] = useState(false);

  // The board and the viewer are fetched together so the page never renders
  // a ranking before it knows which row to mark as yours.
  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void (async () => {
      try {
        const [board, auth] = await Promise.all([
          fetchBoard(supabase, rankBy),
          supabase.auth.getUser(),
        ]);
        if (!active) return;
        setRows(board);
        setUser(auth.data.user ?? null);
      } catch {
        // An unreachable board is an empty board, not a page that sits on a
        // loading skeleton for ever.
        if (active) setRows([]);
      } finally {
        if (active) setResolved(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [supabase, rankBy]);

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-3 text-sm text-text-2">
          Accounts are not configured on this deployment, so there is no board.
        </p>
      </div>
    );
  }

  const listed = user ? rows?.some((row) => row.userId === user.id) : false;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-text-2">
        Everyone who has chosen to appear. Taking part is opt-in, and only your
        chosen name and these four numbers are shared — never which questions
        you answered or how you did on any of them.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {RANKS.map((rank) => {
          const active = rankBy === rank.id;
          return (
            <button
              key={rank.id}
              type="button"
              onClick={() => setRankBy(rank.id)}
              aria-pressed={active}
              title={rank.note}
              className={`btn rounded-chip px-2.5 py-1 text-[0.8125rem] ${
                active
                  ? "btn-primary"
                  : "border border-border text-text-2 hover:border-border-strong hover:text-text"
              }`}
            >
              {rank.label}
            </button>
          );
        })}
        <span className="ml-1 text-xs text-text-2">
          {RANKS.find((rank) => rank.id === rankBy)?.note}
        </span>
      </div>

      {!resolved ? (
        <div className="mt-5 animate-pulse space-y-2">
          <div className="h-9 rounded-control bg-surface" />
          <div className="h-9 rounded-control bg-surface" />
          <div className="h-9 rounded-control bg-surface" />
        </div>
      ) : !user ? (
        <div className="mt-5 rounded-card border border-border p-5">
          <p className="text-sm text-text-2">
            The board is only visible to people with an account, so that a
            chosen name is never exposed to the open web.
          </p>
          <Link
            href="/sign-in"
            className="key key-ink mt-4 inline-block px-4 py-2.5 text-[0.9375rem]"
          >
            Sign in
          </Link>
        </div>
      ) : rows && rows.length > 0 ? (
        <>
          {!listed ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-3.5">
              <p className="text-sm text-text-2">
                You are not on the board. Pick a name on your profile to join.
              </p>
              <Link
                href="/profile"
                className="btn btn-primary shrink-0 px-3.5 py-2 text-sm"
              >
                Join the board
              </Link>
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[24rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-strong">
                  <th scope="col" className="label py-2 pl-2 pr-3 text-right">
                    #
                  </th>
                  <th scope="col" className="label px-3 py-2 text-left">
                    Name
                  </th>
                  <th scope="col" className="label px-3 py-2 text-right">
                    XP
                  </th>
                  <th scope="col" className="label px-3 py-2 text-right">
                    Streak
                  </th>
                  <th
                    scope="col"
                    className="label hidden px-3 py-2 text-right sm:table-cell"
                  >
                    Answered
                  </th>
                  <th
                    scope="col"
                    className="label hidden py-2 pl-3 pr-2 text-right sm:table-cell"
                  >
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const isMe = row.userId === user.id;
                  return (
                    <tr
                      key={row.userId}
                      className={`border-b border-border last:border-b-0 ${
                        isMe ? "bg-ink-wash" : "hover:bg-surface"
                      }`}
                    >
                      <td className="py-2.5 pl-2 pr-3 text-right font-mono text-xs tabular-nums text-text-2">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={isMe ? "font-semibold" : "font-medium"}>
                          {row.displayName}
                        </span>
                        {isMe ? (
                          <span className="ml-2 text-xs text-text-2">you</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums">
                        {row.totalXp.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums">
                        {row.streak}
                      </td>
                      <td className="hidden px-3 py-2.5 text-right font-mono text-xs tabular-nums text-text-2 sm:table-cell">
                        {row.answered.toLocaleString()}
                      </td>
                      <td className="hidden py-2.5 pl-3 pr-2 text-right sm:table-cell">
                        {row.accuracy === null ? (
                          <span className="font-mono text-xs text-text-2">—</span>
                        ) : (
                          <span
                            className={`font-mono text-xs tabular-nums ${
                              row.accuracy >= 0.7 ? "text-green" : "text-red"
                            }`}
                          >
                            {Math.round(row.accuracy * 100)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3 border-t border-border pt-3">
            <Field label="On the board" value={String(rows.length)} />
            <Field
              label="Your rank"
              value={
                listed
                  ? `${rows.findIndex((row) => row.userId === user.id) + 1}`
                  : "—"
              }
            />
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-card border border-border p-5">
          <p className="font-medium">Nobody has joined yet</p>
          <p className="mt-1 text-sm text-text-2">
            Pick a name on your profile and you will be the first.
          </p>
          <Link
            href="/profile"
            className="key key-ink mt-4 inline-block px-4 py-2.5 text-[0.9375rem]"
          >
            Join the board
          </Link>
        </div>
      )}
    </div>
  );
}
