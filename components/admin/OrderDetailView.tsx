"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, StickyNote } from "lucide-react";
import { adminApi } from "@/lib/admin-api-client";
import { ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { ORDER_TRANSITIONS } from "@/lib/order-transitions";
import { DELIVERY_ZONES } from "@/lib/pricing";
import { PAYMENT_METHOD_LABELS } from "@/lib/site";
import { useToast } from "@/lib/toast-context";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextAreaField } from "@/components/ui/Field";
import { formatDateTime } from "./format";
import { ORDER_STATUS_LABELS, OrderStatusBadge, TRANSITION_ACTION_LABELS } from "./order-status";
import { useAdminQuery } from "./useAdminQuery";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const toast = useToast();
  const order = useAdminQuery(() => adminApi.getOrder(orderId), orderId);
  const products = useAdminQuery(() => adminApi.listProducts());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<OrderStatus | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const productById = useMemo(
    () => new Map((products.data ?? []).map((p) => [p.id, p])),
    [products.data]
  );

  if (order.error) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <Card className="p-6">
          <p role="alert" className="text-sm font-medium text-danger">
            {order.error}
          </p>
        </Card>
      </div>
    );
  }
  if (!order.data) {
    return <div className="h-96 animate-pulse rounded-xl bg-neutral-100" aria-busy="true" />;
  }

  const o = order.data;
  const nextSteps = ORDER_TRANSITIONS[o.status];
  const subtotal = o.items.reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0);
  const zone = DELIVERY_ZONES.find((z) => z.id === o.deliveryZone);

  async function move(to: OrderStatus) {
    setBusy(to);
    try {
      order.setData(await adminApi.transitionOrder(orderId, to, note));
      setNote("");
      setConfirmingCancel(false);
      toast(`Order ${orderId}: ${ORDER_STATUS_LABELS[to]}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't update the order.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-neutral-800">{o.id}</h1>
        <OrderStatusBadge status={o.status} />
        <span className="text-sm text-neutral-500">Placed {formatDateTime(o.createdAt)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">Items</h2>
            <ul className="mt-4 divide-y divide-neutral-100">
              {o.items.map((item) => {
                const product = productById.get(item.productId);
                return (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    <div className="relative h-14 w-14 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                      {product?.images[0] && (
                        <Image src={product.images[0]} alt="" fill sizes="56px" className="object-contain p-1.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {product ? (
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="line-clamp-2 text-sm font-medium text-neutral-800 hover:underline"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-neutral-500">{item.productId}</span>
                      )}
                      <span className="block text-xs text-neutral-500">
                        {item.quantity} × {formatPrice(item.priceAtPurchase)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-neutral-800">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-2 flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Delivery</dt>
                <dd className="tabular-nums">{o.deliveryFee === 0 ? "Free" : formatPrice(o.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold text-navy-800">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(o.totalAmount)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">History</h2>
            <ol className="mt-4 flex flex-col gap-4">
              {[...o.history].reverse().map((event, i) => (
                <li key={`${event.at}-${i}`} className="flex gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? "bg-coral-400" : "bg-neutral-300"}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{ORDER_STATUS_LABELS[event.to]}</p>
                    <p className="text-xs text-neutral-500">
                      {formatDateTime(event.at)} · by {event.actor}
                    </p>
                    {event.note && <p className="mt-1 text-sm text-neutral-700">&ldquo;{event.note}&rdquo;</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          <Card className="p-5">
            <h2 className="text-base font-bold text-neutral-800">Update order</h2>
            {nextSteps.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">
                This order is {ORDER_STATUS_LABELS[o.status].toLowerCase()} — no further steps.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <TextAreaField
                  label="Note (optional)"
                  rows={2}
                  placeholder="e.g. Confirmed by phone, courier booked"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {nextSteps
                  .filter((to) => to !== "cancelled")
                  .map((to) => (
                    <Button
                      key={to}
                      variant="primary"
                      disabled={busy !== null}
                      onClick={() => move(to)}
                      className="w-full"
                    >
                      {busy === to ? "Saving…" : TRANSITION_ACTION_LABELS[to]}
                    </Button>
                  ))}
                {nextSteps.includes("cancelled") &&
                  (confirmingCancel ? (
                    <div role="alertdialog" aria-label="Confirm cancel" className="rounded-lg bg-danger-bg p-3">
                      <p className="text-sm font-medium text-danger">
                        Cancel this order? Its stock goes back on sale.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setConfirmingCancel(false)}
                          className="flex-1"
                        >
                          Keep order
                        </Button>
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => move("cancelled")}
                          className="min-h-9 flex-1 rounded-md bg-danger px-3 text-sm font-semibold text-neutral-0 hover:opacity-90 disabled:opacity-60"
                        >
                          {busy === "cancelled" ? "Cancelling…" : "Yes, cancel"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="ghost" onClick={() => setConfirmingCancel(true)} className="w-full text-danger">
                      Cancel order
                    </Button>
                  ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-neutral-800">Customer</h2>
            <p className="mt-3 font-semibold text-neutral-800">{o.customerName}</p>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-neutral-700">
              <li>
                <a href={`tel:${o.phone}`} className="flex items-center gap-2 hover:underline">
                  <Phone aria-hidden width={15} height={15} className="text-neutral-400" />
                  {o.phone}
                </a>
              </li>
              {o.email && (
                <li>
                  <a href={`mailto:${o.email}`} className="flex items-center gap-2 break-all hover:underline">
                    <Mail aria-hidden width={15} height={15} className="shrink-0 text-neutral-400" />
                    {o.email}
                  </a>
                </li>
              )}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-neutral-800">Delivery &amp; payment</h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-neutral-700">
              <MapPin aria-hidden width={15} height={15} className="mt-0.5 shrink-0 text-neutral-400" />
              <span>
                {o.address}, {o.city}
                {zone && (
                  <span className="block text-xs text-neutral-500">
                    {zone.label} · {zone.eta}
                  </span>
                )}
              </span>
            </p>
            {o.customerNote && (
              <p className="mt-3 flex items-start gap-2 rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">
                <StickyNote aria-hidden width={15} height={15} className="mt-0.5 shrink-0 text-neutral-400" />
                {o.customerNote}
              </p>
            )}
            <p className="mt-3 text-sm text-neutral-700">
              <span className="text-neutral-500">Payment: </span>
              <span className="font-semibold">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/orders"
      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-navy-600 hover:underline"
    >
      <ArrowLeft aria-hidden width={16} height={16} />
      All orders
    </Link>
  );
}
