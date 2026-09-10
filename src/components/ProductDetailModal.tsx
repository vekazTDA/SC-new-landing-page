"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Minus, Plus, Star, X } from "lucide-react";
import type { Product } from "@/data/products";
import { submitWeb3Form } from "@/lib/web3forms";

const FIELD_CLASS =
  "w-full rounded-xl border border-[#D8CDC4] bg-white/70 px-3.5 py-2.5 text-sm text-[#261C15] outline-none transition-colors placeholder:text-[#76655A]/70 focus:border-[#C59B78]";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const formId = useId();
  const [activeImage, setActiveImage] = useState(0);
  const [quantityInput, setQuantityInput] = useState(
    String(product?.defaultQuantity ?? 1)
  );
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const quantity = Math.max(1, Number.parseInt(quantityInput, 10) || 1);

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

  const setQuantity = (next: number) => {
    setQuantityInput(String(Math.max(1, next)));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("gift", product.name);
    formData.set("quantity", String(quantity));
    formData.set("price", product.price);
    formData.set("source", "Product detail modal");

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      await submitWeb3Form(formData, {
        extras: {
          subject: `Product inquiry: ${product.name}`,
          from_name: "Sugar Coated Landing",
        },
      });
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[#1B120B]/80"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 py-6 sm:p-8 lg:p-20">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          onClick={(event) => event.stopPropagation()}
          className="relative flex w-full max-w-[1080px] flex-col gap-8 rounded-3xl border border-white/25 bg-[#F9F6F0]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:flex-row lg:gap-12 lg:p-12"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#F0E7DE] text-[#261C15] shadow-md transition-colors hover:bg-white sm:right-5 sm:top-5"
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
                        outline:
                          index === activeImage ? "2px solid #C59B78" : "none",
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
            {submitState === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-4 text-center"
              >
                <CheckCircle2
                  className="h-12 w-12 text-[#C59B78]"
                  aria-hidden="true"
                />
                <h2
                  id="product-modal-title"
                  className="text-3xl font-medium text-[#261C15]"
                >
                  Inquiry sent
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-[#76655A]">
                  Thanks for your interest in {product.name}. Our team will
                  follow up shortly to confirm details.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 rounded-full border border-[#C59B78] bg-[#211610] px-8 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#2E1E17]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#76655A]">
                      {product.eyebrow}
                    </span>
                    <span
                      className="h-1 w-1 rounded-full bg-[#C59B78]"
                      aria-hidden="true"
                    />
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
                      {product.rating} (
                      {product.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-[#261C15]">
                    {product.price}
                  </span>
                  <span className="text-[13px] text-[#76655A]">
                    {product.priceUnit}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[#76655A]">
                  {product.description}
                </p>

                <form onSubmit={onSubmit} className="mt-auto flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#261C15]">
                      Quantity
                    </span>
                    <div className="flex h-16 items-center rounded-2xl border-2 border-[#C59B78] bg-[#2E1E17]">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(quantity - 1)}
                        className="flex h-16 w-16 shrink-0 items-center justify-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C59B78] bg-[#3D2A1F] text-[#C59B78]">
                          <Minus className="h-4 w-4" />
                        </span>
                      </button>

                      <span className="h-9 w-px shrink-0 bg-[#C59B78]/25" />

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        aria-label="Quantity"
                        value={quantityInput}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "");
                          setQuantityInput(digits);
                        }}
                        onBlur={() => setQuantityInput(String(quantity))}
                        className="min-w-0 flex-1 bg-transparent text-center text-2xl font-semibold text-white outline-none"
                      />

                      <span className="h-9 w-px shrink-0 bg-[#C59B78]/25" />

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex h-16 w-16 shrink-0 items-center justify-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C59B78] text-[#2E1E17]">
                          <Plus className="h-4 w-4" />
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor={`${formId}-name`} className="sr-only">
                        Full name
                      </label>
                      <input
                        id={`${formId}-name`}
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Full Name*"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${formId}-email`} className="sr-only">
                        Email
                      </label>
                      <input
                        id={`${formId}-email`}
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Email*"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${formId}-phone`} className="sr-only">
                        Phone
                      </label>
                      <input
                        id={`${formId}-phone`}
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="Phone*"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`${formId}-message`} className="sr-only">
                        Message or special requests
                      </label>
                      <input
                        id={`${formId}-message`}
                        name="message"
                        placeholder="Message / Special Requests"
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>

                  {submitState === "error" && (
                    <p role="alert" className="text-sm text-[#A04A3A]">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitState === "submitting"}
                    className="flex items-center justify-center gap-2 rounded-full border border-[#C59B78] bg-[#211610] px-8 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#2E1E17] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitState === "submitting" ? "Sending…" : "Submit Inquiry"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
