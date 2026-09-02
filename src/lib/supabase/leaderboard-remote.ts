import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardStats } from "@/lib/leaderboard";

const TABLE = "leaderboard";

export type RankBy = "xp" | "streak";

export interface BoardRow {
  userId: string;
  displayName: string;
  totalXp: number;
  streak: number;
  answered: number;
  accuracy: number | null;
}

/** Rows are written by other people's browsers, so treat every field as
 *  untrusted input: coerce the numbers and never render the name as markup. */
function toRow(raw: Record<string, unknown>): BoardRow {
  return {
    userId: String(raw.user_id ?? ""),
    displayName: String(raw.display_name ?? ""),
    totalXp: Number(raw.total_xp ?? 0),
    streak: Number(raw.streak ?? 0),
    answered: Number(raw.answered ?? 0),
    accuracy: raw.accuracy === null ? null : Number(raw.accuracy),
  };
}

/** One indexed query, capped. There is no pagination on purpose -- a board
 *  nobody can reach the bottom of is a bigger read than this app needs. */
export async function fetchBoard(
  supabase: SupabaseClient,
  rankBy: RankBy,
  limit = 50,
): Promise<BoardRow[]> {
  const column = rankBy === "streak" ? "streak" : "total_xp";

  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id, display_name, total_xp, streak, answered, accuracy")
    .order(column, { ascending: false })
    .order("answered", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[whetstone] could not read leaderboard:", error.message);
    return [];
  }
  return (data ?? []).map(toRow);
}

export async function fetchMyRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<BoardRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id, display_name, total_xp, streak, answered, accuracy")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return toRow(data);
}

/** Joining, or renaming yourself. Also refreshes the stats in the same write. */
export async function joinBoard(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
  stats: LeaderboardStats,
): Promise<string | null> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      display_name: displayName,
      total_xp: stats.totalXp,
      streak: stats.streak,
      answered: stats.answered,
      accuracy: stats.accuracy,
    },
    { onConflict: "user_id" },
  );

  return error ? error.message : null;
}

/** Leaving removes the row rather than flagging it, so opting out leaves
 *  nothing of yours behind. */
export async function leaveBoard(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { error } = await supabase.from(TABLE).delete().eq("user_id", userId);
  return error ? error.message : null;
}

/** Refreshes the numbers for someone already listed. Deliberately an update
 *  rather than an upsert: if there is no row, the person is not on the board
 *  and drilling must not quietly put them there. */
export async function refreshMyStats(
  supabase: SupabaseClient,
  userId: string,
  stats: LeaderboardStats,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      total_xp: stats.totalXp,
      streak: stats.streak,
      answered: stats.answered,
      accuracy: stats.accuracy,
    })
    .eq("user_id", userId);

  if (error) {
    // Never interrupt a drill for a leaderboard write.
    console.warn("[whetstone] could not refresh leaderboard:", error.message);
  }
}
