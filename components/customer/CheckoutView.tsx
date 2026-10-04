"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Smartphone,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import {
  DELIVERY_ZONES,
  getDeliveryFee,
  getSavings,
  type DeliveryZone,
} from "@/lib/pricing";
import { PAYMENT_METHOD_LABELS, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/site";
import type { CreateOrderResponse, PaymentMethod } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { OrderSummary } from "./OrderSummary";

// Same rule as the server (app/api/orders/route.ts).
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

const PAYMENT_OPTIONS: { id: PaymentMethod; hint: string; icon: LucideIcon }[] = [
  { id: "cod", hint: "Pay in cash when your order arrives", icon: Banknote },
  { id: "bkash", hint: "Pay from your bKash account", icon: Smartphone },
  { id: "nagad", hint: "Pay from your Nagad account", icon: Wallet },
];

interface FormState {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.customerName.trim()) errors.customerName = "Please enter your full name.";
  if (!BD_PHONE.test(form.phone.replace(/[\s-]/g, "")))
    errors.phone = "Enter an 11-digit mobile number, e.g. 01712345678.";
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "Enter a valid email address, or leave it blank.";
  if (form.address.trim().length < 8)
    errors.address = "Please include house/road and area so the courier can find you.";
  if (!form.city.trim()) errors.city = "Please enter your city or district.";
  return errors;
}

export function CheckoutView() {
  const { status, cart, lines, itemCount, subtotal, linesLoading, refresh } = useCart();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [zone, setZone] = useState<DeliveryZone>("inside_dhaka");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<CreateOrderResponse | null>(null);

  const update = (field: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const deliveryFee = getDeliveryFee(zone, lines);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await apiClient.createOrder({
        customerName: form.customerName.trim(),
        phone: form.phone.replace(/[\s-]/g, ""),
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        deliveryZone: zone,
        paymentMethod,
        note: form.note.trim() || undefined,
      });
      setPlaced(result);
      window.scrollTo({ top: 0 });
      await refresh(); // server emptied the cart
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "We couldn't place your order. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return <OrderConfirmation order={placed} name={form.customerName} phone={form.phone} />;
  }

  if (status === "loading" || (cart.items.length > 0 && linesLoading && lines.length === 0)) {
    return (
      <section aria-busy="true" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="h-96 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-72 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Card>
          <EmptyState
            as="h1"
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add a few products to your cart, then come back here to check out."
          >
            <ButtonLink href="/products" variant="cta">
              Browse products
            </ButtonLink>
          </EmptyState>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
        <Lock aria-hidden width={14} height={14} />
        No account needed — checkout as a guest.
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="flex flex-col gap-6">
          <CheckoutStep number={1} title="Contact details">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Full name"
                name="customerName"
                required
                autoComplete="name"
                placeholder="e.g. Rahim Uddin"
                leading={<User width={17} height={17} />}
                value={form.customerName}
                onChange={update("customerName")}
                error={errors.customerName}
              />
              <TextField
                label="Mobile number"
                name="phone"
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                leading={<Phone width={17} height={17} />}
                value={form.phone}
                onChange={update("phone")}
                error={errors.phone}
                hint="We'll call this number to confirm your order."
              />
              <TextField
                className="sm:col-span-2"
                label="Email (optional)"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                leading={<Mail width={17} height={17} />}
                value={form.email}
                onChange={update("email")}
                error={errors.email}
                hint="For your order receipt."
              />
            </div>
          </CheckoutStep>

          <CheckoutStep number={2} title="Delivery address">
            <fieldset>
              <legend className="text-sm font-medium text-neutral-700">Delivery area</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {DELIVERY_ZONES.map((option) => {
                  const fee = getDeliveryFee(option.id, lines);
                  return (
                    <ChoiceCard
                      key={option.id}
                      name="deliveryZone"
                      checked={zone === option.id}
                      onChange={() => setZone(option.id)}
                      title={option.label}
                      meta={fee === 0 ? "Free" : formatPrice(fee)}
                      hint={option.eta}
                    />
                  );
                })}
              </div>
            </fieldset>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_200px]">
              <TextField
                label="Address"
                name="address"
                required
                autoComplete="street-address"
                placeholder="House, road, area"
                leading={<MapPin width={17} height={17} />}
                value={form.address}
                onChange={update("address")}
                error={errors.address}
              />
              <TextField
                label="City / district"
                name="city"
                required
                autoComplete="address-level2"
                placeholder={zone === "inside_dhaka" ? "Dhaka" : "e.g. Chattogram"}
                leading={<Building2 width={17} height={17} />}
                value={form.city}
                onChange={update("city")}
                error={errors.city}
              />
            </div>
            <TextAreaField
              className="mt-4"
              label="Delivery note (optional)"
              name="note"
              rows={2}
              placeholder="Landmark, preferred time, etc."
              value={form.note}
              onChange={update("note")}
            />
          </CheckoutStep>

          <CheckoutStep number={3} title="Payment">
            <fieldset>
              <legend className="sr-only">Payment method</legend>
              <div className="grid gap-3">
                {PAYMENT_OPTIONS.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    name="paymentMethod"
                    checked={paymentMethod === option.id}
                    onChange={() => setPaymentMethod(option.id)}
                    title={PAYMENT_METHOD_LABELS[option.id]}
                    hint={option.hint}
                    icon={option.icon}
                  />
                ))}
              </div>
            </fieldset>
          </CheckoutStep>
        </div>

        <Card className="p-5 lg:sticky lg:top-32">
          <h2 className="text-lg font-bold text-neutral-800">Your order</h2>
          <ul className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto">
            {lines.map(({ item, product, lineTotal }) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                  <Image src={product.images[0]} alt="" fill sizes="56px" className="object-contain p-1.5" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-800 px-1 text-[10px] font-bold text-neutral-0">
                    {item.quantity}
                    <span className="sr-only"> ×</span>
                  </span>
                </div>
                <p className="line-clamp-2 min-w-0 flex-1 text-sm text-neutral-800">{product.name}</p>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-800">
                  {formatPrice(lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-neutral-200 pt-4">
            <OrderSummary
              itemCount={itemCount}
              subtotal={subtotal}
              savings={getSavings(lines)}
              deliveryFee={deliveryFee}
            />
          </div>

          {submitError && (
            <p role="alert" className="mt-4 rounded-md bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
              {submitError}
            </p>
          )}

          <Button type="submit" variant="cta" size="lg" disabled={submitting} className="mt-5 w-full">
            <Lock aria-hidden width={16} height={16} />
            {submitting ? "Placing your order…" : `Place order · ${formatPrice(subtotal + deliveryFee)}`}
          </Button>
          <p className="mt-3 text-center text-xs text-neutral-600">
            By placing your order you agree to our{" "}
            <Link href="/terms" className="font-medium text-navy-600 underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/return-policy" className="font-medium text-navy-600 underline">
              Return Policy
            </Link>
            .
          </p>
        </Card>
      </form>
    </section>
  );
}

function CheckoutStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-7">
      <h2 className="flex items-center gap-3 border-b border-neutral-100 pb-4 text-lg font-bold text-neutral-800">
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-neutral-0 ring-4 ring-navy-50"
        >
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function ChoiceCard({
  name,
  checked,
  onChange,
  title,
  hint,
  meta,
  icon: Icon,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  hint?: string;
  meta?: string;
  icon?: LucideIcon;
}) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-navy-400 ${
        checked ? "border-navy-800 bg-navy-50" : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4.5 w-4.5 shrink-0 accent-navy-800 focus-visible:outline-none"
      />
      {Icon && (
        <span
          aria-hidden
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            checked ? "bg-navy-800 text-neutral-0" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          <Icon width={18} height={18} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-neutral-800">{title}</span>
        {hint && <span className="block text-xs text-neutral-600">{hint}</span>}
      </span>
      {meta && <span className="text-sm font-semibold text-navy-800">{meta}</span>}
    </label>
  );
}

function OrderConfirmation({
  order,
  name,
  phone,
}: {
  order: CreateOrderResponse;
  name: string;
  phone: string;
}) {
  const { order: o, items } = order;
  const units = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Card className="p-6 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success">
          <CheckCircle2 aria-hidden width={34} height={34} />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
          Thank you{name ? `, ${name.split(" ")[0]}` : ""}! Your order is placed.
        </h1>
        <p className="mt-2 text-neutral-600">
          Order number{" "}
          <span className="font-mono text-base font-bold text-navy-800">{o.id}</span>
        </p>

        <dl className="mx-auto mt-6 grid max-w-md gap-3 rounded-md border border-neutral-200 p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-600">Items</dt>
            <dd className="font-medium text-neutral-800">{units}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-600">Payment</dt>
            <dd className="font-medium text-neutral-800">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-600">Deliver to</dt>
            <dd className="text-right font-medium text-neutral-800">{o.shippingAddress}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3">
            <dt className="font-semibold text-neutral-800">Total</dt>
            <dd className="font-bold text-navy-800">{formatPrice(o.totalAmount)}</dd>
          </div>
        </dl>

        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
          We&apos;ll call <span className="font-semibold text-neutral-800">{phone}</span> shortly
          to confirm your order
          {o.paymentMethod === "cod"
            ? " — please keep the exact amount ready for the courier."
            : ` and share how to complete payment with ${PAYMENT_METHOD_LABELS[o.paymentMethod]}.`}{" "}
          Questions? Call{" "}
          <a href={SUPPORT_PHONE_HREF} className="font-semibold text-navy-600 underline">
            {SUPPORT_PHONE}
          </a>
          .
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products" variant="cta">
            Continue shopping
          </ButtonLink>
          <ButtonLink href="/track-order" variant="secondary">
            Track your order
          </ButtonLink>
        </div>
      </Card>
    </section>
  );
}
