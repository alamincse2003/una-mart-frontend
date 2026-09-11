"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";

// Compact "+ Cart" button used on ProductCardCompact — a smaller, icon-led
// alternative to AddToCartButton's full-width label, matching the
// Best Selling Product figma reference.
export function AddToCartPill({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setStatus("adding");
    await addItem(productId, 1);
    setStatus("added");
    setTimeout(() => setStatus("idle"), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || status === "adding"}
      className="flex items-center gap-1 rounded-pill bg-coral-400 px-3 py-1.5 text-xs font-bold text-navy-900 transition-colors hover:bg-coral-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Plus width={14} height={14} />
      {status === "added" ? "Added" : "Cart"}
    </button>
  );
}
