import type { Metadata } from "next";
import { PageBanner } from "@/components/customer/PageBanner";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description: "Delivery areas, charges and timelines for UNA Mart orders across Bangladesh.",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <PageBanner title="Shipping & Delivery Policy" />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-neutral-700">
          <p>
            We deliver across Bangladesh, from Dhaka to every district. Here&apos;s
            what to expect once your order is placed.
          </p>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Delivery Areas &amp; Charges
            </h2>
            <p className="mt-2">
              Delivery is free for orders inside Dhaka. Orders outside Dhaka
              carry a flat delivery charge, calculated at checkout based on
              your shipping address.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Delivery Timeline
            </h2>
            <p className="mt-2">
              Orders inside Dhaka are typically delivered within 1–2 business
              days. Orders outside Dhaka may take 3–5 business days,
              depending on your location.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Order Tracking
            </h2>
            <p className="mt-2">
              Once your order ships, you can check its status anytime from
              our Track Order page using your order number.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Payment on Delivery
            </h2>
            <p className="mt-2">
              Cash on Delivery is available nationwide. bKash and Nagad
              payments are confirmed instantly, and your order is processed
              as soon as payment is verified.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Delays
            </h2>
            <p className="mt-2">
              Occasionally, weather, holidays, or high order volume can delay
              delivery. We&apos;ll notify you if your order is expected to
              arrive later than usual.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
