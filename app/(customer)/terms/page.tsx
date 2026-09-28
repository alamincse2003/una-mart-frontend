import { PageBanner } from "@/components/customer/PageBanner";

export default function TermsPage() {
  return (
    <>
      <PageBanner title="Terms & Conditions" />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-8 text-sm leading-relaxed text-neutral-600">
          <p>
            By using UNA Mart, you agree to the terms below. Please read them
            carefully before placing an order.
          </p>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              1. Using Our Platform
            </h2>
            <p className="mt-2">
              You must provide accurate information when placing an order,
              including your name, contact details, and shipping address.
              UNA Mart reserves the right to cancel orders that appear
              fraudulent or contain incorrect information.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              2. Pricing &amp; Availability
            </h2>
            <p className="mt-2">
              Prices are listed in BDT and may change without prior notice.
              We make every effort to keep stock levels accurate, but an item
              may occasionally be unavailable after an order is placed — in
              that case, we&apos;ll contact you with a refund or replacement
              option.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              3. Payments
            </h2>
            <p className="mt-2">
              We accept bKash, Nagad, and Cash on Delivery. All online
              payments are processed securely; UNA Mart does not store your
              payment credentials.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              4. Delivery
            </h2>
            <p className="mt-2">
              Delivery timelines are estimates, not guarantees. See our
              Shipping &amp; Delivery Policy for details on delivery areas and
              charges.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              5. Returns
            </h2>
            <p className="mt-2">
              Returns and refunds are handled according to our Return Policy.
              Non-returnable items are listed there.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              6. Changes to These Terms
            </h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of
              UNA Mart after changes are posted means you accept the updated
              terms.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
