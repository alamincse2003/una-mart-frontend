import { NextResponse } from "next/server";
import { getCategories } from "@/lib/fake-data";

export async function GET() {
  return NextResponse.json(getCategories());
}
