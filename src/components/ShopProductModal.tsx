"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Star, X } from "lucide-react";
import type { ShopProduct } from "@/data/shopProducts";
import { SHOP_RATING } from "@/data/shopProducts";

export default function ShopProductModal({
  product,
  onClose,
}: {
  product: ShopProduct | null;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    () => product?.sizeOptions?.findIndex((o) => o.badge === "Popular") ?? 0
  );

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

  const size = product.sizeOptions?.[selectedSize];
  const displayPrice = size?.price ?? product.price;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#241109]/85 p-4 sm:p-8 lg:p-20"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full max-w-[980px] flex-col gap-8 overflow-y-auto rounded-3xl bg-[#EAE5DE] p-6 shadow-[0px_24px_48px_0px_rgba(18,8,4,0.3)] max-h-[90vh] sm:p-8 lg:flex-row lg:gap-10 lg:p-10"
      >
        <div className="flex flex-col gap-4 lg:w-[420px] lg:shrink-0">
          <div className="relative h-[280px] w-full overflow-hidden rounded-2xl sm:h-[400px]">
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 420px, 90vw"
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
                    className="relative h-[70px] flex-1 overflow-hidden rounded-lg"
                    style={{
                      outline: index === activeImage ? "2px solid #321E14" : "none",
                      outlineOffset: "1px",
                    }}
                  >
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-7">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8C7E74]">
                sugar coated
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1B7A5C]">
                • In Stock
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D0C8BF] bg-white/20 text-[#1C1826] transition-colors hover:bg-white/40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h2 id="shop-modal-title" className="text-3xl font-semibold leading-tight text-[#1C1826] sm:text-[2.25rem]">
              {product.name}
            </h2>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-[#E09E53] text-[#E09E53]" />
              ))}
              <span className="ml-1 text-[13px] font-medium text-[#4D433A]">
                {SHOP_RATING.rating} ({SHOP_RATING.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1C1826]">
              ${displayPrice.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-[#8C7E74]">/ tier base price</span>
          </div>

          {product.modalDescription && (
            <p className="text-[15px] leading-relaxed text-[#4D433A]">
              {product.modalDescription}
            </p>
          )}

          {product.sizeOptions && (
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8C7E74]">
                Select Size
              </span>
              <div className="flex gap-3">
                {product.sizeOptions.map((option, index) => {
                  const isSelected = index === selectedSize;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSelectedSize(index)}
                      className={
                        "flex flex-1 flex-col items-center gap-1.5 rounded-xl px-4 py-3.5 transition-colors " +
                        (isSelected
                          ? "bg-[#321E14] text-white"
                          : "border border-[#D0C8BF] bg-transparent text-[#1C1826] hover:border-[#8C7E74]")
                      }
                    >
                      {option.badge && (
                        <span
                          className={
                            "rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] " +
                            (isSelected
                              ? "bg-white/10 text-white"
                              : "bg-[#1C1826]/5 text-[#8C7E74]")
                          }
                        >
                          {option.badge}
                        </span>
                      )}
                      <span className="text-sm font-bold">{option.label}</span>
                      <span
                        className={
                          "text-xs font-medium " + (isSelected ? "text-white/80" : "text-[#8C7E74]")
                        }
                      >
                        ${option.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <a
            href="#contact"
            onClick={onClose}
            className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[#C59B78] bg-[#211610] px-8 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#321E14]"
          >
            Submit Inquiry
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
