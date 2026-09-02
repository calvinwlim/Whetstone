"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useProgress } from "@/components/progress-provider";
import { Field } from "@/components/field";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { fetchRemoteSyncedAt } from "@/lib/supabase/progress-remote";

export default function ProfilePage() {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const { state, hydrated, accuracy, level, streak } = useProgress();

  const [user, setUser] = useState<User | null>(null);
  // Resolution is only ever pending when there is a client to ask. With no
  // Supabase configured the answer is already known, so it is derived rather
  // than assigned in an effect.
  const [resolved, setResolved] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setResolved(true);
      if (data.user) {
        const at = await fetchRemoteSyncedAt(supabase, data.user.id);
        if (active) setSyncedAt(at);
      }
    });

    return () => {
      active = false;
    };
  }, [supabase]);

  if (supabase && !resolved) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-40 rounded-control bg-surface" />
        <div className="h-28 rounded-card bg-surface" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <div className="mt-4 rounded-card border border-border p-5">
          <p className="text-sm text-text-2">
            Accounts are not configured on this deployment. Your progress is
            saved in this browser and does not follow you to another device.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <div className="mt-4 rounded-card border border-border p-5">
          <p className="text-sm text-text-2">
            You are not signed in. Your progress is saved in this browser only.
          </p>
          <Link
            href="/sign-in"
            className="key key-ink mt-4 inline-block px-4 py-2.5 text-[0.9375rem]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const email = user.email ?? "Account";
  const provider = user.app_metadata?.provider ?? "email";

  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-base font-bold text-ink-text"
        >
          {email.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {email}
          </h1>
          <p className="label mt-0.5">
            Signed in with {provider === "email" ? "email link" : provider}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3 border-y border-border py-3">
        <Field label="Level">
          <span className="font-sans text-base font-semibold">
            {level.level.title}
          </span>
        </Field>
        <Field label="XP" value={state.totalXp.toLocaleString()} />
        <Field label="Day streak" value={String(hydrated ? streak : 0)} />
        <Field label="Answered" value={state.attempts.length.toLocaleString()} />
        <Field
          label="Accuracy"
          value={accuracy === undefined ? "—" : `${Math.round(accuracy * 100)}%`}
          tone={
            accuracy === undefined ? undefined : accuracy >= 0.7 ? "good" : "bad"
          }
        />
      </div>

      <section className="mt-5 rounded-card border border-border p-4">
        <h2 className="text-sm font-semibold">Sync</h2>
        <p className="mt-1 text-sm text-text-2">
          Drills are saved to this browser first and mirrored to your account a
          moment later, so a dropped connection never costs you an answer.
        </p>
        <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
          <Row label="Last saved to your account">
            {syncedAt ? (
              <time dateTime={syncedAt} className="font-mono text-xs">
                {new Date(syncedAt).toLocaleString()}
              </time>
            ) : (
              <span className="text-text-2">
                {state.attempts.length === 0
                  ? "Nothing to save yet"
                  : "Not saved yet"}
              </span>
            )}
          </Row>
          <Row label="Longest streak">
            <span className="font-mono text-xs tabular-nums">
              {state.streak.longest}{" "}
              {state.streak.longest === 1 ? "day" : "days"}
            </span>
          </Row>
        </dl>
      </section>

      <section className="mt-4 rounded-card border border-border p-4">
        <h2 className="text-sm font-semibold">Account</h2>
        <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
          <Row label="Email">
            <span className="truncate">{email}</span>
          </Row>
          {user.created_at ? (
            <Row label="Joined">
              <time dateTime={user.created_at} className="font-mono text-xs">
                {new Date(user.created_at).toLocaleDateString()}
              </time>
            </Row>
          ) : null}
          {user.last_sign_in_at ? (
            <Row label="Last sign-in">
              <time
                dateTime={user.last_sign_in_at}
                className="font-mono text-xs"
              >
                {new Date(user.last_sign_in_at).toLocaleString()}
              </time>
            </Row>
          ) : null}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await supabase.auth.signOut();
              router.push("/");
              router.refresh();
            }}
            className="btn btn-quiet px-3.5 py-2 text-sm"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
          <Link
            href="/settings"
            className="text-sm text-text-2 underline underline-offset-2 hover:text-text"
          >
            Daily goal, tracks, and resetting progress
          </Link>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-text-2">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}
