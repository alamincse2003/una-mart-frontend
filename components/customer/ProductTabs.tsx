"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Product } from "@/lib/types";
import { StarRating } from "@/components/ui/StarRating";

type Tab = "description" | "details" | "reviews";

// Accessible tabs (WAI-ARIA pattern: roving tabindex, arrow keys).
// Reviews show only the real aggregate rating from the product data —
// individual review text appears once the Review API (SYSTEM_DESIGN.md)
// exists. Never hard-code sample reviews here.
export function ProductTabs({
  product,
  details,
}: {
  product: Product;
  /** Label/value rows built server-side (category, SKU, delivery, …). */
  details: [string, string][];
}) {
  const [tab, setTab] = useState<Tab>("description");
  const baseId = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    description: null,
    details: null,
    reviews: null,
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    {
      id: "reviews",
      label: product.reviewCount ? `Ratings (${product.reviewCount})` : "Ratings",
    },
  ];

  function onKeyDown(e: KeyboardEvent) {
    const index = tabs.findIndex((t) => t.id === tab);
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = tabs[(index + delta + tabs.length) % tabs.length].id;
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product information"
        onKeyDown={onKeyDown}
        className="scrollbar-none flex gap-1 overflow-x-auto border-b border-neutral-200"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-${t.id}-tab`}
            aria-controls={`${baseId}-${t.id}-panel`}
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-coral-400 text-navy-800"
                : "border-transparent text-neutral-600 hover:text-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-${tab}-panel`}
        aria-labelledby={`${baseId}-${tab}-tab`}
        tabIndex={0}
        className="py-6 outline-none"
      >
        {tab === "description" && (
          <p className="max-w-3xl text-[15px] leading-relaxed text-neutral-700">
            {product.description}
          </p>
        )}

        {tab === "details" && (
          <dl className="max-w-xl divide-y divide-neutral-200 rounded-md border border-neutral-200">
            {details.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 text-sm">
                <dt className="text-neutral-600">{label}</dt>
                <dd className="font-medium text-neutral-800">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "reviews" &&
          (product.rating !== undefined && product.reviewCount ? (
            <div className="flex max-w-xl items-center gap-5 rounded-md border border-neutral-200 p-5">
              <p className="text-4xl font-bold tracking-tight text-navy-800">
                {product.rating.toFixed(1)}
                <span className="text-base font-medium text-neutral-500">/5</span>
              </p>
              <div>
                <StarRating rating={product.rating} size={18} />
                <p className="mt-1 text-sm text-neutral-600">
                  Based on {product.reviewCount.toLocaleString("en-US")} ratings from
                  UNA Mart customers.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              This product hasn&apos;t been rated yet.
            </p>
          ))}
      </div>
    </div>
  );
}
