import { formatPrice } from "@/lib/format";
import type { ReactNode } from "react";

// Totals block shared by cart and checkout so the two screens can never
// disagree about the numbers. deliveryFee: null = not yet known.
export function OrderSummary({
  itemCount,
  subtotal,
  savings,
  deliveryFee,
  children,
}: {
  itemCount: number;
  subtotal: number;
  savings: number;
  deliveryFee: number | null;
  children?: ReactNode;
}) {
  const total = subtotal + (deliveryFee ?? 0);

  return (
    <div>
      <dl className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between text-neutral-700">
          <dt>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-success">
            <dt>You save</dt>
            <dd className="tabular-nums">−{formatPrice(savings)}</dd>
          </div>
        )}
        <div className="flex justify-between text-neutral-700">
          <dt>Delivery</dt>
          <dd className="tabular-nums">
            {deliveryFee === null ? (
              <span className="text-neutral-600">Calculated at checkout</span>
            ) : deliveryFee === 0 ? (
              <span className="font-semibold text-success">Free</span>
            ) : (
              formatPrice(deliveryFee)
            )}
          </dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-neutral-200 pt-3.5">
          <dt className="text-base font-bold text-neutral-800">
            {deliveryFee === null ? "Estimated total" : "Total"}
          </dt>
          <dd className="text-xl font-bold tabular-nums text-navy-800">{formatPrice(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}
