"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { PRODUCTS, type Product } from "@/data/products";

export default function ProductsSection() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <section className="relative isolate overflow-hidden bg-[#AC9D93]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(60%_50%_at_50%_30%,#E3DDD9_0%,transparent_70%)]"
      />


      <div className="relative mx-auto max-w-[1728px] px-6 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20 2xl:px-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <h2
              className="text-3xl leading-[1.3] text-black sm:text-4xl lg:text-4xl 2xl:text-5xl"
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
              className="mt-4 inline-flex items-center justify-center rounded-[14px] border border-[#F0E7DE] bg-[#4F2B1C]/[0.86] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#F0E7DE] transition-colors hover:bg-[#4F2B1C]"
            >
              Submit Inquiry
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3 xl:gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              onSelect={setSelectedProduct}
            />
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
