import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/customer/PageBanner";
import { FaqAccordion } from "@/components/customer/FaqAccordion";
import { FAQS } from "@/lib/faqs";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about delivery, payment, returns and orders at UNA Mart.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <PageBanner
        title="Frequently asked questions"
        breadcrumbs={[{ label: "FAQ" }]}
        description="Quick answers about delivery, payments, returns and orders."
      />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <FaqAccordion faqs={FAQS} />
        <p className="mt-8 text-center text-sm text-neutral-600">
          Still need help?{" "}
          <Link href="/contact" className="font-semibold text-navy-600 underline">
            Contact our team
          </Link>
          .
        </p>
      </section>
    </>
  );
}
