import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getCategoryPath,
  getProducts,
} from "@/lib/fake-data";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductListingPage } from "@/components/customer/ProductListingPage";

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  const path = getCategoryPath(category.id);
  // "Summer" alone is ambiguous — title subcategories with their parent.
  const name =
    path.length > 1 ? `${category.name} — ${path[path.length - 2].name}` : category.name;
  return {
    title: `Shop ${name} Online`,
    description: `Buy ${name.toLowerCase()} online in Bangladesh at UNA Mart. Cash on Delivery, bKash & Nagad, free delivery inside Dhaka.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categories = getCategories();
  const products = getProducts({ category: slug });
  const path = getCategoryPath(category.id);
  const children = categories.filter((c) => c.parentId === category.id);
  const crumbs = path.map((c) => ({ label: c.name, href: `/category/${c.slug}` }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(path.map((c) => ({ name: c.name, path: `/category/${c.slug}` })))}
      />
      <PageBanner
        title={category.name}
        breadcrumbs={crumbs}
        description={`${products.length} ${products.length === 1 ? "product" : "products"} · Cash on Delivery available`}
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
          products={products}
          categories={categories}
          categoryOptions={children}
        />
      </section>
    </>
  );
}
