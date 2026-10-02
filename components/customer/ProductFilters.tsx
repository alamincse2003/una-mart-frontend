"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Category } from "@/lib/types";

export interface FilterState {
  categoryIds: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
}

export const EMPTY_FILTERS: FilterState = {
  categoryIds: [],
  inStockOnly: false,
  onSaleOnly: false,
  minPrice: null,
  maxPrice: null,
  minRating: null,
};

const RATING_OPTIONS = [4, 3];

const checkboxClass =
  "h-4.5 w-4.5 shrink-0 rounded border-neutral-400 accent-navy-800";
const optionRowClass =
  "flex min-h-10 cursor-pointer items-center gap-3 text-sm text-neutral-700 hover:text-neutral-800";

export function ProductFilters({
  categoryOptions,
  priceBounds,
  filters,
  onChange,
}: {
  /** Categories offered as filters (top-level on /products, children on a category page). */
  categoryOptions: Category[];
  priceBounds: { min: number; max: number };
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}) {
  function toggleCategory(id: string) {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id];
    onChange({ ...filters, categoryIds: next });
  }

  const parsePrice = (value: string) => (value === "" ? null : Math.max(0, Number(value)));

  return (
    <div className="flex flex-col divide-y divide-neutral-200">
      {categoryOptions.length > 0 && (
        <FilterSection title="Category">
          {categoryOptions.map((category) => (
            <label key={category.id} className={optionRowClass}>
              <input
                type="checkbox"
                checked={filters.categoryIds.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className={checkboxClass}
              />
              {category.name}
            </label>
          ))}
        </FilterSection>
      )}

      <FilterSection title="Availability & offers">
        <label className={optionRowClass}>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className={checkboxClass}
          />
          In stock only
        </label>
        <label className={optionRowClass}>
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => onChange({ ...filters, onSaleOnly: e.target.checked })}
            className={checkboxClass}
          />
          On sale
        </label>
      </FilterSection>

      <FilterSection title="Price (৳)">
        <div className="flex items-center gap-2 pt-1">
          <label className="flex-1">
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={`Min ${priceBounds.min}`}
              value={filters.minPrice ?? ""}
              onChange={(e) => onChange({ ...filters, minPrice: parsePrice(e.target.value) })}
              className="input-base min-h-10 px-3 py-2"
            />
          </label>
          <span aria-hidden className="text-sm text-neutral-500">
            –
          </span>
          <label className="flex-1">
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={`Max ${priceBounds.max}`}
              value={filters.maxPrice ?? ""}
              onChange={(e) => onChange({ ...filters, maxPrice: parsePrice(e.target.value) })}
              className="input-base min-h-10 px-3 py-2"
            />
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Customer rating">
        {[...RATING_OPTIONS, null].map((rating) => (
          <label key={rating ?? "any"} className={optionRowClass}>
            <input
              type="radio"
              name="min-rating"
              checked={filters.minRating === rating}
              onChange={() => onChange({ ...filters, minRating: rating })}
              className="h-4.5 w-4.5 shrink-0 accent-navy-800"
            />
            {rating ? `${rating}★ & up` : "Any rating"}
          </label>
        ))}
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <fieldset className="py-4 first:pt-0">
      <legend className="contents">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-h-9 w-full items-center justify-between text-sm font-bold text-neutral-800"
        >
          {title}
          <ChevronDown
            aria-hidden
            width={16}
            height={16}
            className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </legend>
      {open && <div className="mt-1 flex flex-col">{children}</div>}
    </fieldset>
  );
}
