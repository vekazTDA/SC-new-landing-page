"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Minus, Plus, Star, X } from "lucide-react";
import type { Product } from "@/data/products";

export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(product?.defaultQuantity ?? 1);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B120B]/80 p-4 sm:p-8 lg:p-20"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full max-w-[1080px] flex-col gap-8 overflow-y-auto rounded-3xl border border-white/25 bg-[#F9F6F0]/90 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] sm:p-8 lg:flex-row lg:gap-12 lg:p-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E7DE]/50 text-[#261C15] transition-colors hover:bg-[#F0E7DE] sm:right-6 sm:top-6"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-5 lg:w-[480px] lg:shrink-0">
          <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-[#D8CDC4] sm:h-[380px]">
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 480px, 90vw"
              className="object-cover"
              priority
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.slice(1).map((src, thumbIndex) => {
                const index = thumbIndex + 1;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    className="relative h-[70px] flex-1 overflow-hidden rounded-lg sm:h-[88px]"
                    style={{
                      outline: index === activeImage ? "2px solid #C59B78" : "none",
                      outlineOffset: "1px",
                    }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-6 lg:gap-7">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#76655A]">
                {product.eyebrow}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#C59B78]" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#C59B78]">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <h2
              id="product-modal-title"
              className="text-3xl font-medium leading-[1.1] text-[#261C15] sm:text-4xl"
            >
              {product.name}
            </h2>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-3.5 w-3.5 fill-[#C59B78] text-[#C59B78]"
                />
              ))}
              <span className="ml-1 text-[13px] text-[#76655A]">
                {product.rating} ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#261C15]">
              {product.price}
            </span>
            <span className="text-[13px] text-[#76655A]">{product.priceUnit}</span>
          </div>

          <p className="whitespace-pre-line text-sm leading-relaxed text-[#76655A]">
            {product.description}
          </p>

          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#261C15]">
              Quantity
            </span>
            <div className="flex h-16 items-center rounded-2xl border-2 border-[#C59B78] bg-[#2E1E17]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-16 w-16 shrink-0 items-center justify-center"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C59B78] bg-[#3D2A1F] text-[#C59B78]">
                  <Minus className="h-4 w-4" />
                </span>
              </button>

              <span className="h-9 w-px shrink-0 bg-[#C59B78]/25" />

              <span className="flex-1 text-center text-2xl font-semibold text-white">
                {quantity}
              </span>

              <span className="h-9 w-px shrink-0 bg-[#C59B78]/25" />

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-16 w-16 shrink-0 items-center justify-center"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C59B78] text-[#2E1E17]">
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>

          <a
            href="#contact"
            onClick={onClose}
            className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[#C59B78] bg-[#211610] px-8 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#2E1E17]"
          >
            Submit Inquiry
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
