"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Ban, Mail, MapPin, Phone, StickyNote } from "lucide-react";
import { adminApi, ApiError } from "@/lib/admin-api-client";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextAreaField } from "@/components/ui/Field";
import { formatDateTime, localPhone } from "./format";
import { ORDER_STATUS_LABELS, OrderStatusBadge, TRANSITION_ACTION_LABELS } from "./order-status";
import { useAdminQuery } from "./useAdminQuery";

const ACTOR_LABEL = { customer: "customer", admin: "admin", system: "system", courier: "courier", payment: "payment" };

export function OrderDetailView({ orderNumber }: { orderNumber: string }) {
  const toast = useToast();
  const order = useAdminQuery(() => adminApi.getOrder(orderNumber), orderNumber);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<OrderStatus | "note" | "flag" | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [adminNote, setAdminNote] = useState<string | null>(null);

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
  const nextSteps = o.allowedTransitions;
  const noteDraft = adminNote ?? o.adminNote ?? "";

  async function move(to: OrderStatus) {
    setBusy(to);
    try {
      order.setData(await adminApi.transitionOrder(orderNumber, to, note.trim() || undefined));
      setNote("");
      setConfirmingCancel(false);
      toast(`Order ${orderNumber}: ${ORDER_STATUS_LABELS[to]}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't update the order.", "error");
      order.reload();
    } finally {
      setBusy(null);
    }
  }

  async function saveNote() {
    setBusy("note");
    try {
      order.setData(await adminApi.updateOrderNote(orderNumber, noteDraft));
      setAdminNote(null);
      toast("Note saved");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't save the note.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function toggleBlock() {
    const block = !o.phoneFlag.isBlocked;
    if (block && !window.confirm(`Block ${localPhone(o.phone)} from Cash on Delivery?`)) return;
    setBusy("flag");
    try {
      const flag = await adminApi.updatePhoneFlag(o.phone, { isBlocked: block });
      order.setData({ ...o, phoneFlag: flag });
      toast(block ? "Phone blocked from COD" : "Phone unblocked");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't update the phone.", "error");
    } finally {
      setBusy(null);
    }
  }

  const address = [o.shippingAddress.line1, o.shippingAddress.area, o.shippingAddress.city].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-neutral-800">{o.orderNumber}</h1>
        <OrderStatusBadge status={o.status} />
        {o.paymentStatus === "paid" && (
          <span className="rounded-pill bg-success-bg px-2.5 py-1 text-xs font-semibold text-success">Paid</span>
        )}
        <span className="text-sm text-neutral-500">Placed {formatDateTime(o.placedAt)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">Items</h2>
            <ul className="mt-4 divide-y divide-neutral-100">
              {o.items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-4 py-3">
                  <div className="relative h-14 w-14 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                    <Image src={item.imageUrl ?? "/products/placeholder.svg"} alt="" fill sizes="56px" className="object-contain p-1.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium text-neutral-800">
                      {item.productName}
                      {item.variantLabel && <span className="text-neutral-500"> · {item.variantLabel}</span>}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      <span className="font-mono">{item.sku}</span> · {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-neutral-800">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(o.subtotal)}</dd>
              </div>
              {o.discountTotal > 0 && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Discount</dt>
                  <dd className="tabular-nums">−{formatPrice(o.discountTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-neutral-600">Delivery</dt>
                <dd className="tabular-nums">{o.deliveryFee === 0 ? "Free" : formatPrice(o.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold text-navy-800">
                <dt>Total {o.paymentMethod === "cod" && <span className="text-xs font-semibold text-neutral-500">(collect in cash)</span>}</dt>
                <dd className="tabular-nums">{formatPrice(o.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">History</h2>
            <ol className="mt-4 flex flex-col gap-4">
              {[...o.timeline].reverse().map((event, i) => (
                <li key={`${event.at}-${i}`} className="flex gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? "bg-coral-400" : "bg-neutral-300"}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{ORDER_STATUS_LABELS[event.toStatus]}</p>
                    <p className="text-xs text-neutral-500">
                      {formatDateTime(event.at)} · by {event.actorName ?? ACTOR_LABEL[event.actorType]}
                    </p>
                    {event.note && <p className="mt-1 text-sm text-neutral-700">&ldquo;{event.note}&rdquo;</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800">Internal note</h2>
            <p className="mt-1 text-xs text-neutral-500">Only admins see this.</p>
            <TextAreaField
              className="mt-3"
              label="Note"
              rows={3}
              value={noteDraft}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Customer asked for evening delivery"
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              disabled={busy !== null || noteDraft === (o.adminNote ?? "")}
              onClick={saveNote}
            >
              {busy === "note" ? "Saving…" : "Save note"}
            </Button>
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
                  label="Note on this step (optional)"
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
                      variant={to === "delivery_failed" ? "secondary" : "primary"}
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
                  {localPhone(o.phone)}
                  {o.phoneVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <BadgeCheck aria-hidden width={14} height={14} />
                      verified
                    </span>
                  )}
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
            <div className="mt-4 rounded-md bg-neutral-50 p-3 text-xs text-neutral-700">
              <p>
                COD history: <span className="font-semibold">{o.phoneFlag.codDeliveredCount}</span> delivered ·{" "}
                <span className={`font-semibold ${o.phoneFlag.codRefusedCount >= 2 ? "text-danger" : ""}`}>
                  {o.phoneFlag.codRefusedCount}
                </span>{" "}
                refused
              </p>
              {o.phoneFlag.isBlocked && <p className="mt-1 font-semibold text-danger">Blocked from Cash on Delivery</p>}
              <button
                type="button"
                onClick={toggleBlock}
                disabled={busy !== null}
                className="mt-2 inline-flex items-center gap-1 font-semibold text-navy-600 hover:underline disabled:opacity-60"
              >
                <Ban aria-hidden width={13} height={13} />
                {o.phoneFlag.isBlocked ? "Unblock this phone" : "Block from COD"}
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-neutral-800">Delivery</h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-neutral-700">
              <MapPin aria-hidden width={15} height={15} className="mt-0.5 shrink-0 text-neutral-400" />
              <span>
                {address}
                <span className="block text-xs text-neutral-500">
                  {o.deliveryZoneDetail.name} · {o.deliveryZoneDetail.etaText}
                </span>
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
              <span className="font-semibold">Cash on Delivery · {o.paymentStatus}</span>
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
