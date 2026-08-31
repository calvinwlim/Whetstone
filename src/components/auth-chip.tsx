"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";

/** Sign-in state in the header. Renders nothing when Supabase is not
 *  configured, so a local-only deployment shows no dead control. */
export function AuthChip() {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setReady(true);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!supabase || !ready) return null;

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-lg border border-border px-2.5 py-1 text-sm font-medium text-text-2 hover:border-border-strong hover:text-text"
      >
        Sign in
      </Link>
    );
  }

  const label = user.email ?? "Account";

  return (
    <button
      type="button"
      title={`Signed in as ${label} — click to sign out`}
      onClick={async () => {
        await supabase.auth.signOut();
        router.refresh();
      }}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-sm font-medium text-text-2 hover:border-border-strong hover:text-text"
    >
      <span
        aria-hidden
        className="grid h-4 w-4 place-items-center rounded-full bg-green text-[10px] font-bold text-white"
      >
        {label.slice(0, 1).toUpperCase()}
      </span>
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
