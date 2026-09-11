import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

// Social brand logos aren't in lucide-react (generic icons only), so these
// are small hand-written SVGs — same approach used before the header's
// icon set migrated to lucide-react. No new dependency for 4 icons.
function SocialIcon({
  name,
}: {
  name: "facebook" | "instagram" | "x" | "youtube";
}) {
  const paths: Record<typeof name, React.ReactNode> = {
    facebook: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
    instagram: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    youtube: (
      <>
        <path d="M22 8.5s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C16.3 5 12 5 12 5s-4.3 0-7.1.3c-.4 0-1.3.1-2.1.9C2.2 6.9 2 8.5 2 8.5S1.8 10.4 1.8 12.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.9 1.9.8 2.4.9 1.7.2 7.3.3 7.3.3s4.3 0 7.1-.3c.4 0 1.3-.1 2.1-.9.6-.7.8-2.3.8-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8z" />
        <polygon points="10 15 15 12 10 9" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const SUPPORT_PHONE = "+880 1XXX-XXXXXX";
const SUPPORT_EMAIL = "support@unamart.com";
const SUPPORT_ADDRESS = "House 12, Road 3, Block A, Mirpur 12, Dhaka 1216";

const LINK_COLUMNS: { title: string; links: string[] }[] = [
  { title: "Company", links: ["About Us", "Shop", "FAQ", "Contact Us"] },
  { title: "Categories", links: ["Gadgets", "Groceries", "Audio", "Staples"] },
  {
    title: "Help",
    links: [
      "Track Order",
      "Return Policy",
      "Shipping & Delivery Policy",
      "Terms & Conditions",
      "Privacy Policy",
    ],
  },
];

const SOCIAL_LINKS: { name: "facebook" | "instagram" | "x" | "youtube" }[] = [
  { name: "facebook" },
  { name: "instagram" },
  { name: "x" },
  { name: "youtube" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-900 text-navy-100">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        {/* Newsletter row */}
        <div className="flex flex-col gap-4 border-b border-navy-700 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-neutral-0 sm:text-2xl">
            Sign Up For Our Newsletter Today
          </h2>
          <div className="w-full sm:w-auto">
            <form className="flex w-full overflow-hidden rounded-md bg-navy-800 focus-within:ring-2 focus-within:ring-coral-400 sm:w-96">
              <input
                type="email"
                required
                placeholder="Your Email Address"
                className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-neutral-0 outline-none placeholder:text-navy-300"
              />
              <button
                type="submit"
                className="shrink-0 bg-coral-400 px-6 py-3 text-sm font-bold text-navy-900 transition-colors hover:bg-coral-500"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-2 text-xs text-navy-300">
              Deals and updates, straight to your inbox — no spam.
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="relative h-16 w-16 rounded-lg bg-neutral-0 p-1.5">
              <Image
                src="/una-logo.webp"
                alt="UNA Mart"
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-200">
              Everything you need, in one place — gadgets, groceries and more,
              delivered across Bangladesh.
            </p>

            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-navy-200">
              <li>
                <a
                  href={`tel:${SUPPORT_PHONE.replace(/\s|-/g, "")}`}
                  className="flex items-center gap-2 transition-colors hover:text-neutral-0"
                >
                  <Phone width={14} height={14} />
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-2 transition-colors hover:text-neutral-0"
                >
                  <Mail width={14} height={14} />
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin width={14} height={14} className="mt-0.5 shrink-0" />
                {SUPPORT_ADDRESS}
              </li>
            </ul>

            <div className="mt-5 flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-navy-100 transition-colors hover:bg-coral-400 hover:text-navy-900"
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-neutral-0">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-navy-200 transition-colors hover:text-neutral-0"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-navy-700 py-6 text-xs text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} <b>UNA Mart</b>. All rights
            reserved.
          </span>
          <Image
            src="/credit-card.png"
            alt="Accepted payment methods"
            width={560}
            height={80}
            className="h-10 w-auto max-w-full sm:h-12"
          />
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none -mb-6 select-none text-center text-6xl font-extrabold leading-none text-neutral-0/5 sm:-mb-8 sm:text-8xl lg:text-9xl"
      >
        UNA Mart
      </p>
    </footer>
  );
}
