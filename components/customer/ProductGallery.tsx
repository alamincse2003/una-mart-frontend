"use client";

import { useState } from "react";
import Image from "next/image";

// Main image + selectable thumbnails. Thumbnails only render when there
// is more than one image, so single-photo products don't show a pointless
// strip. Hover-zoom is a CSS transform (cheap, no GSAP on this screen).
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          src={images[active]}
          alt={images.length > 1 ? `${name} — image ${active + 1} of ${images.length}` : name}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 600px, 100vw"
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          className={`object-contain p-6 transition-transform duration-200 sm:p-10 ${
            zoom ? "lg:scale-150" : ""
          }`}
        />
      </div>

      {images.length > 1 && (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto" aria-label="Product images">
          {images.map((image, i) => (
            <li key={image + i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={`relative h-18 w-18 overflow-hidden rounded-md border-2 bg-neutral-0 transition-colors sm:h-20 sm:w-20 ${
                  i === active ? "border-navy-800" : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
