export type SizeOption = {
  label: string;
  price: number;
  badge?: "Popular" | "Best Value";
};

export type ShopProduct = {
  slug: string;
  name: string;
  price: number;
  images: string[];
  modalDescription?: string;
  sizeOptions?: SizeOption[];
};

const RATING = 4.9;
const REVIEW_COUNT = 1232;

export const SHOP_RATING = { rating: RATING, reviewCount: REVIEW_COUNT };

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: "brew-and-bite",
    name: "The Brew and Bite",
    price: 19.0,
    images: [
      "/images/shop/brew-and-bite.png",
      "/images/shop/brew-and-bite-gallery/thumb-1.png",
      "/images/shop/brew-and-bite-gallery/thumb-2.png",
      "/images/shop/brew-and-bite-gallery/thumb-3.png",
    ],
    modalDescription:
      "A ceramic brewing kit and an elegant mug. Because great meetings begin with a great first sip. Carefully packaged in presentation-ready, customizable signature boxes.",
    sizeOptions: [
      { label: "1 Pack", price: 19.0 },
      { label: "2 Pack", price: 36.0, badge: "Popular" },
      { label: "3 Pack", price: 59.0, badge: "Best Value" },
    ],
  },
  {
    slug: "editors-pick",
    name: "The Editor's Pick",
    price: 49.0,
    images: ["/images/shop/editors-pick.png"],
  },
  {
    slug: "writers-choice",
    name: "The Writer's Choice",
    price: 49.0,
    images: ["/images/shop/writers-choice.png"],
  },
  {
    slug: "single-acrylic-box",
    name: "Single Acrylic Box",
    price: 12.0,
    images: ["/images/shop/single-acrylic-box.png"],
  },
  {
    slug: "executive-self-care-kit",
    name: "The Executive Self-Care Kit",
    price: 74.0,
    images: ["/images/shop/executive-self-care-kit.png"],
  },
  {
    slug: "signature-set",
    name: "The Signature Set: Corporate Gift with Acrylic Boxes",
    price: 34.95,
    images: ["/images/shop/signature-set.png"],
  },
  {
    slug: "taste-tester",
    name: "The Taste Tester: Corporate Gift with Assorted Bags",
    price: 59.95,
    images: ["/images/shop/taste-tester.png"],
  },
];
