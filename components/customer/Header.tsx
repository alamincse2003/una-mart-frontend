"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useCart } from "@/lib/cart-context";
import { apiClient } from "@/lib/api-client";
import type { Category } from "@/lib/types";
import {
  CartIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";

export function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    apiClient.getCategories().then((all) => {
      setCategories(all.filter((c) => !c.parentId));
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-0/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-2xl font-extrabold tracking-tight text-navy-800"
        >
          UNA <span className="text-coral-600">Mart</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {categories.map((category) => {
            const href = `/category/${category.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={category.id}
                href={href}
                className={`whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-navy-800 text-neutral-0"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-navy-800"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center rounded-md border border-neutral-200 bg-neutral-50 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-coral-400 focus-within:bg-neutral-0 focus-within:ring-4 focus-within:ring-coral-400/15 md:flex md:w-56 lg:ml-0 lg:w-64">
          <SearchIcon width={16} height={16} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full flex-1 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-neutral-400"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-4">
          <Link
            href="/login"
            aria-label="Login"
            className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-navy-800 sm:flex"
          >
            <UserIcon width={18} height={18} />
            Login
          </Link>

          <button
            type="button"
            aria-label="Wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-coral-600"
          >
            <HeartIcon />
          </button>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-10 items-center gap-2 rounded-md bg-navy-800 px-4 text-sm font-semibold text-neutral-0 transition-colors hover:bg-navy-600"
          >
            <CartIcon width={18} height={18} />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-neutral-0 bg-coral-600 px-1 text-[10px] font-bold text-neutral-0">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-neutral-100 lg:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        categories={categories}
        pathname={pathname}
      />
    </header>
  );
}

function MobileNav({
  open,
  onClose,
  categories,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // Mount immediately when opening (adjusting state during render, not in
  // an effect, per https://react.dev/learn/you-might-not-need-an-effect).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }

  useEffect(() => {
    if (open || !mounted) return;
    // Closing: play the exit animation before unmounting.
    const tl = gsap.timeline({ onComplete: () => setMounted(false) });
    tl.to(panelRef.current, {
      x: "100%",
      duration: 0.3,
      ease: "power2.in",
    }).to(overlayRef.current, { opacity: 0, duration: 0.2 }, "<");
  }, [open, mounted]);

  useEffect(() => {
    if (!open || !mounted) return;
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2 }
    );
    gsap.fromTo(
      panelRef.current,
      { x: "100%" },
      { x: "0%", duration: 0.35, ease: "power3.out" }
    );
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-navy-900/50"
      />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-neutral-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <span className="text-lg font-extrabold text-navy-800">
            UNA <span className="text-coral-600">Mart</span>
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="flex items-center rounded-md border border-neutral-200 bg-neutral-50 py-1.5 pl-4 pr-1.5 m-5 mb-2">
          <SearchIcon width={16} height={16} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full flex-1 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-neutral-400"
          />
        </div>

        <nav className="flex flex-col gap-1 px-5 py-3">
          {categories.map((category) => {
            const href = `/category/${category.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={category.id}
                href={href}
                onClick={onClose}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-navy-800 text-neutral-0"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-neutral-200 px-5 py-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <UserIcon width={18} height={18} />
            Login
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <HeartIcon width={18} height={18} />
            Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
