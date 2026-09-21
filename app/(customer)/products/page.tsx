import { getCategories, getProducts } from "@/lib/fake-data";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductListingPage } from "@/components/customer/ProductListingPage";

export default function AllProductsPage() {
  const products = getProducts();
  const categories = getCategories();

  return (
    <>
      <PageBanner title="All Products" />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <ProductListingPage products={products} categories={categories} />
      </section>
    </>
  );
}
