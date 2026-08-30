import { NextResponse } from "next/server";
import { getCart } from "@/lib/fake-cart-store";
import { getOrCreateSessionId } from "@/lib/session";

export async function GET() {
  const sessionId = await getOrCreateSessionId();
  const cart = getCart(sessionId);
  return NextResponse.json(cart);
}
