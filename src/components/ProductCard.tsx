import Image from "next/image";
import type { Product } from "@/data/products";

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
      className="group flex flex-col rounded-2xl bg-[#F0E7DE]/80 p-4 text-left transition-transform hover:-translate-y-1 sm:p-5 lg:p-6"
    >
      <h3 className="text-center text-base font-semibold uppercase leading-snug tracking-[0.25em] text-[#76655A] sm:text-lg lg:text-xl">
        {product.name}
      </h3>

      {/* The badge sits outside the clipped photo so it can straddle its bottom edge. */}
      <div className="relative mt-4 w-full sm:mt-5">
        <div className="relative aspect-[349/431] w-full overflow-hidden rounded-xl">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-[#F0E7DE] bg-[#4F2B1C]/[0.86] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="px-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#F0E7DE] sm:text-sm">
              Learn More
            </span>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 flex h-[52px] w-[42px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full sm:h-[65px] sm:w-[52px]"
          style={{ backgroundColor: product.badgeColor }}
        >
          <span className="absolute inset-[3px] rounded-full border border-dotted border-[#D8CDC4]/70" />
          <span
            className="relative text-lg italic text-[#D8CDC4] sm:text-2xl"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            {product.badgeLetter}
          </span>
        </span>
      </div>

      {/* clears the badge, which now hangs half its height below the photo */}
      <div className="mt-9 flex items-end justify-between gap-3 sm:mt-11">
        <p className="max-w-[65%] whitespace-pre-line text-xs leading-relaxed text-[#76655A]/80 sm:text-sm">
          {product.description}
        </p>
        <p className="shrink-0 text-sm font-semibold uppercase tracking-[0.25em] text-[#76655A] sm:text-base">
          {product.price}
        </p>
      </div>
    </button>
  );
}
