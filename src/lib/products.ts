/**
 * EcoKit product catalogue — the built-in source of truth.
 *
 * This list is what the site serves when Firestore is not configured, and it is
 * also what `scripts/seed-firestore.mjs` pushes into Firestore the first time.
 * Once Firestore is live the admin panel owns the data and this file becomes the
 * fallback/seed only. Keep the `Product` shape in sync with the Firestore docs.
 *
 * Catalogue supplied by the client (Abhisek) on 2026-10-05 — 18 products.
 *
 * PRICES: the client's list did not include prices. The ten products that already
 * existed on the site keep the prices taken from the original build; those still
 * need confirming. The eight new products have `price: null`, which renders as
 * "Price on request" and routes the customer to the quote form instead of the
 * cart. No price has been invented.
 *
 * PHOTOGRAPHY: `image` points at /images/products/<slug>.jpg for every product.
 * Those files currently hold branded placeholders. Dropping real photos in at the
 * same filenames replaces them with no code change — see PRODUCT-PHOTO-PROMPTS.md.
 */

export type CategorySlug =
  | "oral-care"
  | "hair-care"
  | "bath-body"
  | "grooming"
  | "travel-essentials"
  | "corporate-gifting";

export type MaterialSlug =
  | "bamboo"
  | "wheat-straw"
  | "neem"
  | "jute"
  | "sugarcane"
  | "natural-fibre";

export interface Product {
  slug: string;
  name: string;
  category: CategorySlug;
  description: string;
  /** Unit price in INR, or null when the client has not supplied one yet.
   *  null => "Price on request": no Add to Cart, quote CTA instead. */
  price: number | null;
  image: string;
  imageAlt: string;
  badge?: string;
  materials: MaterialSlug[];
  /** false once real photography replaces the placeholder */
  needsPhoto?: boolean;
}

export const CATEGORIES: { slug: CategorySlug; label: string }[] = [
  { slug: "oral-care", label: "Oral Care" },
  { slug: "hair-care", label: "Hair Care" },
  { slug: "bath-body", label: "Bath & Body" },
  { slug: "grooming", label: "Grooming" },
  { slug: "travel-essentials", label: "Travel Essentials" },
  { slug: "corporate-gifting", label: "Corporate & Gifting" },
];

export const MATERIALS: { slug: MaterialSlug; label: string }[] = [
  { slug: "bamboo", label: "Bamboo" },
  { slug: "wheat-straw", label: "Wheat Straw" },
  { slug: "neem", label: "Neem Wood" },
  { slug: "jute", label: "Jute" },
  { slug: "sugarcane", label: "Sugarcane Fibre" },
  { slug: "natural-fibre", label: "Natural Fibre" },
];

const img = (slug: string) => `/images/products/${slug}.jpg`;

export const products: Product[] = [
  // ── Oral care ──────────────────────────────────────────────────────────
  {
    slug: "bamboo-toothbrush", name: "Bamboo Toothbrush", category: "oral-care",
    description: "Charcoal-infused bristles. Naturally antimicrobial handle.",
    price: 149, image: img("bamboo-toothbrush"),
    imageAlt: "EcoKit bamboo toothbrush with charcoal bristles",
    badge: "Bestseller", materials: ["bamboo"], needsPhoto: false,
  },
  {
    slug: "wheat-straw-toothbrush", name: "Wheat Straw Toothbrush", category: "oral-care",
    description: "Made from agricultural residue. Fully compostable handle.",
    price: 119, image: img("wheat-straw-toothbrush"),
    imageAlt: "EcoKit wheat straw toothbrush",
    materials: ["wheat-straw"], needsPhoto: false,
  },
  {
    slug: "bamboo-tongue-cleaner", name: "Bamboo Tongue Cleaner", category: "oral-care",
    description: "Traditional design, modern material. Naturally hygienic.",
    price: 99, image: img("bamboo-tongue-cleaner"),
    imageAlt: "EcoKit bamboo tongue cleaner",
    materials: ["bamboo"], needsPhoto: false,
  },

  // ── Hair care ──────────────────────────────────────────────────────────
  {
    slug: "bamboo-comb", name: "Bamboo Comb", category: "hair-care",
    description: "Wide-tooth and anti-static. Engraveable with your brand.",
    price: 129, image: img("bamboo-comb"),
    imageAlt: "EcoKit bamboo comb showing natural grain",
    materials: ["bamboo"], needsPhoto: false,
  },
  {
    slug: "wheat-straw-comb", name: "Wheat Straw Comb", category: "hair-care",
    description: "Lightweight and durable, moulded from wheat-straw fibre.",
    price: null, image: img("wheat-straw-comb"),
    imageAlt: "EcoKit wheat straw comb",
    materials: ["wheat-straw"], needsPhoto: false,
  },
  {
    slug: "neem-comb", name: "Neem Comb", category: "hair-care",
    description: "Hand-finished neem wood. Gentle on the scalp.",
    price: null, image: img("neem-comb"),
    imageAlt: "EcoKit neem wood comb",
    materials: ["neem"], needsPhoto: false,
  },
  {
    slug: "shampoo", name: "Shampoo", category: "hair-care",
    description: "Sulphate-free formula in recyclable packaging.",
    price: 229, image: img("shampoo"),
    imageAlt: "EcoKit shampoo bottle",
    materials: [], needsPhoto: false,
  },

  // ── Bath & body ────────────────────────────────────────────────────────
  {
    slug: "shower-gel", name: "Shower Gel", category: "bath-body",
    description: "Gentle, plant-based formula. Paraben-free.",
    price: 179, image: img("shower-gel"),
    imageAlt: "EcoKit shower gel bottle",
    materials: [], needsPhoto: false,
  },
  {
    slug: "handcrafted-soap", name: "Handcrafted Soap", category: "bath-body",
    description: "Cold-pressed, no parabens, wrapped in kraft paper.",
    price: 149, image: img("handcrafted-soap"),
    imageAlt: "EcoKit handcrafted soap bar in kraft wrap",
    materials: [], needsPhoto: false,
  },
  {
    slug: "moisturizer", name: "Moisturizer", category: "bath-body",
    description: "Aloe vera base. Lightweight, in a recyclable bottle.",
    price: 199, image: img("moisturizer"),
    imageAlt: "EcoKit moisturizer bottle",
    materials: [], needsPhoto: false,
  },
  {
    slug: "jute-loofah", name: "Jute Loofah", category: "bath-body",
    description: "Naturally exfoliating and completely biodegradable.",
    price: 119, image: img("jute-loofah"),
    imageAlt: "EcoKit jute loofah",
    badge: "New", materials: ["jute", "natural-fibre"], needsPhoto: false,
  },
  {
    slug: "bamboo-towel", name: "Bamboo Towel", category: "bath-body",
    description: "Bamboo fibre. Quick-drying, soft and highly absorbent.",
    price: null, image: img("bamboo-towel"),
    imageAlt: "Folded EcoKit bamboo fibre towel",
    materials: ["bamboo"], needsPhoto: false,
  },
  {
    slug: "biodegradable-shower-cap", name: "Biodegradable Shower Cap", category: "bath-body",
    description: "Plant-based material. Compostable within six months.",
    price: 89, image: img("biodegradable-shower-cap"),
    imageAlt: "EcoKit biodegradable shower cap",
    materials: [], needsPhoto: false,
  },

  // ── Grooming ───────────────────────────────────────────────────────────
  {
    slug: "wheat-straw-razor", name: "Wheat Straw Razor", category: "grooming",
    description: "Wheat-straw handle with a precision blade head.",
    price: null, image: img("wheat-straw-razor"),
    imageAlt: "EcoKit wheat straw razor",
    materials: ["wheat-straw"], needsPhoto: true,
  },
  {
    slug: "shaving-gel", name: "Shaving Gel", category: "grooming",
    description: "Plant-based cushion for a close, comfortable shave.",
    price: null, image: img("shaving-gel"),
    imageAlt: "EcoKit shaving gel tube",
    materials: [], needsPhoto: true,
  },

  // ── Travel ─────────────────────────────────────────────────────────────
  {
    slug: "sugarcane-water-bottle", name: "Sugarcane Water Bottle", category: "travel-essentials",
    description: "Moulded from sugarcane bagasse. Light, sturdy, reusable.",
    price: null, image: img("sugarcane-water-bottle"),
    imageAlt: "EcoKit sugarcane fibre water bottle",
    materials: ["sugarcane"], needsPhoto: true,
  },

  // ── Corporate & gifting ────────────────────────────────────────────────
  {
    slug: "bamboo-diary", name: "Bamboo Diary", category: "corporate-gifting",
    description: "Bamboo cover with recycled paper. Engraveable for gifting.",
    price: null, image: img("bamboo-diary"),
    imageAlt: "EcoKit bamboo-covered diary",
    materials: ["bamboo"], needsPhoto: true,
  },
  {
    slug: "bamboo-pen", name: "Bamboo Pen", category: "corporate-gifting",
    description: "Turned bamboo barrel with a smooth refillable cartridge.",
    price: null, image: img("bamboo-pen"),
    imageAlt: "EcoKit bamboo pen",
    materials: ["bamboo"], needsPhoto: true,
  },
];

/**
 * Products that were on the site before the client's 2026-10-05 catalogue and are
 * not on it. Kept here rather than deleted so any of them can be restored by
 * moving the entry back into `products` above.
 */
export const ARCHIVED_PRODUCTS: Product[] = [
  { slug: "jute-travel-bag", name: "Jute Travel Bag", category: "travel-essentials",
    description: "Hand-stitched jute. Drawstring closure. Reusable.",
    price: 249, image: img("jute-travel-bag"), imageAlt: "EcoKit jute travel bag",
    materials: ["jute"], needsPhoto: true },
  { slug: "canvas-slippers", name: "Canvas Slippers", category: "travel-essentials",
    description: "100% cotton canvas. Soft foam sole. Hotel-grade.",
    price: 299, image: img("canvas-slippers"), imageAlt: "EcoKit canvas slippers",
    materials: [], needsPhoto: true },
  { slug: "conditioner", name: "Conditioner", category: "hair-care",
    description: "Argan oil infused. No silicones. Natural scent.",
    price: 249, image: img("conditioner"), imageAlt: "EcoKit conditioner bottle",
    materials: [], needsPhoto: true },
  { slug: "bamboo-shaving-kit", name: "Bamboo Shaving Kit", category: "grooming",
    description: "Bamboo handle razor. Natural shave brush. Complete kit.",
    price: 349, image: img("bamboo-shaving-kit"), imageAlt: "EcoKit bamboo shaving kit",
    materials: ["bamboo"], needsPhoto: true },
];

export function getCategoryLabel(slug: CategorySlug): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const same = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const others = products.filter((p) => p.slug !== product.slug && p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

export function formatPrice(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

/** True when the product can be bought online. Unpriced items are quote-only. */
export function isPurchasable(product: Pick<Product, "price">): product is Product & { price: number } {
  return typeof product.price === "number" && product.price > 0;
}

/** What to show where a price would go. */
export function priceLabel(product: Pick<Product, "price">): string {
  return isPurchasable(product) ? formatPrice(product.price) : "Price on request";
}
