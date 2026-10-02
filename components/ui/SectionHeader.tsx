import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

// The one heading pattern for storefront sections: optional eyebrow,
// title, optional "View all" link and/or right-side controls (children).
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-coral-700">
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="mt-1 text-xl font-bold tracking-tight text-neutral-800 sm:text-2xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        )}
      </div>
      {(action || children) && (
        <div className="flex shrink-0 items-center gap-3">
          {action && (
            <Link
              href={action.href}
              className="group inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-navy-800 hover:text-coral-700"
            >
              {action.label}
              <ArrowRight
                aria-hidden
                width={15}
                height={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
