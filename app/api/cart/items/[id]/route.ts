import { NextRequest, NextResponse } from "next/server";
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/fake-cart-store";
import { getProductById } from "@/lib/fake-data";
import { getOrCreateSessionId } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await params;
  const body = await request.json();
  const { quantity } = body as { quantity: number };

  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { message: "A positive quantity is required" },
      { status: 400 }
    );
  }

  const item = getCart(sessionId).items.find((i) => i.id === id);
  const stock = item ? (getProductById(item.productId)?.stockQty ?? 0) : 0;
  const cart = updateCartItem(sessionId, id, Math.min(quantity, Math.max(stock, 1)));
  return NextResponse.json(cart);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await params;
  const cart = removeCartItem(sessionId, id);
  return NextResponse.json(cart);
}
