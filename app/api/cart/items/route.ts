import { NextRequest, NextResponse } from "next/server";
import { addCartItem, getCart } from "@/lib/fake-cart-store";
import { getProductById } from "@/lib/fake-data";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const body = await request.json();
  const { productId, quantity } = body as {
    productId: string;
    quantity: number;
  };

  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { message: "productId and a positive quantity are required" },
      { status: 400 }
    );
  }

  const product = getProductById(productId);
  if (!product || product.status !== "active") {
    return NextResponse.json(
      { message: "This product is not available" },
      { status: 404 }
    );
  }

  // Never let the cart hold more than is in stock.
  const inCart =
    getCart(sessionId).items.find((i) => i.productId === productId)
      ?.quantity ?? 0;
  const allowed = Math.min(quantity, product.stockQty - inCart);
  if (allowed < 1) {
    return NextResponse.json(
      { message: `Only ${product.stockQty} in stock` },
      { status: 409 }
    );
  }

  const cart = addCartItem(sessionId, productId, allowed);
  return NextResponse.json(cart);
}
