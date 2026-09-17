import { getProducts } from "@/lib/fake-data";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductGrid } from "@/components/customer/ProductGrid";

export default function AllProductsPage() {
  const products = getProducts();

  return (
    <>
      <PageBanner title="All Products" />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <ProductGrid products={products} />
      </section>
    </>
  );
}
