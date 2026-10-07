"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api-client";
import type { Me } from "@/lib/types";
import { Drawer } from "@/components/ui/Drawer";
import { localPhone } from "./format";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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

// The real protection is on the API (admin role + admin-scope session on
// every /admin route). This guard only keeps the UI from showing an empty
// shell to someone who isn't logged in as admin.
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [menuOpen, setMenuOpen] = useState(false);
  const [admin, setAdmin] = useState<Me | null>(null);

  useEffect(() => {
    if (isLogin) return;
    adminApi
      .me()
      .then((me) => {
        if (me.role === "admin" && me.scope === "admin") setAdmin(me);
        else throw new Error("not admin");
      })
      .catch(() => router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`));
  }, [isLogin, pathname, router]);

  if (isLogin) return <div className="min-h-screen bg-neutral-50">{children}</div>;

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50" aria-busy="true">
        <p className="text-sm text-neutral-500">Checking your admin session…</p>
      </div>
    );
  }

  async function logout() {
    await adminApi.logout().catch(() => undefined);
    router.replace("/admin/login");
  }

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
          <span className="ml-auto hidden text-sm text-neutral-600 sm:inline">
            {admin.name ?? localPhone(admin.phone)}
          </span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 max-sm:ml-auto"
          >
            <LogOut aria-hidden width={15} height={15} />
            Log out
          </button>
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
