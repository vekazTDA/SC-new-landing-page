import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession, getAuthUser } from "@/lib/admin/auth";
import AdminShell from "../../_components/AdminShell";
import SetupNotice from "../../_components/SetupNotice";
import NoAccess from "../../_components/NoAccess";
import CatalogEditor, { type Draft } from "../../_components/CatalogEditor";
import type { CatalogKind } from "@/lib/catalog/types";

export const metadata = { title: "Edit product", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TABLES: Record<CatalogKind, string> = {
  products: "products",
  "shop-products": "shop_products",
  addons: "addons",
};

const BLANK: Draft = {
  id: null,
  slug: "",
  images: [],
  is_published: true,
  sort_order: 999,
  name: "",
  title: "",
  eyebrow: "Signature Curation",
  description: "",
  price_amount: 0,
  price_display: "",
  price_unit: "/ tier base price",
  in_stock: true,
  rating: 4.9,
  review_count: 1232,
  default_quantity: 50,
  price: 0,
  modal_description: "",
  size_options: null,
};

function isKind(value: string): value is CatalogKind {
  return value === "products" || value === "shop-products" || value === "addons";
}

export default async function EditProductPage({
  params,
}: {
  // params is a Promise in Next 16 — synchronous access was removed.
  params: Promise<{ kind: string; id: string }>;
}) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const user = await getAuthUser();
  if (!user) redirect("/admin-product/login");

  const session = await getAdminSession();
  if (!session) return <NoAccess email={user.email ?? ""} />;

  const { kind, id } = await params;
  if (!isKind(kind)) notFound();

  let initial: Draft = { ...BLANK };

  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase.from(TABLES[kind]).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();

    const row = data as Record<string, unknown>;
    const pick = <T,>(key: string, fallback: T): T =>
      row[key] === null || row[key] === undefined ? fallback : (row[key] as T);
    const numeric = (key: string, fallback: number) => {
      const value = row[key];
      if (value === null || value === undefined) return fallback;
      return typeof value === "number" ? value : Number.parseFloat(String(value));
    };

    initial = {
      ...BLANK,
      id: String(row.id),
      slug: pick("slug", ""),
      images: pick("images", []),
      is_published: pick("is_published", true),
      sort_order: numeric("sort_order", 999),
      name: pick("name", ""),
      title: pick("title", ""),
      eyebrow: pick("eyebrow", BLANK.eyebrow),
      description: pick("description", ""),
      price_amount: numeric("price_amount", 0),
      price_display: pick("price_display", ""),
      price_unit: pick("price_unit", BLANK.price_unit),
      in_stock: pick("in_stock", true),
      rating: numeric("rating", BLANK.rating),
      review_count: numeric("review_count", BLANK.review_count),
      default_quantity: numeric("default_quantity", BLANK.default_quantity),
      price: numeric("price", 0),
      modal_description: pick("modal_description", ""),
      size_options: pick("size_options", null),
    };
  }

  return (
    <AdminShell email={session.email}>
      <CatalogEditor kind={kind} initial={initial} />
    </AdminShell>
  );
}
