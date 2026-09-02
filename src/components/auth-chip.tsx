"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";

/** Sign-in state in the header. Renders nothing when Supabase is not
 *  configured, so a local-only deployment shows no dead control.
 *
 *  Signed in, this links to the profile rather than signing out: a single
 *  click on your own avatar should never be able to end the session. Sign out
 *  lives on the profile page, where it is a deliberate second step. */
export function AuthChip() {
  const supabase = getBrowserSupabase();
  const pathname = usePathname();
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
        className="rounded-control border border-shell-border px-2.5 py-1 text-sm font-medium text-shell-text-2 transition-colors hover:border-shell-text-2 hover:text-shell-text"
      >
        Sign in
      </Link>
    );
  }

  const label = user.email ?? "Account";
  const active = pathname.startsWith("/profile");

  return (
    <Link
      href="/profile"
      aria-current={active ? "page" : undefined}
      title={`Signed in as ${label}`}
      className={`flex items-center gap-1.5 rounded-control border px-1.5 py-1 text-sm font-medium transition-colors ${
        active
          ? "border-shell-text-2 text-shell-text"
          : "border-shell-border text-shell-text-2 hover:border-shell-text-2 hover:text-shell-text"
      }`}
    >
      <span
        aria-hidden
        className="grid h-5 w-5 place-items-center rounded-full bg-shell-text text-[10px] font-bold text-shell"
      >
        {label.slice(0, 1).toUpperCase()}
      </span>
      <span className="hidden max-w-[10rem] truncate sm:inline">{label}</span>
      <span className="sr-only">Your profile</span>
    </Link>
  );
}
