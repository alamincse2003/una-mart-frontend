"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Banknote, Clock, ShoppingBag } from "lucide-react";
import { adminApi } from "@/lib/admin-api-client";
import { formatPrice } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { AdminPageHeader } from "./AdminPageHeader";
import { formatDateTime } from "./format";
import { OrderStatusBadge } from "./order-status";
import { StatCard } from "./StatCard";
import { useAdminQuery } from "./useAdminQuery";

export function OverviewView() {
  const stats = useAdminQuery(() => adminApi.getStats());
  const orders = useAdminQuery(() => adminApi.listOrders({ pageSize: 6 }));

  const s = stats.data;
  const recent = orders.data?.items ?? [];
  const lowStock = s?.lowStock ?? [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Overview" description="What needs your attention today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Orders today" value={s?.ordersToday ?? "—"} href="/admin/orders" />
        <StatCard
          icon={Clock}
          label="Pending confirmation"
          value={s?.pendingConfirmation ?? "—"}
          href="/admin/orders?status=pending_confirmation"
          tone="warning"
        />
        <StatCard
          icon={Banknote}
          label="Order value today"
          value={s ? formatPrice(s.revenueToday) : "—"}
          tone="success"
        />
        <StatCard
          icon={AlertTriangle}
          label={`Low stock (≤ ${s?.lowStockThreshold ?? 5})`}
          value={s?.lowStockCount ?? "—"}
          href="/admin/products"
          tone="coral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="text-base font-bold text-neutral-800">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:underline"
            >
              View all <ArrowRight aria-hidden width={14} height={14} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">
              {orders.loading ? "Loading…" : "No orders yet."}
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recent.map((order) => (
                <li key={order.orderNumber}>
                  <Link
                    href={`/admin/orders/${order.orderNumber}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-neutral-50"
                  >
                    <span className="font-mono text-sm font-bold text-navy-800">{order.orderNumber}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">{order.customerName}</span>
                    <span className="text-xs text-neutral-500">{formatDateTime(order.placedAt)}</span>
                    <span className="w-24 text-right text-sm font-semibold tabular-nums text-neutral-800">
                      {formatPrice(order.total)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="text-base font-bold text-neutral-800">Restock soon</h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:underline"
            >
              Products <ArrowRight aria-hidden width={14} height={14} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-neutral-500">
              {stats.loading ? "Loading…" : "Everything is well stocked."}
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {lowStock.map((item) => {
                const out = item.stockQty <= 0;
                return (
                  <li key={item.variantId}>
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-neutral-800">{item.productName}</span>
                        <span className="block font-mono text-[11px] text-neutral-500">{item.sku}</span>
                      </span>
                      <span
                        className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${
                          out ? "bg-danger-bg text-danger" : "bg-warning-bg text-warning"
                        }`}
                      >
                        {out ? "Out" : `${item.stockQty} left`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
