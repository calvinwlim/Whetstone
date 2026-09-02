import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireSupabaseEnv } from "@/lib/supabase/config";

/** Deleting your own account.
 *
 *  Supabase will not let a user delete their own auth record with the public
 *  key, so this runs server-side with the service role. Two rules make that
 *  safe, and both matter:
 *
 *  1. The id comes from the session cookie, never from the request. There is
 *     no body to tamper with, so this endpoint cannot be pointed at anyone
 *     else's account.
 *  2. The service key is read inside the handler and never returned. It exists
 *     only on the server.
 *
 *  `progress` and `leaderboard` both reference auth.users with ON DELETE
 *  CASCADE, so removing the auth record takes the data with it -- there is no
 *  second delete to forget, and no way for the two to drift apart. */
export async function DELETE() {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return Response.json({ error: "Accounts are not configured." }, { status: 501 });
  }

  const { data, error: sessionError } = await supabase.auth.getUser();
  const user = data?.user;
  if (sessionError || !user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    // Better to refuse than to half-delete and report success.
    return Response.json(
      { error: "Account deletion is not available on this deployment." },
      { status: 501 },
    );
  }

  const { url } = requireSupabaseEnv();
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[whetstone] account deletion failed:", error.message);
    return Response.json(
      { error: "Could not delete the account. Nothing was removed." },
      { status: 500 },
    );
  }

  // Drop the session cookies so the browser is not left holding a token for an
  // account that no longer exists.
  await supabase.auth.signOut();

  return Response.json({ deleted: true });
}
