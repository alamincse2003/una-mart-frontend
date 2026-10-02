import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/fake-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const ids = searchParams.get("ids")?.split(",").filter(Boolean);

  return NextResponse.json(getProducts({ category, search, ids }));
}
