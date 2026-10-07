// API payload → UI shapes. Keeping this mapping in one file is what lets the
// cards, grids and product page stay unaware of the API's exact fields.
import type { Category, Product, ProductBadge, Variant } from "./types";

/** GET /products item. */
export interface ApiProductListItem {
  id: string;
  slug: string;
  name: string;
  category: { id: string; name: string; slug: string };
  badge: ProductBadge | null;
  freeDelivery: boolean;
  ratingAvg: number;
  ratingCount: number;
  image: { url: string; alt: string } | null;
  variantId: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  stockQty: number;
  variantCount: number;
}

/** GET /products/:slug. */
export interface ApiProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string | null;
  category: { id: string; name: string; slug: string };
  categoryPath: { id: string; name: string; slug: string }[];
  badge: ProductBadge | null;
  freeDelivery: boolean;
  ratingAvg: number;
  ratingCount: number;
  images: { url: string; alt: string; variantId: string | null }[];
  variants: (Variant & { inStock: boolean })[];
  createdAt: string;
}

export interface ApiCategoryNode {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: ApiCategoryNode[];
}

const FALLBACK_IMAGE = "/products/placeholder.svg";

const rating = (avg: number, count: number) => (count > 0 ? { rating: avg, reviewCount: count } : {});

export function toProduct(item: ApiProductListItem): Product {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: "",
    price: item.price,
    ...(item.compareAtPrice && item.compareAtPrice > item.price ? { originalPrice: item.compareAtPrice } : {}),
    stockQty: item.stockQty,
    categoryId: item.category.id,
    images: [item.image?.url ?? FALLBACK_IMAGE],
    badge: item.badge,
    freeDelivery: item.freeDelivery,
    ...rating(item.ratingAvg, item.ratingCount),
    defaultVariantId: item.variantId,
    variantCount: item.variantCount,
  };
}

export function toProductDetail(p: ApiProductDetail): Product {
  const first = p.variants.find((v) => v.stockQty > 0) ?? p.variants[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: first.price,
    ...(first.compareAtPrice && first.compareAtPrice > first.price ? { originalPrice: first.compareAtPrice } : {}),
    stockQty: p.variants.reduce((n, v) => n + v.stockQty, 0),
    categoryId: p.category.id,
    images: p.images.length > 0 ? p.images.map((img) => img.url) : [FALLBACK_IMAGE],
    badge: p.badge,
    freeDelivery: p.freeDelivery,
    ...rating(p.ratingAvg, p.ratingCount),
    createdAt: p.createdAt,
    defaultVariantId: first.id,
    variantCount: p.variants.length,
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      options: v.options,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stockQty: v.stockQty,
    })),
    categoryPath: p.categoryPath,
  };
}

/** Nested tree → flat list with parentId (what menus and filters use). */
export function flattenCategories(nodes: ApiCategoryNode[], parentId: string | null = null): Category[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, slug: node.slug, parentId, imageUrl: node.imageUrl },
    ...flattenCategories(node.children, node.id),
  ]);
}
