"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";

// There's no contact endpoint yet, so the form composes an email in the
// shopper's own mail app (mailto:) instead of pretending to send. When a
// POST /contact (or ticketing) API exists, swap handleSubmit for it.
export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", orderId: "", message: "" });
  const [opened, setOpened] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = form.orderId
      ? `Order ${form.orderId.trim()} — question from ${form.name}`
      : `Question from ${form.name}`;
    const body = [
      form.message,
      "",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      ...(form.orderId ? [`Order number: ${form.orderId}`] : []),
    ].join("\n");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }

  const set = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" required autoComplete="name" value={form.name} onChange={set("name")} />
        <TextField
          label="Mobile number"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          value={form.phone}
          onChange={set("phone")}
        />
      </div>
      <TextField
        label="Order number (optional)"
        placeholder="e.g. UM-10231"
        value={form.orderId}
        onChange={set("orderId")}
      />
      <TextAreaField
        label="Message"
        required
        rows={5}
        placeholder="How can we help?"
        value={form.message}
        onChange={set("message")}
      />
      <Button type="submit" variant="primary" className="w-full sm:w-auto sm:self-start">
        <Mail aria-hidden width={16} height={16} />
        Send via email
      </Button>
      <p className="text-xs text-neutral-600" aria-live="polite">
        {opened
          ? `Your email app should have opened with the message ready. If not, email us directly at ${SUPPORT_EMAIL}.`
          : "This opens your email app with your message ready to send."}
      </p>
    </form>
  );
}
