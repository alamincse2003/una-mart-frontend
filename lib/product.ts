// Display rules derived from a Product, shared by cards, the product page
// and the cart so the same product never shows two different discounts or
// stock labels.
import type { Product } from "./types";

export const LOW_STOCK_THRESHOLD = 5;

export function getDiscountPercent(product: Product): number {
  const { originalPrice, price } = product;
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(100 - (price / originalPrice) * 100);
}

export function isOutOfStock(product: Product): boolean {
  return product.status === "out_of_stock" || product.stockQty <= 0;
}

export function isLowStock(product: Product): boolean {
  return !isOutOfStock(product) && product.stockQty <= LOW_STOCK_THRESHOLD;
}

export function productHref(product: Pick<Product, "slug">): string {
  return `/product/${product.slug}`;
}
