import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Next 16 renamed the `middleware` convention to `proxy` — a `middleware.ts` file is
 * deprecated and the export must be named `proxy`
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 * Do not add `export const runtime` here: proxy is Node-only and setting it throws.
 *
 * Its one job is refreshing the Supabase auth cookie. Treat the redirect below as
 * OPTIMISTIC only — Server Actions POST to the route they live on, so a matcher that
 * skips a path also skips its actions. Real authorisation is `requireAdmin()` inside
 * every action, backed by RLS.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Nothing may go between createServerClient and getUser: reordering here causes
  // intermittent, very hard to trace sign-outs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin-product/login";

  if (!user && pathname.startsWith("/admin-product") && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-product/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-product";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Must return this exact response — a fresh NextResponse.next() would drop the
  // refreshed cookies that setAll just wrote, which looks like random logouts.
  return supabaseResponse;
}

export const config = {
  // A matcher is mandatory: without one the proxy runs for _next/static, _next/image
  // and every file in public/ too.
  matcher: ["/admin-product/:path*"],
};
