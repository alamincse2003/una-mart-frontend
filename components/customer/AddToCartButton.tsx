"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  const handleClick = async () => {
    setStatus("adding");
    await addItem(productId, 1);
    setStatus("added");
    setTimeout(() => setStatus("idle"), 1500);
  };

  return (
    <Button
      variant="cta"
      disabled={disabled || status === "adding"}
      onClick={handleClick}
    >
      {disabled ? "Out of stock" : status === "added" ? "Added!" : "Add to cart"}
    </Button>
  );
}
