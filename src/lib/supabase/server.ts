import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Server client for Server Components, Server Actions and Route Handlers.
 *
 * `cookies()` is async in Next 16 — synchronous access was removed outright, not just
 * deprecated (see node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md),
 * which is why this factory is async and must be awaited at every call site.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Cookies cannot be written during a Server Component render — HTTP does not
          // allow it once streaming has begun. This throw is expected when a token
          // refresh lands mid-render; src/proxy.ts performs the real write.
        }
      },
    },
  });
}
