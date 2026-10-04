import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  href,
  tone = "navy",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  href?: string;
  tone?: "navy" | "coral" | "warning" | "success";
}) {
  const toneClass = {
    navy: "bg-navy-50 text-navy-800",
    coral: "bg-coral-50 text-coral-700",
    warning: "bg-warning-bg text-warning",
    success: "bg-success-bg text-success",
  }[tone];

  const body = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
        <Icon aria-hidden width={20} height={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-neutral-600">{label}</span>
        <span className="mt-0.5 block text-2xl font-bold tabular-nums text-neutral-800">{value}</span>
      </span>
    </>
  );

  const className =
    "flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-0 p-5 transition-[border-color,box-shadow]";
  return href ? (
    <Link href={href} className={`${className} hover:border-neutral-300 hover:shadow-sm`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
