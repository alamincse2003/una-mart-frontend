import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/customer/PageBanner";
import { Card } from "@/components/ui/Card";
import { TrackOrderForm } from "@/components/customer/TrackOrderForm";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/site";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the status of your UNA Mart order with your order number and mobile number.",
};

export default async function TrackOrderPage({ searchParams }: PageProps<"/track-order">) {
  const { number, phone } = await searchParams;
  return (
    <>
      <PageBanner
        title="Track your order"
        breadcrumbs={[{ label: "Track Order" }]}
        description="Enter the order number from your confirmation and the mobile number you ordered with."
      />
      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <Card className="p-5 sm:p-7">
          <TrackOrderForm
            initialNumber={typeof number === "string" ? number.slice(0, 30) : ""}
            initialPhone={typeof phone === "string" ? phone.slice(0, 20) : ""}
          />
        </Card>
        <p className="mt-6 text-center text-sm text-neutral-600">
          Can&apos;t find your order number? Call{" "}
          <a href={SUPPORT_PHONE_HREF} className="font-semibold text-navy-600 underline">
            {SUPPORT_PHONE}
          </a>{" "}
          or{" "}
          <Link href="/contact" className="font-semibold text-navy-600 underline">
            contact us
          </Link>
          .
        </p>
      </section>
    </>
  );
}
