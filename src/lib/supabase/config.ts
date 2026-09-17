/**
 * Supabase environment resolution, in one place.
 *
 * Supabase is renaming the legacy `anon` key to a "publishable" key (`sb_publishable_…`),
 * so both variable names are accepted — whichever the project was created with.
 * Everything here is NEXT_PUBLIC_ on purpose: the browser admin client needs it, and the
 * anon/publishable key is designed to be public. Row Level Security is what protects the
 * data, not the secrecy of this key. The service-role/secret key must never appear here.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** False until the project is wired up; every caller falls back to the static catalogue. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const PRODUCT_IMAGE_BUCKET = "product-images";
