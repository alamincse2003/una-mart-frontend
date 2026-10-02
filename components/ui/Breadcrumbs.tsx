import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

// Breadcrumb trail; "Home" is prepended and the last crumb is the current
// page. Product and category pages pair it with BreadcrumbList JSON-LD.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
        {all.map((crumb, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {last || !crumb.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className="line-clamp-1 text-neutral-800"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-neutral-500 transition-colors hover:text-navy-800"
                >
                  {crumb.label}
                </Link>
              )}
              {!last && (
                <ChevronRight
                  aria-hidden
                  width={13}
                  height={13}
                  className="shrink-0 text-neutral-400"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
