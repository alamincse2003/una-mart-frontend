import { PageBanner } from "@/components/customer/PageBanner";
import { Card } from "@/components/ui/Card";
import { TrackOrderForm } from "@/components/customer/TrackOrderForm";

export default function TrackOrderPage() {
  return (
    <>
      <PageBanner title="Track Order" />
      <section className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold text-neutral-800">
          Track Your Order
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Enter your order number and phone number to check its status.
        </p>
        <Card className="mt-6 p-6">
          <TrackOrderForm />
        </Card>
      </section>
    </>
  );
}
