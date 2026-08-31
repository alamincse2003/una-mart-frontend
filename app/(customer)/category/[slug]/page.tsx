import { getCategories, getProducts } from "@/lib/fake-data";
import { ProductGrid } from "@/components/customer/ProductGrid";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = getCategories();
  const products = getProducts({ category: slug });

  const category = categories.find((c) => c.slug === slug);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-800">
        {category?.name ?? "Category"}
      </h1>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
