import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/fake-data";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductListingPage } from "@/components/customer/ProductListingPage";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse every product at UNA Mart — gadgets, fashion, accessories and sports gear, delivered across Bangladesh.",
  alternates: { canonical: "/products" },
};

export default function AllProductsPage() {
  const products = getProducts();
  const categories = getCategories();

  return (
    <>
      <PageBanner
        title="All Products"
        description="Gadgets, fashion, accessories and sports gear — all in one place."
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ProductListingPage
          products={products}
          categories={categories}
          categoryOptions={categories.filter((c) => !c.parentId)}
        />
      </section>
    </>
  );
}
