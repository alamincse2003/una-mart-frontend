import Image from "next/image";
import { Check, LayoutGrid, ShieldCheck, Truck } from "lucide-react";

// "Why Choose UNA Mart?" trust section, per the figma reference. Claims
// are limited to features that are actually real or already committed in
// CLAUDE.md (bKash/Nagad/COD payments, delivery, one-marketplace pitch,
// secure checkout) — no EMI/warranty claims, since those aren't real
// features yet and inventing them would mislead a real visitor (same
// reasoning as dropping the fake customer reviews section earlier).
const FEATURES = [
  {
    icon: Check,
    title: "bKash, Nagad & Cash on Delivery",
    description:
      "Pay the way that works for you — mobile banking or cash when your order arrives.",
  },
  {
    icon: Truck,
    title: "Delivery Across Bangladesh",
    description:
      "Reliable delivery to your doorstep, wherever you are in the country.",
  },
  {
    icon: LayoutGrid,
    title: "Everything in One Place",
    description:
      "Gadgets, groceries and more — one marketplace instead of ten different apps.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Easy Checkout",
    description:
      "A simple, protected checkout flow so you can order with confidence.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid overflow-hidden rounded-lg bg-navy-900 sm:grid-cols-2">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-neutral-0 sm:text-3xl">
            Why Choose UNA Mart?
          </h2>
          <p className="mt-3 text-sm text-navy-200">
            We don&apos;t just sell products — we deliver a marketplace built
            for Bangladesh, with the payment options and delivery you already
            trust.
          </p>

          <ul className="mt-8 flex flex-col gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-coral-400 text-navy-900">
                  <Icon width={18} height={18} />
                </span>
                <div>
                  <p className="font-bold text-neutral-0">{title}</p>
                  <p className="mt-1 text-sm text-navy-200">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden min-h-100 sm:block">
          <Image
            src="/products/image1.webp"
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
