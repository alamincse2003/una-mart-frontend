import { NextRequest, NextResponse } from "next/server";
import { CatalogError, createProduct, products, type ProductInput } from "@/lib/fake-data";
import { validateProductInput } from "@/lib/admin-validation";

// Admin sees every product, drafts included (the storefront hides drafts).
export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<ProductInput>;
  const problem = validateProductInput(body);
  if (problem) return NextResponse.json({ message: problem }, { status: 400 });
  try {
    return NextResponse.json(createProduct(body as ProductInput), { status: 201 });
  } catch (error) {
    if (error instanceof CatalogError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}
