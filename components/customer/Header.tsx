"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";
import type { Category } from "@/lib/types";
import { TopBar } from "./TopBar";
import { MainNav } from "./MainNav";
import { HeaderActions } from "./HeaderActions";
import { MobileNav } from "./MobileNav";
import { MegaMenu, type MenuProduct } from "./MegaMenu";
import { SearchForm } from "./SearchForm";

// Hover-intent delay so sweeping the mouse across the nav doesn't flash
// every category's menu.
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 150;

// Storefront header: dark utility TopBar (md+), then the main row (logo /
// MainNav / search / actions), then a full-width search row on mobile.
//
// categories + menuProducts come from CustomerLayout (server). The menu
// only gets a few product names per category — never the whole catalog —
// so the header's client payload stays small as the catalog grows.
export function Header({
  categories,
  menuProducts,
}: {
  categories: Category[];
  menuProducts: Record<string, MenuProduct[]>;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuCategoryId, setMenuCategoryId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const headerRef = useRef<HTMLElement>(null);

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

  const openMenu = useCallback((id: string, immediate = false) => {
    clearTimeout(timer.current);
    if (immediate) setMenuCategoryId(id);
    else timer.current = setTimeout(() => setMenuCategoryId(id), OPEN_DELAY_MS);
  }, []);

  const closeMenu = useCallback((immediate = true) => {
    clearTimeout(timer.current);
    if (immediate) setMenuCategoryId(null);
    else timer.current = setTimeout(() => setMenuCategoryId(null), CLOSE_DELAY_MS);
  }, []);

  // Close the desktop menu on navigation, Escape, and focus/click outside.
  // (Mobile nav links close their drawer explicitly via onClose.)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuCategoryId(null);
  }

  useEffect(() => {
    if (!menuCategoryId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    function onFocusIn(e: FocusEvent) {
      if (!headerRef.current?.contains(e.target as Node)) closeMenu();
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [menuCategoryId, closeMenu]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const activeCategory = topLevelCategories.find((c) => c.id === menuCategoryId);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-80 focus:rounded-md focus:bg-navy-800 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-neutral-0"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-0"
        onMouseLeave={() => closeMenu(false)}
        onMouseEnter={() => clearTimeout(timer.current)}
      >
        <TopBar />

        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-18 xl:gap-6">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-neutral-100 lg:hidden"
          >
            <Menu aria-hidden width={22} height={22} />
          </button>

          <Link
            href="/"
            aria-label="UNA Mart home"
            className="relative h-12 w-12 shrink-0 lg:h-14 lg:w-14"
          >
            <Image
              src="/una-logo.webp"
              alt=""
              fill
              priority
              sizes="56px"
              className="object-contain"
            />
          </Link>

          <MainNav
            topLevelCategories={topLevelCategories}
            hasChildren={(id) => (subcategoriesByParent.get(id)?.length ?? 0) > 0}
            activeCategoryId={menuCategoryId}
            onOpenCategory={openMenu}
            onClose={() => closeMenu(false)}
          />

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <SearchForm className="hidden w-56 md:flex xl:w-72" />
            <HeaderActions />
          </div>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <SearchForm />
        </div>

        {activeCategory && (
          <MegaMenu
            key={activeCategory.id}
            activeCategory={activeCategory}
            subcategoriesByParent={subcategoriesByParent}
            menuProducts={menuProducts}
            onNavigate={() => closeMenu()}
          />
        )}
      </header>

      {/* Rendered as a header sibling, not a descendant, so the fixed
          drawer isn't clipped by the sticky header's stacking context. */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        topLevelCategories={topLevelCategories}
        subcategoriesByParent={subcategoriesByParent}
      />
    </>
  );
}
