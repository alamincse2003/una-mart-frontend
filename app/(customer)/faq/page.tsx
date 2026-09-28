import { PageBanner } from "@/components/customer/PageBanner";
import { FaqAccordion } from "@/components/customer/FaqAccordion";

export default function FaqPage() {
  return (
    <>
      <PageBanner title="FAQ" />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold text-neutral-800">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Can&apos;t find what you&apos;re looking for? Reach out on our
          Contact Us page.
        </p>
        <div className="mt-6">
          <FaqAccordion />
        </div>
      </section>
    </>
  );
}
