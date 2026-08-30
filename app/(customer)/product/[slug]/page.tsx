import Image from "next/image";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { AddToCartButton } from "@/components/customer/AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await apiClient.getProduct(slug);
  } catch {
    notFound();
  }

  const outOfStock = product.status === "out_of_stock";

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6">
      <div className="relative aspect-square rounded-lg bg-neutral-50">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-8"
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">
          {product.name}
        </h1>
        <p className="mt-2 text-2xl font-bold text-navy-800">
          &#2547;{product.price.toLocaleString()}
        </p>
        <p className="mt-4 text-neutral-600">{product.description}</p>
        <p className="mt-2 text-sm text-neutral-500">
          {outOfStock
            ? "Out of stock"
            : `${product.stockQty} in stock`}
        </p>

        <div className="mt-6">
          <AddToCartButton productId={product.id} disabled={outOfStock} />
        </div>
      </div>
    </section>
  );
}
