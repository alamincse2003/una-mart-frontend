import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import {
  getCategoryPath,
  getDescendantCategoryIds,
  getProductBySlug,
  getProducts,
} from "@/lib/fake-data";
import { getDiscountPercent, isLowStock, isOutOfStock } from "@/lib/product";
import { formatPrice } from "@/lib/format";
import { DELIVERY_FEE } from "@/lib/pricing";
import { breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Price } from "@/components/ui/Price";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StarRating } from "@/components/ui/StarRating";
import { ProductGallery } from "@/components/customer/ProductGallery";
import { ProductPurchasePanel } from "@/components/customer/ProductPurchasePanel";
import { ProductTabs } from "@/components/customer/ProductTabs";
import { ProductCard } from "@/components/customer/ProductCard";
import { ScrollRail } from "@/components/customer/ScrollRail";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const description = `${product.description} ${formatPrice(product.price)} at UNA Mart — Cash on Delivery, bKash & Nagad.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.images.map((url) => ({ url })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const outOfStock = isOutOfStock(product);
  const lowStock = isLowStock(product);
  const discountPct = getDiscountPercent(product);
  const path = getCategoryPath(product.categoryId);
  const category = path[path.length - 1];

  // Related: same leaf category first, then the same top-level category.
  const all = getProducts().filter((p) => p.id !== product.id && !isOutOfStock(p));
  const sameLeaf = all.filter((p) => p.categoryId === product.categoryId);
  const topIds = path[0] ? getDescendantCategoryIds(path[0].id) : new Set<string>();
  const sameTop = all.filter((p) => p.categoryId !== product.categoryId && topIds.has(p.categoryId));
  const related = [...sameLeaf, ...sameTop].slice(0, 8);

  const details: [string, string][] = [
    ["Category", path.map((c) => c.name).join(" › ") || "—"],
    ["Product code", product.id.toUpperCase()],
    [
      "Availability",
      outOfStock ? "Out of stock" : lowStock ? `Only ${product.stockQty} left` : "In stock",
    ],
    [
      "Delivery",
      product.freeDelivery
        ? "Free delivery nationwide"
        : `Free inside Dhaka · ${formatPrice(DELIVERY_FEE.outside_dhaka)} outside Dhaka`,
    ],
    ["Returns", "7-day returns on unused items"],
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product, category)} />
      <JsonLd
        data={breadcrumbJsonLd([
          ...path.map((c) => ({ name: c.name, path: `/category/${c.slug}` })),
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <Breadcrumbs
          items={[
            ...path.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
            { label: product.name },
          ]}
        />
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-12 [&>*]:min-w-0">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="w-fit text-xs font-semibold uppercase tracking-[0.12em] text-coral-700 hover:underline"
            >
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-neutral-800 sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {product.rating !== undefined && (
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size={15} />
            )}
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                outOfStock ? "text-danger" : lowStock ? "text-warning" : "text-success"
              }`}
            >
              <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
              {outOfStock ? "Out of stock" : lowStock ? `Only ${product.stockQty} left` : "In stock"}
            </span>
          </div>

          <div className="mt-5 border-y border-neutral-200 py-5">
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              size="lg"
              showDiscount
            />
            {discountPct > 0 && product.originalPrice && (
              <p className="mt-1 text-sm font-medium text-success">
                You save {formatPrice(product.originalPrice - product.price)}
              </p>
            )}
          </div>

          <div className="mt-6">
            <ProductPurchasePanel
              productId={product.id}
              productName={product.name}
              price={product.price}
              stockQty={product.stockQty}
              outOfStock={outOfStock}
            />
          </div>

          <ul className="mt-6 grid gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-4 sm:grid-cols-2">
            {[
              {
                icon: Truck,
                title: product.freeDelivery ? "Free delivery nationwide" : "Free delivery inside Dhaka",
                text: product.freeDelivery
                  ? "1–2 days in Dhaka, 3–5 days elsewhere"
                  : `${formatPrice(DELIVERY_FEE.outside_dhaka)} outside Dhaka · 3–5 days`,
              },
              { icon: Banknote, title: "Cash on Delivery", text: "Or pay with bKash / Nagad" },
              { icon: RotateCcw, title: "7-day returns", text: "Unused, in original packaging" },
              { icon: ShieldCheck, title: "Genuine product", text: "Checked before dispatch" },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon aria-hidden width={20} height={20} className="mt-0.5 shrink-0 text-navy-600" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{title}</p>
                  <p className="text-xs text-neutral-600">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <ProductTabs product={product} details={details} />
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <SectionHeader id="related" title="You may also like" />
          <div className="mt-6">
            <ScrollRail label="Related products">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ScrollRail>
          </div>
        </section>
      )}
    </>
  );
}
