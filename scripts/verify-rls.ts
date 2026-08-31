import { createClient } from "@supabase/supabase-js";

/** Proves the anon key is safe to ship: without a session, RLS must expose
 *  nothing and reject writes. */
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("missing Supabase env");

  const supabase = createClient(url, anon);

  const read = await supabase.from("progress").select("user_id");
  console.log(
    "anon read ->",
    read.error ? `blocked (${read.error.code})` : `${read.data?.length ?? 0} rows visible`,
  );

  const write = await supabase
    .from("progress")
    .insert({ user_id: "00000000-0000-0000-0000-000000000000", state: {} });
  console.log(
    "anon write ->",
    write.error ? `blocked (${write.error.code})` : "ALLOWED - RLS IS NOT PROTECTING WRITES",
  );

  const ok =
    (read.error !== null || (read.data?.length ?? 0) === 0) && write.error !== null;
  console.log(ok ? "RLS verified" : "RLS PROBLEM");
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
