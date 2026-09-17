import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCardCompact } from "./ProductCardCompact";

// TEST DATA ONLY: only 2 real products carry the "best" badge today, not
// enough to fill an 8-card grid like the figma reference. Repeating them
// here is purely so the grid layout can be reviewed with a realistic card
// count — remove this repeat once there are enough real bestsellers.
const GRID_TEST_REPEAT = 4;

// "Best Selling Product" homepage section — grid of the compact product
// card style, per the figma reference.
export function BestSellingProduct({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const cards = Array.from({ length: GRID_TEST_REPEAT }, (_, i) =>
    products.map((product) => ({ product, repeatIndex: i }))
  ).flat();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-800">
          Best Selling Product
        </h2>
        <Link
          href="/category/gadgets"
          className="flex items-center gap-1 text-sm font-semibold text-neutral-700 underline underline-offset-4 transition-colors hover:text-coral-600"
        >
          View All Products
          <ArrowRight width={15} height={15} />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(({ product, repeatIndex }, i) => (
          <div
            key={`${product.id}-${repeatIndex}`}
            className="animate-fade-rise-in"
            style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}
          >
            <ProductCardCompact product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
