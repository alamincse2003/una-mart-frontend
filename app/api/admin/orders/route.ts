import { NextRequest, NextResponse } from "next/server";
import { listOrders, ORDER_TRANSITIONS } from "@/lib/fake-order-store";
import type { OrderStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status") as OrderStatus | null;
  if (status && !(status in ORDER_TRANSITIONS)) {
    return NextResponse.json({ message: "Unknown status." }, { status: 400 });
  }
  return NextResponse.json(listOrders({ status: status ?? undefined, q: params.get("q") ?? undefined }));
}
