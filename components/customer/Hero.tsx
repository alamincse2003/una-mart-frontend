"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.5 })
        .from(
          ".hero-title",
          { opacity: 0, y: 24, duration: 0.6 },
          "-=0.3"
        )
        .from(
          ".hero-subtitle",
          { opacity: 0, y: 16, duration: 0.5 },
          "-=0.35"
        )
        .from(".hero-cta", { opacity: 0, y: 12, duration: 0.4 }, "-=0.3");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-navy-800 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl text-center">
        <p className="hero-eyebrow text-sm font-semibold uppercase tracking-wide text-navy-200">
          Now delivering across Bangladesh
        </p>
        <h1 className="hero-title mt-4 text-4xl font-bold text-neutral-0 sm:text-5xl">
          Everything you need, in one place.
        </h1>
        <p className="hero-subtitle mx-auto mt-4 max-w-xl text-base text-navy-100">
          Gadgets, groceries, and more — shop it all from a single
          marketplace built for Bangladesh.
        </p>
        <div className="hero-cta mt-8">
          <Link href="/category/gadgets" className="btn-cta">
            Start shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
