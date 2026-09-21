"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductFilters, type FilterState } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

const SORT_LABEL: Record<SortOption, string> = {
  featured: "Sort: Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Highest Rated",
};

export function ProductListingPage({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 0),
    };
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    categoryIds: [],
    availability: [],
    minPrice: priceBounds.min,
    maxPrice: priceBounds.max,
    minRating: null,
  });
  const [sort, setSort] = useState<SortOption>("featured");

  const categoryDescendantIds = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const topLevel of categories.filter((c) => !c.parentId)) {
      const ids = new Set(
        categories
          .filter((c) => c.id === topLevel.id || c.parentId === topLevel.id)
          .map((c) => c.id)
      );
      map.set(topLevel.id, ids);
    }
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    let result = products;

    if (filters.categoryIds.length > 0) {
      const allowedIds = new Set(
        filters.categoryIds.flatMap((id) => [
          ...(categoryDescendantIds.get(id) ?? [id]),
        ])
      );
      result = result.filter((p) => allowedIds.has(p.categoryId));
    }

    if (filters.availability.length > 0) {
      result = result.filter((p) =>
        filters.availability.includes(
          p.status === "out_of_stock" ? "out_of_stock" : "active"
        )
      );
    }

    result = result.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    if (filters.minRating !== null) {
      result = result.filter((p) => (p.rating ?? 0) >= filters.minRating!);
    }

    const sorted = [...result];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating")
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return sorted;
  }, [products, filters, sort, categoryDescendantIds]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <ProductFilters
          categories={categories}
          priceBounds={priceBounds}
          filters={filters}
          onChange={setFilters}
        />
      </aside>

      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}{" "}
            available
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-coral-400"
          >
            {(Object.keys(SORT_LABEL) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABEL[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <ProductGrid products={filtered} />
        </div>
      </div>
    </div>
  );
}
