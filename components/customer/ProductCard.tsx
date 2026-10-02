import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import {
  getDiscountPercent,
  isLowStock,
  isOutOfStock,
  productHref,
} from "@/lib/product";
import { Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";

// The storefront's single product card (grids, rails, search, wishlist).
// Server component; only the two buttons hydrate. No GSAP here by rule —
// listing screens are judged on speed (see CLAUDE.md).
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  /** Eager-load the image (first row above the fold). */
  priority?: boolean;
}) {
  const outOfStock = isOutOfStock(product);
  const lowStock = isLowStock(product);
  const discountPct = getDiscountPercent(product);
  const href = productHref(product);

  const badge =
    discountPct > 0
      ? { label: `-${discountPct}%`, className: "bg-coral-700 text-neutral-0" }
      : product.badge === "new"
        ? { label: "New", className: "bg-navy-800 text-neutral-0" }
        : product.badge === "best"
          ? { label: "Best seller", className: "bg-navy-50 text-navy-800" }
          : null;

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-neutral-200 bg-neutral-0 p-2.5 transition-[border-color,box-shadow] duration-200 hover:border-neutral-300 hover:shadow-md sm:p-3">
      <div className="relative">
        {/* Image link is hidden from AT/tab order — the title link below is
            the single accessible link per card. */}
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-square overflow-hidden rounded-md bg-neutral-50"
        >
          <Image
            src={product.images[0]}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 290px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04] sm:p-4 ${
              outOfStock ? "opacity-50 grayscale" : ""
            }`}
          />
          {outOfStock && (
            <span className="absolute inset-x-2 bottom-2 rounded-sm bg-neutral-800/85 py-1 text-center text-xs font-semibold text-neutral-0">
              Out of stock
            </span>
          )}
        </Link>

        {badge && (
          <span
            className={`pointer-events-none absolute left-2 top-2 rounded-sm px-2 py-0.5 text-[11px] font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
        <div className="absolute right-1.5 top-1.5 z-10">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="text-sm font-medium leading-snug text-neutral-800">
          <Link
            href={href}
            className="line-clamp-2 min-h-[2lh] after:absolute after:inset-0 after:content-[''] hover:text-navy-600"
          >
            {product.name}
          </Link>
        </h3>

        {product.rating !== undefined && (
          <div className="mt-1.5">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
        )}

        <div className="mt-2">
          <Price price={product.price} originalPrice={product.originalPrice} size="sm" />
        </div>

        <p className="mt-1 min-h-4 text-xs font-medium">
          {lowStock ? (
            <span className="text-warning">Only {product.stockQty} left</span>
          ) : product.freeDelivery ? (
            <span className="text-success">Free delivery</span>
          ) : null}
        </p>

        {/* relative z-10 keeps the button above the stretched title link. */}
        <div className="relative z-10 mt-auto pt-3">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            disabled={outOfStock}
          />
        </div>
      </div>
    </article>
  );
}
