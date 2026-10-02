import Link from "next/link";
import { ArrowRight, Banknote, ShieldCheck, Truck } from "lucide-react";
import type { Category } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { CampaignCarousel, type CampaignSlide } from "./CampaignCarousel";

// Campaign artwork is 1:1 social-style posters with text baked in, so it
// is shown uncropped in a square frame, and the headline/CTAs are real
// HTML beside it (indexable, crisp on every screen, and the LCP text paints
// without waiting on an image). Replace/extend slides here.
const SLIDES: CampaignSlide[] = [
  {
    src: "/products/unamart-banner/banner3.webp",
    alt: "Everything you need, in one place — fashion, accessories, sports and more.",
    href: "/products",
  },
  {
    src: "/products/unamart-banner/banner2.webp",
    alt: "Make life easier with UNA Mart — fashion, accessories, sports and more, in one click.",
    href: "/products",
  },
  {
    src: "/products/unamart-banner/banner4.webp",
    alt: "Good products, smart choices. Shop smart, shop easy.",
    href: "/products",
  },
  {
    src: "/products/unamart-banner/banner5.webp",
    alt: "Everything you need, now at UNA Mart. Shop your way.",
    href: "/products",
  },
  {
    src: "/products/unamart-banner/banner6.webp",
    alt: "UNA Mart — quality products and reliable delivery across Bangladesh.",
    href: "/products",
  },
];

const PROMISES = [
  { icon: Truck, label: "Free delivery in Dhaka" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: ShieldCheck, label: "Genuine products" },
];

export function Hero({ categories }: { categories: Category[] }) {
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <section className="bg-linear-to-b from-navy-50 to-neutral-50">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:py-12">
        <div className="order-2 lg:order-1">
          <p className="inline-flex items-center gap-2 rounded-pill bg-neutral-0 px-3 py-1 text-xs font-semibold text-navy-800 shadow-sm ring-1 ring-navy-100">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-coral-400" />
            Gadgets · Fashion · Accessories · Sports
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-navy-800 sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
            Everything you need,{" "}
            <span className="block text-coral-700">in one place.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-neutral-600 lg:text-lg">
            Genuine products at fair prices, delivered to your door anywhere in
            Bangladesh. Pay with bKash, Nagad or cash when it arrives.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/products" variant="cta" size="lg">
              Shop all products
              <ArrowRight aria-hidden width={18} height={18} />
            </ButtonLink>
            <ButtonLink href="#deals" variant="secondary" size="lg">
              Today&apos;s deals
            </ButtonLink>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {PROMISES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                <Icon aria-hidden width={16} height={16} className="text-success" />
                {label}
              </li>
            ))}
          </ul>

          <nav aria-label="Popular categories" className="mt-7 hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Popular categories
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {topLevel.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="inline-flex min-h-9 items-center rounded-pill border border-neutral-300 bg-neutral-0 px-4 text-sm font-semibold text-neutral-700 transition-colors hover:border-navy-800 hover:text-navy-800"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="order-1 mx-auto w-full max-w-md sm:max-w-lg lg:order-2 lg:max-w-none">
          <CampaignCarousel slides={SLIDES} />
        </div>
      </div>
    </section>
  );
}
