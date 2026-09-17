import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession, getAuthUser } from "@/lib/admin/auth";
import AdminShell from "./_components/AdminShell";
import SetupNotice from "./_components/SetupNotice";
import ReorderableList, { type ListRow } from "./_components/ReorderableList";
import NoAccess from "./_components/NoAccess";
import type { CatalogKind } from "@/lib/catalog/types";

export const metadata = { title: "Product admin", robots: { index: false, follow: false } };
// Always read live rows — an admin list must never be served from a cache.
export const dynamic = "force-dynamic";

const GROUPS: { kind: CatalogKind; table: string; label: string; blurb: string; nameColumn: string }[] = [
  {
    kind: "products",
    table: "products",
    label: "Signature curations",
    blurb: "The “Impress Your Team And Clients” grid.",
    nameColumn: "name",
  },
  {
    kind: "shop-products",
    table: "shop_products",
    label: "Shop products",
    blurb: "The “Our Products” grid, with size options.",
    nameColumn: "name",
  },
  {
    kind: "addons",
    table: "addons",
    label: "Add-ons",
    blurb: "The “Add-ons: The Finishing Touch” row.",
    nameColumn: "title",
  },
];

type Row = {
  id: string;
  slug: string;
  name?: string;
  title?: string;
  images: { url: string }[];
  is_published: boolean;
  sort_order: number;
};

export default async function AdminProductPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  // Two distinct states: not signed in at all (go to login) versus signed in but not on
  // the allowlist (explain it). Redirecting the second case to /login would loop, since
  // the proxy sends anyone with a valid session back here.
  const user = await getAuthUser();
  if (!user) redirect("/admin-product/login");

  const session = await getAdminSession();
  if (!session) return <NoAccess email={user.email ?? ""} />;

  const supabase = await createClient();
  const groups = await Promise.all(
    GROUPS.map(async (group) => {
      const { data, error } = await supabase
        .from(group.table)
        .select(`id,slug,${group.nameColumn},images,is_published,sort_order`)
        .order("sort_order", { ascending: true });
      return { ...group, rows: (data ?? []) as unknown as Row[], error: error?.message ?? null };
    })
  );

  return (
    <AdminShell email={session.email}>
      <main className="mx-auto max-w-5xl px-5 py-10">
        {groups.map((group) => (
          <section key={group.kind} className="mb-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  className="text-2xl text-[#F1D9C1]"
                  style={{ fontFamily: "var(--font-serif-display)" }}
                >
                  {group.label}
                </h2>
                <p className="mt-1 text-sm text-white/50">{group.blurb}</p>
              </div>
              <Link
                href={`/admin-product/${group.kind}/new`}
                className="rounded-lg bg-[#C5A880] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#140D0A] transition-colors hover:bg-[#d4b992]"
              >
                Add new
              </Link>
            </div>

            {group.error && (
              <p role="alert" className="mt-4 rounded-lg bg-[#3a1b16] p-3 text-sm text-[#E8B4A0]">
                {group.error} — have you run the migrations in supabase/migrations?
              </p>
            )}

            <ReorderableList
              kind={group.kind}
              rows={group.rows.map(
                (row): ListRow => ({
                  id: row.id,
                  slug: row.slug,
                  label: row.name ?? row.title ?? "Untitled",
                  image: row.images?.[0]?.url ?? "",
                  isPublished: row.is_published,
                })
              )}
            />
          </section>
        ))}
      </main>
    </AdminShell>
  );
}
