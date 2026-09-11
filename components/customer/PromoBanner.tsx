import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Reusable full-bleed promo banner — dark photo bg, bold 2-line heading
// with one accent-colored word, subtext, split-button CTA. Same visual
// language as Hero.tsx but without the eyebrow/stats row, for secondary
// CTA placements further down a page (homepage today, category pages
// later).
export function PromoBanner({
  image,
  title,
  accentWord,
  description,
  ctaLabel,
  ctaHref,
}: {
  image: string;
  title: string;
  accentWord: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-lg">
        <div className="relative min-h-88">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-navy-900 via-navy-900/80 to-navy-900/20" />

          <div className="relative flex h-full items-center px-6 py-12 sm:px-10">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold leading-tight text-neutral-0 sm:text-4xl">
                {title} <span className="text-coral-400">{accentWord}</span>
              </h2>
              <p className="mt-3 text-sm text-navy-100">{description}</p>
              <Link
                href={ctaHref}
                className="mt-6 inline-flex items-center gap-3 rounded-md bg-coral-400 py-1.5 pl-5 pr-1.5 text-sm font-bold text-navy-900 transition-colors hover:bg-coral-500"
              >
                {ctaLabel}
                <span className="flex h-8 w-8 items-center justify-center rounded bg-navy-900 text-neutral-0">
                  <ArrowUpRight width={16} height={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
