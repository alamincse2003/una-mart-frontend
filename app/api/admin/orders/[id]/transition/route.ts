import { NextRequest, NextResponse } from "next/server";
import { ORDER_TRANSITIONS, OrderError, transitionOrder } from "@/lib/fake-order-store";
import type { OrderStatus } from "@/lib/types";

// POST /admin/orders/:number/transition  { to, note }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { to?: string; note?: string };
  if (!body.to || !(body.to in ORDER_TRANSITIONS)) {
    return NextResponse.json({ message: "Unknown status." }, { status: 400 });
  }
  try {
    return NextResponse.json(transitionOrder(id, body.to as OrderStatus, body.note));
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }
}
