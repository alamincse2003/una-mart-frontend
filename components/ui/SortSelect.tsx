"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

// Custom dropdown replacing a native <select> — same semantics (value +
// onChange), but a styled, animated panel instead of the browser's
// unstyled list, so it matches the rest of the storefront's design.
export function SortSelect<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative">
      {label && <span className="sr-only">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-pill border py-1.5 pl-4 pr-3 text-sm font-semibold transition-colors ${
          open
            ? "border-coral-400 bg-coral-50 text-navy-800"
            : "border-neutral-200 bg-neutral-0 text-neutral-800 hover:border-neutral-300"
        }`}
      >
        {selected?.label ?? label}
        <ChevronDown
          aria-hidden
          width={15}
          height={15}
          className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 py-1.5 shadow-lg"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-navy-50 text-navy-800"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {option.label}
                  {active && <Check aria-hidden width={15} height={15} className="text-coral-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
