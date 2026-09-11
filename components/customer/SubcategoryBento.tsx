import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types";

// Bento-style feature block for one parent category's subcategories, per
// the figma reference. Needs exactly 4 items to fill the 1-big + 3-small
// grid shape — Gadgets has 4 real subcategories today (Groceries only has
// 3), so this is scoped to Gadgets until another category has 4.
const SUBCATEGORY_IMAGE: Record<string, string> = {
  audio: "/products/image4.webp",
  wearables: "/products/image3.webp",
  accessories: "/products/image2.webp",
  "chargers-cables": "/products/image5.webp",
};

export function SubcategoryBento({
  subcategories,
}: {
  subcategories: Category[];
}) {
  const [featured, ...rest] = subcategories;
  if (!featured || rest.length < 3) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2">
        <BentoTile category={featured} className="sm:row-span-2" large />
        {rest.slice(0, 2).map((category) => (
          <BentoTile key={category.id} category={category} />
        ))}
        <BentoTile
          category={rest[2]}
          className="sm:col-span-2 sm:row-span-1"
        />
      </div>
    </section>
  );
}

function BentoTile({
  category,
  className = "",
  large = false,
}: {
  category: Category;
  className?: string;
  large?: boolean;
}) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group relative block overflow-hidden rounded-lg ${
        large ? "aspect-square sm:aspect-auto sm:min-h-125" : "min-h-60"
      } ${className}`}
    >
      <Image
        src={SUBCATEGORY_IMAGE[category.slug] ?? "/products/image1.webp"}
        alt=""
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-navy-900/90 via-navy-900/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3
          className={`font-bold leading-tight text-neutral-0 ${
            large ? "text-3xl" : "text-xl"
          }`}
        >
          {category.name}
        </h3>
        <span className="mt-3 inline-flex items-center gap-3 rounded-md bg-coral-400 py-1.5 pl-5 pr-1.5 text-sm font-bold text-navy-900 transition-colors group-hover:bg-coral-500">
          Shop {category.name}
          <span className="flex h-8 w-8 items-center justify-center rounded bg-navy-900 text-neutral-0">
            <ArrowUpRight width={16} height={16} />
          </span>
        </span>
      </div>
    </Link>
  );
}
