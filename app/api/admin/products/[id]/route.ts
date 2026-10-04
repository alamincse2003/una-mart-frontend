import { NextRequest, NextResponse } from "next/server";
import { CatalogError, getProductById, updateProduct, type ProductInput } from "@/lib/fake-data";
import { validateProductInput } from "@/lib/admin-validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Partial<ProductInput>;
  const current = getProductById(id);
  if (!current) return NextResponse.json({ message: "Product not found." }, { status: 404 });

  // Validate against the merged result so "original > price" checks use the
  // price that will actually be saved.
  const problem = validateProductInput({ price: current.price, ...body }, true);
  if (problem) return NextResponse.json({ message: problem }, { status: 400 });
  try {
    return NextResponse.json(updateProduct(id, body));
  } catch (error) {
    if (error instanceof CatalogError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}
