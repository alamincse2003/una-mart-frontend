"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category, Product } from "@/lib/types";

// One full-width panel shared across the whole header. Left rail lists the
// hovered top-level category's own subcategories (e.g. Men's Wear,
// Women's Wear under Fashion) — hovering a row there drills one level
// deeper, showing THAT subcategory's own children (e.g. Summer, Winter
// under Men's Wear) as product columns on the right, plus a promo tile.
export function MegaMenu({
  topLevelCategories,
  subcategoriesByParent,
  activeCategoryId,
  productsByCategory,
}: {
  topLevelCategories: Category[];
  subcategoriesByParent: Map<string, Category[]>;
  activeCategoryId: string | null;
  productsByCategory: Map<string, Product[]>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [hoveredSubcategoryId, setHoveredSubcategoryId] = useState<
    string | null
  >(null);

  useEffect(() => {
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
    );
  }, [activeCategoryId]);

  const activeCategory = topLevelCategories.find(
    (c) => c.id === activeCategoryId
  );
  const activeSubcategories = activeCategory
    ? (subcategoriesByParent.get(activeCategory.id) ?? [])
    : [];

  // Reset the drill-down whenever the top-level category changes, and
  // default to the first subcategory so the panel isn't empty on open.
  useEffect(() => {
    setHoveredSubcategoryId(activeSubcategories[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId]);

  const activeSubcategory =
    activeSubcategories.find((c) => c.id === hoveredSubcategoryId) ??
    activeSubcategories[0];
  const leafCategories = activeSubcategory
    ? (subcategoriesByParent.get(activeSubcategory.id) ?? [])
    : [];
  // Some subcategories (e.g. Audio under Gadgets) have no further children
  // — show that subcategory's own products directly instead of an empty
  // column set.
  const columnCategories =
    leafCategories.length > 0 ? leafCategories : activeSubcategory
      ? [activeSubcategory]
      : [];

  const promoProduct = activeSubcategory
    ? productsByCategory.get(activeSubcategory.id)?.[0] ??
      leafCategories
        .map((c) => productsByCategory.get(c.id)?.[0])
        .find(Boolean)
    : undefined;

  if (!activeCategory) return null;

  return (
    <div
      ref={panelRef}
      className="absolute inset-x-0 top-full border-t border-neutral-200 bg-neutral-0 shadow-lg"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[200px_1fr_1fr_1fr_260px] gap-8 px-4 py-6 sm:px-6">
        <ul className="flex flex-col gap-1 border-r border-neutral-100 pr-4">
          {activeSubcategories.map((subcategory) => {
            const isActive = subcategory.id === activeSubcategory?.id;
            return (
              <li key={subcategory.id}>
                <Link
                  href={`/category/${subcategory.slug}`}
                  onMouseEnter={() => setHoveredSubcategoryId(subcategory.id)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-neutral-50 text-navy-800"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-navy-800"
                  }`}
                >
                  {subcategory.name}
                  <ChevronRight width={15} height={15} />
                </Link>
              </li>
            );
          })}
        </ul>

        {columnCategories.map((column) => {
          const columnProducts = productsByCategory.get(column.id) ?? [];
          return (
            <div key={column.id}>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-800">
                {column.name}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {columnProducts.slice(0, 5).map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm text-neutral-600 transition-colors hover:text-coral-600"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
                {columnProducts.length === 0 && (
                  <li className="text-sm text-neutral-400">
                    No products yet
                  </li>
                )}
              </ul>
            </div>
          );
        })}

        {promoProduct && (
          <Link
            href={`/product/${promoProduct.slug}`}
            className="group relative flex flex-col justify-end overflow-hidden rounded-lg bg-linear-to-b from-neutral-200 to-navy-900 p-5"
          >
            <div className="absolute inset-0">
              <Image
                src={promoProduct.images[0]}
                alt=""
                fill
                sizes="260px"
                className="object-contain p-8 opacity-90 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="relative">
              <span className="badge-sale inline-block">New Arrival</span>
              <p className="mt-2 text-lg font-bold text-neutral-0">
                {promoProduct.name}
              </p>
              <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-neutral-0">
                Shop Now <ChevronRight width={15} height={15} />
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
