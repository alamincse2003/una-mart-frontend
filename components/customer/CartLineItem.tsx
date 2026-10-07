"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/types";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

// One cart row, shared by the cart page and the cart drawer.
export function CartLineItem({
  line,
  compact = false,
  onNavigate,
}: {
  line: CartLine;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { updateItem, removeItem } = useCart();
  const href = `/product/${line.slug}`;
  const imageSize = compact ? "h-18 w-18" : "h-20 w-20 sm:h-24 sm:w-24";
  const unavailable = line.issue === "unavailable";

  return (
    <div className="flex gap-3 sm:gap-4">
      <Link
        href={href}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden
        className={`relative ${imageSize} shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50`}
      >
        <Image
          src={line.imageUrl ?? "/products/placeholder.svg"}
          alt=""
          fill
          sizes="96px"
          className={`object-contain p-2 mix-blend-multiply ${unavailable ? "opacity-50 grayscale" : ""}`}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className="line-clamp-2 text-sm font-medium text-neutral-800 hover:text-navy-600"
            >
              {line.name}
            </Link>
            {line.variantLabel && <p className="text-xs text-neutral-600">{line.variantLabel}</p>}
          </div>
          <button
            type="button"
            aria-label={`Remove ${line.name} from cart`}
            onClick={() => removeItem(line.id)}
            className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-danger-bg hover:text-danger"
          >
            <Trash2 aria-hidden width={16} height={16} />
          </button>
        </div>
        <p className="text-xs text-neutral-600">{formatPrice(line.unitPrice)} each</p>

        {line.issue && (
          <p role="status" className="mt-1 text-xs font-semibold text-danger">
            {unavailable
              ? "No longer available — please remove it."
              : `Only ${line.stockQty} left — lower the quantity to order.`}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {unavailable ? (
            <span />
          ) : (
            <QuantityStepper
              size="sm"
              quantity={line.quantity}
              max={Math.max(1, Math.min(line.stockQty, 50))}
              label={`Quantity of ${line.name}`}
              onChange={(qty) => updateItem(line.id, qty)}
            />
          )}
          <p className={`text-sm font-bold tabular-nums ${line.issue ? "text-neutral-400 line-through" : "text-navy-800"}`}>
            {formatPrice(line.lineTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
