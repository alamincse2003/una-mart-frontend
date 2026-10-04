"use client";

import { useMemo, useState } from "react";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { getDiscountPercent, isOutOfStock } from "@/lib/product";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SortSelect } from "@/components/ui/SortSelect";
import { formatPrice } from "@/lib/format";
import { EMPTY_FILTERS, ProductFilters, type FilterState } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
];

// Client-side filter/sort over a server-provided product list. When the
// catalog moves to NestJS, these filters map 1:1 onto GET /products query
// params (category, price range, …) and this component fetches instead.
export function ProductListingPage({
  products,
  categories,
  categoryOptions,
}: {
  products: Product[];
  /** Full category list — used to resolve filter matches at any depth. */
  categories: Category[];
  categoryOptions: Category[];
}) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 0) };
  }, [products]);

  // categoryId -> itself + all descendants
  const descendantsOf = useMemo(() => {
    const childrenOf = new Map<string, string[]>();
    for (const c of categories) {
      if (!c.parentId) continue;
      childrenOf.set(c.parentId, [...(childrenOf.get(c.parentId) ?? []), c.id]);
    }
    return (id: string) => {
      const result = new Set<string>();
      const stack = [id];
      while (stack.length) {
        const next = stack.pop()!;
        result.add(next);
        stack.push(...(childrenOf.get(next) ?? []));
      }
      return result;
    };
  }, [categories]);

  const filtered = useMemo(() => {
    let result = products;

    if (filters.categoryIds.length > 0) {
      const allowed = new Set(filters.categoryIds.flatMap((id) => [...descendantsOf(id)]));
      result = result.filter((p) => allowed.has(p.categoryId));
    }
    if (filters.inStockOnly) result = result.filter((p) => !isOutOfStock(p));
    if (filters.onSaleOnly) result = result.filter((p) => getDiscountPercent(p) > 0);
    if (filters.minPrice !== null) result = result.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice !== null) result = result.filter((p) => p.price <= filters.maxPrice!);
    if (filters.minRating !== null) result = result.filter((p) => (p.rating ?? 0) >= filters.minRating!);

    const sorted = [...result];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === "newest") sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // "featured": in-stock first, catalog order otherwise
    else sorted.sort((a, b) => Number(isOutOfStock(a)) - Number(isOutOfStock(b)));

    return sorted;
  }, [products, filters, sort, descendantsOf]);

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: () => FilterState }[] = [];
    for (const id of filters.categoryIds) {
      const name = categories.find((c) => c.id === id)?.name ?? id;
      list.push({
        key: `cat-${id}`,
        label: name,
        clear: () => ({ ...filters, categoryIds: filters.categoryIds.filter((c) => c !== id) }),
      });
    }
    if (filters.inStockOnly) list.push({ key: "stock", label: "In stock", clear: () => ({ ...filters, inStockOnly: false }) });
    if (filters.onSaleOnly) list.push({ key: "sale", label: "On sale", clear: () => ({ ...filters, onSaleOnly: false }) });
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      const label = `${filters.minPrice !== null ? formatPrice(filters.minPrice) : "Any"} – ${
        filters.maxPrice !== null ? formatPrice(filters.maxPrice) : "Any"
      }`;
      list.push({ key: "price", label, clear: () => ({ ...filters, minPrice: null, maxPrice: null }) });
    }
    if (filters.minRating !== null) {
      list.push({ key: "rating", label: `${filters.minRating}★ & up`, clear: () => ({ ...filters, minRating: null }) });
    }
    return list;
  }, [filters, categories]);

  const filterPanel = (
    <ProductFilters
      categoryOptions={categoryOptions}
      priceBounds={priceBounds}
      filters={filters}
      onChange={setFilters}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside aria-label="Filters" className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-base font-bold text-neutral-800">Filters</h2>
          {chips.length > 0 && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs font-semibold text-navy-600 underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        {filterPanel}
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="whitespace-nowrap text-sm text-neutral-600" aria-live="polite">
            <span className="font-semibold text-neutral-800">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden"
            >
              <SlidersHorizontal aria-hidden width={15} height={15} />
              Filters{chips.length > 0 && ` (${chips.length})`}
            </Button>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="hidden sm:inline">Sort by</span>
              <SortSelect
                label="Sort by"
                value={sort}
                options={SORT_OPTIONS}
                onChange={setSort}
              />
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={() => setFilters(chip.clear())}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="flex min-h-8 items-center gap-1.5 rounded-pill bg-navy-50 py-1 pl-3 pr-2 text-xs font-semibold text-navy-800 hover:bg-navy-100"
                >
                  {chip.label}
                  <X aria-hidden width={13} height={13} />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="min-h-8 px-2 text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            </li>
          </ul>
        )}

        <div className="mt-5">
          <h2 className="sr-only">Products</h2>
          {filtered.length > 0 ? (
            <ProductGrid products={filtered} priorityCount={4} />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title={products.length === 0 ? "No products here yet" : "No products match your filters"}
              description={
                products.length === 0
                  ? "We're adding new stock regularly. In the meantime, browse the full catalog."
                  : "Try removing a filter or widening the price range."
              }
            >
              {products.length === 0 ? (
                <ButtonLink href="/products">Browse all products</ButtonLink>
              ) : (
                <Button onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>
              )}
            </EmptyState>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        side="left"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setFilters(EMPTY_FILTERS)}
              disabled={chips.length === 0}
              className="flex-1"
            >
              Clear
            </Button>
            <Button onClick={() => setDrawerOpen(false)} className="flex-2">
              Show {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </Button>
          </div>
        }
      >
        <div className="p-5">{filterPanel}</div>
      </Drawer>
    </div>
  );
}
