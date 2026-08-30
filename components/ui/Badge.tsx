import type { ReactNode } from "react";

export function SaleBadge({ children }: { children: ReactNode }) {
  return <span className="badge-sale">{children}</span>;
}
