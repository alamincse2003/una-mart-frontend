"use client";

import { HeartIcon } from "@/components/ui/icons";

export function WishlistButton() {
  return (
    <button
      type="button"
      aria-label="Add to wishlist"
      onClick={(e) => e.preventDefault()}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-0/90 text-neutral-600 transition-colors hover:text-coral-600"
    >
      <HeartIcon width={16} height={16} />
    </button>
  );
}
