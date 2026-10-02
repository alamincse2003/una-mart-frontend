"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { WishlistButton } from "./WishlistButton";

export function ProductPurchasePanel({
  productId,
  productName,
  price,
  stockQty,
  outOfStock,
}: {
  productId: string;
  productName: string;
  price: number;
  stockQty: number;
  outOfStock: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

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

  const handleAddToCart = async () => {
    setBusy("add");
    await addItem(productId, quantity); // opens the cart drawer on success
    setBusy(null);
  };

  const handleBuyNow = async () => {
    setBusy("buy");
    const ok = await addItem(productId, quantity, { openDrawer: false });
    setBusy(null);
    if (ok) router.push("/checkout");
  };

  if (outOfStock) {
    return (
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" disabled className="flex-1">
          Out of stock
        </Button>
        <WishlistButton productId={productId} productName={productName} variant="outline" />
      </div>
    );
  }

  return (
    <>
      <div ref={actionsRef} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">Quantity</span>
          <QuantityStepper
            quantity={quantity}
            onChange={setQuantity}
            max={stockQty}
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

      <div
        aria-hidden={!showStickyBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-neutral-0/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur transition-transform duration-300 lg:hidden ${
          showStickyBar ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-neutral-600">{productName}</p>
            <p className="text-base font-bold text-navy-800">{formatPrice(price)}</p>
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
    </>
  );
}
