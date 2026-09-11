import { getCategories, getProducts } from "@/lib/fake-data";
import { Hero } from "@/components/customer/Hero";
import { CategoryShowcase } from "@/components/customer/CategoryShowcase";
import { SubcategoryBento } from "@/components/customer/SubcategoryBento";
import { BestSellingProduct } from "@/components/customer/BestSellingProduct";
import { NewArrivalProducts } from "@/components/customer/NewArrivalProducts";
import { WhyChooseUs } from "@/components/customer/WhyChooseUs";
import { TestimonialSection } from "@/components/customer/TestimonialSection";
import { FeatureHighlight } from "@/components/customer/FeatureHighlight";
import { PromoBanner } from "@/components/customer/PromoBanner";

export default async function HomePage() {
  const categories = getCategories();
  const products = getProducts();
  const bestSellers = products.filter((p) => p.badge === "best");
  const newArrivals = products.filter((p) => p.badge === "new");
  const gadgetsSubcategories = categories.filter(
    (c) => c.parentId === "cat-gadgets",
  );

  return (
    <>
      <Hero />
      <CategoryShowcase categories={categories} />
      <BestSellingProduct products={bestSellers} />
      <SubcategoryBento subcategories={gadgetsSubcategories} />
      <NewArrivalProducts products={newArrivals} />
      <WhyChooseUs />
      <TestimonialSection />
      <FeatureHighlight
        image="/products/image5.webp"
        title="Trusted Gadgets, Real Value"
        description="From wireless earbuds to power banks, our gadget range is picked for everyday reliability at fair prices — with Cash on Delivery, bKash and Nagad accepted on every order."
        ctaLabel="Shop Gadgets"
        ctaHref="/category/gadgets"
      />
      <FeatureHighlight
        image="/products/image1.webp"
        title="Also Available in Groceries"
        description="From cooking oil to daily staples, we're stocking essentials alongside gadgets so your order doesn't need a second trip. Same trusted delivery and payment options across every category."
        ctaLabel="Shop Groceries"
        ctaHref="/category/groceries"
        imageSide="right"
      />
      <PromoBanner
        image="/products/image3.webp"
        title="Shop Smarter, Live"
        accentWord="Better"
        description="From everyday essentials to the latest gadgets, UNA Mart brings it all together — with trusted delivery and payment options built for Bangladesh."
        ctaLabel="Shop Now"
        ctaHref="/category/gadgets"
      />
    </>
  );
}
