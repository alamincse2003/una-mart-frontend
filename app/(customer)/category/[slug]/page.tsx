import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryPath, getCategories, getPriceBounds, getProducts } from "@/lib/catalog";
import { listingQuery, parseListing } from "@/lib/listing";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductListingPage } from "@/components/customer/ProductListingPage";

async function findCategory(slug: string) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  return category ? { category, categories, path: categoryPath(categories, category.id) } : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await findCategory(slug);
  if (!found) return {};
  const { category, path } = found;
  // "Summer" alone is ambiguous — title subcategories with their parent.
  const name =
    path.length > 1 ? `${category.name} — ${path[path.length - 2].name}` : category.name;
  return {
    title: `Shop ${name} Online`,
    description: `Buy ${name.toLowerCase()} online in Bangladesh at UNA Mart. Cash on Delivery, free delivery inside Dhaka.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const found = await findCategory(slug);
  if (!found) notFound();
  const { category, categories, path } = found;

  const listing = parseListing(await searchParams);
  const children = categories.filter((c) => c.parentId === category.id);
  // Only this category's own subcategories can narrow it.
  listing.filters.categorySlugs = listing.filters.categorySlugs.filter((s) => children.some((c) => c.slug === s));

  const [results, priceBounds] = await Promise.all([
    getProducts(listingQuery(listing, { category: [slug] })),
    getPriceBounds({ category: [slug] }),
  ]);
  const crumbs = path.map((c) => ({ label: c.name, href: `/category/${c.slug}` }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(path.map((c) => ({ name: c.name, path: `/category/${c.slug}` })))}
      />
      <PageBanner
        title={category.name}
        breadcrumbs={crumbs}
        description={`${results.total} ${results.total === 1 ? "product" : "products"} · Cash on Delivery available`}
      >
        {children.length > 0 && (
          <nav aria-label={`${category.name} subcategories`} className="mt-5">
            <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {children.map((child) => (
                <li key={child.id} className="shrink-0">
                  <Link
                    href={`/category/${child.slug}`}
                    className="inline-flex min-h-10 items-center rounded-pill border border-neutral-300 bg-neutral-0 px-4 text-sm font-semibold text-neutral-700 transition-colors hover:border-navy-800 hover:text-navy-800"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageBanner>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ProductListingPage
          results={results}
          filters={listing.filters}
          sort={listing.sort}
          categoryOptions={children}
          priceBounds={priceBounds}
        />
      </section>
    </>
  );
}
