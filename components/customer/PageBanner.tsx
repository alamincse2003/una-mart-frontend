import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageBanner({ title }: { title: string }) {
  return (
    <section className="relative flex min-h-50 items-center overflow-hidden bg-navy-900">
      <Image
        src="/products/image3.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-90"
      />
      <div className="absolute inset-0 bg-linear-to-r from-navy-900 via-navy-900/85 to-navy-900/40" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-navy-100">
          <Link href="/" className="transition-colors hover:text-neutral-0">
            Home
          </Link>
          <ChevronRight width={13} height={13} />
          <span className="text-neutral-0">{title}</span>
        </nav>
        <h1 className="mt-3 text-3xl font-bold text-neutral-0 sm:text-4xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
