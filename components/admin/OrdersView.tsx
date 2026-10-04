"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, Search } from "lucide-react";
import { adminApi } from "@/lib/admin-api-client";
import { formatPrice } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/site";
import type { OrderStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { formatDateTime } from "./format";
import { ORDER_STATUS_LABELS, OrderStatusBadge } from "./order-status";
import { useAdminQuery } from "./useAdminQuery";

const TABS: (OrderStatus | "all")[] = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

export function OrdersView() {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  // Debounce the search box so typing doesn't fire a request per key.
  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const stats = useAdminQuery(() => adminApi.getStats());
  const orders = useAdminQuery(
    () => adminApi.listOrders({ status: status === "all" ? undefined : status, q: q || undefined }),
    `${status}|${q}`
  );

  const counts = stats.data?.statusCounts;
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Orders" description="Confirm, ship and track every order." />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Order status" className="flex gap-1 overflow-x-auto rounded-pill bg-neutral-100 p-1">
          {TABS.map((tab) => {
            const active = tab === status;
            const count = tab === "all" ? total : counts?.[tab];
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(tab)}
                className={`flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active ? "bg-neutral-0 text-navy-800 shadow-sm" : "text-neutral-600 hover:text-neutral-800"
                }`}
              >
                {tab === "all" ? "All" : ORDER_STATUS_LABELS[tab]}
                {count !== undefined && (
                  <span className={`rounded-pill px-1.5 text-xs tabular-nums ${active ? "bg-navy-50" : "bg-neutral-200"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <label className="relative block lg:w-72">
          <span className="sr-only">Search orders</span>
          <Search aria-hidden width={16} height={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order no., name or phone"
            className="input-base min-h-10 rounded-pill py-2 pl-10"
          />
        </label>
      </div>

      <Card className="overflow-hidden">
        {orders.error ? (
          <p role="alert" className="p-6 text-sm font-medium text-danger">{orders.error}</p>
        ) : orders.data && orders.data.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No orders here"
            description={q ? "Nothing matches that search." : "Orders will show up here as soon as customers check out."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Placed</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(orders.data ?? []).map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="cursor-pointer transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono font-bold text-navy-800 hover:underline"
                      >
                        {order.id}
                      </Link>
                      <span className="block text-xs text-neutral-500">
                        {order.items.reduce((n, i) => n + i.quantity, 0)} items
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-neutral-600">{formatDateTime(order.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-neutral-800">{order.customerName}</span>
                      <span className="block text-xs text-neutral-500">{order.phone} · {order.city}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-neutral-800">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</td>
                    <td className="px-5 py-3.5"><OrderStatusBadge status={order.status} /></td>
                  </tr>
                ))}
                {orders.loading && !orders.data && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-neutral-500">Loading orders…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
