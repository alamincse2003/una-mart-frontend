"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "What areas do you deliver to?",
    answer:
      "We deliver across Bangladesh. Delivery is free inside Dhaka, with a flat delivery charge for orders outside Dhaka, calculated at checkout.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders inside Dhaka typically arrive within 1–2 business days. Orders outside Dhaka may take 3–5 business days depending on location.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bKash, Nagad, and Cash on Delivery. Card payments aren't supported yet.",
  },
  {
    question: "Can I return an item?",
    answer:
      "Most items can be returned within 7 days of delivery if unused and in original packaging. See our Return Policy for full details and exceptions.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Use the Track Order page with your order number to check its current status.",
  },
  {
    question: "What if my order arrives damaged?",
    answer:
      "Contact our support team within 48 hours of delivery with photos of the item, and we'll arrange a replacement or refund at no extra cost.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-neutral-200 border-y border-neutral-200">
      {FAQS.map((faq, i) => {
        const open = openIndex === i;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-neutral-800"
            >
              {faq.question}
              <ChevronDown
                width={18}
                height={18}
                className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {open && (
              <p className="pb-4 text-sm leading-relaxed text-neutral-600">
                {faq.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
