"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { apiClient } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TrashIcon } from "@/components/ui/icons";

const DEMO_COUPONS: Record<string, number> = {
  WELCOME10: 0.1,
};

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getProducts().then((all) => {
      const bySlugId = Object.fromEntries(all.map((p) => [p.id, p]));
      setProducts(bySlugId);
    });
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (DEMO_COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setCouponError("Invalid coupon code");
    }
  }

  if (cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-neutral-800">
          Your cart is empty
        </h1>
        <Link href="/products" className="mt-4 inline-block btn-primary">
          Continue shopping
        </Link>
      </section>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const discount = appliedCoupon ? subtotal * DEMO_COUPONS[appliedCoupon] : 0;
  const total = subtotal - discount;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Link href="/" className="transition-colors hover:text-navy-800">
          Home
        </Link>
        <ChevronRight width={13} height={13} />
        <span className="text-neutral-800">Cart</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold text-neutral-800">
        My Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <Card className="divide-y divide-neutral-200 p-2 sm:p-4">
          {cart.items.map((item) => {
            const product = products[item.productId];
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 py-4 first:pt-2 last:pb-2 sm:flex-nowrap"
              >
                <div className="relative h-16 w-16 shrink-0 rounded-md bg-neutral-50 sm:h-20 sm:w-20">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-800">
                    {product.name}
                  </p>
                  <p className="mt-1 font-semibold text-navy-800">
                    &#2547;{product.price.toLocaleString()}
                  </p>
                </div>

                <QuantityStepper
                  quantity={item.quantity}
                  onChange={(qty) => updateItem(item.id, qty)}
                />

                <p className="w-20 text-right font-bold text-navy-800">
                  &#2547;{(product.price * item.quantity).toLocaleString()}
                </p>

                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => removeItem(item.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-danger-bg hover:text-danger"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            );
          })}
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-neutral-800">
            Order Summary
          </h2>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter coupon code"
              className="min-w-0 flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-coral-400"
            />
            <Button variant="secondary" onClick={handleApplyCoupon}>
              Apply
            </Button>
          </div>
          {couponError && (
            <p className="mt-1.5 text-xs font-medium text-danger">
              {couponError}
            </p>
          )}
          {appliedCoupon && (
            <p className="mt-1.5 text-xs font-medium text-success">
              &ldquo;{appliedCoupon}&rdquo; applied —{" "}
              {DEMO_COUPONS[appliedCoupon] * 100}% off
            </p>
          )}

          <div className="mt-4 flex justify-between text-sm text-neutral-600">
            <span>Total Items ({itemCount})</span>
            <span>&#2547;{subtotal.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-neutral-600">
            <span>Delivery Charge</span>
            <span>Calculated at checkout</span>
          </div>
          {appliedCoupon && (
            <div className="mt-2 flex justify-between text-sm text-success">
              <span>Promo Discount</span>
              <span>&minus;&#2547;{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold text-navy-800">
            <span>Sub Total</span>
            <span>&#2547;{total.toLocaleString()}</span>
          </div>

          <Link href="/checkout" className="mt-4 block">
            <Button variant="cta" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
          <Link href="/products" className="mt-2 block">
            <Button variant="secondary" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}
