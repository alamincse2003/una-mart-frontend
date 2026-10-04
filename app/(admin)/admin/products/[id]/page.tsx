import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit product" };

export default async function AdminEditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  return <ProductForm productId={id} />;
}
