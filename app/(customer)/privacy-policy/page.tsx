import type { Metadata } from "next";
import { PageBanner } from "@/components/customer/PageBanner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How UNA Mart collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageBanner title="Privacy Policy" />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-neutral-700">
          <p>
            Your privacy matters to us. This policy explains what information
            we collect and how we use it.
          </p>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Information We Collect
            </h2>
            <p className="mt-2">
              When you place an order, we collect your name, phone number,
              email, and shipping address. We also store your cart contents
              locally in your browser to keep items saved between visits.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              How We Use Your Information
            </h2>
            <p className="mt-2">
              We use your information solely to process orders, arrange
              delivery, and provide customer support. We do not sell your
              personal information to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Payment Information
            </h2>
            <p className="mt-2">
              Payments made via bKash or Nagad are processed directly by
              those providers — UNA Mart does not store your payment
              credentials.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Cookies &amp; Local Storage
            </h2>
            <p className="mt-2">
              We use your browser&apos;s local storage to remember your cart
              and wishlist between visits, and a single essential cookie to
              keep your cart session. No tracking cookies are used for
              advertising purposes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-800">
              Contacting Us
            </h2>
            <p className="mt-2">
              If you have questions about how your information is handled,
              reach out through our Contact Us page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
