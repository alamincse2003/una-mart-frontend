// Structured data (schema.org JSON-LD) helpers. Google uses these for
// product rich results (price, stock, rating) and breadcrumb trails.
import type { Category, Product } from "./types";
import { SITE_NAME, SITE_URL } from "./site";
import { isOutOfStock } from "./product";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output can't contain "</script>" unless the data
      // does; escape "<" to be safe with product text from an API.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function productJsonLd(product: Product, category?: Pick<Category, "name">) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.variants?.[0]?.sku ?? product.id,
    image: product.images.map((src) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)),
    category: category?.name,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(product.rating !== undefined && product.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "BDT",
      price: (product.price / 100).toFixed(2), // poisha → BDT
      availability: isOutOfStock(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}
