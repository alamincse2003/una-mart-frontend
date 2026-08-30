"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-neutral-200 bg-neutral-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-navy-800">
          UNA Mart
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-neutral-700 sm:flex">
          <Link
            href="/category/gadgets"
            className="transition-colors hover:text-navy-800"
          >
            Gadgets
          </Link>
          <Link
            href="/category/groceries"
            className="transition-colors hover:text-navy-800"
          >
            Groceries
          </Link>
        </nav>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 text-sm font-medium text-navy-800"
        >
          Cart
          {itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-coral-600 px-1.5 text-xs font-semibold text-neutral-0">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
