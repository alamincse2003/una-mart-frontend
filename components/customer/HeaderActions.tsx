"use client";

import Link from "next/link";
import { Heart, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      // Re-keying on count replays the bump animation each time it changes.
      key={count}
      className="animate-bump absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-neutral-0 bg-coral-700 px-1 text-[10px] font-bold tabular-nums text-neutral-0"
    >
      {count > 99 ? "99+" : count}
      <span className="sr-only"> {label}</span>
    </span>
  );
}

// Right-hand cluster of the main header: account, wishlist, cart.
// Text label for Login collapses below `sm` (icon-only).
export function HeaderActions() {
  const { itemCount } = useCart();
  const { ids, ready } = useWishlist();
  const { user } = useAuth();
  const iconLink =
    "relative flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-navy-800";

  return (
    <div className="flex shrink-0 items-center">
      <Link
        href={user ? "/account" : "/login"}
        className="flex h-11 items-center gap-1.5 rounded-pill px-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-navy-800 sm:px-3"
      >
        <User aria-hidden width={20} height={20} />
        <span className="sr-only sm:not-sr-only">
          {user ? (user.name?.split(" ")[0] ?? "Account") : "Login"}
        </span>
      </Link>

      <Link href="/wishlist" className={iconLink}>
        <Heart aria-hidden width={20} height={20} />
        <span className="sr-only">Wishlist</span>
        <CountBadge count={ready ? ids.length : 0} label="saved items" />
      </Link>

      <Link href="/cart" className={iconLink}>
        <ShoppingCart aria-hidden width={20} height={20} />
        <span className="sr-only">Cart</span>
        <CountBadge count={itemCount} label="items in cart" />
      </Link>
    </div>
  );
}
