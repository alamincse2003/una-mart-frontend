"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  Menu,
  Package,
  ShieldAlert,
  ShoppingBag,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-coral-400/15 text-coral-200"
                : "text-navy-100 hover:bg-neutral-0/5 hover:text-neutral-0"
            }`}
          >
            <Icon aria-hidden width={18} height={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-navy-900 px-4 py-6 lg:flex">
        <Link href="/admin" className="px-3 text-xl font-extrabold tracking-tight text-neutral-0">
          UNA <span className="text-coral-400">Mart</span>
          <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wider text-navy-200">
            Admin
          </span>
        </Link>
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-100 hover:bg-neutral-0/5 hover:text-neutral-0"
        >
          <ExternalLink aria-hidden width={16} height={16} />
          View store
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-neutral-0/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-md text-navy-800 hover:bg-neutral-100 lg:hidden"
          >
            <Menu aria-hidden width={20} height={20} />
          </button>
          <span className="font-bold text-navy-800 lg:hidden">Admin</span>
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-pill bg-warning-bg px-3 py-1 text-xs font-semibold text-warning"
            title="No login yet — hidden in production unless ADMIN_PREVIEW=1. Data resets when the server restarts."
          >
            <ShieldAlert aria-hidden width={14} height={14} />
            Preview · not protected
          </span>
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Sidebar (mobile) */}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Admin" side="left">
        <div className="flex h-full flex-col bg-navy-900 p-4">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
          <Link
            href="/"
            className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy-100"
          >
            <ExternalLink aria-hidden width={16} height={16} />
            View store
          </Link>
        </div>
      </Drawer>
    </div>
  );
}
