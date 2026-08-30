"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";

export function ProductPurchasePanel({
  productId,
  outOfStock,
}: {
  productId: string;
  outOfStock: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(productId, quantity);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    setAdding(true);
    await addItem(productId, quantity);
    setAdding(false);
    router.push("/cart");
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          disabled={outOfStock || adding}
          onClick={handleAddToCart}
          className="flex-1"
        >
          Add to Cart
        </Button>
        <Button
          variant="cta"
          disabled={outOfStock || adding}
          onClick={handleBuyNow}
          className="flex-1"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
