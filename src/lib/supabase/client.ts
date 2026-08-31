"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, requireSupabaseEnv } from "./config";

let cached: SupabaseClient | null = null;

/** Browser client, or null when Supabase is not configured. Callers treat
 *  null as "no accounts available" and fall back to local-only progress. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    const { url, anonKey } = requireSupabaseEnv();
    cached = createBrowserClient(url, anonKey);
  }
  return cached;
}
