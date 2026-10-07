import type { Metadata } from "next";
import { getCategories, getPriceBounds, getProducts } from "@/lib/catalog";
import { listingQuery, parseListing } from "@/lib/listing";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductListingPage } from "@/components/customer/ProductListingPage";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse every product at UNA Mart — gadgets, fashion, accessories and sports gear, delivered across Bangladesh.",
  alternates: { canonical: "/products" },
};

export default async function AllProductsPage({ searchParams }: PageProps<"/products">) {
  const listing = parseListing(await searchParams);
  const [categories, results, priceBounds] = await Promise.all([
    getCategories(),
    getProducts(listingQuery(listing, {})),
    getPriceBounds({}),
  ]);

  return (
    <>
      <PageBanner
        title="All Products"
        description="Gadgets, fashion, accessories and sports gear — all in one place."
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ProductListingPage
          results={results}
          filters={listing.filters}
          sort={listing.sort}
          categoryOptions={categories.filter((c) => !c.parentId)}
          priceBounds={priceBounds}
        />
      </section>
    </>
  );
}
