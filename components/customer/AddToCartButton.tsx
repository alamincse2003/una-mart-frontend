"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";

// Card-level add-to-cart. Quiet "ghost" style so a grid of cards isn't a
// wall of orange; success opens the cart drawer (from CartProvider).
export function AddToCartButton({
  productId,
  productName,
  disabled,
}: {
  productId: string;
  productName: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  const handleClick = async () => {
    setStatus("adding");
    const ok = await addItem(productId, 1);
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
