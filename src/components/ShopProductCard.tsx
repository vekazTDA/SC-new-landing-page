import Image from "next/image";
import type { ShopProduct } from "@/data/shopProducts";

export default function ShopProductCard({
  product,
  onSelect,
}: {
  product: ShopProduct;
  onSelect: (product: ShopProduct) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      aria-label={`View details for ${product.name}`}
      // no flex gap: the reveal below is a flex child, and a gap would keep spacing
      // for it even while it is collapsed
      className="group flex h-full w-full flex-col text-left"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#241109]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 50vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#FFCC7A]">
          {product.name}
        </h3>
        <p className="text-xs uppercase tracking-[0.1em] text-white">
          ${product.price.toFixed(2)} USD
        </p>
      </div>

      {/* Below the price, not over the photo. Fill, border and text are sampled from
          the client's Figma recording. A span, not a button — the whole card is
          already the button. 0fr -> 1fr opens the card; overflow-hidden is what lets
          the row collapse to nothing. */}
      <div
        aria-hidden="true"
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]"
      >
        <div className="overflow-hidden">
          <span className="mx-auto mt-4 flex w-fit items-center justify-center rounded-full border border-[#BAA89E] bg-[#3E2215] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F0E7DE] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:px-8 sm:text-xs">
            Learn More
          </span>
        </div>
      </div>
    </button>
  );
}
