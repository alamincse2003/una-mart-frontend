"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { CartIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

// Right-hand cluster of the main header: search, wishlist, cart, login.
// Search collapses below `md`; login label collapses below `sm` (icon-only).
export function HeaderActions() {
  const { itemCount } = useCart();

  return (
    <div className="flex shrink-0 items-center gap-1">
      <SearchBar className="hidden md:flex" />

      <Link
        href="/login"
        aria-label="Login"
        className="flex h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-semibold text-navy-800 transition-colors hover:bg-neutral-100 sm:px-4"
      >
        <UserIcon width={18} height={18} />
        <span className="hidden sm:inline">Login</span>
      </Link>

      <button
        type="button"
        aria-label="Wishlist"
        className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-coral-600"
      >
        <HeartIcon width={20} height={20} />
      </button>

      <Link
        href="/cart"
        aria-label="Cart"
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-navy-800"
      >
        <CartIcon width={20} height={20} />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-neutral-0 bg-coral-600 px-1 text-[10px] font-bold text-neutral-0">
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
}

function SearchBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-56 items-center rounded-pill border border-neutral-200 bg-neutral-0 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-coral-400 focus-within:ring-4 focus-within:ring-coral-400/15 lg:w-64 ${className}`}
    >
      <input
        type="text"
        placeholder="Search for products…"
        className="w-full flex-1 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-neutral-400"
      />
      <button
        type="button"
        aria-label="Search"
        className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-pill bg-navy-800 text-neutral-0 transition-colors hover:bg-navy-600"
      >
        <SearchIcon width={16} height={16} />
      </button>
    </div>
  );
}
