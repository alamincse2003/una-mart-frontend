"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// No backend endpoint exists yet for contact submissions — this simulates
// a successful send so the form is demoable end to end (same approach as
// checkout's order placement).
export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <h3 className="text-lg font-bold text-neutral-800">
          Message sent
        </h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Thanks for reaching out — our team will get back to you within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name">
          <input
            type="text"
            required
            placeholder="Full Name"
            className="input-base"
          />
        </Field>
        <Field label="Phone Number">
          <input
            type="tel"
            required
            placeholder="Phone Number"
            className="input-base"
          />
        </Field>
      </div>
      <Field label="Email Address">
        <input
          type="email"
          required
          placeholder="Email Address"
          className="input-base"
        />
      </Field>
      <Field label="Message">
        <textarea
          required
          rows={5}
          placeholder="How can we help?"
          className="input-base resize-none"
        />
      </Field>
      <Button type="submit" variant="cta" className="mt-2 w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
