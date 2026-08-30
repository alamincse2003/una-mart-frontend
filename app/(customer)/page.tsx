import { apiClient } from "@/lib/api-client";
import { Hero } from "@/components/customer/Hero";
import { CategoryShowcase } from "@/components/customer/CategoryShowcase";
import { ProductGrid } from "@/components/customer/ProductGrid";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    apiClient.getCategories(),
    apiClient.getProducts(),
  ]);

  return (
    <>
      <Hero />
      <CategoryShowcase categories={categories} />
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="text-xl font-semibold text-neutral-800">
          Featured products
        </h2>
        <div className="mt-6">
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
