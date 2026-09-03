export type Addon = {
  slug: string;
  title: string;
  price: number;
  image: string;
  description: string;
  defaultSelected: boolean;
};

export const ADDONS: Addon[] = [
  {
    slug: "single-acrylic-box",
    title: "Single Acrylic Box",
    price: 11.95,
    image: "/images/addons/single-acrylic-box.png",
    description:
      "A classy, translucent box with our signature chocolate-crisp bites; the most elegant add-on.",
    defaultSelected: true,
  },
  {
    slug: "4oz-bag",
    title: "4 oz. Bag",
    price: 7.95,
    image: "/images/addons/4oz-bag.png",
    description:
      "A delicious bag of our signature chocolate-crisp bites; everyone's go-to add-on.",
    defaultSelected: true,
  },
  {
    slug: "corporate-gift-assorted-bags",
    title: "Corporate Gift with Assorted Bags",
    price: 59.95,
    image: "/images/addons/corporate-gift-assorted-bags.png",
    description:
      "A curated assortment of our signature chocolate-crisp bites, nestled inside a premium magnetic gift box.",
    defaultSelected: false,
  },
  {
    slug: "corporate-gift-acrylic-boxes",
    title: "Corporate Gift with Acrylic Boxes",
    price: 34.95,
    image: "/images/addons/corporate-gift-acrylic-boxes.png",
    description:
      "A matching pair of our best-selling acrylic boxes, set inside a premium magnetic outer box.",
    defaultSelected: false,
  },
];
