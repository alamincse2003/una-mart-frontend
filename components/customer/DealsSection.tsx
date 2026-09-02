import Link from "next/link";
import type { Product } from "@/lib/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ProductGrid } from "./ProductGrid";

export function DealsSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section id="deals" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-coral-600">
            Limited time
          </p>
          <h2 className="mt-1 text-xl font-bold text-neutral-800">
            Best deals
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} products currently discounted.
          </p>
        </div>
        <Link
          href="/category/gadgets"
          className="flex items-center gap-1 text-sm font-semibold text-navy-800 hover:text-coral-600"
        >
          View all <ArrowRightIcon width={14} height={14} />
        </Link>
      </div>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
