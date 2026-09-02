"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  missing_code: "That sign-in link was incomplete. Try again.",
  exchange_failed: "That link has expired or was already used. Request a new one.",
  not_configured: "Accounts are not configured on this deployment.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface" />}>
      <SignIn />
    </Suspense>
  );
}

function SignIn() {
  const supabase = getBrowserSupabase();
  const errorParam = useSearchParams().get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState<string | null>(
    errorParam ? (ERRORS[errorParam] ?? "Sign-in failed. Try again.") : null,
  );

  if (!supabase) {
    return (
      <div className="rounded-xl border border-border p-5">
        <h1 className="text-lg font-semibold">Accounts are not configured</h1>
        <p className="mt-1 text-sm text-text-2">
          Your progress is still saved in this browser. It just will not follow
          you to another device.
        </p>
        <Link href="/" className="key key-plain mt-4 inline-block px-4 py-2 text-sm">
          Back to today
        </Link>
      </div>
    );
  }

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || email.trim() === "") return;

    setStatus("sending");
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("idle");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-text-2">
        Signing in syncs your streak, XP, and review schedule across devices.
        Without it, progress stays in this browser only.
      </p>

      {message ? (
        <p className="mt-4 rounded-lg border-[1.5px] border-red bg-red-wash px-3.5 py-2.5 text-sm">
          {message}
        </p>
      ) : null}

      {status === "sent" ? (
        <div className="mt-4 rounded-lg border-[1.5px] border-green bg-green-wash px-3.5 py-3 text-sm">
          <p className="font-semibold">Check your email</p>
          <p className="mt-1">
            We sent a sign-in link to {email}. It expires shortly, so use it
            soon.
          </p>
        </div>
      ) : (
        <form onSubmit={sendMagicLink} className="mt-5">
          <label htmlFor="email" className="text-sm font-medium text-text-2">
            Email a sign-in link
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-lg border-[1.5px] border-border bg-bg px-3.5 py-3 text-[0.9375rem] outline-none focus:border-green"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="key key-green mt-3 w-full px-4 py-3"
          >
            {status === "sending" ? "Sending…" : "Send link"}
          </button>
        </form>
      )}

      <Link
        href="/"
        className="mt-6 block text-center text-sm text-text-2 underline underline-offset-2 hover:text-green"
      >
        Keep using it without an account
      </Link>
    </div>
  );
}
