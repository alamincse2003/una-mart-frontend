import { Mail, MapPin, Phone } from "lucide-react";
import { PageBanner } from "@/components/customer/PageBanner";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/customer/ContactForm";

const SUPPORT_PHONE = "+880 1927-967894";
const SUPPORT_EMAIL = "info.unamartbd@gmail.com";
const SUPPORT_ADDRESS = "Gulshan-2, Dhaka Bangladesh";

export default function ContactPage() {
  return (
    <>
      <PageBanner title="Contact Us" />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-neutral-800">
              Get in Touch
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">
              Questions about an order, a product, or anything else? Our team
              is happy to help.
            </p>

            <Card className="flex flex-col gap-4 p-5">
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s|-/g, "")}`}
                className="flex items-center gap-3 text-sm font-medium text-neutral-700 transition-colors hover:text-navy-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-800">
                  <Phone width={16} height={16} />
                </span>
                {SUPPORT_PHONE}
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-3 text-sm font-medium text-neutral-700 transition-colors hover:text-navy-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-800">
                  <Mail width={16} height={16} />
                </span>
                {SUPPORT_EMAIL}
              </a>
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-800">
                  <MapPin width={16} height={16} />
                </span>
                {SUPPORT_ADDRESS}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  );
}
