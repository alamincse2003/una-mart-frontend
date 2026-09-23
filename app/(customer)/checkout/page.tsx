"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { apiClient } from "@/lib/api-client";
import type { PaymentMethod, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProductPromoBanner } from "@/components/customer/ProductPromoBanner";

const OUTSIDE_DHAKA_DELIVERY_FEE = 120;

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "cod", label: "Cash on Delivery" },
];

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    apiClient.getProducts().then((all) => {
      setProducts(Object.fromEntries(all.map((p) => [p.id, p])));
    });
  }, []);

  useEffect(() => {
    if (cart.id && cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [cart, router]);

  if (cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const deliveryFee =
    city.trim().toLowerCase() === "dhaka" || city.trim() === ""
      ? 0
      : OUTSIDE_DHAKA_DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    // No backend order-creation endpoint yet — this simulates submission so
    // the checkout flow is demoable end to end (see CLAUDE.md's
    // frontend-first workflow: fake data behind API routes, real UI state).
    setTimeout(() => {
      router.push("/");
    }, 800);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Link href="/" className="transition-colors hover:text-navy-800">
          Home
        </Link>
        <ChevronRight width={13} height={13} />
        <span className="text-neutral-800">Checkout</span>
      </nav>

      <form
        onSubmit={handlePlaceOrder}
        className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start"
      >
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-neutral-800">
              Shipping Information
            </h2>

            <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-neutral-500">
              Contact Information
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-coral-400"
                />
              </Field>
              <Field label="Phone Number" required>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-coral-400"
                />
              </Field>
            </div>

            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-neutral-500">
              Shipping Address
            </h3>
            <div className="mt-3 flex flex-col gap-4">
              <Field label="Street, House, Apartment" required>
                <input
                  type="text"
                  required
                  placeholder="Enter Street Address, House No, Apartment No"
                  className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-coral-400"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" required>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-coral-400"
                  />
                </Field>
                <Field label="District">
                  <input
                    type="text"
                    placeholder="District"
                    className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-coral-400"
                  />
                </Field>
                <Field label="Zip Code">
                  <input
                    type="text"
                    placeholder="Zip Code"
                    className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-coral-400"
                  />
                </Field>
              </div>
              <p className="text-xs text-neutral-500">
                {city.trim() === ""
                  ? "Enter your city to calculate the delivery charge."
                  : deliveryFee === 0
                    ? "Free delivery — this order qualifies for free delivery inside Dhaka."
                    : `A flat ৳${OUTSIDE_DHAKA_DELIVERY_FEE} delivery charge applies outside Dhaka.`}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-neutral-800">
              Select a Payment Method
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                    paymentMethod === method.id
                      ? "border-coral-400 bg-coral-50 text-navy-800"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="h-4 w-4 border-neutral-300 text-navy-800 focus:ring-navy-400"
                  />
                  {method.label}
                </label>
              ))}
            </div>

            {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
              <p className="mt-3 text-xs text-neutral-500">
                You&rsquo;ll be redirected to {paymentMethod === "bkash" ? "bKash" : "Nagad"}{" "}
                to complete payment once you place the order.
              </p>
            )}
            {paymentMethod === "cod" && (
              <p className="mt-3 text-xs text-neutral-500">
                Pay in cash when your order is delivered.
              </p>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-neutral-800">
            Order Summary
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {cart.items.map((item) => {
              const product = products[item.productId];
              if (!product) return null;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 rounded-md bg-neutral-50">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {product.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-navy-800">
                    &#2547;{(product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-sm text-neutral-600">
            <span>Total Items ({cart.items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>&#2547;{subtotal.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-neutral-600">
            <span>Delivery Charge</span>
            <span>
              {deliveryFee === 0 ? "Free" : `৳${deliveryFee.toLocaleString()}`}
            </span>
          </div>
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold text-navy-800">
            <span>Sub Total</span>
            <span>&#2547;{total.toLocaleString()}</span>
          </div>

          <Button
            type="submit"
            variant="cta"
            disabled={placing}
            className="mt-4 w-full"
          >
            {placing ? "Placing order…" : `Proceed to Checkout — ৳${total.toLocaleString()}`}
          </Button>
        </Card>
      </form>

      <div className="mt-10">
        <ProductPromoBanner />
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-neutral-700">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}
