"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

const STATS = [
  { value: "10K+", label: "Happy customers" },
  { value: "4.8/5", label: "Average rating" },
  { value: "60+", label: "Districts covered" },
];

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
        .from(".hero-cta", { opacity: 0, y: 12, duration: 0.4 }, "-=0.3")
        .from(".hero-stats", { opacity: 0, y: 12, duration: 0.4 }, "-=0.25");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="rounded-b-3xl bg-navy-800 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl text-center">
        <p className="hero-eyebrow mx-auto inline-flex items-center gap-2 rounded-pill border border-coral-400/40 bg-coral-400/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-coral-200">
          Now delivering across Bangladesh
        </p>
        <h1 className="hero-title mt-6 text-4xl font-bold leading-tight text-neutral-0 sm:text-5xl">
          Everything you need,{" "}
          <span className="text-coral-400">in one place.</span>
        </h1>
        <p className="hero-subtitle mx-auto mt-4 max-w-xl text-base text-navy-100">
          Gadgets, groceries, and more — shop it all from a single
          marketplace built for Bangladesh.
        </p>
        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/category/gadgets" className="btn-cta">
            Start shopping
          </Link>
          <Link
            href="/category/groceries"
            className="btn-ghost-white rounded-md border border-neutral-0/50 bg-neutral-0/10 px-6 py-3 text-sm font-semibold text-neutral-0 backdrop-blur-sm transition-colors hover:bg-neutral-0 hover:text-navy-800"
          >
            Explore groceries
          </Link>
        </div>
        <div className="hero-stats mt-14 flex flex-wrap justify-center gap-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-neutral-0">
                {stat.value}
              </p>
              <p className="text-xs text-navy-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
