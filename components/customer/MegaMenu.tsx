"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";

/** Slim product summary for the menu — computed server-side in the layout. */
export interface MenuProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
}

// One full-width panel shared across the whole header. Left rail lists the
// hovered top-level category's own subcategories (e.g. Men's Wear,
// Women's Wear under Fashion) — hovering a row there drills one level
// deeper, showing THAT subcategory's own children (e.g. Summer, Winter
// under Men's Wear) as product columns on the right, plus a promo tile.
//
// Header renders this with key={activeCategoryId}, so switching top-level
// category remounts it and resets the drill-down without an effect.
export function MegaMenu({
  activeCategory,
  subcategoriesByParent,
  menuProducts,
  onNavigate,
}: {
  activeCategory: Category;
  subcategoriesByParent: Map<string, Category[]>;
  menuProducts: Record<string, MenuProduct[]>;
  onNavigate: () => void;
}) {
  const [hoveredSubcategoryId, setHoveredSubcategoryId] = useState<
    string | null
  >(null);

  const subcategories = subcategoriesByParent.get(activeCategory.id) ?? [];
  const activeSubcategory =
    subcategories.find((c) => c.id === hoveredSubcategoryId) ??
    subcategories[0];
  const leafCategories = activeSubcategory
    ? (subcategoriesByParent.get(activeSubcategory.id) ?? [])
    : [];
  // Some subcategories (e.g. Audio under Gadgets) have no further children
  // — show that subcategory's own products directly instead.
  const columnCategories =
    leafCategories.length > 0
      ? leafCategories
      : activeSubcategory
        ? [activeSubcategory]
        : [];

  const promoProduct = [activeSubcategory, ...leafCategories]
    .filter(Boolean)
    .map((c) => menuProducts[c!.id]?.[0])
    .find(Boolean);

  if (subcategories.length === 0) return null;

  return (
    <div
      className="animate-menu-in absolute inset-x-0 top-full hidden border-t border-neutral-200 bg-neutral-0 shadow-lg lg:block"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr_260px] gap-8 px-4 py-6 sm:px-6">
        <ul className="flex flex-col gap-1 border-r border-neutral-200 pr-4">
          {subcategories.map((subcategory) => {
            const isActive = subcategory.id === activeSubcategory?.id;
            return (
              <li key={subcategory.id}>
                <Link
                  href={`/category/${subcategory.slug}`}
                  onClick={onNavigate}
                  onMouseEnter={() => setHoveredSubcategoryId(subcategory.id)}
                  onFocus={() => setHoveredSubcategoryId(subcategory.id)}
                  className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-navy-50 text-navy-800"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-navy-800"
                  }`}
                >
                  {subcategory.name}
                  <ChevronRight aria-hidden width={15} height={15} />
                </Link>
              </li>
            );
          })}
          <li className="mt-2 border-t border-neutral-200 pt-2">
            <Link
              href={`/category/${activeCategory.slug}`}
              onClick={onNavigate}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-coral-700 hover:bg-coral-50"
            >
              All {activeCategory.name}
              <ArrowRight aria-hidden width={14} height={14} />
            </Link>
          </li>
        </ul>

        <div className="grid grid-cols-3 content-start gap-8">
          {columnCategories.map((column) => {
            const columnProducts = menuProducts[column.id] ?? [];
            return (
              <div key={column.id}>
                <Link
                  href={`/category/${column.slug}`}
                  onClick={onNavigate}
                  className="text-xs font-bold uppercase tracking-wide text-neutral-800 hover:text-coral-700"
                >
                  {column.name}
                </Link>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {columnProducts.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={onNavigate}
                        className="text-sm text-neutral-600 transition-colors hover:text-navy-800"
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                  {columnProducts.length === 0 && (
                    <li className="text-sm text-neutral-500">
                      New stock coming soon
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        {promoProduct ? (
          <Link
            href={`/product/${promoProduct.slug}`}
            onClick={onNavigate}
            className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
          >
            <div className="relative aspect-4/3">
              <Image
                src={promoProduct.image}
                alt=""
                fill
                sizes="260px"
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="border-t border-neutral-200 bg-neutral-0 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-coral-700">
                Featured
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-bold text-neutral-800">
                {promoProduct.name}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-navy-800">
                Shop now
                <ArrowRight
                  aria-hidden
                  width={14}
                  height={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
