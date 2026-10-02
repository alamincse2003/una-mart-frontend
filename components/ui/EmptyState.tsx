import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Shared empty/zero-result state: icon, title, guidance, and next actions.
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  as: Heading = "h2",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-800">
        <Icon aria-hidden width={28} height={28} strokeWidth={1.6} />
      </span>
      <Heading className="mt-5 text-lg font-bold text-neutral-800">{title}</Heading>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-neutral-600">{description}</p>
      )}
      {children && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
      )}
    </div>
  );
}
