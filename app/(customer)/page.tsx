import { getCategories, getProducts } from "@/lib/fake-data";
import { Hero } from "@/components/customer/Hero";
import { MarqueeStrip } from "@/components/customer/MarqueeStrip";
import { CategoryShowcase } from "@/components/customer/CategoryShowcase";
import { ProductGrid } from "@/components/customer/ProductGrid";

export default async function HomePage() {
  const categories = getCategories();
  const products = getProducts();

  return (
    <>
      <Hero />
      <MarqueeStrip />
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
