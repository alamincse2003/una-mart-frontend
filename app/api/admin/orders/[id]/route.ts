import { NextRequest, NextResponse } from "next/server";
import { getAdminOrder } from "@/lib/fake-order-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getAdminOrder(id);
  if (!order) return NextResponse.json({ message: "Order not found." }, { status: 404 });
  return NextResponse.json(order);
}
