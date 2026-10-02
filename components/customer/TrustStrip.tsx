import { Banknote, Headset, RotateCcw, Truck } from "lucide-react";

// The four promises that matter most to a first-time buyer in Bangladesh.
// Every claim here must match the shipping/return policy pages.
const ITEMS = [
  { icon: Truck, title: "Free delivery in Dhaka", text: "Nationwide shipping in 3–5 days" },
  { icon: Banknote, title: "Cash on Delivery", text: "Or pay with bKash & Nagad" },
  { icon: RotateCcw, title: "7-day easy returns", text: "On unused items, original packaging" },
  { icon: Headset, title: "Real human support", text: "Call or WhatsApp our team" },
];

export function TrustStrip({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ul
      className={`grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4 ${
        dark ? "" : "rounded-lg border border-neutral-200 bg-neutral-0 p-4 sm:p-6"
      }`}
    >
      {ITEMS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
              dark ? "bg-navy-800 text-coral-200" : "bg-coral-50 text-coral-700"
            }`}
          >
            <Icon aria-hidden width={20} height={20} />
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${dark ? "text-neutral-0" : "text-neutral-800"}`}>
              {title}
            </p>
            <p className={`mt-0.5 text-xs leading-snug ${dark ? "text-navy-200" : "text-neutral-600"}`}>
              {text}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
