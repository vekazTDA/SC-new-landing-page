import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AdminSession = { userId: string; email: string };

/**
 * The real authorisation check, deliberately NOT delegated to src/proxy.ts.
 *
 * Server Actions are POSTs to the route they live on, so a proxy matcher that skips a
 * path also skips its actions — Next's own docs say to verify inside each Server
 * Function rather than relying on the proxy. Treat the proxy redirect as cosmetic and
 * this, plus RLS, as the actual boundary.
 *
 * Wrapped in React `cache` so several actions in one request share a single round trip.
 */
/**
 * The signed-in Supabase user, regardless of whether they may edit anything.
 *
 * Kept separate from getAdminSession so callers can tell "nobody is signed in" (send
 * them to the login screen) apart from "signed in, but not on the allowlist" (show a
 * no-access screen). Collapsing the two caused a redirect loop: the page bounced a
 * non-admin to /admin-product/login, and the proxy bounced them straight back because
 * they did have a valid session.
 */
export const getAuthUser = cache(async () => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();

  // getUser, never getSession: getSession trusts the cookie as-is, while getUser
  // revalidates the JWT with the auth server. Only the latter is safe server-side.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error || !user ? null : user;
});

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  // Being signed in is not enough. Supabase allows public sign-ups by default, so
  // membership of admin_users is what grants write access — mirrored by the is_admin()
  // RLS policies, which stop a forged request even if this check were bypassed.
  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) return null;

  return { userId: user.id, email: user.email ?? "" };
});

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Not authorised.");
  return session;
}
