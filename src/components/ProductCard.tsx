import Image from "next/image";
import type { Product } from "@/data/products";

/**
 * Two layouts from one markup.
 *
 * Mobile is Figma 36:2012 (Component 14, a 181x306 card): photo first, then a centred
 * title, description, price and an always-visible CTA. Tablet and up keeps the original
 * desktop card: title above the photo, description and price on one row, CTA on hover.
 * `order` does the swap so the DOM stays in one sensible reading order.
 */
export default function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      aria-label={`View details for ${product.name}`}
      className="group flex h-full w-full max-w-[400px] flex-col rounded-[14px] bg-[#F0E7DE]/80 p-3 text-left transition-transform hover:-translate-y-1 sm:rounded-2xl sm:p-5 lg:p-6"
    >
      <h3 className="order-2 mt-[19px] text-center text-[12px] font-semibold uppercase leading-snug tracking-[0.31em] text-[#76655A] sm:order-1 sm:mt-0 sm:text-lg sm:tracking-[0.25em] lg:text-xl">
        {product.name}
      </h3>

      {/* The badge sits outside the clipped photo so it can straddle its bottom edge. */}
      <div className="order-1 relative w-full sm:order-2 sm:mt-5">
        {/* Figma puts a #261C15 plate behind the photo; it also keeps any transparent
            corners in a product PNG from showing the cream card through. */}
        <div className="relative aspect-[153/148] w-full overflow-hidden rounded-[12px] bg-[#261C15] sm:aspect-[349/431] sm:rounded-xl">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 45vw"
            className="object-cover"
          />
        </div>

        {/* One badge for every card: the ring artwork with the S/C monogram centred on
            top. 24x30 on mobile per the Figma node, 52x65 from sm up. */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-[30px] w-[24px] -translate-x-1/2 translate-y-1/2 sm:h-[65px] sm:w-[52px]"
        >
          <Image
            src="/images/card-icon/badge-ring.png"
            alt=""
            fill
            sizes="52px"
            className="object-contain"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/card-icon/badge-monogram.png"
              alt=""
              width={21}
              height={27}
              className="h-auto w-[40%]"
            />
          </span>
        </span>
      </div>

      {/* flex-1 stretches cards in a row so mobile price + CTA share one baseline. */}
      <div className="order-3 mt-[7px] flex min-h-0 flex-1 flex-col text-center sm:mt-11 sm:text-left">
        <div className="flex flex-col items-center gap-[10px] sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <p className="text-[9px] leading-[1.16] text-[#76655A]/80 sm:max-w-[65%] sm:text-sm sm:leading-relaxed">
            {product.description}
          </p>
          <p className="hidden text-base font-semibold uppercase tracking-[0.25em] text-[#76655A] sm:block sm:shrink-0">
            {product.price}
          </p>
        </div>

        {/* Mobile: pin price + Learn More to the card bottom so adjacent cards align. */}
        <div className="mt-auto flex w-full flex-col items-center gap-[10px] pt-[10px] sm:hidden">
          <p className="text-[10px] font-semibold uppercase tracking-[0.31em] text-[#76655A]">
            {product.price}
          </p>
          <span
            aria-hidden="true"
            className="-mx-[5px] block w-[calc(100%+10px)] rounded-2xl border border-[#F0E7DE] bg-[#4F2B1C]/[0.86] py-[10px] text-center text-[8px] font-semibold uppercase leading-[1.35] tracking-[0.31em] text-[#F0E7DE]"
          >
            Learn More
          </span>
        </div>

        {/* Desktop: CTA under the description row; 0fr → 1fr opens on hover. */}
        <div
          aria-hidden="true"
          className="hidden transition-[grid-template-rows] duration-300 ease-out sm:mt-4 sm:grid sm:grid-rows-[0fr] sm:group-hover:grid-rows-[1fr]"
        >
          <div className="overflow-hidden">
            <span className="block rounded-xl bg-[#4F2B1C]/[0.86] py-5 text-center text-sm font-semibold uppercase tracking-[0.25em] text-[#F0E7DE] opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:py-6">
              Learn More
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
