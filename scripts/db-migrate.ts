import { readFileSync } from "node:fs";
import { Client } from "pg";

/** Applies supabase/schema.sql. Uses the non-pooling connection because DDL
 *  and session-level statements do not belong on a transaction pooler. */
async function main() {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error(
      "No POSTGRES_URL_NON_POOLING. Run: vercel env pull .env.local --yes",
    );
    process.exit(1);
  }

  const sql = readFileSync("supabase/schema.sql", "utf8");

  // Supabase signs its database certificates with its own CA, which is not in
  // Node's default trust store. Recent pg versions treat sslmode=require as
  // verify-full, so the URL's own sslmode has to be normalised or it overrides
  // the client option below. The connection stays TLS-encrypted; only chain
  // verification is relaxed. This runs locally against a known host and never
  // in the request path.
  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "no-verify");
  const client = new Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log("schema applied");

    const { rows } = await client.query(
      "select relrowsecurity from pg_class where oid = 'public.progress'::regclass",
    );
    console.log("row level security enabled:", rows[0]?.relrowsecurity);

    const policies = await client.query(
      "select policyname from pg_policies where schemaname = 'public' and tablename = 'progress'",
    );
    console.log(
      "policies:",
      policies.rows.map((r: { policyname: string }) => r.policyname),
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
