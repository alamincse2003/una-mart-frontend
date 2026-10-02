"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/site";
import type { CreateOrderResponse, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order placed" },
  { status: "paid", label: "Confirmed" },
  { status: "shipped", label: "On the way" },
  { status: "delivered", label: "Delivered" },
];

export function TrackOrderForm() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateOrderResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await apiClient.getOrder(orderId, phone));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const order = result?.order;
  const currentStep = order ? STEPS.findIndex((s) => s.status === order.status) : -1;

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Order number"
            required
            placeholder="e.g. UM-10231"
            autoCapitalize="characters"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <TextField
            label="Mobile number"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="Used when ordering"
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
              Order <span className="font-mono font-bold text-navy-800">{order.id}</span> ·{" "}
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>

            {order.status === "cancelled" ? (
              <p className="mt-4 rounded-md bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">
                This order was cancelled.
              </p>
            ) : (
              <ol className="mt-5 grid grid-cols-4">
                {STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  return (
                    <li key={step.status} className="relative flex flex-col items-center text-center">
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
                      <span className={`mt-2 text-xs font-semibold ${done ? "text-neutral-800" : "text-neutral-500"}`}>
                        {step.label}
                        <span className="sr-only">{done ? " — done" : " — pending"}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            <dl className="mt-6 grid gap-2 rounded-md bg-neutral-50 p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-neutral-600">Total</dt>
                <dd className="font-semibold text-neutral-800">{formatPrice(order.totalAmount)}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Payment</dt>
                <dd className="font-semibold text-neutral-800">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Deliver to</dt>
                <dd className="font-semibold text-neutral-800">{order.shippingAddress}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
