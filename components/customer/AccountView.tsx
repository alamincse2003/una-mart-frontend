"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Package, User } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { formatDate, formatPrice } from "@/lib/format";
import type { OrderStatus, OrderSummary, Page } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextField } from "@/components/ui/Field";

const STATUS_LABEL: Record<OrderStatus, { label: string; className: string }> = {
  awaiting_payment: { label: "Awaiting payment", className: "bg-warning-bg text-warning" },
  pending_confirmation: { label: "Placed", className: "bg-info-bg text-info" },
  confirmed: { label: "Confirmed", className: "bg-info-bg text-info" },
  processing: { label: "Packed", className: "bg-info-bg text-info" },
  shipped: { label: "On the way", className: "bg-navy-50 text-navy-800" },
  delivered: { label: "Delivered", className: "bg-success-bg text-success" },
  delivery_failed: { label: "Delivery failed", className: "bg-warning-bg text-warning" },
  returned_to_warehouse: { label: "Returned", className: "bg-neutral-100 text-neutral-700" },
  cancelled: { label: "Cancelled", className: "bg-danger-bg text-danger" },
};

const localPhone = (e164: string) => e164.replace(/^\+88/, "");

export function AccountView() {
  const { user, updateMe, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState<Page<OrderSummary> | null>(null);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user === null) router.replace("/login?next=/account");
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fill the form once the session is known
    setName(user.name ?? "");
    setEmail(user.email ?? "");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    apiClient
      .myOrders(page)
      .then(setOrders)
      .catch(() => setOrders({ items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 }));
  }, [user, page]);

  if (!user) {
    return (
      <section aria-busy="true" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-neutral-100" />
      </section>
    );
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setSaving(true);
    try {
      await updateMe({ name: name.trim() || undefined, email: email.trim() || undefined });
      toast("Profile saved");
    } catch (error) {
      setProfileError(error instanceof ApiError ? error.message : "Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    toast("You're logged out");
    router.push("/");
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "My account" }]} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
            {user.name ? `Hi, ${user.name.split(" ")[0]}` : "My account"}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">Logged in with {localPhone(user.phone)}</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut aria-hidden width={16} height={16} />
          Log out
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-800">
            <Package aria-hidden width={19} height={19} className="text-navy-600" />
            My orders
          </h2>
          {orders === null ? (
            <div className="mt-4 space-y-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-neutral-100" />
              ))}
            </div>
          ) : orders.items.length === 0 ? (
            <EmptyState icon={Package} title="No orders yet" description="When you place an order, it shows up here.">
              <ButtonLink href="/products" variant="cta">
                Start shopping
              </ButtonLink>
            </EmptyState>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-neutral-200">
                {orders.items.map((order) => {
                  const status = STATUS_LABEL[order.status];
                  return (
                    <li key={order.orderNumber}>
                      <Link
                        href={`/track-order?number=${encodeURIComponent(order.orderNumber)}`}
                        className="flex items-center gap-3 py-3 hover:bg-neutral-50"
                      >
                        <div className="relative h-12 w-12 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                          <Image src={order.imageUrl ?? "/products/placeholder.svg"} alt="" fill sizes="48px" className="object-contain p-1" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-sm font-bold text-navy-800">{order.orderNumber}</p>
                          <p className="text-xs text-neutral-600">
                            {formatDate(order.placedAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold tabular-nums text-neutral-800">{formatPrice(order.total)}</p>
                          <span className={`mt-1 inline-block rounded-pill px-2 py-0.5 text-[11px] font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {orders.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="text-neutral-600">
                    Page {orders.page} of {orders.totalPages}
                  </span>
                  <Button variant="secondary" size="sm" disabled={page >= orders.totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-neutral-800">Profile</h2>
          <form onSubmit={saveProfile} className="mt-4 flex flex-col gap-4">
            <TextField
              label="Full name"
              autoComplete="name"
              leading={<User width={17} height={17} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email (optional)"
              type="email"
              autoComplete="email"
              leading={<Mail width={17} height={17} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {profileError && (
              <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm font-medium text-danger">
                {profileError}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
