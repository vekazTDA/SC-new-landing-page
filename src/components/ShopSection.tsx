"use client";

import { useState } from "react";
import ShopProductCard from "./ShopProductCard";
import ShopProductModal from "./ShopProductModal";
import { SHOP_PRODUCTS, type ShopProduct } from "@/data/shopProducts";

export default function ShopSection() {
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-[#241109]">

      <div className="relative mx-auto max-w-[1728px] px-6 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20 2xl:px-14">
        <h2
          className="text-center text-3xl text-[#F1D9C1] sm:text-4xl lg:text-[2.5rem]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          Our Products
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:mt-14 xl:grid-cols-4 xl:gap-x-8">
          {SHOP_PRODUCTS.map((product) => (
            <ShopProductCard
              key={product.slug}
              product={product}
              onSelect={setSelectedProduct}
            />
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
