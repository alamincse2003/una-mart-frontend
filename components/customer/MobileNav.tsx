"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Category } from "@/lib/types";
import { CloseIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

// Slide-in panel shown on small screens (<lg) via the hamburger button.
// GSAP is used here deliberately for the open/close transition — this is
// the one non-marketing spot in the header that gets a motion pass,
// approved for the hamburger menu specifically.
export function MobileNav({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // Mount immediately when opening (adjusting state during render, not in
  // an effect — see https://react.dev/learn/you-might-not-need-an-effect).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }

  useEffect(() => {
    if (open || !mounted) return;
    // Closing: play the exit animation, then unmount.
    const tl = gsap.timeline({ onComplete: () => setMounted(false) });
    tl.to(panelRef.current, { x: "100%", duration: 0.3, ease: "power2.in" }).to(
      overlayRef.current,
      { opacity: 0, duration: 0.2 },
      "<"
    );
  }, [open, mounted]);

  useEffect(() => {
    if (!open || !mounted) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(
      panelRef.current,
      { x: "100%" },
      { x: "0%", duration: 0.35, ease: "power3.out" }
    );
  }, [open, mounted]);

  if (!mounted) return null;

  const topLevelCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-navy-900/50"
      />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-neutral-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <span className="text-lg font-extrabold text-navy-800">
            UNA <span className="text-coral-600">Mart</span>
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="m-5 mb-2 flex items-center rounded-md border border-neutral-200 bg-neutral-50 py-1.5 pl-4 pr-1.5">
          <SearchIcon width={16} height={16} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full flex-1 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-neutral-400"
          />
        </div>

        <nav className="flex flex-col gap-1 px-5 py-3">
          {topLevelCategories.map((category) => {
            const href = `/category/${category.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={category.id}
                href={href}
                onClick={onClose}
                className={`rounded-pill px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-navy-800 text-neutral-0"
                    : "text-neutral-700 hover:bg-navy-800 hover:text-neutral-0"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
          <Link
            href="/#deals"
            onClick={onClose}
            className="rounded-pill px-4 py-2.5 text-sm font-bold text-coral-600 transition-colors hover:bg-coral-600 hover:text-neutral-0"
          >
            Deals
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-neutral-200 px-5 py-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <UserIcon width={18} height={18} />
            Login
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            <HeartIcon width={18} height={18} />
            Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
