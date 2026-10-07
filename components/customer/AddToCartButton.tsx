"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";

// Card-level add-to-cart. Quiet "ghost" style so a grid of cards isn't a
// wall of orange; success opens the cart drawer (from CartProvider).
// Products with several options link to the product page instead.
export function AddToCartButton({
  variantId,
  productName,
  disabled,
  chooseOptionsHref,
}: {
  variantId: string;
  productName: string;
  disabled?: boolean;
  /** Set when the product has several variants. */
  chooseOptionsHref?: string;
}) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  if (chooseOptionsHref && !disabled) {
    return (
      <Link
        href={chooseOptionsHref}
        aria-label={`Choose options: ${productName}`}
        className="flex min-h-9 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
      >
        <SlidersHorizontal aria-hidden width={15} height={15} />
        Choose options
      </Link>
    );
  }

  const handleClick = async () => {
    setStatus("adding");
    const ok = await addItem(variantId, 1);
    setStatus(ok ? "added" : "idle");
    if (ok) setTimeout(() => setStatus("idle"), 1500);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled || status === "adding"}
      aria-label={disabled ? `Out of stock: ${productName}` : `Add to cart: ${productName}`}
      className="w-full"
    >
      {status === "added" ? (
        <Check aria-hidden width={15} height={15} />
      ) : (
        <ShoppingCart aria-hidden width={15} height={15} />
      )}
      {disabled
        ? "Out of stock"
        : status === "adding"
          ? "Adding…"
          : status === "added"
            ? "Added"
            : "Add to cart"}
    </Button>
  );
}
