import type { MetadataRoute } from "next";
import { IS_STAGING, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (IS_STAGING) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal/transactional pages and the fake API have no search value.
      disallow: ["/api/", "/cart", "/checkout", "/wishlist", "/login", "/register", "/search"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
