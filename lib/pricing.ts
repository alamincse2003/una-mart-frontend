// Order pricing previews shared by the cart page, cart drawer and checkout.
// The API's POST /orders re-prices everything — these are previews, not the
// source of truth. Delivery fees come from GET /delivery-zones.
import type { CartLine, DeliveryZone } from "./types";

/** Lines that can be ordered as they are (no unavailable / stock issue). */
export function orderableLines(lines: CartLine[]): CartLine[] {
  return lines.filter((line) => line.issue === null);
}

/** Savings vs. was-prices — shown so discounts stay visible at checkout. */
export function getSavings(lines: CartLine[]): number {
  return orderableLines(lines).reduce(
    (sum, line) => sum + Math.max(0, (line.compareAtPrice ?? line.unitPrice) - line.unitPrice) * line.quantity,
    0
  );
}

/** Same rule as the API: the zone fee, waived when every item ships free. */
export function getDeliveryFee(zone: Pick<DeliveryZone, "fee">, lines: CartLine[]): number {
  const orderable = orderableLines(lines);
  const allFree = orderable.length > 0 && orderable.every((line) => line.freeDelivery);
  return allFree ? 0 : zone.fee;
}
