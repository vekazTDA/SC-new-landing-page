export type Product = {
  slug: string;
  name: string;
  images: string[];
  description: string;
  price: string;
  eyebrow: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  priceUnit: string;
  defaultQuantity: number;
};

export const PRODUCTS: Product[] = [
  {
    slug: "the-brew",
    name: "The Brew",
    images: [
      "/images/products/brew-gallery/main.png",
      "/images/products/brew-gallery/thumb-1.png",
      "/images/products/brew-gallery/thumb-2.png",
      "/images/products/brew-gallery/thumb-3.png",
    ],
    description:
      "A ceramic brewing kit and an elegant mug. Because great meetings begin with a great first sip.",
    price: "$19.00",
    eyebrow: "Signature Curation",
    inStock: true,
    rating: 4.9,
    reviewCount: 1232,
    priceUnit: "/ tier base price",
    defaultQuantity: 50,
  },
  {
    slug: "the-refill",
    name: "The Refill",
    images: ["/images/products/the-refill.png"],
    description:
      "A pair of artisanal glasses along with tongs and reusable whisky stones. For those who like a refined way to wind down after a busy day.",
    price: "$19.00",
    eyebrow: "Signature Curation",
    inStock: true,
    rating: 4.9,
    reviewCount: 1232,
    priceUnit: "/ tier base price",
    defaultQuantity: 50,
  },
  {
    slug: "the-writers-choice",
    name: "The Writer's Choice",
    images: ["/images/products/the-writers-choice.png"],
    description:
      "A custom notebook, a quality pen, and an insulated bottle that keeps drinks hot for hours (or cold just as long). Hydrated. Organized. Appreciated.",
    price: "$49.00",
    eyebrow: "Signature Curation",
    inStock: true,
    rating: 4.9,
    reviewCount: 1232,
    priceUnit: "/ tier base price",
    defaultQuantity: 50,
  },
  {
    slug: "the-reset",
    name: "The Reset",
    images: ["/images/products/the-reset.png"],
    description:
      "A deep tissue percussion massager with six attachments and a recovery wrap to match. This was made for the leader who never stops moving.",
    price: "$74.00",
    eyebrow: "Signature Curation",
    inStock: true,
    rating: 4.9,
    reviewCount: 1232,
    priceUnit: "/ tier base price",
    defaultQuantity: 50,
  },
  {
    slug: "the-enoteca",
    name: "The Enoteca",
    images: ["/images/products/the-enoteca.png"],
    description:
      "An effortless electric bottle opener and the bar tools to back it up. For celebrating wins, big and small.",
    price: "$74.00",
    eyebrow: "Signature Curation",
    inStock: true,
    rating: 4.9,
    reviewCount: 1232,
    priceUnit: "/ tier base price",
    defaultQuantity: 50,
  },
  {
    slug: "the-respite",
    name: "The Respite",
    images: ["/images/products/the-respite.png"],
    description:
      "A signature scented candle and a set of reed diffusers, designed to make appreciation feel personal, not routine.",
    price: "$49.00",
    eyebrow: "Signature Curation",
    inStock: true,
    rating: 4.9,
    reviewCount: 1232,
    priceUnit: "/ tier base price",
    defaultQuantity: 50,
  },
];
