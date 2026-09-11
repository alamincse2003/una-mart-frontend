"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { MenuIcon } from "@/components/ui/icons";
import { TopBar } from "./TopBar";
import { MainNav } from "./MainNav";
import { HeaderActions } from "./HeaderActions";
import { MobileNav } from "./MobileNav";
import { MegaMenu } from "./MegaMenu";

// Storefront header: a dark utility TopBar, then the main row
// (logo / MainNav / HeaderActions). Below `lg`, MainNav hides and a
// hamburger button opens MobileNav instead — see that file for the
// mobile menu's own layout and animation.
//
// categories/products are passed in as props, fetched server-side by
// CustomerLayout (app/(customer)/layout.tsx) via lib/fake-data.ts — this
// data doesn't need client-side fetching (no auth, no per-user state), so
// keeping it server-fetched avoids a whole class of client-fetch failure
// (e.g. a self-fetch that gets blocked by hosting-level auth) for data
// that's the same for every visitor anyway.
//
// The MegaMenu is rendered here (not inside MainNav) because it needs to
// span the full header width, not just the width of the nav links — see
// MegaMenu.tsx for the panel itself and MainNav.tsx for how hover events
// reach `hoveredCategoryId` below.
export function Header({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null
  );

  const topLevelCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const subcategoriesByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const category of categories) {
      if (!category.parentId) continue;
      const siblings = map.get(category.parentId) ?? [];
      siblings.push(category);
      map.set(category.parentId, siblings);
    }
    return map;
  }, [categories]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of products) {
      const bucket = map.get(product.categoryId) ?? [];
      bucket.push(product);
      map.set(product.categoryId, bucket);
    }
    return map;
  }, [products]);

  return (
    <header
      className="sticky top-0 z-50 bg-neutral-0/80 shadow-sm backdrop-blur-md"
      onMouseLeave={() => setHoveredCategoryId(null)}
    >
      <TopBar />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1 sm:px-6">
        <Link href="/" className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
          <Image
            src="/una-logo.webp"
            alt="UNA Mart"
            fill
            priority
            sizes="96px"
            className="object-contain"
          />
        </Link>

        <MainNav
          categories={categories}
          activeCategoryId={hoveredCategoryId}
          onHoverCategory={setHoveredCategoryId}
        />

        <div className="flex shrink-0 items-center gap-1">
          <HeaderActions />

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-neutral-100 lg:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {hoveredCategoryId && (
        <MegaMenu
          topLevelCategories={topLevelCategories}
          subcategoriesByParent={subcategoriesByParent}
          activeCategoryId={hoveredCategoryId}
          onHoverCategory={setHoveredCategoryId}
          productsByCategory={productsByCategory}
        />
      )}

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        categories={categories}
      />
    </header>
  );
}
