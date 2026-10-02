"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

// Scroll-reveal for MARKETING sections only (category showcase, promo and
// trust blocks) — never product grids, search or checkout (CLAUDE.md).
//
// Safe by construction:
// - Content is server-rendered visible. It's only hidden on mount when it
//   is still below the fold, so nothing the shopper already sees blinks.
// - No-JS / slow-JS visitors simply see the static section.
// - prefers-reduced-motion skips it entirely.
// Children marked data-reveal animate in a short stagger; otherwise the
// wrapper itself animates.
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    if (root.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    const marked = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const targets = marked.length > 0 ? [...marked] : [root];

    const ctx = gsap.context(() => {
      gsap.set(targets, { autoAlpha: 0, y: 24 });
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        ctx.add(() => {
          gsap.to(targets, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
            clearProps: "transform,opacity,visibility",
          });
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
