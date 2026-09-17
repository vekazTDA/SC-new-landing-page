import { PRODUCTS, type Product } from "@/data/products";
import { SHOP_PRODUCTS, type ShopProduct } from "@/data/shopProducts";
import { ADDONS, type Addon } from "@/data/addons";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";
import { toAddon, toProduct, toShopProduct } from "./mappers";
import type { AddonRow, CatalogKind, ProductRow, ShopProductRow } from "./types";

/** Cache tags, also used by the admin actions to expire the marketing page. */
export const CATALOG_TAGS: Record<CatalogKind, string> = {
  products: "products",
  "shop-products": "shop-products",
  addons: "addons",
};

export const CATALOG_REVALIDATE_SECONDS = 3600;

/**
 * Read straight from PostgREST rather than through supabase-js: it keeps the client
 * library out of the public bundle, and it is the only way to attach `next: { tags }`
 * so an admin edit can expire the marketing page.
 *
 * Returns null — never throws, never returns [] — so every caller can fall back to the
 * static arrays. That is what keeps the site building and rendering before Supabase is
 * configured at all.
 */
async function fetchRows<T>(query: string, tag: string): Promise<T[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        accept: "application/json",
      },
      // Caching is opt-in in Next 16 — without force-cache this refetches on every
      // request and the marketing page stops being static.
      cache: "force-cache",
      next: { tags: [tag], revalidate: CATALOG_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.warn(`[catalog] ${tag}: ${response.status} ${response.statusText}`);
      return null;
    }

    const rows: unknown = await response.json();
    // An empty table means the seed has not run — fall back rather than render an
    // empty grid on the live site.
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows as T[];
  } catch (error) {
    console.warn(`[catalog] ${tag} fetch failed`, error);
    return null;
  }
}

const PUBLISHED = "&is_published=eq.true&order=sort_order.asc,created_at.asc";

export async function getProducts(): Promise<Product[]> {
  const rows = await fetchRows<ProductRow>(
    "products?select=id,slug,name,eyebrow,description,images,price_amount,price_display," +
      "price_unit,in_stock,rating,review_count,default_quantity,sort_order,is_published" +
      PUBLISHED,
    CATALOG_TAGS.products
  );
  if (!rows) return PRODUCTS;
  try {
    const mapped = rows.map(toProduct);
    return mapped.length > 0 ? mapped : PRODUCTS;
  } catch (error) {
    console.warn("[catalog] products mapping failed, using static fallback", error);
    return PRODUCTS;
  }
}

export async function getShopProducts(): Promise<ShopProduct[]> {
  const rows = await fetchRows<ShopProductRow>(
    "shop_products?select=id,slug,name,price,images,modal_description,size_options," +
      "rating,review_count,sort_order,is_published" +
      PUBLISHED,
    CATALOG_TAGS["shop-products"]
  );
  if (!rows) return SHOP_PRODUCTS;
  try {
    const mapped = rows.map(toShopProduct);
    return mapped.length > 0 ? mapped : SHOP_PRODUCTS;
  } catch (error) {
    console.warn("[catalog] shop products mapping failed, using static fallback", error);
    return SHOP_PRODUCTS;
  }
}

export async function getAddons(): Promise<Addon[]> {
  const rows = await fetchRows<AddonRow>(
    "addons?select=id,slug,title,price,description,images,sort_order,is_published" + PUBLISHED,
    CATALOG_TAGS.addons
  );
  if (!rows) return ADDONS;
  try {
    const mapped = rows.map(toAddon);
    return mapped.length > 0 ? mapped : ADDONS;
  } catch (error) {
    console.warn("[catalog] addons mapping failed, using static fallback", error);
    return ADDONS;
  }
}
