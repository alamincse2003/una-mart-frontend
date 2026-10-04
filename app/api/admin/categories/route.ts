import { NextRequest, NextResponse } from "next/server";
import { CatalogError, createCategory, getCategories } from "@/lib/fake-data";

export async function GET() {
  return NextResponse.json(getCategories());
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { name?: string; parentId?: string | null };
  if (typeof body.name !== "string" || body.name.trim().length < 2) {
    return NextResponse.json({ message: "Category name must be at least 2 characters." }, { status: 400 });
  }
  try {
    return NextResponse.json(createCategory({ name: body.name, parentId: body.parentId ?? null }), { status: 201 });
  } catch (error) {
    if (error instanceof CatalogError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}
