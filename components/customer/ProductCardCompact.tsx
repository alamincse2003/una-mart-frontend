"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { AddToCartPill } from "./AddToCartPill";

// Compact product card for the Best Selling Product section — badge
// top-left, plain heart top-right, price + "+ Cart" pill on the same row.
// A separate component from ProductCard (used on category/product pages)
// since the visual language here is deliberately different — see the
// Best Selling Product figma reference.
export function ProductCardCompact({ product }: { product: Product }) {
  const outOfStock = product.status === "out_of_stock";
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : 0;

  return (
    <Card className="relative overflow-hidden p-3 transition-shadow hover:shadow-md">
      {product.badge && (
        <span
          className={`absolute left-3 top-3 z-10 rounded px-2 py-0.5 text-[11px] font-bold ${
            discountPct > 0
              ? "bg-danger text-neutral-0"
              : "bg-info text-neutral-0"
          }`}
        >
          {discountPct > 0 ? `${discountPct}% Off` : "New"}
        </span>
      )}

      <button
        type="button"
        aria-label="Add to wishlist"
        onClick={(e) => e.preventDefault()}
        className="absolute right-3 top-3 z-10 text-neutral-400 transition-colors hover:text-coral-600"
      >
        <Heart width={17} height={17} />
      </button>

      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-4"
          />
        </div>

        <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-neutral-800">
          {product.name}
        </h3>
      </Link>

      {product.rating !== undefined && (
        <div className="mt-1">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-navy-800">
            &#2547;{product.price.toLocaleString()}
          </span>
          {discountPct > 0 && (
            <span className="text-xs text-neutral-400 line-through">
              &#2547;{product.originalPrice!.toLocaleString()}
            </span>
          )}
        </div>

        <AddToCartPill productId={product.id} disabled={outOfStock} />
      </div>
    </Card>
  );
}
