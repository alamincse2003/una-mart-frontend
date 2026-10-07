import { getAllProducts, getCategories } from "@/lib/catalog";
import { Header } from "@/components/customer/Header";
import { Footer } from "@/components/customer/Footer";
import { CartDrawer } from "@/components/customer/CartDrawer";
import type { MenuProduct } from "@/components/customer/MegaMenu";

const MENU_PRODUCTS_PER_CATEGORY = 5;

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);

  // The mega menu only needs a handful of names per category — send that,
  // not the whole catalog, to the client header on every page.
  const menuProducts: Record<string, MenuProduct[]> = {};
  for (const product of products) {
    const bucket = (menuProducts[product.categoryId] ??= []);
    if (bucket.length < MENU_PRODUCTS_PER_CATEGORY) {
      bucket.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
      });
    }
  }

  return (
    <>
      <Header categories={categories} menuProducts={menuProducts} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer categories={categories} />
      <CartDrawer />
    </>
  );
}
