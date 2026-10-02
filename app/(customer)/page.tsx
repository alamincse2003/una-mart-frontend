import { getCategories, getDescendantCategoryIds, getProducts } from "@/lib/fake-data";
import { getDiscountPercent, isOutOfStock } from "@/lib/product";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/lib/seo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Hero } from "@/components/customer/Hero";
import { TrustStrip } from "@/components/customer/TrustStrip";
import { CategoryShowcase } from "@/components/customer/CategoryShowcase";
import { ProductGrid } from "@/components/customer/ProductGrid";
import { ProductCard } from "@/components/customer/ProductCard";
import { ScrollRail } from "@/components/customer/ScrollRail";
import { WhyChooseUs } from "@/components/customer/WhyChooseUs";
import { PromoBanner } from "@/components/customer/PromoBanner";

const RAIL_SIZE = 8;

export default function HomePage() {
  const categories = getCategories();
  const products = getProducts();
  const available = products.filter((p) => !isOutOfStock(p));

  // Ranking here is a stand-in for real signals; when the backend exists,
  // these become e.g. GET /products?sort=bestselling&limit=8.
  const deals = available
    .filter((p) => getDiscountPercent(p) > 0)
    .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))
    .slice(0, RAIL_SIZE);
  const bestSellers = [...available]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, RAIL_SIZE);
  const newArrivals = [...available]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RAIL_SIZE);

  const productCounts = Object.fromEntries(
    categories
      .filter((c) => !c.parentId)
      .map((c) => {
        const ids = getDescendantCategoryIds(c.id);
        return [c.id, products.filter((p) => ids.has(p.categoryId)).length];
      })
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <Hero categories={categories} />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <TrustStrip />
      </div>

      <CategoryShowcase categories={categories} productCounts={productCounts} />

      {deals.length > 0 && (
        <section id="deals" aria-labelledby="deals-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <SectionHeader
            id="deals-title"
            eyebrow="Limited-time prices"
            title="Today's deals"
            description={`${deals.length} products currently discounted`}
            action={{ label: "View all", href: "/products" }}
          />
          <div className="mt-6">
            <ProductGrid products={deals} />
          </div>
        </section>
      )}

      <section aria-labelledby="best-sellers" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <SectionHeader
          id="best-sellers"
          eyebrow="Customer favourites"
          title="Best sellers"
          action={{ label: "View all", href: "/products" }}
        />
        <div className="mt-6">
          <ScrollRail label="Best sellers">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollRail>
        </div>
      </section>

      <WhyChooseUs />

      <section aria-labelledby="new-arrivals" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <SectionHeader
          id="new-arrivals"
          eyebrow="Just landed"
          title="New arrivals"
          action={{ label: "View all", href: "/products" }}
        />
        <div className="mt-6">
          <ScrollRail label="New arrivals">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollRail>
        </div>
      </section>

      <PromoBanner
        image="/products/image3.webp"
        eyebrow="Gadgets"
        title="Smart tech for everyday life,"
        accent="at fair prices."
        description="Earbuds, smartwatches, power banks and accessories — picked for reliability, with Cash on Delivery on every order."
        ctaLabel="Shop gadgets"
        ctaHref="/category/gadgets"
      />
    </>
  );
}
