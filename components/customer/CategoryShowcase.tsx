"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { ArrowRightIcon } from "@/components/ui/icons";

// Static bg photo per top-level category slug. No lifestyle photography
// exists yet, so these reuse the closest real product photo — swap for
// real category shots once available.
const CATEGORY_IMAGE: Record<string, string> = {
  gadgets: "/products/image3.webp",
  groceries: "/products/image1.webp",
};

// TEST DATA ONLY: there are just 2 real top-level categories today, not
// enough to need a carousel. Repeating them here is purely so the arrow
// buttons/scroll behavior can be verified before more real categories
// exist — remove this repeat once the catalog has enough categories to
// need scrolling on its own.
const CAROUSEL_TEST_REPEAT = 4;

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const topLevel = categories.filter((c) => !c.parentId);
  const cards = Array.from({ length: CAROUSEL_TEST_REPEAT }, (_, i) =>
    topLevel.map((category) => ({ category, repeatIndex: i })),
  ).flat();

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild?.clientWidth ?? 260;
    track.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-coral-600">
            Shop by category
          </p>
          <h2 className="mt-1 text-2xl font-bold text-neutral-800">
            Find what you need
          </h2>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByCard(-1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <ChevronLeft width={18} height={18} />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByCard(1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-coral-600 text-neutral-0 transition-colors hover:bg-coral-700"
          >
            <ChevronRight width={18} height={18} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-6 flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
      >
        {cards.map(({ category, repeatIndex }) => (
          <Link
            key={`${category.id}-${repeatIndex}`}
            href={`/category/${category.slug}`}
            className="group relative aspect-3/4 w-45 shrink-0 overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-lg sm:w-60"
          >
            <Image
              src={CATEGORY_IMAGE[category.slug] ?? "/products/image2.webp"}
              alt=""
              fill
              sizes="240px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-navy-900/85 via-navy-900/20 to-transparent" />
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
