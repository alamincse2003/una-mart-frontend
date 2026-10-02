// Order pricing rules shared by the cart page, cart drawer and checkout so
// every screen shows the same numbers. The backend's POST /orders must
// apply the same rules — the frontend total is a preview, not the source
// of truth.
import type { CartItem, Product } from "./types";

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export const DELIVERY_ZONES: { id: DeliveryZone; label: string; eta: string }[] =
  [
    { id: "inside_dhaka", label: "Inside Dhaka", eta: "1–2 business days" },
    { id: "outside_dhaka", label: "Outside Dhaka", eta: "3–5 business days" },
  ];

export const DELIVERY_FEE: Record<DeliveryZone, number> = {
  inside_dhaka: 0,
  outside_dhaka: 120,
};

export interface PricedLine {
  item: CartItem;
  product: Product;
  lineTotal: number;
}

/** Joins cart items with their products, skipping any not yet loaded. */
export function priceCartLines(
  items: CartItem[],
  products: Record<string, Product>
): PricedLine[] {
  return items.flatMap((item) => {
    const product = products[item.productId];
    return product
      ? [{ item, product, lineTotal: product.price * item.quantity }]
      : [];
  });
}

export function getSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

/** Savings vs. original prices — shown so discounts stay visible at checkout. */
export function getSavings(lines: PricedLine[]): number {
  return lines.reduce((sum, { product, item }) => {
    const original = product.originalPrice ?? product.price;
    return sum + Math.max(0, original - product.price) * item.quantity;
  }, 0);
}

/** Delivery is free inside Dhaka, and anywhere when every item ships free. */
export function getDeliveryFee(
  zone: DeliveryZone,
  lines: PricedLine[]
): number {
  const allFree =
    lines.length > 0 && lines.every((line) => line.product.freeDelivery);
  return allFree ? 0 : DELIVERY_FEE[zone];
}
