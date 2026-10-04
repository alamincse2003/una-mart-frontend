import { NextResponse } from "next/server";
import { getOrderStats } from "@/lib/fake-order-store";

export async function GET() {
  return NextResponse.json(getOrderStats());
}
