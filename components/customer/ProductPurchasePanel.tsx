"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, variantLabel } from "@/lib/product";
import type { Variant } from "@/lib/types";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { WishlistButton } from "./WishlistButton";

// Price, option picker and purchase buttons. Price and stock follow the
// chosen variant; the picker only appears when there is a real choice.
export function ProductPurchasePanel({
  productId,
  productName,
  variants,
}: {
  productId: string;
  productName: string;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState(
    () => (variants.find((v) => v.stockQty > 0) ?? variants[0])?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const outOfStock = !variant || variant.stockQty <= 0;
  const originalPrice =
    variant?.compareAtPrice && variant.compareAtPrice > variant.price ? variant.compareAtPrice : undefined;

  // Mobile: once the main buttons scroll out of view, keep a compact
  // purchase bar pinned to the bottom of the screen.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!variant) return null;

  const chooseVariant = (id: string) => {
    setVariantId(id);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    setBusy("add");
    await addItem(variant.id, quantity); // opens the cart drawer on success
    setBusy(null);
  };

  const handleBuyNow = async () => {
    setBusy("buy");
    const ok = await addItem(variant.id, quantity, { openDrawer: false });
    setBusy(null);
    if (ok) router.push("/checkout");
  };

  return (
    <>
      <div className="mt-5 border-y border-neutral-200 py-5">
        <Price price={variant.price} originalPrice={originalPrice} size="lg" showDiscount />
        {originalPrice && (
          <p className="mt-1 text-sm font-medium text-success">
            You save {formatPrice(originalPrice - variant.price)}
          </p>
        )}
      </div>

      {variants.length > 1 && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-neutral-700">
            Option: <span className="font-semibold text-neutral-800">{variantLabel(variant.options) || variant.sku}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => {
              const selected = v.id === variant.id;
              const soldOut = v.stockQty <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseVariant(v.id)}
                  className={`min-h-10 rounded-md border-2 px-4 text-sm font-semibold transition-colors ${
                    selected
                      ? "border-navy-800 bg-navy-50 text-navy-800"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                  } ${soldOut ? "text-neutral-400 line-through" : ""}`}
                >
                  {variantLabel(v.options) || v.sku}
                  {soldOut && <span className="sr-only"> (sold out)</span>}
                </button>
              );
            })}
          </div>
          {!outOfStock && variant.stockQty <= LOW_STOCK_THRESHOLD && (
            <p className="mt-2 text-sm font-semibold text-warning">Only {variant.stockQty} left of this option</p>
          )}
        </fieldset>
      )}

      <div className="mt-6">
        {outOfStock ? (
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" disabled className="flex-1">
              Out of stock
            </Button>
            <WishlistButton productId={productId} productName={productName} variant="outline" />
          </div>
        ) : (
          <div ref={actionsRef} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-700">Quantity</span>
              <QuantityStepper
                quantity={quantity}
                onChange={setQuantity}
                max={Math.min(variant.stockQty, 50)}
                label={`Quantity of ${productName}`}
              />
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="secondary"
                size="lg"
                disabled={busy !== null}
                onClick={handleAddToCart}
                className="min-w-0 flex-1 px-3 sm:px-7"
              >
                <ShoppingCart aria-hidden width={18} height={18} />
                {busy === "add" ? "Adding…" : "Add to cart"}
              </Button>
              <Button
                variant="cta"
                size="lg"
                disabled={busy !== null}
                onClick={handleBuyNow}
                className="min-w-0 flex-1 px-3 sm:px-7"
              >
                <Zap aria-hidden width={18} height={18} />
                {busy === "buy" ? "Please wait…" : "Buy now"}
              </Button>
              <WishlistButton productId={productId} productName={productName} variant="outline" />
            </div>
          </div>
        )}
      </div>

      {!outOfStock && (
        <div
          aria-hidden={!showStickyBar}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-neutral-0/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur transition-transform duration-300 lg:hidden ${
            showStickyBar ? "translate-y-0" : "pointer-events-none translate-y-full"
          }`}
        >
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-neutral-600">{productName}</p>
              <p className="text-base font-bold text-navy-800">{formatPrice(variant.price)}</p>
            </div>
            <Button
              variant="cta"
              tabIndex={showStickyBar ? 0 : -1}
              disabled={busy !== null}
              onClick={handleAddToCart}
            >
              <ShoppingCart aria-hidden width={17} height={17} />
              Add to cart
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
