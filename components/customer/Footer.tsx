import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  PAYMENT_METHOD_LABELS,
  SITE_TAGLINE,
  SOCIAL_LINKS,
  SUPPORT_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from "@/lib/site";
import type { Category } from "@/lib/types";
import { TrustStrip } from "./TrustStrip";

// Social brand logos aren't in lucide-react (generic icons only), so these
// are small hand-written SVGs. No new dependency for 3 icons.
function SocialIcon({ name }: { name: (typeof SOCIAL_LINKS)[number]["name"] }) {
  if (name === "WhatsApp") {
    return (
      <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.32 4.95L2 22l5.2-1.36a9.96 9.96 0 0 0 4.84 1.23h.01c5.52 0 10-4.48 10-10s-4.48-9.87-10.01-9.87zm5.87 14.2c-.25.7-1.45 1.37-2 1.46-.51.08-1.15.11-1.85-.12-.43-.14-.98-.32-1.68-.63-2.96-1.28-4.89-4.25-5.04-4.45-.15-.2-1.21-1.6-1.21-3.06 0-1.45.77-2.17 1.04-2.47.27-.3.6-.37.8-.37s.4 0 .58.01c.19.01.44-.07.68.52.25.6.86 2.07.93 2.22.08.15.13.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.26 1.64 2.04 1.13 1 2.07 1.32 2.38 1.47.31.15.48.13.66-.08.18-.2.77-.89.97-1.2.2-.3.4-.25.68-.15.27.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.72-.17 1.42z" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "Facebook" ? (
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      ) : (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

const HELP_LINKS = [
  { label: "Track Order", href: "/track-order" },
  { label: "Shipping & Delivery", href: "/shipping-policy" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "All Products", href: "/products" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export function Footer({ categories }: { categories: Category[] }) {
  const columns = [
    {
      title: "Shop",
      links: categories
        .filter((c) => !c.parentId)
        .map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    },
    { title: "Help", links: HELP_LINKS },
    { title: "Company", links: COMPANY_LINKS },
  ];

  return (
    <footer className="mt-auto bg-navy-900 text-navy-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="border-b border-navy-700 py-8">
          <TrustStrip tone="dark" />
        </div>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label="UNA Mart home"
              className="relative block h-14 w-14 rounded-lg bg-neutral-0"
            >
              <Image src="/una-logo.webp" alt="" fill sizes="56px" className="object-contain p-1" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-200">
              {SITE_TAGLINE} Gadgets, fashion, accessories and more, delivered
              across Bangladesh.
            </p>

            <ul className="mt-5 flex flex-col gap-3 text-sm text-navy-100">
              <li>
                <a href={SUPPORT_PHONE_HREF} className="flex items-center gap-2.5 hover:text-neutral-0">
                  <Phone aria-hidden width={15} height={15} className="text-coral-200" />
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2.5 break-all hover:text-neutral-0">
                  <Mail aria-hidden width={15} height={15} className="shrink-0 text-coral-200" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin aria-hidden width={15} height={15} className="mt-0.5 shrink-0 text-coral-200" />
                {SUPPORT_ADDRESS}
              </li>
            </ul>

            <ul className="mt-5 flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`UNA Mart on ${social.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-navy-100 transition-colors hover:bg-coral-400 hover:text-navy-900"
                  >
                    <SocialIcon name={social.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-bold text-neutral-0">{column.title}</h2>
              <ul className="mt-4 space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-sm text-navy-200 transition-colors hover:text-neutral-0"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-navy-700 py-6 text-xs text-navy-200 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} UNA Mart. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1">We accept</span>
            {Object.values(PAYMENT_METHOD_LABELS).map((label) => (
              <span
                key={label}
                className="rounded-sm border border-navy-700 bg-navy-800 px-2.5 py-1 font-semibold text-neutral-0"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
