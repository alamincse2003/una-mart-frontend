// Fixed locale on purpose: a bare toLocaleString() renders Bengali digits
// (৳২,৯৯০) on bn-BD browsers but Latin digits on the server, which both
// causes hydration mismatches and shows the same price two different ways.
const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** Money in the app is integer poisha (৳1 = 100); this is the only place it becomes taka. */
export function formatPrice(poisha: number): string {
  return `৳${priceFormatter.format(Math.round(poisha / 100))}`;
}

export const toPoisha = (taka: number) => Math.round(taka * 100);
export const toTaka = (poisha: number) => poisha / 100;

export function formatDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" } : { timeZone: "Asia/Dhaka" }),
  });
}
