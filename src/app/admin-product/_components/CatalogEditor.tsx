"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteRow, saveRow } from "../actions";
import ImageManager from "./ImageManager";
import PreviewPane from "./PreviewPane";
import SizeOptionsEditor from "./SizeOptionsEditor";
import { Field, NumberField, Toggle, inputClass } from "./fields";
import { toAddon, toProduct, toShopProduct } from "@/lib/catalog/mappers";
import type { CatalogKind, ImageEntry, SizeOptionRow } from "@/lib/catalog/types";
import type { PreviewDraft, PreviewView } from "@/lib/admin/preview-protocol";

export type Draft = {
  id: string | null;
  slug: string;
  images: ImageEntry[];
  is_published: boolean;
  sort_order: number;
  name: string;
  title: string;
  eyebrow: string;
  description: string;
  price_amount: number;
  price_display: string;
  price_unit: string;
  in_stock: boolean;
  rating: number;
  review_count: number;
  default_quantity: number;
  price: number;
  modal_description: string;
  size_options: SizeOptionRow[] | null;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Build the public-facing object the real components consume, from the draft row. */
function toPreviewPayload(kind: CatalogKind, draft: Draft): PreviewDraft {
  if (kind === "products") {
    return {
      kind,
      draft: toProduct({
        id: draft.id ?? "draft",
        slug: draft.slug || "draft",
        name: draft.name || "Untitled",
        eyebrow: draft.eyebrow,
        description: draft.description,
        images: draft.images,
        price_amount: draft.price_amount,
        price_display: draft.price_display || null,
        price_unit: draft.price_unit,
        in_stock: draft.in_stock,
        rating: draft.rating,
        review_count: draft.review_count,
        default_quantity: draft.default_quantity,
        sort_order: draft.sort_order,
        is_published: draft.is_published,
      }),
    };
  }
  if (kind === "shop-products") {
    return {
      kind,
      draft: toShopProduct({
        id: draft.id ?? "draft",
        slug: draft.slug || "draft",
        name: draft.name || "Untitled",
        price: draft.price,
        images: draft.images,
        modal_description: draft.modal_description || null,
        size_options: draft.size_options,
        rating: draft.rating,
        review_count: draft.review_count,
        sort_order: draft.sort_order,
        is_published: draft.is_published,
      }),
    };
  }
  return {
    kind: "addons",
    draft: toAddon({
      id: draft.id ?? "draft",
      slug: draft.slug || "draft",
      title: draft.title || "Untitled",
      price: draft.price,
      description: draft.description,
      images: draft.images,
      sort_order: draft.sort_order,
      is_published: draft.is_published,
    }),
  };
}

/** Only the columns that exist on this kind's table — extras would fail the insert. */
function toRow(kind: CatalogKind, draft: Draft): Record<string, unknown> {
  const shared = {
    slug: draft.slug,
    images: draft.images,
    is_published: draft.is_published,
    sort_order: draft.sort_order,
  };
  if (kind === "products") {
    return {
      ...shared,
      name: draft.name,
      eyebrow: draft.eyebrow,
      description: draft.description,
      price_amount: draft.price_amount,
      price_display: draft.price_display.trim() || null,
      price_unit: draft.price_unit,
      in_stock: draft.in_stock,
      rating: draft.rating,
      review_count: draft.review_count,
      default_quantity: draft.default_quantity,
    };
  }
  if (kind === "shop-products") {
    return {
      ...shared,
      name: draft.name,
      price: draft.price,
      modal_description: draft.modal_description.trim() || null,
      size_options: draft.size_options?.length ? draft.size_options : null,
      rating: draft.rating,
      review_count: draft.review_count,
    };
  }
  return {
    ...shared,
    title: draft.title,
    price: draft.price,
    description: draft.description,
  };
}

function validate(kind: CatalogKind, draft: Draft): string | null {
  if (!draft.slug) return "A URL slug is required.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug))
    return "The slug may only contain lowercase letters, numbers and single hyphens.";
  if (draft.images.length === 0) return "Add at least one photo.";
  if (kind === "addons" && !draft.title.trim()) return "A title is required.";
  if (kind !== "addons" && !draft.name.trim()) return "A name is required.";
  if (kind === "products" && !draft.description.trim()) return "A description is required.";
  if (kind === "addons" && !draft.description.trim()) return "A description is required.";
  if (kind === "shop-products" && draft.size_options) {
    const popular = draft.size_options.filter((option) => option.badge === "Popular");
    if (popular.length > 1) return "Only one size can be marked Popular.";
    if (draft.size_options.some((option) => !option.label.trim()))
      return "Every size option needs a label.";
  }
  return null;
}

const TITLES: Record<CatalogKind, string> = {
  products: "Signature curation",
  "shop-products": "Shop product",
  addons: "Add-on",
};

export default function CatalogEditor({
  kind,
  initial,
}: {
  kind: CatalogKind;
  initial: Draft;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial);
  const [view, setView] = useState<PreviewView>("card");
  const [status, setStatus] = useState<{ kind: "error" | "saved"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setStatus(null);
  };

  // Slug follows the name until someone edits it by hand, then it stays put — renaming a
  // live product should not silently change its URL.
  const setDisplayName = (value: string) => {
    setDraft((previous) => ({
      ...previous,
      ...(kind === "addons" ? { title: value } : { name: value }),
      ...(slugTouched ? {} : { slug: slugify(value) }),
    }));
    setStatus(null);
  };

  const payload = useMemo(() => toPreviewPayload(kind, draft), [kind, draft]);
  const displayName = kind === "addons" ? draft.title : draft.name;

  const onSave = async () => {
    const problem = validate(kind, draft);
    if (problem) {
      setStatus({ kind: "error", text: problem });
      return;
    }
    setBusy(true);
    const result = await saveRow(kind, draft.id, toRow(kind, draft));
    setBusy(false);

    if (!result.ok) {
      setStatus({ kind: "error", text: result.error });
      return;
    }
    setStatus({ kind: "saved", text: "Saved and published to the live site." });
    router.refresh();
    if (!draft.id) router.replace("/admin-product");
  };

  const onDelete = async () => {
    if (!draft.id) return;
    if (!window.confirm(`Delete “${displayName}”? This cannot be undone.`)) return;
    setBusy(true);
    const result = await deleteRow(kind, draft.id);
    setBusy(false);
    if (!result.ok) {
      setStatus({ kind: "error", text: result.error });
      return;
    }
    router.replace("/admin-product");
  };

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin-product" className="text-xs text-white/45 hover:text-white">
            ‹ All products
          </Link>
          <h1
            className="mt-1 text-2xl text-[#F1D9C1]"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            {draft.id ? displayName || "Untitled" : `New ${TITLES[kind].toLowerCase()}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {draft.id && (
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={busy}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8B4A0] transition-colors hover:border-[#E8B4A0] disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={busy}
            className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#140D0A] transition-colors hover:bg-[#d4b992] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`mb-5 rounded-lg p-3 text-sm ${
            status.kind === "error" ? "bg-[#3a1b16] text-[#E8B4A0]" : "bg-[#1d2c1d] text-[#B5D8A8]"
          }`}
        >
          {status.text}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Field label={kind === "addons" ? "Title" : "Name"}>
            <input
              className={inputClass}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </Field>

          <Field label="URL slug" hint="Lowercase, hyphens only. Changing it changes the product's address.">
            <input
              className={inputClass}
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set("slug", slugify(event.target.value));
              }}
            />
          </Field>

          {kind === "products" && (
            <Field label="Eyebrow" hint="Small label above the name in the detail view.">
              <input
                className={inputClass}
                value={draft.eyebrow}
                onChange={(event) => set("eyebrow", event.target.value)}
              />
            </Field>
          )}

          {kind !== "shop-products" && (
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={draft.description}
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>
          )}

          {kind === "shop-products" && (
            <Field label="Detail description" hint="Shown in the pop-up when a shopper opens this product.">
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={draft.modal_description}
                onChange={(event) => set("modal_description", event.target.value)}
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Price"
              prefix="$"
              value={kind === "products" ? draft.price_amount : draft.price}
              onChange={(value) => set(kind === "products" ? "price_amount" : "price", value)}
            />

            {kind === "products" && (
              <Field label="Price unit">
                <input
                  className={inputClass}
                  value={draft.price_unit}
                  onChange={(event) => set("price_unit", event.target.value)}
                />
              </Field>
            )}
          </div>

          {kind === "products" && (
            <>
              <Field
                label="Price override"
                hint="Leave empty to show the price above. Anything typed here is used verbatim, including in inquiry emails."
              >
                <input
                  className={inputClass}
                  placeholder="e.g. From $19"
                  value={draft.price_display}
                  onChange={(event) => set("price_display", event.target.value)}
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <NumberField
                  label="Rating"
                  value={draft.rating}
                  max={5}
                  onChange={(value) => set("rating", value)}
                />
                <NumberField
                  label="Reviews"
                  value={draft.review_count}
                  integer
                  onChange={(value) => set("review_count", value)}
                />
                <NumberField
                  label="Default qty"
                  value={draft.default_quantity}
                  integer
                  min={1}
                  onChange={(value) => set("default_quantity", value)}
                />
              </div>

              <Toggle
                label="In stock"
                checked={draft.in_stock}
                onChange={(value) => set("in_stock", value)}
                hint="Unchecking shows an out-of-stock state in the detail view."
              />
            </>
          )}

          {kind === "shop-products" && (
            <SizeOptionsEditor
              options={draft.size_options}
              onChange={(options) => set("size_options", options)}
            />
          )}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
              Photos
            </p>
            <ImageManager
              images={draft.images}
              slug={draft.slug}
              onChange={(images) => set("images", images)}
            />
          </div>

          <Toggle
            label="Published"
            checked={draft.is_published}
            onChange={(value) => set("is_published", value)}
            hint="Unpublished products stay hidden on the public site but remain here."
          />
        </div>

        <PreviewPane payload={payload} view={view} onViewChange={setView} />
      </div>
    </main>
  );
}
