"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  "/products/unamart-banner/banner1.webp",
  "/products/unamart-banner/banner2.webp",
  "/products/unamart-banner/banner3.webp",
  "/products/unamart-banner/banner4.webp",
  "/products/unamart-banner/banner5.webp",
  "/products/unamart-banner/banner6.webp",
];

const AUTOPLAY_MS = 5000;

export function Hero() {
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    setActive((index + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-neutral-900">
      <div className="relative h-70 w-full sm:h-90 md:h-100">
        {SLIDES.map((slide, i) => (
          <div
            key={slide}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 sm:bottom-6">
        {SLIDES.map((slide, i) => (
          <button
            key={slide}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-pill transition-all ${
              i === active
                ? "w-6 bg-neutral-0"
                : "w-2 bg-neutral-0/50 hover:bg-neutral-0/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
