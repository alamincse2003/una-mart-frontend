import { StarIcon } from "@/components/ui/icons";

const REVIEWS = [
  {
    name: "Rafiul Islam",
    role: "Verified buyer, Dhaka",
    rating: 5,
    text: "Ordered a power bank and it arrived the next day. Packaging was solid and the price was better than what I found on other sites.",
  },
  {
    name: "Nusrat Jahan",
    role: "Verified buyer, Chattogram",
    rating: 5,
    text: "Groceries were fresh and delivery was on time. Cash on delivery made it easy to trust the first order.",
  },
  {
    name: "Tanvir Ahmed",
    role: "Verified buyer, Sylhet",
    rating: 4,
    text: "Good range of gadgets at fair prices. Would like to see more brands added, but overall a smooth experience.",
  },
];

export function ReviewsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-coral-600">
        Trusted by thousands
      </p>
      <h2 className="mt-1 text-xl font-bold text-neutral-800">
        Customer reviews
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {REVIEWS.map((review) => (
          <div
            key={review.name}
            className="rounded-lg border border-neutral-200 bg-neutral-0 p-5"
          >
            <div className="flex gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} width={14} height={14} filled={i < review.rating} />
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
    </section>
  );
}
