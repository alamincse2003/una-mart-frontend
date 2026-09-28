import { PageBanner } from "@/components/customer/PageBanner";

export default function ReturnPolicyPage() {
  return (
    <>
      <PageBanner title="Return Policy" />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-8 text-sm leading-relaxed text-neutral-600">
          <p>
            We want you to be fully satisfied with every order. If something
            isn&apos;t right, here&apos;s how returns work at UNA Mart.
          </p>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              Return Window
            </h2>
            <p className="mt-2">
              Most items can be returned within 7 days of delivery, provided
              they are unused, in their original packaging, and accompanied
              by proof of purchase.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              Non-Returnable Items
            </h2>
            <p className="mt-2">
              For hygiene and safety reasons, innerwear, swimwear, and
              personal care items cannot be returned once delivered, unless
              the item arrived damaged or incorrect.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              Damaged or Incorrect Items
            </h2>
            <p className="mt-2">
              If your order arrives damaged, defective, or different from
              what you ordered, contact our support team within 48 hours of
              delivery with photos of the item — we&apos;ll arrange a
              replacement or refund at no extra cost.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              How to Request a Return
            </h2>
            <p className="mt-2">
              Reach out to our support team via phone, email, or WhatsApp
              with your order number. We&apos;ll guide you through pickup or
              drop-off, and process your refund once the item is received
              and inspected.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              Refund Timeline
            </h2>
            <p className="mt-2">
              Approved refunds are processed within 5–7 business days to
              your original payment method, or as store credit if you paid
              with Cash on Delivery.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
