"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { PRODUCTS, type Product } from "@/data/products";

/**
 * Timing measured off the client's screen recording: the centre card is already
 * parked while the outer two are still climbing, and the whole move takes about a
 * second. Delay is keyed to how far a card sits from the middle of its row, so the
 * centre leads and the edges follow — at one column everything is centred and the
 * stagger collapses to nothing on its own.
 */
const RISE_MS = 700;
const OUTER_DELAY_MS = 400;

export default function ProductsSection() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);

  // Cards rise into place the first time the grid comes into view, then stay put —
  // the observer disconnects so scrolling back up does not replay it.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        // Measure the columns rather than assuming three: the grid is 1/2/3 wide
        // across breakpoints, and the laid-out positions already know which.
        const gridBox = grid.getBoundingClientRect();
        const centre = gridBox.left + gridBox.width / 2;
        const offsets = Array.from(grid.children).map((child) => {
          const box = child.getBoundingClientRect();
          return Math.abs(box.left + box.width / 2 - centre);
        });
        const widest = Math.max(...offsets, 1);

        setDelays(offsets.map((o) => Math.round((o / widest) * OUTER_DELAY_MS)));
        setRevealed(true);
      },
      // Fire on the grid's top edge reaching the lower part of the screen, NOT on a
      // fraction of the grid being visible: the grid is taller than the viewport (one
      // column on a phone makes it ~3250px), so a ratio threshold needs more of it on
      // screen than can ever fit, and the cards stay hidden.
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="corporate-gifting"
      className="relative isolate flex min-h-svh scroll-mt-[var(--header-height,84px)] flex-col justify-center overflow-hidden bg-[#AC9D93]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(60%_50%_at_50%_30%,#E3DDD9_0%,transparent_70%)]"
      />


      <div className="relative mx-auto max-w-[1728px] px-6 pb-16 pt-[calc(var(--header-height,84px)+0.75rem)] sm:px-10 sm:pb-20 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20 2xl:px-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <h2
              className="text-3xl leading-[1.3] text-[#EFE9E0] sm:text-4xl lg:text-4xl 2xl:text-5xl"
              style={{ fontFamily: "var(--font-serif-display)" }}
            >
              Impress Your Team
              <br />
              <em className="italic">And Clients.</em>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#EFE9E0]/80 sm:text-base lg:text-lg">
              We provide the elegance of luxury gifting with the ease of a
              founder-led team.
            </p>
          </div>

          <div className="max-w-md lg:text-right">
            <p
              className="italic leading-[1.35] text-[#E9DFD6]"
              style={{ fontFamily: "var(--font-serif-display)" }}
            >
              <span className="text-lg sm:text-xl lg:text-2xl">
                Have a specific quantity or custom request in mind?
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#EFE9E0]/80 sm:text-base lg:text-lg">
              Our team will tailor your order and confirm the details as soon
              as we can.
            </p>
            <a
              href="#contact"
              className="mt-4 inline-flex items-center justify-center rounded-[14px] bg-[#4F2B1C]/[0.86] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#F0E7DE] transition-colors hover:bg-[#4F2B1C]"
            >
              Submit Inquiry
            </a>
          </div>
        </div>

        {/* The cards start hidden so the entrance has somewhere to come from, which
            would strand them at opacity 0 if the observer never runs. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>.card-reveal{opacity:1;translate:none}</style>",
          }}
        />

        <div
          ref={gridRef}
          className="mt-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3 xl:gap-8"
        >
          {PRODUCTS.map((product, index) => (
            // The reveal lives on a wrapper, not on the card: the card already owns
            // `transform` for its 150ms hover lift, and a 500ms entrance on the same
            // property would drag that out. `flex` keeps the card stretching to the
            // row height the way it did when it was the grid item itself.
            <div
              key={product.slug}
              className={`card-reveal flex w-full justify-center transition ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                revealed ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}
              style={{
                transitionDuration: `${RISE_MS}ms`,
                transitionDelay: revealed ? `${delays[index] ?? 0}ms` : "0ms",
              }}
            >
              <ProductCard product={product} onSelect={setSelectedProduct} />
            </div>
          ))}
        </div>
      </div>

      <ProductDetailModal
        key={selectedProduct?.slug ?? "closed"}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
