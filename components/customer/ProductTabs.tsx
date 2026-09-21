"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { StarIcon } from "@/components/ui/icons";

const PLACEHOLDER_REVIEWS = [
  {
    name: "Rafiul Islam",
    role: "Verified buyer, Dhaka",
    rating: 5,
    text: "Ordered this and it arrived the next day. Packaging was solid and the price was better than what I found elsewhere.",
  },
  {
    name: "Nusrat Jahan",
    role: "Verified buyer, Chattogram",
    rating: 5,
    text: "Exactly as described, delivery was on time. Cash on delivery made it easy to trust the first order.",
  },
  {
    name: "Tanvir Ahmed",
    role: "Verified buyer, Sylhet",
    rating: 4,
    text: "Good quality for the price. Would buy again from UNA Mart.",
  },
];

type Tab = "description" | "specifications" | "reviews";

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>("description");

  const specs: [string, string][] = [
    ["Status", product.status === "active" ? "Active" : "Out of stock"],
    ["Stock quantity", `${product.stockQty} units`],
    ["Free delivery", product.freeDelivery ? "Yes" : "No"],
    [
      "Added",
      new Date(product.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    ],
  ];

  return (
    <div className="mt-14">
      <div className="flex gap-1 border-b border-neutral-200">
        <TabButton active={tab === "description"} onClick={() => setTab("description")}>
          Description
        </TabButton>
        <TabButton
          active={tab === "specifications"}
          onClick={() => setTab("specifications")}
        >
          Specifications
        </TabButton>
        <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")}>
          Reviews {product.reviewCount ? `(${product.reviewCount})` : ""}
        </TabButton>
      </div>

      <div className="py-6">
        {tab === "description" && (
          <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>
        )}

        {tab === "specifications" && (
          <dl className="max-w-xl divide-y divide-neutral-200">
            {specs.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <dt className="text-neutral-500">{label}</dt>
                <dd className="font-medium text-neutral-800">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "reviews" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {PLACEHOLDER_REVIEWS.map((review) => (
              <div
                key={review.name}
                className="rounded-lg border border-neutral-200 bg-neutral-0 p-5"
              >
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      width={14}
                      height={14}
                      filled={i < review.rating}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-neutral-800">
                    {review.name}
                  </p>
                  <p className="text-xs text-neutral-500">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "border-coral-600 text-navy-800"
          : "border-transparent text-neutral-500 hover:text-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}
