import { getCategories, getProducts } from "@/lib/fake-data";
import { Hero } from "@/components/customer/Hero";
import { CategoryShowcase } from "@/components/customer/CategoryShowcase";
import { CategoryFeatureSection } from "@/components/customer/CategoryFeatureSection";
import { DealsSection } from "@/components/customer/DealsSection";
import { ProductRowSection } from "@/components/customer/ProductRowSection";
import { ReviewsSection } from "@/components/customer/ReviewsSection";
import { NewsletterSection } from "@/components/customer/NewsletterSection";

export default async function HomePage() {
  const categories = getCategories();
  const products = getProducts();
  const topLevelCategories = categories.filter((c) => !c.parentId);

  function productsInCategoryTree(categoryId: string) {
    const descendantIds = new Set(
      categories
        .filter((c) => c.id === categoryId || c.parentId === categoryId)
        .map((c) => c.id)
    );
    return products.filter((p) => descendantIds.has(p.categoryId));
  }

  const dealProducts = products.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );
  const bestSellers = products.filter((p) => p.badge === "best");
  const trending = [...products]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 4);

  return (
    <>
      <Hero />
      <CategoryShowcase categories={categories} />

      {topLevelCategories.map((category, i) => (
        <CategoryFeatureSection
          key={category.id}
          category={category}
          products={productsInCategoryTree(category.id)}
          index={i}
        />
      ))}

      <DealsSection products={dealProducts} />
      <ProductRowSection
        eyebrow="Fan favorites"
        title="Best sellers"
        products={bestSellers}
      />
      <ProductRowSection
        eyebrow="Right now"
        title="Trending products"
        products={trending}
      />
      <ReviewsSection />
      <NewsletterSection />
    </>
  );
}
