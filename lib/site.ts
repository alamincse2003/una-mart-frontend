// Business details used across the storefront (header, footer, contact page,
// metadata). One place to update when a number or address changes.
export const SITE_NAME = "UNA Mart";
export const SITE_TAGLINE = "Everything you need, in one place.";
export const SITE_DESCRIPTION =
  "Shop gadgets, fashion, accessories and sports gear online in Bangladesh. Cash on Delivery, bKash and Nagad accepted, with delivery nationwide.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SUPPORT_PHONE = "+880 1927-967894";
export const SUPPORT_PHONE_HREF = `tel:${SUPPORT_PHONE.replace(/[\s-]/g, "")}`;
export const SUPPORT_EMAIL = "info.unamartbd@gmail.com";
export const SUPPORT_ADDRESS = "Gulshan-2, Dhaka, Bangladesh";
export const WHATSAPP_HREF = "https://wa.me/8801927967894";

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/share/1BCNGEJxxR/" },
  {
    name: "Instagram",
    href: "https://www.instagram.com/unamart_bd?stkn=MWtkZzBjdWs3N2puag==",
  },
  { name: "WhatsApp", href: WHATSAPP_HREF },
] as const;

// Payment methods actually accepted — keep in sync with PaymentMethod in
// lib/types.ts. Do not show card-network logos until cards are supported.
export const PAYMENT_METHOD_LABELS = {
  bkash: "bKash",
  nagad: "Nagad",
  cod: "Cash on Delivery",
} as const;
