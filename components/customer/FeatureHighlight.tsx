import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Reusable photo + copy + CTA feature block — image on one side, heading/
// description/button on the other, same split-button style as Hero and
// SubcategoryBento. Generic so it can highlight any category or promo
// without a new one-off component each time.
export function FeatureHighlight({
  image,
  title,
  description,
  ctaLabel,
  ctaHref,
  imageSide = "left",
}: {
  image: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageSide?: "left" | "right";
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
        <div
          className={`relative aspect-4/3 overflow-hidden rounded-lg bg-neutral-100 ${
            imageSide === "right" ? "sm:order-2" : ""
          }`}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-neutral-800 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            {description}
          </p>
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
    </section>
  );
}
