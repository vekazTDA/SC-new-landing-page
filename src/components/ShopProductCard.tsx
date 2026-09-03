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
      className="group flex flex-col gap-3 text-left"
    >
      <div className="relative aspect-[305/441] w-full overflow-hidden rounded-2xl">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[#140D0A]/0 opacity-0 transition-all duration-300 group-hover:bg-[#140D0A]/60 group-hover:opacity-100">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
            Learn More
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[#FFCC7A]">
          {product.name}
        </h3>
        <p className="text-xs uppercase tracking-[0.1em] text-white">
          ${product.price.toFixed(2)} USD
        </p>
      </div>
    </button>
  );
}
