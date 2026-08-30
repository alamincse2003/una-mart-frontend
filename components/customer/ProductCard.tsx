import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";

const BADGE_LABEL: Record<string, string> = {
  new: "NEW",
  best: "BESTSELLER",
};

function badgeClass(badge: string) {
  if (badge === "new") return "bg-navy-800 text-neutral-0";
  if (badge === "best") return "bg-warning text-neutral-0";
  return "bg-coral-600 text-neutral-0";
}

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.status === "out_of_stock";
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : 0;

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block">
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          {product.badge && (
            <span
              className={`absolute left-3 top-3 z-10 rounded-pill px-2.5 py-1 text-[11px] font-bold tracking-wide ${badgeClass(
                product.badge
              )}`}
            >
              {product.badge === "sale"
                ? `-${discountPct}%`
                : BADGE_LABEL[product.badge]}
            </span>
          )}

          <WishlistButton />

          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />

          <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-md bg-navy-800 py-2 text-center text-xs font-semibold text-neutral-0 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            Quick View
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {outOfStock ? "Out of stock" : "In stock"}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-800">
            {product.name}
          </h3>
        </Link>

        {product.rating !== undefined && (
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        )}

        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-navy-800">
            &#2547;{product.price.toLocaleString()}
          </span>
          {discountPct > 0 && (
            <>
              <span className="text-xs text-neutral-500 line-through">
                &#2547;{product.originalPrice!.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-coral-600">
                -{discountPct}%
              </span>
            </>
          )}
        </div>

        {product.freeDelivery && (
          <p className="text-[11px] font-semibold text-success">
            Free Delivery
          </p>
        )}

        <div className="mt-auto pt-3">
          <AddToCartButton
            productId={product.id}
            disabled={outOfStock}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}
