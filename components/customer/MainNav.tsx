"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/lib/types";

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
    <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
      <Link
        href="/products"
        className={`whitespace-nowrap rounded-pill px-2.5 py-2 text-sm font-semibold transition-colors xl:px-4 ${
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
          (c) => c.parentId === category.id,
        );
        const menuOpen = activeCategoryId === category.id;

        return (
          <Link
            key={category.id}
            href={href}
            onMouseEnter={() => onHoverCategory(category.id)}
            className={`flex items-center gap-1 whitespace-nowrap rounded-pill px-2.5 py-2 text-sm font-semibold transition-colors xl:px-4 ${
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
        className="ml-1 whitespace-nowrap rounded-pill px-2.5 py-2 text-sm font-bold text-coral-600 transition-colors hover:bg-coral-600 hover:text-neutral-0 xl:px-4"
      >
        Deals
      </Link>
    </nav>
  );
}
