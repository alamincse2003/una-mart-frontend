import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageBanner } from "@/components/customer/PageBanner";
import { ContactForm } from "@/components/customer/ContactForm";
import {
  SUPPORT_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
  WHATSAPP_HREF,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get help with an order or product. Call ${SUPPORT_PHONE}, WhatsApp, or email UNA Mart.`,
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  { icon: Phone, label: "Call us", value: SUPPORT_PHONE, href: SUPPORT_PHONE_HREF },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat with our team", href: WHATSAPP_HREF, external: true },
  { icon: Mail, label: "Email", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
];

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact us"
        breadcrumbs={[{ label: "Contact" }]}
        description="Questions about an order, a product, or anything else? Our team is happy to help."
      />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0 shadow-sm lg:grid-cols-[1fr_1.3fr]">
          {/* Contact channels */}
          <div className="relative flex flex-col overflow-hidden bg-linear-to-br from-navy-800 to-navy-900 p-7 text-neutral-0 sm:p-10">
            <span
              aria-hidden
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-coral-400/25 blur-3xl"
            />
            <span
              aria-hidden
              className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-coral-400/10 blur-3xl"
            />

            <div className="relative">
              <h2 className="text-2xl font-bold">Talk to a real person</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-100">
                Pick whatever&apos;s easiest — we&apos;ll get back to you fast.
              </p>
            </div>

            <ul className="relative mt-8 flex flex-col gap-3">
              {CHANNELS.map(({ icon: Icon, label, value, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-xl bg-neutral-0/5 p-4 ring-1 ring-neutral-0/10 transition-colors hover:bg-neutral-0/10"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-400/15 text-coral-400 ring-1 ring-coral-400/30">
                      <Icon aria-hidden width={19} height={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className="block break-all text-sm text-navy-100">{value}</span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      width={16}
                      height={16}
                      className="shrink-0 text-navy-200 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>

            {/* TODO(founders): add real support hours here once decided. */}
            <p className="relative mt-6 flex items-start gap-3 text-sm text-navy-100">
              <MapPin aria-hidden width={18} height={18} className="mt-0.5 shrink-0 text-coral-400" />
              {SUPPORT_ADDRESS}
            </p>

            <p className="relative mt-auto pt-8 text-sm text-navy-100">
              Checking on a delivery?{" "}
              <Link href="/track-order" className="font-semibold text-neutral-0 underline">
                Track your order
              </Link>{" "}
              or read the{" "}
              <Link href="/faq" className="font-semibold text-neutral-0 underline">
                FAQ
              </Link>
              .
            </p>
          </div>

          {/* Message form */}
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-800">Send us a message</h2>
            <p className="mt-1.5 text-sm text-neutral-600">We usually reply within one business day.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
