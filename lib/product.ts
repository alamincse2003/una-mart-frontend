// Display rules derived from a Product, shared by cards, the product page
// and the cart so the same product never shows two different discounts or
// stock labels.
import type { Product } from "./types";

export const LOW_STOCK_THRESHOLD = 5;

export function discountPercent(price: number, originalPrice?: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(100 - (price / originalPrice) * 100);
}

export function getDiscountPercent(product: Pick<Product, "price" | "originalPrice">): number {
  return discountPercent(product.price, product.originalPrice);
}

export function isOutOfStock(product: Pick<Product, "stockQty">): boolean {
  return product.stockQty <= 0;
}

export function isLowStock(product: Pick<Product, "stockQty">): boolean {
  return !isOutOfStock(product) && product.stockQty <= LOW_STOCK_THRESHOLD;
}

export function productHref(product: Pick<Product, "slug">): string {
  return `/product/${product.slug}`;
}

/** "M / Navy" from { size: "M", color: "Navy" }. */
export function variantLabel(options: Record<string, string>): string {
  return Object.values(options).filter(Boolean).join(" / ");
}
