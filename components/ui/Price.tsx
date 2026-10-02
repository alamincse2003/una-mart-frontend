import { formatPrice } from "@/lib/format";

// Price with optional struck-through original price and "Save x%" chip.
// The strikethrough uses neutral-500 (4.53:1) — lighter grays fail AA.
export function Price({
  price,
  originalPrice,
  size = "md",
  showDiscount = false,
}: {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
}) {
  const discounted = originalPrice !== undefined && originalPrice > price;
  const pct = discounted ? Math.round(100 - (price / originalPrice) * 100) : 0;

  const priceClass = { sm: "text-base", md: "text-lg", lg: "text-3xl" }[size];

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-bold tracking-tight text-navy-800 ${priceClass}`}>
        <span className="sr-only">{discounted ? "Sale price " : "Price "}</span>
        {formatPrice(price)}
      </span>
      {discounted && (
        <>
          <span
            className={`text-neutral-500 line-through ${size === "lg" ? "text-lg" : "text-xs"}`}
          >
            <span className="sr-only">Original price </span>
            {formatPrice(originalPrice)}
          </span>
          {showDiscount && <span className="badge-sale">Save {pct}%</span>}
        </>
      )}
    </div>
  );
}
