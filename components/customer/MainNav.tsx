"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/lib/types";

// Centered page links in the main header row. Desktop only — MobileNav
// covers the same links on small screens via the hamburger menu.
//
// This component only renders the links themselves. The MegaMenu it opens
// on hover is owned and positioned by Header.tsx (it needs to span the
// full header width, which this nav's own flex box doesn't) — MainNav just
// reports which category is hovered via `onHoverCategory`. Closing the menu
// is Header's job (its own onMouseLeave covers the whole header), so this
// component doesn't need an onMouseLeave of its own — that would close the
// menu prematurely while the cursor moves from a nav link down into the
// panel below.
//
// A category with subcategories gets a chevron that flips 180° while its
// MegaMenu is open — `activeCategoryId` is the same "which category is
// hovered" state Header already tracks for the MegaMenu itself, so the
// chevron and the panel always agree on what's open.
export function MainNav({
  categories,
  activeCategoryId,
  onHoverCategory,
}: {
  categories: Category[];
  activeCategoryId: string | null;
  onHoverCategory: (categoryId: string) => void;
}) {
  const pathname = usePathname();
  const topLevelCategories = categories.filter((c) => !c.parentId);

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      <Link
        href="/products"
        className={`whitespace-nowrap rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
          pathname === "/products"
            ? "bg-navy-800 text-neutral-0"
            : "text-neutral-600 hover:bg-navy-800 hover:text-neutral-0"
        }`}
      >
        All Products
      </Link>
      {topLevelCategories.map((category) => {
        const href = `/category/${category.slug}`;
        const active = pathname === href;
        const hasSubcategories = categories.some(
          (c) => c.parentId === category.id
        );
        const menuOpen = activeCategoryId === category.id;

        return (
          <Link
            key={category.id}
            href={href}
            onMouseEnter={() => onHoverCategory(category.id)}
            className={`flex items-center gap-1 whitespace-nowrap rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-navy-800 text-neutral-0"
                : "text-neutral-600 hover:bg-navy-800 hover:text-neutral-0"
            }`}
          >
            {category.name}
            {hasSubcategories && (
              <ChevronDown
                width={15}
                height={15}
                className={`transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </Link>
        );
      })}
      <Link
        href="/#deals"
        className="ml-1 whitespace-nowrap rounded-pill px-4 py-2 text-sm font-bold text-coral-600 transition-colors hover:bg-coral-600 hover:text-neutral-0"
      >
        Deals
      </Link>
    </nav>
  );
}
