import type { Product } from "@/data/products";
import type { ShopProduct } from "@/data/shopProducts";
import type { Addon } from "@/data/addons";
import type { AddonRow, ImageEntry, ProductRow, ShopProductRow } from "./types";

/** numeric(10,2) arrives as a string over PostgREST. */
const num = (value: string | number) =>
  typeof value === "number" ? value : Number.parseFloat(value);

/** Products render price as a display string; shop products render a number. */
export const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

const urls = (images: ImageEntry[] | null | undefined) =>
  (images ?? []).map((image) => image.url).filter(Boolean);

export function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    images: urls(row.images),
    description: row.description,
    price: row.price_display?.trim() || formatPrice(num(row.price_amount)),
    eyebrow: row.eyebrow,
    inStock: row.in_stock,
    rating: num(row.rating),
    reviewCount: row.review_count,
    priceUnit: row.price_unit,
    defaultQuantity: row.default_quantity,
  };
}

export function toShopProduct(row: ShopProductRow): ShopProduct {
  return {
    slug: row.slug,
    name: row.name,
    price: num(row.price),
    images: urls(row.images),
    ...(row.modal_description ? { modalDescription: row.modal_description } : {}),
    rating: num(row.rating),
    reviewCount: row.review_count,
    ...(row.size_options && row.size_options.length > 0
      ? {
          sizeOptions: row.size_options.map((option) => ({
            label: option.label,
            price: num(option.price),
            ...(option.badge ? { badge: option.badge } : {}),
          })),
        }
      : {}),
  };
}

export function toAddon(row: AddonRow): Addon {
  return {
    slug: row.slug,
    title: row.title,
    price: num(row.price),
    // The DB stores an array so the admin has one uploader for every type; the card
    // renders a single image, so the hero is images[0].
    image: urls(row.images)[0] ?? "",
    description: row.description,
    rating: num(row.rating),
    reviewCount: row.review_count,
  };
}
