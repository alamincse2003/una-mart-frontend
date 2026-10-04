import { NextRequest, NextResponse } from "next/server";
import { CatalogError, deleteCategory, updateCategory } from "@/lib/fake-data";

type Params = { params: Promise<{ id: string }> };

function handle(error: unknown) {
  if (error instanceof CatalogError) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }
  throw error;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { name?: string; parentId?: string | null };
  if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim().length < 2)) {
    return NextResponse.json({ message: "Category name must be at least 2 characters." }, { status: 400 });
  }
  try {
    return NextResponse.json(updateCategory(id, body));
  } catch (error) {
    return handle(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handle(error);
  }
}
