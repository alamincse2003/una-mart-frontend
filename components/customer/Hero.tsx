"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-title", { opacity: 0, y: 24, duration: 0.6 })
        .from(".hero-subtitle", { opacity: 0, y: 16, duration: 0.5 }, "-=0.35")
        .from(".hero-cta", { opacity: 0, y: 12, duration: 0.4 }, "-=0.3");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-100 items-center overflow-hidden   bg-navy-900 sm:min-h-125"
    >
      <Image
        src="/products/image3.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-90"
      />
      <div className="absolute inset-0 bg-linear-to-r from-navy-900 via-navy-900/85 to-navy-900/40" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="hero-title max-w-md text-3xl font-bold leading-tight text-neutral-0 sm:text-4xl">
          Everything you need,{" "}
          <span className="text-coral-400">in one place.</span>
        </h1>
        <p className="hero-subtitle mt-3 max-w-sm text-sm text-navy-100 sm:text-base">
          Gadgets, groceries and more — all delivered from a single
          marketplace built for Bangladesh.
        </p>
        <div className="hero-cta mt-6">
          <Link
            href="/category/gadgets"
            className="inline-flex items-center gap-3 rounded-md bg-coral-400 py-1.5 pl-5 pr-1.5 text-sm font-bold text-navy-900 transition-colors hover:bg-coral-500"
          >
            Explore Now
            <span className="flex h-8 w-8 items-center justify-center rounded bg-navy-900 text-neutral-0">
              <ArrowUpRight width={16} height={16} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
