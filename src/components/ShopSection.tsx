"use client";

import { useEffect, useRef, useState } from "react";
import ShopProductCard from "./ShopProductCard";
import ShopProductModal from "./ShopProductModal";
import { SHOP_PRODUCTS, type ShopProduct } from "@/data/shopProducts";

/**
 * Figma 36:1100 carries blur(11px) on the card instance itself at its 187.53px width, so
 * the blur is held proportional to the card as rendered rather than pinned to 11px — a
 * ~380px desktop card needs roughly twice that to read as equally soft.
 */
const BLUR_RATIO = 11 / 187.53;
const MIN_SCALE = 0.96;
const MIN_OPACITY = 0.65;

/**
 * How far (as a fraction of half the viewport) a card's centre may stray from the middle
 * of the screen before it starts defocusing. Measured from the centre rather than from the
 * viewport edges the way CtaBannerSection does it: that card is 815 of 900px tall, so its
 * top edge is a fair proxy for the whole thing, whereas these cards are a third of the
 * screen and an edge ramp would never let a row settle. Centre distance also means a whole
 * grid row sharpens and blurs together, which is what the node shows.
 */
const SHARP_ZONE = 0.4;

export default function ShopSection() {
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Cards arrive out of focus, sharpen as they reach the middle of the screen and pull
  // back out of focus on their way past. Written straight to style inside rAF so scrolling
  // never re-renders the grid.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;

    const clear = (card: HTMLDivElement) => {
      card.style.filter = "";
      card.style.transform = "";
      card.style.opacity = "";
    };

    const apply = () => {
      frame = null;
      const half = window.innerHeight / 2;
      if (half === 0) return;

      for (const card of cardsRef.current) {
        if (!card) continue;
        if (reduced.matches) {
          clear(card);
          continue;
        }

        const rect = card.getBoundingClientRect();
        // Scaling about the centre leaves the centre where it is, so this stays stable
        // even while the card is mid-transform.
        const offset = Math.abs(rect.top + rect.height / 2 - half) / half;
        const defocus = Math.min(
          Math.max((offset - SHARP_ZONE) / (1 - SHARP_ZONE), 0),
          1
        );

        if (defocus === 0) {
          clear(card);
          continue;
        }

        // offsetWidth, not rect.width: the rect is already scaled down by the transform
        // below, which would feed back into the blur radius.
        const radius = defocus * card.offsetWidth * BLUR_RATIO;
        card.style.filter = `blur(${radius.toFixed(1)}px)`;
        card.style.transform = `scale(${(1 - defocus * (1 - MIN_SCALE)).toFixed(3)})`;
        card.style.opacity = `${(1 - defocus * (1 - MIN_OPACITY)).toFixed(3)}`;
      }
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduced.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduced.removeEventListener("change", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="shop"
      className="relative isolate flex min-h-svh scroll-mt-[var(--header-height,84px)] flex-col justify-center bg-[#241109]"
    >

      <div className="relative mx-auto max-w-[1728px] px-6 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20 2xl:px-14">
        <h2
          className="text-center text-3xl text-[#F1D9C1] sm:text-4xl lg:text-[2.5rem]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          Our Products
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:mt-14 xl:grid-cols-4 xl:gap-x-8">
          {SHOP_PRODUCTS.map((product, index) => (
            // The defocus lives on a wrapper rather than on the card: the card owns
            // `transform` for its hover scale, and a filter on it would clip the
            // "learn more" reveal into its own stacking context.
            <div
              key={product.slug}
              ref={(node) => {
                cardsRef.current[index] = node;
              }}
              className="h-full w-full will-change-[filter,transform,opacity]"
            >
              <ShopProductCard product={product} onSelect={setSelectedProduct} />
            </div>
          ))}
        </div>
      </div>

      <ShopProductModal
        key={selectedProduct?.slug ?? "closed"}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
