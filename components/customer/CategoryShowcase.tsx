import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "./Reveal";

// Representative photo per top-level category slug. Packshots are shown
// uncropped on a light tile (they're shot on white) — swap for real
// category/lifestyle photography once available.
const CATEGORY_IMAGE: Record<string, string> = {
  gadgets: "/products/image1.webp",
  fashion: "/products/Three Piece.webp",
  accessories: "/products/Watch4.webp",
  sports: "/products/Shoes3.webp",
};

export function CategoryShowcase({
  categories,
  productCounts,
}: {
  categories: Category[];
  /** Products per top-level category id, including subcategories. */
  productCounts: Record<string, number>;
}) {
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <section aria-labelledby="shop-by-category" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeader
        id="shop-by-category"
        eyebrow="Shop by category"
        title="Find what you need"
        action={{ label: "All products", href: "/products" }}
      />

      <Reveal className="mt-6">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {topLevel.map((category) => (
            <li key={category.id} data-reveal>
              <Link
                href={`/category/${category.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 transition-[border-color,box-shadow] hover:border-neutral-300 hover:shadow-md"
              >
                <div className="relative aspect-square bg-neutral-50">
                  <Image
                    src={CATEGORY_IMAGE[category.slug] ?? "/products/image2.webp"}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 290px, 50vw"
                    className="object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-105 sm:p-8"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-neutral-800 sm:text-lg">
                      {category.name}
                    </h3>
                    <p className="text-xs text-neutral-600">
                      {productCounts[category.id] ?? 0} products
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-800 transition-colors group-hover:bg-navy-800 group-hover:text-neutral-0"
                  >
                    <ArrowRight width={16} height={16} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
