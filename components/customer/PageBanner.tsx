import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

// Page title block for listing and information pages: breadcrumb, H1 and
// an optional one-line description. Deliberately quiet (no photo) so the
// products or content below are the loudest thing on screen.
export function PageBanner({
  title,
  description,
  breadcrumbs,
  children,
}: {
  title: string;
  description?: string;
  /** Trail after "Home"; defaults to just the page title. */
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-neutral-200 bg-neutral-0">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs items={breadcrumbs ?? [{ label: title }]} />
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
