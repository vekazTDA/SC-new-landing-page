"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOG_TAGS } from "@/lib/catalog";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/supabase/config";
import type { CatalogKind } from "@/lib/catalog/types";

const TABLES: Record<CatalogKind, string> = {
  products: "products",
  "shop-products": "shop_products",
  addons: "addons",
};

export type ActionResult = { ok: true } | { ok: false; error: string };

function describe(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

/**
 * Expire the marketing page after a write.
 *
 * `updateTag` (Server-Action-only) expires immediately and is read-your-own-writes, so
 * the team sees their edit on the live site the moment they hit Save. `revalidatePath`
 * covers the very first publish, when no tagged cache entry exists yet because the build
 * fell back to the static catalogue — `updateTag` alone would silently do nothing there.
 */
function expireCatalog(kind: CatalogKind) {
  updateTag(CATALOG_TAGS[kind]);
  revalidatePath("/");
}

export async function saveRow(
  kind: CatalogKind,
  id: string | null,
  values: Record<string, unknown>
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const table = TABLES[kind];
    if (!table) return { ok: false, error: `Unknown product type: ${kind}` };

    const supabase = await createClient();

    if (id) {
      const { error } = await supabase.from(table).update(values).eq("id", id);
      if (error) return { ok: false, error: describe(error) };
    } else {
      const { error } = await supabase.from(table).insert(values);
      if (error) return { ok: false, error: describe(error) };
    }

    expireCatalog(kind);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: describe(error) };
  }
}

export async function deleteRow(kind: CatalogKind, id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const table = TABLES[kind];
    if (!table) return { ok: false, error: `Unknown product type: ${kind}` };

    const supabase = await createClient();

    // Delete the Storage objects first — the database does not cascade into the bucket,
    // so doing it the other way round orphans the files forever.
    const { data: row } = await supabase.from(table).select("images").eq("id", id).single();
    const paths = (row?.images as { path?: string | null }[] | undefined)
      ?.map((image) => image.path)
      .filter((path): path is string => Boolean(path));

    if (paths && paths.length > 0) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(paths);
    }

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { ok: false, error: describe(error) };

    expireCatalog(kind);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: describe(error) };
  }
}

export async function reorderRows(
  kind: CatalogKind,
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const table = TABLES[kind];
    if (!table) return { ok: false, error: `Unknown product type: ${kind}` };

    const supabase = await createClient();

    // Gaps of 10 so inserting a single row between two others needs no renumbering.
    for (const [index, id] of orderedIds.entries()) {
      const { error } = await supabase
        .from(table)
        .update({ sort_order: (index + 1) * 10 })
        .eq("id", id);
      if (error) return { ok: false, error: describe(error) };
    }

    expireCatalog(kind);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: describe(error) };
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin-product/login");
}
