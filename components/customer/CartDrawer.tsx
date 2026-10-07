"use client";

import { ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { Drawer } from "@/components/ui/Drawer";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartLineItem } from "./CartLineItem";

// Mini cart: opens after a successful add-to-cart so shoppers get instant
// confirmation and a one-tap path to checkout without leaving the page.
export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, lines, itemCount, subtotal } = useCart();
  const close = () => setDrawerOpen(false);

  return (
    <Drawer
      open={drawerOpen}
      onClose={close}
      title={`Your cart (${itemCount})`}
      widthClass="max-w-md"
      footer={
        itemCount > 0 ? (
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-600">Subtotal</span>
              <span className="text-lg font-bold tabular-nums text-navy-800">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
              <Truck aria-hidden width={14} height={14} />
              Free delivery inside Dhaka. Delivery calculated at checkout.
            </p>
            <div className="mt-4 grid gap-2">
              <ButtonLink href="/checkout" variant="cta" size="lg" onClick={close}>
                Checkout
              </ButtonLink>
              <ButtonLink href="/cart" variant="secondary" onClick={close}>
                View cart
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      {itemCount === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our latest gadgets, fashion and accessories."
        >
          <ButtonLink href="/products" onClick={close}>
            Start shopping
          </ButtonLink>
        </EmptyState>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 px-5">
          {lines.map((line) => (
            <li key={line.id} className="py-4">
              <CartLineItem line={line} compact onNavigate={close} />
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
