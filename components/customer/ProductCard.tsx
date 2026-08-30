import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.status === "out_of_stock";

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square bg-neutral-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-neutral-800">
            {product.name}
          </h3>
          <p className="mt-1 text-base font-semibold text-navy-800">
            &#2547;{product.price.toLocaleString()}
          </p>
          {outOfStock && (
            <p className="mt-1 text-xs font-medium text-danger">
              Out of stock
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
