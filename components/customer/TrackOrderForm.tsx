"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// No order-lookup backend exists yet — this is a UI-only placeholder so the
// page has a working form shape ahead of that integration.
export function TrackOrderForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-700">
            Order Number
          </span>
          <input
            type="text"
            required
            placeholder="e.g. UM-10234"
            className="input-base"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-700">
            Phone Number
          </span>
          <input
            type="tel"
            required
            placeholder="Phone Number"
            className="input-base"
          />
        </label>
      </div>
      <Button type="submit" variant="cta" className="w-full sm:w-auto">
        Track Order
      </Button>

      {submitted && (
        <p className="mt-2 text-sm text-neutral-500">
          Order tracking isn&apos;t connected to live order data yet — once
          it is, your order status will appear here.
        </p>
      )}
    </form>
  );
}
