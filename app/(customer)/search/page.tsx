import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { getCategories, getProducts } from "@/lib/fake-data";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductListingPage } from "@/components/customer/ProductListingPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export async function generateMetadata({
  searchParams,
}: PageProps<"/search">): Promise<Metadata> {
  const q = (await searchParams).q;
  const query = typeof q === "string" ? q.trim() : "";
  return {
    title: query ? `Search results for “${query}”` : "Search",
    // Search result pages are thin/duplicate content for crawlers.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const q = (await searchParams).q;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const categories = getCategories();
  const topLevel = categories.filter((c) => !c.parentId);
  const results = query ? getProducts({ search: query }) : [];

  return (
    <>
      <PageBanner
        title={query ? `Results for “${query}”` : "Search"}
        breadcrumbs={[{ label: "Search" }]}
        description={
          query
            ? `${results.length} ${results.length === 1 ? "product" : "products"} found`
            : "Search by product name, type or category."
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {results.length > 0 ? (
          <ProductListingPage
            products={results}
            categories={categories}
            categoryOptions={topLevel}
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title={query ? `No results for “${query}”` : "What are you looking for?"}
            description={
              query
                ? "Check the spelling, try a more general word, or browse a category below."
                : "Use the search bar above, or start from a category."
            }
          >
            <div className="flex flex-col items-center gap-5">
              <ul className="flex flex-wrap justify-center gap-2">
                {topLevel.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="inline-flex min-h-10 items-center rounded-pill border border-neutral-300 bg-neutral-0 px-4 text-sm font-semibold text-neutral-700 hover:border-navy-800 hover:text-navy-800"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/products">Browse all products</ButtonLink>
            </div>
          </EmptyState>
        )}
      </section>
    </>
  );
}
