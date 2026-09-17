"use client";

import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import ProductsSection from "@/components/ProductsSection";
import ShopSection from "@/components/ShopSection";
import AddonsSection from "@/components/AddonsSection";
import ProductDetailModal from "@/components/ProductDetailModal";
import ShopProductModal from "@/components/ShopProductModal";
import {
  PLACEHOLDER_IMAGE,
  PREVIEW_ORIGIN_TAG,
  isPreviewMessage,
  type PreviewDraft,
  type PreviewView,
} from "@/lib/admin/preview-protocol";

/**
 * The live-preview target. Loaded in fixed-width iframes by the editor so that the real
 * viewport media queries evaluate at phone and desktop widths, and fed the in-progress
 * draft over postMessage.
 *
 * It renders the REAL section components with a single-item catalogue, so what the team
 * sees is production markup and production CSS, not a mock that can drift.
 */
/**
 * A draft legitimately has no photos until the first upload finishes, but every card
 * renders images[0] unconditionally — correctly, since the database enforces
 * images_nonempty on saved rows. Normalising at this render boundary (rather than in the
 * editor that sends the message) means a stale editor tab, or any future caller of this
 * route, still cannot push an empty list into a live component.
 *
 * The `kind` literals are repeated per branch on purpose: spreading `...payload` widens
 * the discriminated union and the components stop type-checking.
 */
function withPhoto(payload: PreviewDraft): PreviewDraft {
  if (payload.kind === "addons") {
    return {
      kind: "addons",
      draft: { ...payload.draft, image: payload.draft.image || PLACEHOLDER_IMAGE },
    };
  }
  const images =
    payload.draft.images.length > 0 ? payload.draft.images : [PLACEHOLDER_IMAGE];
  return payload.kind === "products"
    ? { kind: "products", draft: { ...payload.draft, images } }
    : { kind: "shop-products", draft: { ...payload.draft, images } };
}

export default function AdminPreviewPage() {
  const [state, setState] = useState<{ payload: PreviewDraft; view: PreviewView } | null>(
    null
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Same-origin only: this is a first-party route, so anything from elsewhere is
      // not ours. (No sandbox attribute on the iframe — an opaque origin would break
      // both this check and /_next/image.)
      if (event.origin !== window.location.origin) return;
      if (!isPreviewMessage(event.data) || event.data.type !== "draft") return;
      const { view, ...payload } = event.data;
      setState({ payload: payload as unknown as PreviewDraft, view });
    };

    window.addEventListener("message", onMessage);
    // Tell the editor we are mounted and ready for the first draft.
    window.parent?.postMessage({ tag: PREVIEW_ORIGIN_TAG, type: "ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Guard at the render boundary, not at the sender. A draft legitimately has no photos
  // until the first upload finishes, but every card renders images[0] unconditionally —
  // correctly, since the DB enforces images_nonempty on saved rows. Normalising here
  // rather than in the editor means a stale editor tab, or any future caller of this
  // route, cannot push an empty list into a live component.
  if (!state) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#AC9D93] text-sm text-white/70">
        Waiting for the editor…
      </div>
    );
  }

  const { view } = state;
  const payload = withPhoto(state.payload);
  const noop = () => {};

  return (
    <>
      {/* SiteHeader publishes the measured --header-height that ProductsSection pads
          against; without it the preview silently drifts from production spacing. */}
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        {payload.kind === "products" &&
          (view === "detail" ? (
            <ProductDetailModal product={payload.draft} onClose={noop} />
          ) : (
            <ProductsSection products={[payload.draft]} />
          ))}

        {payload.kind === "shop-products" &&
          (view === "detail" ? (
            <ShopProductModal product={payload.draft} onClose={noop} />
          ) : (
            <ShopSection products={[payload.draft]} />
          ))}

        {payload.kind === "addons" && <AddonsSection addons={[payload.draft]} />}
      </main>
    </>
  );
}
