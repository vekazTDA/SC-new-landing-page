import type { NextConfig } from "next";

/**
 * Supabase Storage host for next/image.
 *
 * Note that next.config.ts is evaluated ONCE at server boot, while `next dev` hot-reloads
 * .env.local without re-reading it. So adding NEXT_PUBLIC_SUPABASE_URL to a running dev
 * server connects the app but leaves this list empty until a restart — which surfaces as
 * "hostname is not configured under images", with no hint that a restart is the fix.
 *
 * Hence the fallback: when the URL is not visible at boot we allow any Supabase project
 * host rather than none, so a mid-session env change degrades to a slightly broader
 * allowlist instead of a crash. Both forms stay pinned to https and to public Storage
 * paths, so the image optimizer is never a general-purpose proxy.
 */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

// Two path prefixes per host: plain public objects, and the image-transformation
// endpoint. Do NOT add `search: ""` to these — that would block all query strings and
// 400 the `?width=` transformation URLs.
const STORAGE_PATHS = [
  "/storage/v1/object/public/**",
  "/storage/v1/render/image/public/**",
] as const;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: STORAGE_PATHS.map((pathname) => ({
      protocol: "https" as const,
      hostname: supabaseHost ?? "**.supabase.co",
      pathname,
    })),
  },
};

export default nextConfig;
