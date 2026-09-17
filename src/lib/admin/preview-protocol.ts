import type { Product } from "@/data/products";
import type { ShopProduct } from "@/data/shopProducts";
import type { Addon } from "@/data/addons";
import type { CatalogKind } from "@/lib/catalog/types";

/**
 * Messages the admin editor posts into the preview iframe.
 *
 * An iframe is not a stylistic choice here — it is required. The cards are laid out by
 * Tailwind `sm:`/`xl:` variants, which compile to viewport media queries, plus `svh`
 * units and JS that reads `window.innerHeight`. Rendering them in a narrow <div> would
 * still evaluate every desktop breakpoint. Only a real nested browsing context has its
 * own viewport, so only an iframe shows the true mobile layout.
 */
export const PREVIEW_ORIGIN_TAG = "sc-admin-preview";

/** Stand-in shown while a draft still has no photos. Never written to the database. */
export const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";

export type PreviewView = "card" | "detail";

export type PreviewDraft =
  | { kind: "products"; draft: Product }
  | { kind: "shop-products"; draft: ShopProduct }
  | { kind: "addons"; draft: Addon };

export type PreviewMessage =
  | ({ tag: typeof PREVIEW_ORIGIN_TAG; type: "draft"; view: PreviewView } & PreviewDraft)
  | { tag: typeof PREVIEW_ORIGIN_TAG; type: "ready" };

export function isPreviewMessage(value: unknown): value is PreviewMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { tag?: unknown }).tag === PREVIEW_ORIGIN_TAG
  );
}

export type { CatalogKind };
