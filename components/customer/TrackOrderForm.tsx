"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { AlertTriangle, Check, XCircle } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatPrice } from "@/lib/format";
import type { CustomerOrder, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

const STEPS = ["Order placed", "Confirmed", "Packed", "On the way", "Delivered"];

const STEP_OF: Partial<Record<OrderStatus, number>> = {
  awaiting_payment: 0,
  pending_confirmation: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

const NOTICE: Partial<Record<OrderStatus, string>> = {
  cancelled: "This order was cancelled.",
  delivery_failed: "The courier couldn't deliver this order. We'll contact you about next steps.",
  returned_to_warehouse: "This order came back to our warehouse after a failed delivery.",
};

export function TrackOrderForm({ initialNumber = "", initialPhone = "" }: { initialNumber?: string; initialPhone?: string }) {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState(initialNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CustomerOrder | null>(null);

  async function lookup(number: string, phoneNumber: string) {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      setOrder(await apiClient.getOrder(number.trim(), phoneNumber.trim() || undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Links from the confirmation page / account arrive with the details filled in.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time lookup for prefilled links
    if (initialNumber && (initialPhone || user)) void lookup(initialNumber, initialPhone);
    // Only on first load (and once the session is known).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user === undefined]);

  async function handleCancel() {
    if (!order || !window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    setCancelling(true);
    setError(null);
    try {
      setOrder(await apiClient.cancelOrder(order.orderNumber, phone.trim() || undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't cancel the order. Please call us.");
    } finally {
      setCancelling(false);
    }
  }

  const step = order ? STEP_OF[order.status] ?? -1 : -1;
  const notice = order ? NOTICE[order.status] : undefined;

  return (
    <div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void lookup(orderNumber, phone);
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Order number"
            required
            placeholder="e.g. UM-10231"
            autoCapitalize="characters"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <TextField
            label="Mobile number"
            type="tel"
            inputMode="tel"
            required={!user}
            autoComplete="tel"
            placeholder={user ? "Not needed for your own orders" : "Used when ordering"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto sm:self-start">
          {loading ? "Looking up…" : "Track order"}
        </Button>
      </form>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-5 rounded-md bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-6 border-t border-neutral-200 pt-6">
            <p className="text-sm text-neutral-600">
              Order <span className="font-mono font-bold text-navy-800">{order.orderNumber}</span> · placed{" "}
              {formatDate(order.placedAt)}
            </p>

            {notice ? (
              <p
                className={`mt-4 flex items-start gap-2 rounded-md px-4 py-3 text-sm font-semibold ${
                  order.status === "cancelled" ? "bg-danger-bg text-danger" : "bg-warning-bg text-warning"
                }`}
              >
                {order.status === "cancelled" ? (
                  <XCircle aria-hidden width={18} height={18} className="mt-px shrink-0" />
                ) : (
                  <AlertTriangle aria-hidden width={18} height={18} className="mt-px shrink-0" />
                )}
                {notice}
              </p>
            ) : (
              <ol className="mt-5 grid grid-cols-5">
                {STEPS.map((label, i) => {
                  const done = i <= step;
                  return (
                    <li key={label} className="relative flex flex-col items-center text-center">
                      {i > 0 && (
                        <span
                          aria-hidden
                          className={`absolute right-1/2 top-4 h-0.5 w-full ${done ? "bg-success" : "bg-neutral-200"}`}
                        />
                      )}
                      <span
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          done
                            ? "border-success bg-success text-neutral-0"
                            : "border-neutral-300 bg-neutral-0 text-neutral-400"
                        }`}
                      >
                        {done ? <Check aria-hidden width={16} height={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </span>
                      <span className={`mt-2 text-[11px] font-semibold sm:text-xs ${done ? "text-neutral-800" : "text-neutral-500"}`}>
                        {label}
                        <span className="sr-only">{done ? " — done" : " — pending"}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            <ul className="mt-6 flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={`${item.sku}`} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                    <Image src={item.imageUrl ?? "/products/placeholder.svg"} alt="" fill sizes="48px" className="object-contain p-1" />
                  </div>
                  <p className="min-w-0 flex-1 text-sm text-neutral-800">
                    {item.productName}
                    {item.variantLabel && <span className="text-neutral-600"> · {item.variantLabel}</span>}
                    <span className="block text-xs text-neutral-600">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                  </p>
                  <span className="text-sm font-semibold tabular-nums text-neutral-800">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 grid gap-2 rounded-md bg-neutral-50 p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-neutral-600">Total</dt>
                <dd className="font-semibold text-neutral-800">
                  {formatPrice(order.total)}
                  {order.deliveryFee > 0 && (
                    <span className="block text-xs font-normal text-neutral-600">incl. {formatPrice(order.deliveryFee)} delivery</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-600">Payment</dt>
                <dd className="font-semibold text-neutral-800">
                  Cash on Delivery{order.paymentStatus === "paid" ? " · Paid" : ""}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-600">Deliver to</dt>
                <dd className="font-semibold text-neutral-800">
                  {[order.shippingAddress.line1, order.shippingAddress.area, order.shippingAddress.city].filter(Boolean).join(", ")}
                </dd>
              </div>
            </dl>

            {order.cancellable && (
              <Button variant="secondary" onClick={handleCancel} disabled={cancelling} className="mt-5">
                {cancelling ? "Cancelling…" : "Cancel this order"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
