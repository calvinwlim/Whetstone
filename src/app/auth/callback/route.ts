import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-redirect";

/** OAuth and magic-link both land here with a code to exchange for a session.
 *  The proxy keeps that session refreshed from then on.
 *
 *  `next` arrives from the query string and is therefore attacker-controlled;
 *  safeNext is what stops it pointing the browser off this origin. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"), origin);

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/sign-in?error=not_configured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=exchange_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
