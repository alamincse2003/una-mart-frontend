"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  MessageCircle,
  Package,
  Phone,
  Tag,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { Category } from "@/lib/types";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/site";
import { Drawer } from "@/components/ui/Drawer";
import { SearchForm } from "./SearchForm";

// Mobile menu (<lg). Built on the shared Drawer (focus trap, Escape,
// scroll lock). Categories with children expand in place so shoppers can
// reach subcategories without a second page load.
export function MobileNav({
  open,
  onClose,
  topLevelCategories,
  subcategoriesByParent,
}: {
  open: boolean;
  onClose: () => void;
  topLevelCategories: Category[];
  subcategoriesByParent: Map<string, Category[]>;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const linkClass = (href: string) =>
    `flex min-h-12 flex-1 items-center rounded-md px-3 text-[15px] font-semibold transition-colors ${
      pathname === href
        ? "bg-navy-50 text-navy-800"
        : "text-neutral-800 hover:bg-neutral-100"
    }`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <span className="text-lg font-extrabold text-navy-800">
          UNA <span className="text-coral-700">Mart</span>
        </span>
      }
    >
      <div className="px-4 pt-4">
        <SearchForm onSubmitted={onClose} />
      </div>

      <nav aria-label="Categories" className="px-2 py-3">
        <ul className="flex flex-col">
          <li>
            <Link href="/products" onClick={onClose} className={linkClass("/products")}>
              All Products
            </Link>
          </li>
          {topLevelCategories.map((category) => {
            const href = `/category/${category.slug}`;
            const children = subcategoriesByParent.get(category.id) ?? [];
            const expanded = expandedId === category.id;
            const panelId = `mobile-cat-${category.id}`;

            return (
              <li key={category.id}>
                <div className="flex items-center">
                  <Link href={href} onClick={onClose} className={linkClass(href)}>
                    {category.name}
                  </Link>
                  {children.length > 0 && (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      aria-label={`${expanded ? "Hide" : "Show"} ${category.name} subcategories`}
                      onClick={() => setExpandedId(expanded ? null : category.id)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                    >
                      <ChevronDown
                        aria-hidden
                        width={18}
                        height={18}
                        className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {children.length > 0 && expanded && (
                  <ul id={panelId} className="mb-2 ml-3 border-l border-neutral-200 pl-2">
                    {children.map((child) => {
                      const childHref = `/category/${child.slug}`;
                      return (
                        <li key={child.id}>
                          <Link
                            href={childHref}
                            onClick={onClose}
                            className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium ${
                              pathname === childHref
                                ? "bg-navy-50 text-navy-800"
                                : "text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
          <li>
            <Link
              href="/#deals"
              onClick={onClose}
              className="flex min-h-12 items-center gap-2 rounded-md px-3 text-[15px] font-bold text-coral-700 hover:bg-coral-50"
            >
              <Tag aria-hidden width={17} height={17} />
              Deals
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mx-4 border-t border-neutral-200 py-3">
        <ul className="flex flex-col">
          {[
            user
              ? { href: "/account", label: "My account", icon: User }
              : { href: "/login", label: "Login / Register", icon: User },
            { href: "/wishlist", label: "Wishlist", icon: Heart },
            { href: "/track-order", label: "Track Order", icon: Package },
            { href: "/contact", label: "Help & Contact", icon: MessageCircle },
          ].map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className="flex min-h-11 items-center gap-3 rounded-md px-1 text-sm font-medium text-neutral-700 hover:text-navy-800"
              >
                <Icon aria-hidden width={18} height={18} className="text-neutral-500" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={SUPPORT_PHONE_HREF}
          className="mt-3 flex items-center gap-3 rounded-md bg-navy-50 px-3 py-3 text-sm font-semibold text-navy-800"
        >
          <Phone aria-hidden width={18} height={18} />
          <span>
            Order by phone
            <span className="block text-xs font-medium text-neutral-600">{SUPPORT_PHONE}</span>
          </span>
        </a>
      </div>
    </Drawer>
  );
}
