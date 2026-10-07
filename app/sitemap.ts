import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const absolute = (src: string) => (src.startsWith("http") ? src : `${SITE_URL}${src}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/products",
    "/about",
    "/contact",
    "/faq",
    "/shipping-policy",
    "/return-policy",
    "/terms",
    "/privacy-policy",
    "/track-order",
  ];
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);

  return [
    ...staticPaths.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: path === "" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.5,
    })),
    ...categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: c.parentId ? 0.6 : 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.map(absolute),
    })),
  ];
}
