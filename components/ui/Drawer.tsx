"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

const TRANSITION_MS = 280;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared slide-in panel (mobile menu, cart, mobile filters). Modal dialog
// semantics: focus moves in and is trapped, Escape/overlay closes, page
// scroll is locked, and focus returns to the trigger on close. Motion is a
// plain CSS transform transition — cheap on low-end phones and covered by
// the global reduced-motion rule.
export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
  footer,
  widthClass = "max-w-sm",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: "left" | "right";
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Mount synchronously when opening (adjusting state during render).
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (!mounted) return;
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    const frame = requestAnimationFrame(() => setShown(false));
    const timer = setTimeout(() => {
      setMounted(false);
      returnFocusRef.current?.focus?.();
    }, TRANSITION_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [open, mounted]);

  // Focus the panel's first control once it is visible.
  useEffect(() => {
    if (!shown) return;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();
  }, [shown]);

  // Scroll lock, Escape, and focus trap while open.
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const hiddenTransform = side === "right" ? "translate-x-full" : "-translate-x-full";

  return (
    <div className="fixed inset-0 z-60">
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-navy-900/50 transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute top-0 flex h-full w-[88%] ${widthClass} flex-col bg-neutral-0 shadow-xl outline-none transition-transform duration-300 ease-out ${
          side === "right" ? "right-0" : "left-0"
        } ${shown ? "translate-x-0" : hiddenTransform}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3">
          <h2 id={titleId} className="text-base font-bold text-neutral-800">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
          >
            <X width={20} height={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && (
          <div className="border-t border-neutral-200 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
