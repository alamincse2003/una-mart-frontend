"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/faqs";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-neutral-0">
      {faqs.map((faq, i) => {
        const open = openIndex === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={faq.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                {faq.question}
                <ChevronDown
                  aria-hidden
                  width={18}
                  height={18}
                  className={`shrink-0 text-neutral-500 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="px-5 pb-5 text-[15px] leading-relaxed text-neutral-700"
            >
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
