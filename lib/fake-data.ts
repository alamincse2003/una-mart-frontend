// In-memory fake data for Phase 1. Client components go through /app/api/*;
// server components import the helpers below directly (no self-fetch) —
// see CLAUDE.md's frontend-first workflow rules.
import type { Category, Product } from "./types";

// Real product photos already in public/products — swap for Cloudinary
// URLs once the catalog is real.
const IMAGE_HEADPHONES = "/products/image1.webp";
const IMAGE_MOUSE = "/products/image2.webp";
const IMAGE_SMARTWATCH = "/products/image3.webp";
const IMAGE_EARBUDS = "/products/image4.webp";
const IMAGE_POWERBANK = "/products/image5.webp";
const IMAGE_SAREE = "/products/Saree1.webp";
const IMAGE_SHIRT = "/products/Shirt (1).webp";
const IMAGE_SHOES = "/products/Shoes3.webp";
const IMAGE_SUNGLASSES = "/products/Sunglasses1.webp";
const IMAGE_THREE_PIECE = "/products/Three Piece.webp";
const IMAGE_WATCH_1 = "/products/Watch1.webp";
const IMAGE_WATCH_4 = "/products/Watch4.webp";
const IMAGE_WATCH_5 = "/products/Watch5.webp";

export const categories: Category[] = [
  { id: "cat-gadgets", name: "Gadgets", slug: "gadgets", parentId: null },
  { id: "cat-groceries", name: "Groceries", slug: "groceries", parentId: null },
  { id: "cat-fashion", name: "Fashion", slug: "fashion", parentId: null },
  { id: "cat-sports", name: "Sports", slug: "sports", parentId: null },

  // Gadgets subcategories
  { id: "cat-audio", name: "Audio", slug: "audio", parentId: "cat-gadgets" },
  {
    id: "cat-wearables",
    name: "Wearables",
    slug: "wearables",
    parentId: "cat-gadgets",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    parentId: "cat-gadgets",
  },
  {
    id: "cat-chargers",
    name: "Chargers & Cables",
    slug: "chargers-cables",
    parentId: "cat-gadgets",
  },

  // Groceries subcategories
  {
    id: "cat-staples",
    name: "Staples",
    slug: "staples",
    parentId: "cat-groceries",
  },
  {
    id: "cat-cooking-oil",
    name: "Cooking Oil",
    slug: "cooking-oil",
    parentId: "cat-groceries",
  },
  {
    id: "cat-snacks",
    name: "Snacks & Beverages",
    slug: "snacks-beverages",
    parentId: "cat-groceries",
  },

  // Fashion subcategories
  {
    id: "cat-mens-wear",
    name: "Men's Wear",
    slug: "mens-wear",
    parentId: "cat-fashion",
  },
  {
    id: "cat-womens-wear",
    name: "Women's Wear",
    slug: "womens-wear",
    parentId: "cat-fashion",
  },
  {
    id: "cat-fashion-accessories",
    name: "Watches & Accessories",
    slug: "watches-accessories",
    parentId: "cat-fashion",
  },

  // Sports subcategories
  {
    id: "cat-sports-footwear",
    name: "Footwear",
    slug: "sports-footwear",
    parentId: "cat-sports",
  },
  {
    id: "cat-fitness",
    name: "Fitness Equipment",
    slug: "fitness-equipment",
    parentId: "cat-sports",
  },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Wireless Earbuds Pro",
    slug: "wireless-earbuds-pro",
    description:
      "Active noise cancellation, 30-hour battery life, USB-C fast charging.",
    price: 2990,
    originalPrice: 3490,
    stockQty: 42,
    categoryId: "cat-audio",
    images: [IMAGE_EARBUDS],
    status: "active",
    createdAt: "2026-01-10T00:00:00.000Z",
    rating: 4.6,
    reviewCount: 214,
    badge: "sale",
    freeDelivery: true,
  },
  {
    id: "prod-2",
    name: "Over-Ear ANC Headphones",
    slug: "over-ear-anc-headphones",
    description:
      "Active noise cancellation, plush ear cushions, 40-hour battery life.",
    price: 2990,
    stockQty: 55,
    categoryId: "cat-audio",
    images: [IMAGE_HEADPHONES],
    status: "active",
    createdAt: "2026-01-12T00:00:00.000Z",
    rating: 4.8,
    reviewCount: 320,
    badge: "best",
    freeDelivery: true,
  },
  {
    id: "prod-3",
    name: "Smart Watch SE",
    slug: "smart-watch-se",
    description: "Heart rate tracking, sleep monitoring, 7-day battery.",
    price: 5990,
    stockQty: 18,
    categoryId: "cat-wearables",
    images: [IMAGE_SMARTWATCH],
    status: "active",
    createdAt: "2026-01-14T00:00:00.000Z",
    rating: 4.5,
    reviewCount: 96,
    badge: "new",
  },
  {
    id: "prod-4",
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    description: "Ergonomic wireless mouse, adjustable DPI, silent clicks.",
    price: 890,
    stockQty: 120,
    categoryId: "cat-accessories",
    images: [IMAGE_MOUSE],
    status: "active",
    createdAt: "2026-01-15T00:00:00.000Z",
    rating: 4.3,
    reviewCount: 58,
  },
  {
    id: "prod-5",
    name: "Power Bank 20000mAh",
    slug: "power-bank-20000mah",
    description: "High-capacity power bank with fast-charge pass-through.",
    price: 1990,
    originalPrice: 2290,
    stockQty: 3,
    categoryId: "cat-chargers",
    images: [IMAGE_POWERBANK],
    status: "active",
    createdAt: "2026-01-16T00:00:00.000Z",
    rating: 4.4,
    reviewCount: 132,
    badge: "sale",
  },
  {
    id: "prod-6",
    name: "Premium Basmati Rice (5kg)",
    slug: "premium-basmati-rice-5kg",
    description: "Aged basmati rice, long grain, sourced from local mills.",
    price: 750,
    stockQty: 200,
    categoryId: "cat-staples",
    images: [IMAGE_HEADPHONES], // no real rice photo yet — reusing gadget photo
    status: "active",
    createdAt: "2026-01-18T00:00:00.000Z",
    rating: 4.7,
    reviewCount: 88,
    badge: "new",
    freeDelivery: true,
  },
  {
    id: "prod-7",
    name: "Soybean Cooking Oil (5L)",
    slug: "soybean-cooking-oil-5l",
    description: "Refined soybean oil, fortified with vitamin A and D.",
    price: 890,
    stockQty: 150,
    categoryId: "cat-cooking-oil",
    images: [IMAGE_MOUSE], // no real oil photo yet — reusing gadget photo
    status: "active",
    createdAt: "2026-01-19T00:00:00.000Z",
    rating: 4.2,
    reviewCount: 41,
    freeDelivery: true,
  },
  {
    id: "prod-8",
    name: "Red Lentils (1kg)",
    slug: "red-lentils-1kg",
    description: "Split red lentils (masoor dal), cleaned and sorted.",
    price: 140,
    stockQty: 300,
    categoryId: "cat-staples",
    images: [IMAGE_SMARTWATCH], // no real lentils photo yet — reusing gadget photo
    status: "active",
    createdAt: "2026-01-20T00:00:00.000Z",
    rating: 4.5,
    reviewCount: 65,
    badge: "best",
    freeDelivery: true,
  },
  {
    id: "prod-9",
    name: "Sunflower Cooking Oil (2L)",
    slug: "sunflower-cooking-oil-2l",
    description: "Light, refined sunflower oil for everyday cooking.",
    price: 420,
    stockQty: 0,
    categoryId: "cat-cooking-oil",
    images: [IMAGE_EARBUDS], // no real oil photo yet — reusing gadget photo
    status: "out_of_stock",
    createdAt: "2026-01-21T00:00:00.000Z",
    rating: 4.1,
    reviewCount: 27,
  },
  {
    id: "prod-10",
    name: "USB-C to Lightning Cable",
    slug: "usb-c-to-lightning-cable",
    description: "1.5m braided cable, supports fast charging and data sync.",
    price: 590,
    stockQty: 80,
    categoryId: "cat-chargers",
    images: [IMAGE_POWERBANK], // no real cable photo yet — reusing gadget photo
    status: "active",
    createdAt: "2026-01-22T00:00:00.000Z",
    rating: 4.3,
    reviewCount: 19,
  },
  {
    id: "prod-11",
    name: "Assorted Biscuits Pack",
    slug: "assorted-biscuits-pack",
    description: "A mixed pack of tea-time biscuits, resealable box of 12.",
    price: 320,
    stockQty: 140,
    categoryId: "cat-snacks",
    images: [IMAGE_MOUSE], // no real snacks photo yet — reusing gadget photo
    status: "active",
    createdAt: "2026-01-23T00:00:00.000Z",
    rating: 4.4,
    reviewCount: 34,
  },
  {
    id: "prod-12",
    name: "Embroidered Silk Saree",
    slug: "embroidered-silk-saree",
    description: "Traditional silk saree with hand-finished embroidery detail.",
    price: 3450,
    originalPrice: 4200,
    stockQty: 24,
    categoryId: "cat-womens-wear",
    images: [IMAGE_SAREE],
    status: "active",
    createdAt: "2026-01-24T00:00:00.000Z",
    rating: 4.7,
    reviewCount: 52,
    badge: "sale",
    freeDelivery: true,
  },
  {
    id: "prod-13",
    name: "Men's Casual Cotton Shirt",
    slug: "mens-casual-cotton-shirt",
    description: "Breathable cotton shirt, regular fit, machine washable.",
    price: 950,
    stockQty: 90,
    categoryId: "cat-mens-wear",
    images: [IMAGE_SHIRT],
    status: "active",
    createdAt: "2026-01-25T00:00:00.000Z",
    rating: 4.4,
    reviewCount: 38,
    badge: "new",
  },
  {
    id: "prod-14",
    name: "Unisex Sports Sneakers",
    slug: "unisex-sports-sneakers",
    description: "Lightweight, cushioned sole, breathable mesh upper.",
    price: 2200,
    stockQty: 65,
    categoryId: "cat-sports-footwear",
    images: [IMAGE_SHOES],
    status: "active",
    createdAt: "2026-01-26T00:00:00.000Z",
    rating: 4.6,
    reviewCount: 71,
    badge: "best",
    freeDelivery: true,
  },
  {
    id: "prod-15",
    name: "Classic UV-Protection Sunglasses",
    slug: "classic-uv-protection-sunglasses",
    description: "Polarized lenses with full UV400 protection, unisex frame.",
    price: 780,
    stockQty: 110,
    categoryId: "cat-fashion-accessories",
    images: [IMAGE_SUNGLASSES],
    status: "active",
    createdAt: "2026-01-27T00:00:00.000Z",
    rating: 4.3,
    reviewCount: 29,
  },
  {
    id: "prod-16",
    name: "Women's Three-Piece Outfit",
    slug: "womens-three-piece-outfit",
    description: "Matching three-piece set — kameez, salwar and dupatta.",
    price: 2650,
    stockQty: 40,
    categoryId: "cat-womens-wear",
    images: [IMAGE_THREE_PIECE],
    status: "active",
    createdAt: "2026-01-28T00:00:00.000Z",
    rating: 4.5,
    reviewCount: 22,
  },
  {
    id: "prod-17",
    name: "Classic Analog Watch",
    slug: "classic-analog-watch",
    description: "Stainless steel case, genuine leather strap, water resistant.",
    price: 1850,
    originalPrice: 2300,
    stockQty: 33,
    categoryId: "cat-fashion-accessories",
    images: [IMAGE_WATCH_1],
    status: "active",
    createdAt: "2026-01-29T00:00:00.000Z",
    rating: 4.6,
    reviewCount: 47,
    badge: "sale",
  },
  {
    id: "prod-18",
    name: "Sports Chronograph Watch",
    slug: "sports-chronograph-watch",
    description: "Shock-resistant sports watch with chronograph and backlight.",
    price: 2100,
    stockQty: 27,
    categoryId: "cat-fashion-accessories",
    images: [IMAGE_WATCH_4],
    status: "active",
    createdAt: "2026-01-30T00:00:00.000Z",
    rating: 4.4,
    reviewCount: 18,
  },
  {
    id: "prod-19",
    name: "Minimalist Dress Watch",
    slug: "minimalist-dress-watch",
    description: "Slim profile dress watch, mesh strap, scratch-resistant glass.",
    price: 1650,
    stockQty: 45,
    categoryId: "cat-fashion-accessories",
    images: [IMAGE_WATCH_5],
    status: "active",
    createdAt: "2026-01-31T00:00:00.000Z",
    rating: 4.5,
    reviewCount: 31,
    badge: "new",
  },
  {
    id: "prod-20",
    name: "Adjustable Dumbbell Set",
    slug: "adjustable-dumbbell-set",
    description: "5-25kg adjustable dumbbell pair for home strength training.",
    price: 4200,
    stockQty: 15,
    categoryId: "cat-fitness",
    images: [IMAGE_POWERBANK], // no real fitness photo yet — reusing gadget photo
    status: "active",
    createdAt: "2026-02-01T00:00:00.000Z",
    rating: 4.6,
    reviewCount: 24,
    freeDelivery: true,
  },
  {
    id: "prod-21",
    name: "Yoga Mat (Non-Slip)",
    slug: "yoga-mat-non-slip",
    description: "6mm thick non-slip yoga mat with carry strap.",
    price: 690,
    stockQty: 85,
    categoryId: "cat-fitness",
    images: [IMAGE_EARBUDS], // no real fitness photo yet — reusing gadget photo
    status: "active",
    createdAt: "2026-02-02T00:00:00.000Z",
    rating: 4.5,
    reviewCount: 40,
  },
];

export function getProducts(params?: {
  category?: string;
  search?: string;
}): Product[] {
  let result = products;

  if (params?.category) {
    const matchedCategory = categories.find((c) => c.slug === params.category);
    result = result.filter(
      (p) => matchedCategory && p.categoryId === matchedCategory.id
    );
  }

  if (params?.search) {
    const term = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  return result;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategories(): Category[] {
  return categories;
}
