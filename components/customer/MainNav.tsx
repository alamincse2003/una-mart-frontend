"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/lib/types";

export function MainNav({
  topLevelCategories,
  hasChildren,
  activeCategoryId,
  onOpenCategory,
  onClose,
}: {
  topLevelCategories: Category[];
  hasChildren: (categoryId: string) => boolean;
  activeCategoryId: string | null;
  onOpenCategory: (categoryId: string, immediate?: boolean) => void;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const itemClass = (active: boolean) =>
    `flex items-center gap-1 whitespace-nowrap rounded-pill px-3 py-2 text-sm font-semibold transition-colors xl:px-4 ${
      active
        ? "bg-navy-800 text-neutral-0"
        : "text-neutral-700 hover:bg-navy-50 hover:text-navy-800"
    }`;

  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-0.5 xl:gap-1">
        <li>
          <Link
            href="/products"
            onMouseEnter={onClose}
            aria-current={pathname === "/products" ? "page" : undefined}
            className={itemClass(pathname === "/products")}
          >
            All Products
          </Link>
        </li>
        {topLevelCategories.map((category) => {
          const href = `/category/${category.slug}`;
          const withMenu = hasChildren(category.id);
          const menuOpen = activeCategoryId === category.id;

          return (
            <li key={category.id}>
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                aria-expanded={withMenu ? menuOpen : undefined}
                onMouseEnter={() =>
                  withMenu ? onOpenCategory(category.id) : onClose()
                }
                onFocus={() =>
                  withMenu ? onOpenCategory(category.id, true) : onClose()
                }
                onClick={onClose}
                className={itemClass(pathname === href || menuOpen)}
              >
                {category.name}
                {withMenu && (
                  <ChevronDown
                    aria-hidden
                    width={15}
                    height={15}
                    className={`transition-transform duration-200 ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/#deals"
            onMouseEnter={onClose}
            onFocus={onClose}
            className="ml-1 whitespace-nowrap rounded-pill px-3 py-2 text-sm font-bold text-coral-700 transition-colors hover:bg-coral-50 xl:px-4"
          >
            Deals
          </Link>
        </li>
      </ul>
    </nav>
  );
}
