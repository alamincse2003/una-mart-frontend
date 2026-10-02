import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/fake-data";
import { SITE_URL } from "@/lib/site";

// Swap the fake-data imports for API calls when the catalog moves to NestJS.
export default function sitemap(): MetadataRoute.Sitemap {
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

  return [
    ...staticPaths.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: path === "" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.5,
    })),
    ...getCategories().map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: c.parentId ? 0.6 : 0.8,
    })),
    ...getProducts().map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.map((src) => `${SITE_URL}${src}`),
    })),
  ];
}
