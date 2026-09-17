"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Browser client, used by the admin panel for sign-in and for uploading photos straight
 * to Storage. Uploading from the browser rather than through a Server Action is
 * deliberate: Server Actions have a 1MB request body limit by default, which real
 * product photography blows through immediately.
 *
 * The env vars are referenced as literal `process.env.X` in config.ts — Next only inlines
 * static references, so building the key name dynamically would yield undefined here.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
