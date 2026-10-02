import { BadgeCheck, Banknote, LayoutGrid, Truck } from "lucide-react";
import { Reveal } from "./Reveal";

// "Why UNA Mart" trust section. Claims are limited to things that are
// actually true today (payments, delivery, returns policy, one catalog) —
// no EMI/warranty/"#1" claims until they're real.
const FEATURES = [
  {
    icon: Banknote,
    title: "Pay your way",
    description: "bKash, Nagad, or cash when your order arrives — no card needed.",
  },
  {
    icon: Truck,
    title: "Delivery across Bangladesh",
    description: "Free inside Dhaka in 1–2 days; 3–5 days to every other district.",
  },
  {
    icon: BadgeCheck,
    title: "Checked before it ships",
    description: "Every order is inspected and packed by our own team.",
  },
  {
    icon: LayoutGrid,
    title: "One cart for everything",
    description: "Gadgets, fashion, accessories and more — one order, one delivery.",
  },
];

export function WhyChooseUs() {
  return (
    <section aria-labelledby="why-una" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Reveal className="rounded-lg bg-navy-900 px-5 py-8 sm:px-10 sm:py-12">
        <div className="max-w-2xl" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-coral-200">
            Why UNA Mart
          </p>
          <h2 id="why-una" className="mt-2 text-2xl font-bold tracking-tight text-neutral-0 sm:text-3xl">
            Shopping online, without the worry.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-200 sm:text-base">
            Built for how Bangladesh shops — the payment options and delivery
            you already trust, with real people answering when you call.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              data-reveal
              className="rounded-md border border-navy-700 bg-navy-800 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-coral-400 text-navy-900">
                <Icon aria-hidden width={20} height={20} />
              </span>
              <h3 className="mt-4 font-semibold text-neutral-0">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-200">{description}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
