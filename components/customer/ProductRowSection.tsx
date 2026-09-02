import type { Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";

export function ProductRowSection({
  eyebrow,
  title,
  products,
}: {
  eyebrow: string;
  title: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-coral-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold text-neutral-800">{title}</h2>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
