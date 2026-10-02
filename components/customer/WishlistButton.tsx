"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";

export function WishlistButton({
  productId,
  productName,
  variant = "overlay",
}: {
  productId: string;
  productName: string;
  /** "overlay" sits on a product image; "outline" is a standalone button. */
  variant?: "overlay" | "outline";
}) {
  const { has, toggle, ready } = useWishlist();
  const saved = ready && has(productId);

  const base =
    variant === "overlay"
      ? "h-9 w-9 rounded-full bg-neutral-0/90 shadow-sm backdrop-blur hover:bg-neutral-0"
      : "h-11 w-11 rounded-md border border-neutral-300 bg-neutral-0 hover:border-navy-800";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      onClick={() => toggle(productId)}
      className={`flex shrink-0 items-center justify-center transition-colors ${base} ${
        saved ? "text-coral-700" : "text-neutral-600 hover:text-coral-700"
      }`}
    >
      <Heart
        aria-hidden
        width={18}
        height={18}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
