"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export interface FilterState {
  categoryIds: string[];
  availability: ("active" | "out_of_stock")[];
  minPrice: number;
  maxPrice: number;
  minRating: number | null;
}

const RATING_OPTIONS = [4, 3, 2];

export function ProductFilters({
  categories,
  priceBounds,
  filters,
  onChange,
}: {
  categories: Category[];
  priceBounds: { min: number; max: number };
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}) {
  const topLevelCategories = categories.filter((c) => !c.parentId);

  function toggleCategory(id: string) {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id];
    onChange({ ...filters, categoryIds: next });
  }

  function toggleAvailability(status: "active" | "out_of_stock") {
    const next = filters.availability.includes(status)
      ? filters.availability.filter((s) => s !== status)
      : [...filters.availability, status];
    onChange({ ...filters, availability: next });
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterSection title="Category">
        <div className="flex flex-col gap-2">
          {topLevelCategories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
            >
              <input
                type="checkbox"
                checked={filters.categoryIds.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="h-4 w-4 rounded border-neutral-300 text-navy-800 focus:ring-navy-400"
              />
              {category.name}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={filters.availability.includes("active")}
              onChange={() => toggleAvailability("active")}
              className="h-4 w-4 rounded border-neutral-300 text-navy-800 focus:ring-navy-400"
            />
            In Stock
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={filters.availability.includes("out_of_stock")}
              onChange={() => toggleAvailability("out_of_stock")}
              className="h-4 w-4 rounded border-neutral-300 text-navy-800 focus:ring-navy-400"
            />
            Out of Stock
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex flex-col gap-3">
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={filters.maxPrice}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: Number(e.target.value) })
            }
            className="w-full accent-navy-800"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={priceBounds.min}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(e) =>
                onChange({ ...filters, minPrice: Number(e.target.value) })
              }
              className="w-full rounded-md border border-neutral-200 px-2 py-1.5 text-xs"
            />
            <span className="text-xs text-neutral-400">to</span>
            <input
              type="number"
              min={filters.minPrice}
              max={priceBounds.max}
              value={filters.maxPrice}
              onChange={(e) =>
                onChange({ ...filters, maxPrice: Number(e.target.value) })
              }
              className="w-full rounded-md border border-neutral-200 px-2 py-1.5 text-xs"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map((rating) => (
            <label
              key={rating}
              className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => onChange({ ...filters, minRating: rating })}
                className="h-4 w-4 border-neutral-300 text-navy-800 focus:ring-navy-400"
              />
              {rating}+ stars
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === null}
              onChange={() => onChange({ ...filters, minRating: null })}
              className="h-4 w-4 border-neutral-300 text-navy-800 focus:ring-navy-400"
            />
            Any rating
          </label>
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-bold text-neutral-800"
      >
        {title}
        <ChevronDown
          width={16}
          height={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </Card>
  );
}
