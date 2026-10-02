import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: Product[];
  /** How many leading cards load their image eagerly (above the fold). */
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
