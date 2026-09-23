import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Headset,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { PageBanner } from "@/components/customer/PageBanner";
import { ProductPromoBanner } from "@/components/customer/ProductPromoBanner";

const STATS = [
  { value: "10K+", label: "Happy Customers" },
  { value: "01+", label: "Years of Experience" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "24/7", label: "Customer Support" },
];

const OUR_PROMISE = [
  "Genuine, quality-checked products at fair prices",
  "Fast, reliable delivery across Bangladesh",
  "A wider selection added every week",
];

const OUR_FOCUS = [
  "Building Bangladesh's most trusted online marketplace",
  "Widest range across gadgets, groceries and more",
  "Nationwide delivery with real customer support",
];

const DIFFERENTIATORS = [
  {
    icon: BadgeCheck,
    title: "100% Genuine Products",
    description: "Every item is checked before it reaches our warehouse.",
  },
  {
    icon: Truck,
    title: "Fast, Reliable Delivery",
    description: "Free delivery inside Dhaka, nationwide shipping beyond.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "bKash, Nagad and Cash on Delivery — always safe.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    description: "Our team is here to help, every day of the week.",
  },
];

const TRUST_REASONS = [
  { label: "Nationwide Fast Delivery" },
  { label: "Flexible Payment Options" },
  { label: "Genuine, Quality-Checked Products" },
  { label: "A Growing Community of Shoppers" },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner title="About Us" />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-neutral-50">
            <Image
              src="/products/image3.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-10"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-neutral-800 sm:text-3xl">
              Everything You Need, with Precision, Value &amp; Trust.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              UNA Mart is dedicated to delivering world-class online shopping to
              homes and businesses across Bangladesh. From gadgets to groceries,
              we&apos;re committed to bringing you products you can rely on,
              delivered fast and priced fairly.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-navy-800">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-neutral-800 sm:text-2xl">
              Built to Deliver Real Value.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Our mission is to make quality products accessible to every home
              in Bangladesh. We believe better prices start with a better-run
              marketplace — one committed to fair pricing, reliable delivery and
              honest service.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {OUR_PROMISE.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <CheckCircle2
                    width={16}
                    height={16}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/products"
              className="btn-cta mt-6 inline-flex items-center gap-2"
            >
              Explore Our Products
              <ArrowUpRight width={16} height={16} />
            </Link>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-neutral-50">
            <Image
              src="/products/image1.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-10"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-neutral-50 lg:order-2">
            <Image
              src="/products/image5.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-10"
            />
          </div>

          <div className="lg:order-1">
            <h2 className="text-xl font-bold text-neutral-800 sm:text-2xl">
              Shaping the Future of Online Shopping.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              We envision a Bangladesh where every household is one click away
              from what it needs. Our focus stays on the fundamentals: a wide
              catalog, honest prices and delivery you can count on.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {OUR_FOCUS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <CheckCircle2
                    width={16}
                    height={16}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/products"
              className="btn-cta mt-6 inline-flex items-center gap-2"
            >
              Explore Our Products
              <ArrowUpRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-neutral-0 sm:text-3xl">
            What Makes Us Different
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-navy-100">
            We go beyond selling products — we deliver a complete shopping
            experience built on quality, convenience and trust.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {DIFFERENTIATORS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-navy-700 bg-navy-800 p-6 text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-coral-400/15 text-coral-400">
                  <Icon width={22} height={22} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-neutral-0">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-navy-100">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-coral-600">
              Why Shoppers Choose Us
            </p>
            <h2 className="mt-1 text-xl font-bold text-neutral-800 sm:text-2xl">
              The Core Reasons to Trust Us
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Better service starts with delivering premium products and support
              Bangladesh can rely on.
            </p>

            <div className="mt-6 flex flex-col divide-y divide-neutral-200 border-y border-neutral-200">
              {TRUST_REASONS.map((reason, i) => (
                <div
                  key={reason.label}
                  className="flex items-center gap-4 py-4"
                >
                  <span className="text-sm font-bold text-coral-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-neutral-800">
                    {reason.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-neutral-50">
            <Image
              src="/products/image4.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-10"
            />
          </div>
        </div>
      </section>

      <ProductPromoBanner />
    </>
  );
}
