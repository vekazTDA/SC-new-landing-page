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
      className="group flex w-full max-w-[400px] flex-col rounded-2xl bg-[#F0E7DE]/80 p-4 text-left transition-transform hover:-translate-y-1 sm:p-5 lg:p-6"
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
        </div>

        {/* One badge for every card: the ring artwork at its native 52x65, with the
            S/C monogram centred on top. */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-[52px] w-[42px] -translate-x-1/2 translate-y-1/2 sm:h-[65px] sm:w-[52px]"
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

      {/* clears the badge, which now hangs half its height below the photo */}
      <div className="mt-9 flex items-end justify-between gap-3 sm:mt-11">
        <p className="max-w-[65%] text-xs leading-relaxed text-[#76655A]/80 sm:text-sm">
          {product.description}
        </p>
        <p className="shrink-0 text-sm font-semibold uppercase tracking-[0.25em] text-[#76655A] sm:text-base">
          {product.price}
        </p>
      </div>

      {/* The call to action lives under the description, not over the photo. It is a span,
          not a button, because the whole card is already the button — nesting one inside
          the other is invalid, and it would also leave touch devices with no way in.
          0fr -> 1fr animates the card open; overflow-hidden is what lets the row collapse
          (a grid item's automatic minimum size would otherwise hold it at full height). */}
      <div
        aria-hidden="true"
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]"
      >
        <div className="overflow-hidden">
          <span className="mt-4 block w-full rounded-xl bg-[#4F2B1C]/[0.86] py-5 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#F0E7DE] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-sm lg:py-6">
            Learn More
          </span>
        </div>
      </div>
    </button>
  );
}
