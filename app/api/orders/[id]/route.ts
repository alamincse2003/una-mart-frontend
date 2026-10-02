import { NextRequest, NextResponse } from "next/server";
import { findOrder } from "@/lib/fake-order-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const phone = request.nextUrl.searchParams.get("phone") ?? "";
  const order = findOrder(id, phone);

  // Same response whether the id or the phone is wrong — don't reveal
  // which order numbers exist.
  if (!order) {
    return NextResponse.json(
      { message: "We couldn't find an order with that number and phone." },
      { status: 404 }
    );
  }
  return NextResponse.json(order);
}
