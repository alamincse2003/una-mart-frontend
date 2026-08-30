import { NextRequest, NextResponse } from "next/server";
import { categories, products } from "@/lib/fake-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let result = products;

  if (category) {
    const matchedCategory = categories.find((c) => c.slug === category);
    result = result.filter(
      (p) => matchedCategory && p.categoryId === matchedCategory.id
    );
  }

  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  return NextResponse.json(result);
}
