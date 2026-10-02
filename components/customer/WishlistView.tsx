"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useWishlist } from "@/lib/wishlist-context";
import type { Product } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGrid } from "./ProductGrid";

export function WishlistView() {
  const { ids, ready } = useWishlist();
  const [products, setProducts] = useState<Product[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!ready) return;
    if (!key) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect an emptied wishlist
      setProducts([]);
      return;
    }
    let cancelled = false;
    apiClient
      .getProducts({ ids: key.split(",") })
      .then((found) => {
        if (!cancelled) setProducts(found);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [key, ready]);

  if (!ready || products === null) {
    return (
      <div aria-busy="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[3/4.4] animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  }

  // Keep the order the shopper saved them in; hide ids that no longer exist.
  const ordered = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  if (ordered.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it here for later."
      >
        <ButtonLink href="/products">Discover products</ButtonLink>
      </EmptyState>
    );
  }

  return <ProductGrid products={ordered} />;
}
