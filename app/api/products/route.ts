import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/fake-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  return NextResponse.json(getProducts({ category, search }));
}
