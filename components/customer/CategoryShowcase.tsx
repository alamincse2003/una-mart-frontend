import Link from "next/link";
import type { Category } from "@/lib/types";
import { ArrowRightIcon } from "@/components/ui/icons";

const GRADIENTS = [
  "from-navy-800 to-navy-600",
  "from-coral-600 to-coral-400",
  "from-navy-700 to-coral-600",
];

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-coral-600">
        Shop by category
      </p>
      <h2 className="mt-1 text-2xl font-bold text-neutral-800">
        Find what you need
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {topLevel.map((category, i) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`group relative aspect-square overflow-hidden rounded-lg bg-linear-to-br shadow-sm transition-shadow hover:shadow-lg sm:aspect-3/4 ${
              GRADIENTS[i % GRADIENTS.length]
            }`}
          >
            <div className="absolute inset-0 bg-linear-to-t from-navy-900/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-neutral-0">
              <h3 className="text-lg font-bold">{category.name}</h3>
              <span className="mt-1 flex translate-y-1.5 items-center gap-1.5 text-xs font-semibold text-neutral-100 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                Explore <ArrowRightIcon width={13} height={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
