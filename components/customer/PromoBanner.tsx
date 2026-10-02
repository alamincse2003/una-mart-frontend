import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "./Reveal";

// Reusable promo banner: copy + CTA on a navy panel, product image framed
// on its own light tile (packshots are shot on white — forcing them under
// a dark gradient makes them look muddy).
export function PromoBanner({
  image,
  eyebrow,
  title,
  accent,
  description,
  ctaLabel,
  ctaHref,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  /** Optional trailing words of the title shown in the accent colour. */
  accent?: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Reveal className="grid overflow-hidden rounded-lg bg-navy-800 sm:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12" data-reveal>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-coral-200">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-neutral-0 sm:text-3xl lg:text-4xl">
            {title} {accent && <span className="text-coral-200">{accent}</span>}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-100 sm:text-base">
            {description}
          </p>
          <div className="mt-6">
            <ButtonLink href={ctaHref} variant="cta" size="lg">
              {ctaLabel}
              <ArrowRight aria-hidden width={18} height={18} />
            </ButtonLink>
          </div>
        </div>
        <div className="relative m-4 mt-0 min-h-56 rounded-md bg-neutral-0 sm:m-6 sm:ml-0 sm:min-h-72" data-reveal>
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 640px) 40vw, 100vw"
            className="object-contain p-6 sm:p-10"
          />
        </div>
      </Reveal>
    </section>
  );
}
