// Fixed locale on purpose: a bare toLocaleString() renders Bengali digits
// (৳২,৯৯০) on bn-BD browsers but Latin digits on the server, which both
// causes hydration mismatches and shows the same price two different ways.
const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return `৳${priceFormatter.format(Math.round(amount))}`;
}
