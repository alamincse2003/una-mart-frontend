import { NextRequest, NextResponse } from "next/server";
import { removeCartItem, updateCartItem } from "@/lib/fake-cart-store";
import { getOrCreateSessionId } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = await getOrCreateSessionId();
  const { id } = await params;
  const body = await request.json();
  const { quantity } = body as { quantity: number };

  if (!quantity || quantity < 1) {
    return NextResponse.json(
      { message: "A positive quantity is required" },
      { status: 400 }
    );
  }

  const cart = updateCartItem(sessionId, id, quantity);
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
