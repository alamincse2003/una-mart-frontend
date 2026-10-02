"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import type { PricedLine } from "@/lib/pricing";
import { productHref } from "@/lib/product";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

// One cart row, shared by the cart page and the cart drawer.
export function CartLineItem({
  line,
  compact = false,
  onNavigate,
}: {
  line: PricedLine;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { updateItem, removeItem } = useCart();
  const { item, product, lineTotal } = line;
  const imageSize = compact ? "h-18 w-18" : "h-20 w-20 sm:h-24 sm:w-24";

  return (
    <div className="flex gap-3 sm:gap-4">
      <Link
        href={productHref(product)}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden
        className={`relative ${imageSize} shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50`}
      >
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes="96px"
          className="object-contain p-2 mix-blend-multiply"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={productHref(product)}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium text-neutral-800 hover:text-navy-600"
          >
            {product.name}
          </Link>
          <button
            type="button"
            aria-label={`Remove ${product.name} from cart`}
            onClick={() => removeItem(item.id)}
            className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-danger-bg hover:text-danger"
          >
            <Trash2 aria-hidden width={16} height={16} />
          </button>
        </div>
        <p className="text-xs text-neutral-600">{formatPrice(product.price)} each</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QuantityStepper
            size="sm"
            quantity={item.quantity}
            max={product.stockQty}
            label={`Quantity of ${product.name}`}
            onChange={(qty) => updateItem(item.id, qty)}
          />
          <p className="text-sm font-bold tabular-nums text-navy-800">
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
