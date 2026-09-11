"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCardCompact } from "./ProductCardCompact";

// TEST DATA ONLY: only 2 real products carry the "new" badge today, not
// enough to fill a scrollable row like the figma reference. Repeating them
// here is purely so the carousel can be reviewed with a realistic card
// count — remove this repeat once there are enough real new arrivals.
const ROW_TEST_REPEAT = 3;

// "New Arrival Products" homepage section — horizontally scrollable row
// of the compact product card, per the figma reference. Same carousel
// pattern as CategoryShowcase (arrow buttons scroll the track by one
// card width).
export function NewArrivalProducts({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const cards = Array.from({ length: ROW_TEST_REPEAT }, (_, i) =>
    products.map((product) => ({ product, repeatIndex: i }))
  ).flat();

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild?.clientWidth ?? 260;
    track.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-800">
          New Arrival Products
        </h2>

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
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-coral-400 text-navy-900 transition-colors hover:bg-coral-500"
          >
            <ChevronRight width={18} height={18} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-6 flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
      >
        {cards.map(({ product, repeatIndex }) => (
          <div
            key={`${product.id}-${repeatIndex}`}
            className="w-45 shrink-0 sm:w-64"
          >
            <ProductCardCompact product={product} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/category/gadgets"
          className="inline-flex items-center gap-3 rounded-md bg-coral-400 py-1.5 pl-5 pr-1.5 text-sm font-bold text-navy-900 transition-colors hover:bg-coral-500"
        >
          View All Products
          <span className="flex h-8 w-8 items-center justify-center rounded bg-navy-900 text-neutral-0">
            <ArrowUpRight width={16} height={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
