"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal, swipeable rail with snap points. Touch users swipe; mouse
// users get prev/next arrows that disable at the ends. Items are passed as
// server-rendered children so cards don't need to become client code.
export function ScrollRail({
  label,
  children,
  itemClassName = "w-[46%] sm:w-[31%] lg:w-[23.5%]",
}: {
  /** Accessible name for the rail region, e.g. "New arrivals". */
  label: string;
  children: ReactNode[];
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setEdges({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const frame = requestAnimationFrame(updateEdges);
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [updateEdges]);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrowClass =
    "hidden h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-0 text-navy-800 shadow-sm transition-[opacity,background-color] hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-0 sm:flex";

  return (
    <div className="relative" role="region" aria-label={label}>
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:scroll-px-0 sm:gap-4 sm:px-0"
      >
        {children.map((child, i) => (
          <li key={i} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        disabled={edges.start}
        className={`${arrowClass} absolute -left-5 top-[38%] z-10 -translate-y-1/2`}
      >
        <ChevronLeft width={18} height={18} />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        disabled={edges.end}
        className={`${arrowClass} absolute -right-5 top-[38%] z-10 -translate-y-1/2`}
      >
        <ChevronRight width={18} height={18} />
      </button>
    </div>
  );
}
