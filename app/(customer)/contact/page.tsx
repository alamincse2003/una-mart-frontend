import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageBanner } from "@/components/customer/PageBanner";
import { Card } from "@/components/ui/Card";
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
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {CHANNELS.map(({ icon: Icon, label, value, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-0 p-4 transition-[border-color,box-shadow] hover:border-neutral-300 hover:shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-800">
                      <Icon aria-hidden width={19} height={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-neutral-800">{label}</span>
                      <span className="block break-all text-sm text-neutral-600">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* TODO(founders): add real support hours here once decided. */}
            <Card className="p-4 text-sm text-neutral-700">
              <p className="flex items-start gap-3">
                <MapPin aria-hidden width={18} height={18} className="mt-0.5 shrink-0 text-navy-600" />
                {SUPPORT_ADDRESS}
              </p>
            </Card>

            <p className="text-sm text-neutral-600">
              Checking on a delivery?{" "}
              <Link href="/track-order" className="font-semibold text-navy-600 underline">
                Track your order
              </Link>{" "}
              or read the{" "}
              <Link href="/faq" className="font-semibold text-navy-600 underline">
                FAQ
              </Link>
              .
            </p>
          </div>

          <Card className="p-5 sm:p-7">
            <h2 className="text-lg font-bold text-neutral-800">Send us a message</h2>
            <p className="mt-1 text-sm text-neutral-600">We usually reply within one business day.</p>
            <div className="mt-5">
              <ContactForm />
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
