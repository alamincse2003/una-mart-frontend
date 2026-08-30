import { NextRequest, NextResponse } from "next/server";
import { addCartItem } from "@/lib/fake-cart-store";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const body = await request.json();
  const { productId, quantity } = body as {
    productId: string;
    quantity: number;
  };

  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json(
      { message: "productId and a positive quantity are required" },
      { status: 400 }
    );
  }

  const cart = addCartItem(sessionId, productId, quantity);
  return NextResponse.json(cart);
}
