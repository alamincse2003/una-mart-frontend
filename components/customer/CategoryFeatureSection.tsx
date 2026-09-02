import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ProductGrid } from "./ProductGrid";

const GRADIENTS = [
  "from-navy-800 to-navy-600",
  "from-coral-600 to-coral-400",
];

export function CategoryFeatureSection({
  category,
  products,
  index,
}: {
  category: Category;
  products: Product[];
  index: number;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div
        className={`relative overflow-hidden rounded-lg bg-linear-to-br p-8 sm:p-10 ${
          GRADIENTS[index % GRADIENTS.length]
        }`}
      >
        <div className="relative max-w-md">
          <h3 className="text-2xl font-bold text-neutral-0">
            {category.name}
          </h3>
          <p className="mt-2 text-sm text-neutral-0/80">
            Explore our {category.name.toLowerCase()} collection, picked for
            everyday value.
          </p>
          <Link
            href={`/category/${category.slug}`}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-neutral-0 px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:bg-neutral-100"
          >
            Shop {category.name} <ArrowRightIcon width={14} height={14} />
          </Link>
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-coral-600">
            Collection
          </p>
          <h2 className="mt-1 text-xl font-bold text-neutral-800">
            {category.name}
          </h2>
        </div>
        <Link
          href={`/category/${category.slug}`}
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
