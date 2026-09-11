"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Quote, UserRound } from "lucide-react";

// SAMPLE CONTENT — not real customer reviews. UNA Mart doesn't have a
// review system yet, so these are clearly placeholder quotes (no invented
// names/photos pretending to be real customers, per the same reasoning
// that got the old ReviewsSection removed). Swap for a real reviews feed
// once that exists — see SYSTEM_DESIGN.md's Review entity.
const SAMPLE_TESTIMONIALS = [
  {
    quote:
      "Sample testimonial — ordering felt simple from browsing to checkout, and delivery was on schedule.",
    role: "Placeholder customer, Dhaka",
  },
  {
    quote:
      "Sample testimonial — good range of products in one place, and Cash on Delivery made the first order easy to trust.",
    role: "Placeholder customer, Chattogram",
  },
  {
    quote:
      "Sample testimonial — clear pricing and a straightforward checkout flow, no surprises at payment.",
    role: "Placeholder customer, Sylhet",
  },
  {
    quote:
      "Sample testimonial — clear pricing and a straightforward checkout flow, no surprises at payment.",
    role: "Placeholder customer, Sylhet",
  },
];

const CARD_STYLE = [
  "bg-neutral-50 text-neutral-800",
  "bg-navy-900 text-neutral-0",
  "bg-neutral-50 text-neutral-800",
];

export function TestimonialSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.firstElementChild?.clientWidth ?? 320;
    track.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">
          Feedback From Our Customers
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
        {SAMPLE_TESTIMONIALS.map((testimonial, i) => (
          <div
            key={i}
            className={`animate-fade-rise-in relative w-75 shrink-0 rounded-lg p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:w-90 ${CARD_STYLE[i % CARD_STYLE.length]}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Quote
              width={32}
              height={32}
              className={i % 2 === 0 ? "text-neutral-300" : "text-navy-700"}
            />

            <p className="mt-4 text-sm leading-relaxed">{testimonial.quote}</p>

            <div className="mt-6 flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  i % 2 === 0
                    ? "bg-neutral-200 text-neutral-500"
                    : "bg-navy-700 text-navy-200"
                }`}
              >
                <UserRound width={18} height={18} />
              </span>
              <p className="text-xs">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
