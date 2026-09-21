import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ProductPromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="relative flex min-h-50 items-center overflow-hidden rounded-lg bg-navy-900">
        <Image
          src="/products/image3.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-linear-to-r from-navy-900 via-navy-900/85 to-navy-900/40" />

        <div className="relative px-6 py-10 sm:px-10">
          <h2 className="max-w-sm text-2xl font-bold leading-tight text-neutral-0 sm:text-3xl">
            Everything you need, <span className="text-coral-400">delivered fast.</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm text-navy-100">
            Shop gadgets and groceries from a single marketplace built for
            Bangladesh — reliable delivery, trusted payments.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-3 rounded-md bg-coral-400 py-1.5 pl-5 pr-1.5 text-sm font-bold text-navy-900 transition-colors hover:bg-coral-500"
          >
            Shop Now
            <span className="flex h-8 w-8 items-center justify-center rounded bg-navy-900 text-neutral-0">
              <ArrowUpRight width={16} height={16} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
