"use client";

import { Banknote, Lock, RotateCcw, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getSavings } from "@/lib/pricing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartLineItem } from "./CartLineItem";
import { OrderSummary } from "./OrderSummary";

export function CartView() {
  const { status, lines, itemCount, subtotal, linesLoading, cart } = useCart();
  const loading = status === "loading" || (cart.items.length > 0 && linesLoading && lines.length === 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
        Shopping cart
        {itemCount > 0 && (
          <span className="ml-2 text-base font-medium text-neutral-500">
            ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
        )}
      </h1>

      {loading ? (
        <div aria-busy="true" aria-label="Loading your cart" className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="space-y-5 p-5">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-24 w-24 animate-pulse rounded-md bg-neutral-100" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </Card>
          <Card className="h-56 animate-pulse bg-neutral-100" />
        </div>
      ) : cart.items.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Explore our latest gadgets, fashion and accessories."
          >
            <ButtonLink href="/products" variant="cta">
              Start shopping
            </ButtonLink>
            <ButtonLink href="/wishlist" variant="secondary">
              View wishlist
            </ButtonLink>
          </EmptyState>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <Card className="px-4 sm:px-5">
            <ul className="divide-y divide-neutral-200">
              {lines.map((line) => (
                <li key={line.item.id} className="py-5">
                  <CartLineItem line={line} />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 lg:sticky lg:top-32">
            <h2 className="text-lg font-bold text-neutral-800">Order summary</h2>
            <div className="mt-4">
              <OrderSummary
                itemCount={itemCount}
                subtotal={subtotal}
                savings={getSavings(lines)}
                deliveryFee={null}
              />
            </div>
            <div className="mt-5 grid gap-2">
              <ButtonLink href="/checkout" variant="cta" size="lg">
                <Lock aria-hidden width={16} height={16} />
                Proceed to checkout
              </ButtonLink>
              <ButtonLink href="/products" variant="secondary">
                Continue shopping
              </ButtonLink>
            </div>
            <ul className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-xs text-neutral-600">
              <li className="flex items-center gap-2">
                <Banknote aria-hidden width={15} height={15} className="text-navy-600" />
                Cash on Delivery, bKash and Nagad accepted
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw aria-hidden width={15} height={15} className="text-navy-600" />
                7-day returns on unused items
              </li>
            </ul>
          </Card>
        </div>
      )}
    </section>
  );
}
