import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProgressState } from "@/lib/progress";
import { isProgressState } from "@/lib/storage";

const TABLE = "progress";

/** Reads this user's blob. Returns null when there is no row yet, and also
 *  when the stored shape is unrecognised -- an unreadable remote state is
 *  treated as absent rather than allowed to overwrite good local progress. */
export async function fetchRemoteProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProgressState | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[whetstone] could not read remote progress:", error.message);
    return null;
  }
  if (!data) return null;

  return isProgressState(data.state) ? data.state : null;
}

export async function pushRemoteProgress(
  supabase: SupabaseClient,
  userId: string,
  state: ProgressState,
): Promise<boolean> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, state }, { onConflict: "user_id" });

  if (error) {
    // A failed sync must never interrupt a drill; the next change retries.
    console.warn("[whetstone] could not save remote progress:", error.message);
    return false;
  }
  return true;
}
