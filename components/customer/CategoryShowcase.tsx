import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-semibold text-neutral-800">
        Shop by category
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {topLevel.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="rounded-lg border border-neutral-200 bg-neutral-0 p-6 text-center font-medium text-navy-800 transition-colors hover:border-navy-400"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
