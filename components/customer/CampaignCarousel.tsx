"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

export interface CampaignSlide {
  src: string;
  /** Describe the text baked into the artwork — it's otherwise invisible to screen readers and search. */
  alt: string;
  href: string;
}

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

// Square campaign-artwork carousel for the hero. Artwork is shown
// uncropped (object-contain at its native 1:1). GSAP crossfades slides;
// autoplay pauses on hover/focus/hidden tab, can be paused by the user
// (WCAG 2.2.2), and never starts under prefers-reduced-motion.
export function CampaignCarousel({ slides }: { slides: CampaignSlide[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  // Only mount images that have been (or are about to be) shown, so the
  // hero doesn't download every slide up front.
  const [loaded, setLoaded] = useState(() => new Set([0, 1 % slides.length]));
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previous = useRef(0);
  const pointerStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      const next = (index + count) % count;
      setLoaded((prev) => new Set(prev).add(next).add((next + 1) % count));
      setActive(next);
    },
    [count]
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      const frame = requestAnimationFrame(() => setPlaying(false));
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    if (!playing || hovered || count < 2) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") goTo(active + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing, hovered, active, goTo, count]);

  useLayoutEffect(() => {
    const prev = slideRefs.current[previous.current];
    const next = slideRefs.current[active];
    previous.current = active;
    if (!next || prev === next) return;

    if (prefersReducedMotion()) {
      gsap.set(prev, { autoAlpha: 0 });
      gsap.set(next, { autoAlpha: 1, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to(prev, { autoAlpha: 0, duration: 0.6, ease: "power1.out" });
      gsap.fromTo(
        next,
        { autoAlpha: 0, scale: 1.03 },
        { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out" }
      );
    });
    // kill (not revert): keep each slide's end state when the next change
    // interrupts this one, instead of snapping back to the initial CSS.
    return () => ctx.kill();
  }, [active]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Current offers"
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onPointerDown={(e) => (pointerStart.current = e.clientX)}
      onPointerUp={(e) => {
        if (pointerStart.current === null) return;
        const delta = e.clientX - pointerStart.current;
        pointerStart.current = null;
        swiped.current = Math.abs(delta) > SWIPE_THRESHOLD_PX;
        if (swiped.current) goTo(active + (delta < 0 ? 1 : -1));
      }}
      onClickCapture={(e) => {
        // A swipe ends with a click on the slide link — don't navigate.
        if (swiped.current) {
          e.preventDefault();
          swiped.current = false;
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 shadow-sm ring-1 ring-neutral-200">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== active}
            // Initial state in CSS so the first paint is correct before GSAP runs.
            className={`absolute inset-0 ${i === 0 ? "" : "invisible opacity-0"}`}
          >
            {loaded.has(i) && (
              <Link
                href={slide.href}
                tabIndex={i === active ? 0 : -1}
                draggable={false}
                className="absolute inset-0 block"
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                fetchPriority={i === 0 ? "high" : "auto"}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  draggable={false}
                  className="select-none object-contain"
                />
              </Link>
            )}
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(active - 1)}
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-0/90 text-navy-800 shadow-md opacity-0 transition-opacity hover:bg-neutral-0 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
            >
              <ChevronLeft width={20} height={20} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(active + 1)}
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-0/90 text-navy-800 shadow-md opacity-0 transition-opacity hover:bg-neutral-0 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
            >
              <ChevronRight width={20} height={20} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-navy-800 hover:bg-navy-50"
            >
              {playing ? <Pause width={13} height={13} /> : <Play width={13} height={13} />}
            </button>
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className="flex h-8 w-6 items-center justify-center"
              >
                <span
                  className={`block h-1.5 rounded-pill transition-all duration-300 ${
                    i === active ? "w-6 bg-navy-800" : "w-1.5 bg-neutral-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
