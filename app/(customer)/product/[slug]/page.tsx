import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/fake-data";
import { StarRating } from "@/components/ui/StarRating";
import { ProductGrid } from "@/components/customer/ProductGrid";
import { ProductPurchasePanel } from "@/components/customer/ProductPurchasePanel";
import { TruckIcon, ShieldIcon, RefreshIcon } from "@/components/ui/icons";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const outOfStock = product.status === "out_of_stock";
  const lowStock = !outOfStock && product.stockQty <= 5;
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(100 - (product.price / product.originalPrice) * 100)
      : 0;

  const allProducts = getProducts();
  const related = allProducts
    .filter(
      (p) => p.id !== product.id && p.categoryId === product.categoryId
    )
    .slice(0, 4);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6">
        <div>
          <div className="relative aspect-square rounded-lg bg-neutral-50">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-contain p-8"
            />
          </div>
          <div className="mt-3 flex gap-3">
            {product.images.map((image, i) => (
              <div
                key={i}
                className="h-20 w-20 overflow-hidden rounded-md border-2 border-coral-400 bg-neutral-50 opacity-100"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {outOfStock ? "Out of stock" : lowStock ? "Low stock" : "In stock"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-800 sm:text-3xl">
            {product.name}
          </h1>

          {product.rating !== undefined && (
            <div className="mt-3 flex items-center gap-3">
              <StarRating
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
              <span
                className={`text-xs font-bold ${
                  outOfStock
                    ? "text-danger"
                    : lowStock
                      ? "text-warning"
                      : "text-success"
                }`}
              >
                {outOfStock
                  ? "Out of Stock"
                  : lowStock
                    ? "Low Stock"
                    : "In Stock"}
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-navy-800">
              &#2547;{product.price.toLocaleString()}
            </span>
            {discountPct > 0 && (
              <>
                <span className="text-lg text-neutral-500 line-through">
                  &#2547;{product.originalPrice!.toLocaleString()}
                </span>
                <span className="badge-sale">-{discountPct}% OFF</span>
              </>
            )}
            {product.freeDelivery && (
              <span className="rounded-pill bg-success-bg px-3 py-1 text-xs font-bold text-success">
                Free Delivery
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>

          <div className="mt-6">
            <ProductPurchasePanel
              productId={product.id}
              outOfStock={outOfStock}
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-6 border-t border-neutral-200 pt-6">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="text-coral-600">
                <TruckIcon width={18} height={18} />
              </span>
              Cash on Delivery available
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="text-coral-600">
                <ShieldIcon width={18} height={18} />
              </span>
              Secure checkout
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="text-coral-600">
                <RefreshIcon width={18} height={18} />
              </span>
              bKash & Nagad accepted
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            You may also like
          </h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
