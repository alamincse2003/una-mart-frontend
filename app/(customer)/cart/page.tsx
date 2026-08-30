"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { apiClient } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    apiClient.getProducts().then((all) => {
      const bySlugId = Object.fromEntries(all.map((p) => [p.id, p]));
      setProducts(bySlugId);
    });
  }, []);

  if (cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-neutral-800">
          Your cart is empty
        </h1>
        <Link href="/" className="mt-4 inline-block btn-primary">
          Continue shopping
        </Link>
      </section>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-800">Your cart</h1>

      <ul className="mt-6 divide-y divide-neutral-200">
        {cart.items.map((item) => {
          const product = products[item.productId];
          if (!product) return null;

          return (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 flex-shrink-0 rounded-md bg-neutral-50">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <div className="flex-1">
                <p className="font-medium text-neutral-800">{product.name}</p>
                <p className="text-sm text-neutral-500">
                  &#2547;{product.price.toLocaleString()}
                </p>
              </div>

              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(item.id, Number(e.target.value) || 1)
                }
                className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-center"
              />

              <button
                onClick={() => removeItem(item.id)}
                className="text-sm font-medium text-danger transition-colors hover:opacity-80"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-6">
        <p className="text-lg font-semibold text-neutral-800">
          Total: &#2547;{total.toLocaleString()}
        </p>
        <Button variant="cta">Checkout</Button>
      </div>
    </section>
  );
}
