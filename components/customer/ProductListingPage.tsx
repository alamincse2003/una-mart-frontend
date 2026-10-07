"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import type { ProductSort } from "@/lib/catalog";
import { formatPrice, toPoisha } from "@/lib/format";
import { EMPTY_FILTERS, listingSearch, type FilterState } from "@/lib/listing";
import type { Category, ProductPage } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SortSelect } from "@/components/ui/SortSelect";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
];

// Filters, sort and page live in the URL; the server page fetches exactly
// the matching page from the API. Changing a filter navigates (no full
// reload) and the grid dims while the new results load.
export function ProductListingPage({
  results,
  filters,
  sort,
  categoryOptions,
  priceBounds,
}: {
  results: ProductPage;
  filters: FilterState;
  sort: ProductSort;
  categoryOptions: Category[];
  /** Poisha. */
  priceBounds: { min: number; max: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hrefFor = (next: FilterState, nextSort: ProductSort, page = 1) =>
    `${pathname}${listingSearch(new URLSearchParams(searchParams.toString()), next, nextSort, page)}`;
  const navigate = (next: FilterState, nextSort = sort) =>
    startTransition(() => router.push(hrefFor(next, nextSort), { scroll: false }));

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: () => FilterState }[] = [];
    for (const slug of filters.categorySlugs) {
      const name = categoryOptions.find((c) => c.slug === slug)?.name ?? slug;
      list.push({
        key: `cat-${slug}`,
        label: name,
        clear: () => ({ ...filters, categorySlugs: filters.categorySlugs.filter((c) => c !== slug) }),
      });
    }
    if (filters.inStockOnly) list.push({ key: "stock", label: "In stock", clear: () => ({ ...filters, inStockOnly: false }) });
    if (filters.onSaleOnly) list.push({ key: "sale", label: "On sale", clear: () => ({ ...filters, onSaleOnly: false }) });
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      const label = `${filters.minPrice !== null ? formatPrice(toPoisha(filters.minPrice)) : "Any"} – ${
        filters.maxPrice !== null ? formatPrice(toPoisha(filters.maxPrice)) : "Any"
      }`;
      list.push({ key: "price", label, clear: () => ({ ...filters, minPrice: null, maxPrice: null }) });
    }
    if (filters.minRating !== null) {
      list.push({ key: "rating", label: `${filters.minRating}★ & up`, clear: () => ({ ...filters, minRating: null }) });
    }
    return list;
  }, [filters, categoryOptions]);

  const filterPanel = (
    <ProductFilters
      categoryOptions={categoryOptions}
      priceBounds={priceBounds}
      filters={filters}
      onChange={(next) => navigate(next)}
    />
  );

  const { items, total, page, totalPages } = results;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside aria-label="Filters" className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-base font-bold text-neutral-800">Filters</h2>
          {chips.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(EMPTY_FILTERS)}
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
            <span className="font-semibold text-neutral-800">{total}</span>{" "}
            {total === 1 ? "product" : "products"}
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
                onChange={(next) => navigate(filters, next)}
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
                  onClick={() => navigate(chip.clear())}
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
                onClick={() => navigate(EMPTY_FILTERS)}
                className="min-h-8 px-2 text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            </li>
          </ul>
        )}

        <div className={`mt-5 transition-opacity ${pending ? "opacity-50" : ""}`} aria-busy={pending}>
          <h2 className="sr-only">Products</h2>
          {items.length > 0 ? (
            <ProductGrid products={items} priorityCount={4} />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title={chips.length === 0 ? "No products here yet" : "No products match your filters"}
              description={
                chips.length === 0
                  ? "We're adding new stock regularly. In the meantime, browse the full catalog."
                  : "Try removing a filter or widening the price range."
              }
            >
              {chips.length === 0 ? (
                <ButtonLink href="/products">Browse all products</ButtonLink>
              ) : (
                <Button onClick={() => navigate(EMPTY_FILTERS)}>Clear filters</Button>
              )}
            </EmptyState>
          )}
        </div>

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3 text-sm">
            {page > 1 ? (
              <Link href={hrefFor(filters, sort, page - 1)} className="flex min-h-10 items-center gap-1 rounded-md border border-neutral-300 px-3 font-semibold text-neutral-700 hover:border-navy-800">
                <ChevronLeft aria-hidden width={16} height={16} />
                Previous
              </Link>
            ) : null}
            <span className="text-neutral-600">
              Page <span className="font-semibold text-neutral-800">{page}</span> of {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={hrefFor(filters, sort, page + 1)} className="flex min-h-10 items-center gap-1 rounded-md border border-neutral-300 px-3 font-semibold text-neutral-700 hover:border-navy-800">
                Next
                <ChevronRight aria-hidden width={16} height={16} />
              </Link>
            ) : null}
          </nav>
        )}
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
              onClick={() => navigate(EMPTY_FILTERS)}
              disabled={chips.length === 0}
              className="flex-1"
            >
              Clear
            </Button>
            <Button onClick={() => setDrawerOpen(false)} className="flex-2">
              Show {total} {total === 1 ? "result" : "results"}
            </Button>
          </div>
        }
      >
        <div className="p-5">{filterPanel}</div>
      </Drawer>
    </div>
  );
}
