"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category, Product } from "@/lib/types";

// One full-width panel shared across the whole header: a left rail lists
// every top-level category, and the right side shows that category's
// subcategory columns plus a promo tile for its top product. Which
// category's columns are shown is controlled by `activeCategoryId` (owned
// by MainNav, since hovering the rail itself changes the selection without
// closing/reopening the panel — see MainNav.tsx).
export function MegaMenu({
  topLevelCategories,
  subcategoriesByParent,
  activeCategoryId,
  onHoverCategory,
  productsByCategory,
}: {
  topLevelCategories: Category[];
  subcategoriesByParent: Map<string, Category[]>;
  activeCategoryId: string | null;
  onHoverCategory: (categoryId: string) => void;
  productsByCategory: Map<string, Product[]>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
    );
  }, []);

  const activeCategory =
    topLevelCategories.find((c) => c.id === activeCategoryId) ??
    topLevelCategories[0];
  const activeSubcategories = activeCategory
    ? (subcategoriesByParent.get(activeCategory.id) ?? [])
    : [];
  const promoProduct = activeCategory
    ? productsByCategory.get(activeCategory.id)?.[0]
    : undefined;

  return (
    <div
      ref={panelRef}
      className="absolute inset-x-0 top-full border-t border-neutral-200 bg-neutral-0 shadow-lg"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr] gap-8 px-4 py-6 sm:px-6">
        {/* Left rail — every top-level category, hover switches the panel */}
        <ul className="border-r border-neutral-100 pr-4">
          {topLevelCategories.map((category) => {
            const isActive = category.id === activeCategory?.id;
            return (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  onMouseEnter={() => onHoverCategory(category.id)}
                  className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-neutral-50 text-navy-800"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-navy-800"
                  }`}
                >
                  {category.name}
                  <ChevronRight width={15} height={15} />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side — subcategory columns + a promo tile */}
        {activeCategory && (
          <div className="grid grid-cols-[1fr_1fr_1fr_260px] gap-8">
            {activeSubcategories.map((subcategory) => {
              const columnProducts =
                productsByCategory.get(subcategory.id) ?? [];
              return (
                <div key={subcategory.id}>
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-800">
                    {subcategory.name}
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
        )}
      </div>
    </div>
  );
}
