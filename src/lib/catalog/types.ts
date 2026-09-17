/** Shapes as they come back from PostgREST. Mapped to the public types in mappers.ts. */

export type ImageEntry = { url: string; alt?: string | null; path?: string | null };

export type SizeOptionRow = {
  label: string;
  price: number;
  badge?: "Popular" | "Best Value" | null;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  images: ImageEntry[];
  price_amount: string | number;
  price_display: string | null;
  price_unit: string;
  in_stock: boolean;
  rating: string | number;
  review_count: number;
  default_quantity: number;
  sort_order: number;
  is_published: boolean;
  updated_at?: string;
};

export type ShopProductRow = {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  images: ImageEntry[];
  modal_description: string | null;
  size_options: SizeOptionRow[] | null;
  rating: string | number;
  review_count: number;
  sort_order: number;
  is_published: boolean;
  updated_at?: string;
};

export type AddonRow = {
  id: string;
  slug: string;
  title: string;
  price: string | number;
  description: string;
  images: ImageEntry[];
  rating: string | number;
  review_count: number;
  sort_order: number;
  is_published: boolean;
  updated_at?: string;
};

export type CatalogKind = "products" | "shop-products" | "addons";
