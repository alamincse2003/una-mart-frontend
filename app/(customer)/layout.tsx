import { getCategories, getProducts } from "@/lib/fake-data";
import { Header } from "@/components/customer/Header";
import { Footer } from "@/components/customer/Footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = getCategories();
  const products = getProducts();

  return (
    <>
      <Header categories={categories} products={products} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
