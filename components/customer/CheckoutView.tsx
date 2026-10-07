"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { getDeliveryFee, getSavings, orderableLines } from "@/lib/pricing";
import { PAYMENT_METHOD_LABELS, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/site";
import type { CustomerOrder, DeliveryZone, PaymentMethod } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { OrderSummary } from "./OrderSummary";
import { OtpInput } from "./OtpInput";

// Same rule as the API (normalizeBdPhone).
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
const RESEND_SECONDS = 60;

const PAYMENT_OPTIONS: { id: PaymentMethod; hint: string; icon: LucideIcon; available: boolean }[] = [
  { id: "cod", hint: "Pay in cash when your order arrives", icon: Banknote, available: true },
  { id: "bkash", hint: "Coming soon", icon: Smartphone, available: false },
  { id: "nagad", hint: "Coming soon", icon: Wallet, available: false },
];

interface FormState {
  customerName: string;
  phone: string;
  email: string;
  line1: string;
  area: string;
  city: string;
  note: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const localPhone = (e164: string) => e164.replace(/^\+88/, "");

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (form.customerName.trim().length < 2) errors.customerName = "Please enter your full name.";
  if (!BD_PHONE.test(form.phone.replace(/[\s-]/g, "")))
    errors.phone = "Enter an 11-digit mobile number, e.g. 01712345678.";
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "Enter a valid email address, or leave it blank.";
  if (form.line1.trim().length < 5)
    errors.line1 = "Please include house and road so the courier can find you.";
  if (form.city.trim().length < 2) errors.city = "Please enter your city or district.";
  return errors;
}

export function CheckoutView() {
  const { status, lines, itemCount, subtotal, refresh } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    phone: "",
    email: "",
    line1: "",
    area: "",
    city: "",
    note: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [zones, setZones] = useState<DeliveryZone[] | null>(null);
  const [zoneCode, setZoneCode] = useState("inside_dhaka");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<CustomerOrder | null>(null);
  // Phone verification, when the API answers OTP_REQUIRED.
  const [otp, setOtp] = useState<{ phone: string; code: string; devCode?: string; resendAt: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    apiClient
      .getDeliveryZones()
      .then(setZones)
      .catch(() => setSubmitError("We couldn't load delivery options. Please refresh the page."));
  }, []);

  // Logged-in shoppers: prefill what we know (never overwrite typing).
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time prefill once the session is known
    setForm((f) => ({
      ...f,
      customerName: f.customerName || user.name || "",
      phone: f.phone || localPhone(user.phone),
      email: f.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!otp) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [otp]);

  const update = (field: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
    if (field === "phone" && otp) setOtp(null); // a new number needs a new code
  };

  const zone = zones?.find((z) => z.code === zoneCode) ?? zones?.[0];
  const deliveryFee = zone ? getDeliveryFee(zone, lines) : null;
  const hasIssues = lines.some((line) => line.issue !== null);
  const phone = form.phone.replace(/[\s-]/g, "");

  async function sendCode() {
    const sent = await apiClient.requestOtp(phone, "checkout");
    setOtp({ phone, code: "", devCode: sent.devCode, resendAt: Date.now() + RESEND_SECONDS * 1000 });
    setNow(Date.now());
  }

  async function placeOrder(otpCode?: string) {
    if (!zone) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await apiClient.createOrder({
        customerName: form.customerName.trim(),
        phone,
        email: form.email.trim() || undefined,
        address: { line1: form.line1.trim(), area: form.area.trim() || undefined, city: form.city.trim() },
        deliveryZone: zone.code,
        paymentMethod: "cod",
        note: form.note.trim() || undefined,
        otpCode,
      });
      setPlaced(order);
      setOtp(null);
      window.scrollTo({ top: 0 });
      await refresh(); // the server emptied the cart
    } catch (error) {
      if (error instanceof ApiError && error.code === "OTP_REQUIRED") {
        try {
          await sendCode();
        } catch (sendError) {
          setSubmitError(sendError instanceof ApiError ? sendError.message : "We couldn't send the code. Please try again.");
        }
      } else if (error instanceof ApiError && (error.code === "OTP_LOCKED" || error.code === "OTP_INVALID")) {
        setSubmitError(error.message);
        if (error.code === "OTP_LOCKED") setOtp((o) => (o ? { ...o, code: "" } : o));
      } else {
        setSubmitError(
          error instanceof ApiError
            ? error.message
            : "We couldn't place your order. Please check your connection and try again."
        );
        if (error instanceof ApiError && ["OUT_OF_STOCK", "ITEM_UNAVAILABLE", "CART_EMPTY"].includes(error.code)) {
          await refresh();
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    if (otp) {
      if (!/^\d{6}$/.test(otp.code)) {
        setSubmitError("Enter the 6-digit code we sent to your phone.");
        return;
      }
      await placeOrder(otp.code);
    } else {
      await placeOrder();
    }
  }

  async function handleResend() {
    setSubmitError(null);
    try {
      await sendCode();
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "We couldn't send the code. Please try again.");
    }
  }

  if (placed) {
    return <OrderConfirmation order={placed} />;
  }

  if (status === "loading") {
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

  if (lines.length === 0) {
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

  const resendIn = otp ? Math.max(0, Math.ceil((otp.resendAt - now) / 1000)) : 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
        <Lock aria-hidden width={14} height={14} />
        {user ? `Logged in as ${localPhone(user.phone)}.` : (
          <>
            No account needed — checkout as a guest, or{" "}
            <Link href="/login?next=/checkout" className="font-semibold text-navy-600 underline">
              log in
            </Link>
            .
          </>
        )}
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
                hint="We'll call or text this number about your order."
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
                {zones === null
                  ? [0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100" />)
                  : zones.map((option) => {
                      const fee = getDeliveryFee(option, lines);
                      return (
                        <ChoiceCard
                          key={option.code}
                          name="deliveryZone"
                          checked={zone?.code === option.code}
                          onChange={() => setZoneCode(option.code)}
                          title={option.name}
                          meta={fee === 0 ? "Free" : formatPrice(fee)}
                          hint={option.etaText}
                        />
                      );
                    })}
              </div>
            </fieldset>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField
                className="sm:col-span-2"
                label="Address"
                name="line1"
                required
                autoComplete="address-line1"
                placeholder="House, road, block"
                leading={<MapPin width={17} height={17} />}
                value={form.line1}
                onChange={update("line1")}
                error={errors.line1}
              />
              <TextField
                label="Area (optional)"
                name="area"
                autoComplete="address-line2"
                placeholder="e.g. Dhanmondi"
                value={form.area}
                onChange={update("area")}
              />
              <TextField
                label="City / district"
                name="city"
                required
                autoComplete="address-level2"
                placeholder={zone?.code === "inside_dhaka" ? "Dhaka" : "e.g. Chattogram"}
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
                    checked={option.id === "cod"}
                    disabled={!option.available}
                    onChange={() => undefined}
                    title={PAYMENT_METHOD_LABELS[option.id as keyof typeof PAYMENT_METHOD_LABELS]}
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
            {lines.map((line) => (
              <li key={line.id} className={`flex items-center gap-3 ${line.issue ? "opacity-60" : ""}`}>
                <div className="relative h-14 w-14 shrink-0 rounded-md border border-neutral-200 bg-neutral-50">
                  <Image src={line.imageUrl ?? "/products/placeholder.svg"} alt="" fill sizes="56px" className="object-contain p-1.5" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-800 px-1 text-[10px] font-bold text-neutral-0">
                    {line.quantity}
                    <span className="sr-only"> ×</span>
                  </span>
                </div>
                <p className="line-clamp-2 min-w-0 flex-1 text-sm text-neutral-800">
                  {line.name}
                  {line.variantLabel && <span className="block text-xs text-neutral-600">{line.variantLabel}</span>}
                </p>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-800">
                  {formatPrice(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-neutral-200 pt-4">
            <OrderSummary
              itemCount={orderableLines(lines).reduce((n, l) => n + l.quantity, 0) || itemCount}
              subtotal={subtotal}
              savings={getSavings(lines)}
              deliveryFee={deliveryFee}
            />
          </div>

          {otp && (
            <div className="mt-5 rounded-lg border-2 border-navy-100 bg-navy-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-navy-800">
                <ShieldCheck aria-hidden width={18} height={18} />
                Verify your phone
              </p>
              <p className="mt-1 text-xs text-neutral-700">
                We sent a 6-digit code to <span className="font-semibold">{otp.phone}</span>. Enter it to place your order.
              </p>
              <div className="mt-3">
                <OtpInput
                  value={otp.code}
                  onChange={(code) => setOtp((o) => (o ? { ...o, code } : o))}
                  label="Verification code"
                  autoFocus
                />
              </div>
              {otp.devCode && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600">
                  <KeyRound aria-hidden width={13} height={13} />
                  Dev mode code: <span className="font-mono font-semibold">{otp.devCode}</span>
                </p>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendIn > 0 || submitting}
                className="mt-2 text-xs font-semibold text-navy-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-neutral-500 disabled:no-underline"
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </button>
            </div>
          )}

          {hasIssues && (
            <p role="alert" className="mt-4 rounded-md bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
              Some items in your cart are unavailable or low on stock.{" "}
              <Link href="/cart" className="underline">
                Update your cart
              </Link>{" "}
              to continue.
            </p>
          )}
          {submitError && (
            <p role="alert" className="mt-4 rounded-md bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            variant="cta"
            size="lg"
            disabled={submitting || hasIssues || !zone}
            className="mt-5 w-full"
          >
            <Lock aria-hidden width={16} height={16} />
            {submitting
              ? "Placing your order…"
              : otp
                ? "Verify & place order"
                : `Place order · ${formatPrice(subtotal + (deliveryFee ?? 0))}`}
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
  disabled = false,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  hint?: string;
  meta?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex min-h-14 items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-navy-400 ${
        disabled
          ? "cursor-not-allowed border-neutral-200 opacity-60"
          : checked
            ? "cursor-pointer border-navy-800 bg-navy-50"
            : "cursor-pointer border-neutral-200 hover:border-neutral-400"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
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

function OrderConfirmation({ order }: { order: CustomerOrder }) {
  const units = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const confirmed = order.status === "confirmed";
  const address = [order.shippingAddress.line1, order.shippingAddress.area, order.shippingAddress.city]
    .filter(Boolean)
    .join(", ");
  const phone = localPhone(order.phone);
  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Card className="p-6 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success">
          <CheckCircle2 aria-hidden width={34} height={34} />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
          Thank you, {order.customerName.split(" ")[0]}! Your order is {confirmed ? "confirmed" : "placed"}.
        </h1>
        <p className="mt-2 text-neutral-600">
          Order number{" "}
          <span className="font-mono text-base font-bold text-navy-800">{order.orderNumber}</span>
        </p>

        <dl className="mx-auto mt-6 grid max-w-md gap-3 rounded-md border border-neutral-200 p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-600">Items</dt>
            <dd className="font-medium text-neutral-800">{units}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-600">Payment</dt>
            <dd className="font-medium text-neutral-800">Cash on Delivery</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-600">Deliver to</dt>
            <dd className="text-right font-medium text-neutral-800">{address}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-600">Delivery</dt>
            <dd className="text-right font-medium text-neutral-800">
              {order.deliveryZone.name} · {order.deliveryZone.etaText}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3">
            <dt className="font-semibold text-neutral-800">Total</dt>
            <dd className="font-bold text-navy-800">{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
          {confirmed
            ? "Your phone is verified, so we're preparing your order now"
            : <>We&apos;ll call <span className="font-semibold text-neutral-800">{phone}</span> shortly to confirm your order</>}
          {" "}— please keep the exact amount ready for the courier. Questions? Call{" "}
          <a href={SUPPORT_PHONE_HREF} className="font-semibold text-navy-600 underline">
            {SUPPORT_PHONE}
          </a>
          .
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products" variant="cta">
            Continue shopping
          </ButtonLink>
          <ButtonLink
            href={`/track-order?number=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(phone)}`}
            variant="secondary"
          >
            Track your order
          </ButtonLink>
        </div>
      </Card>
    </section>
  );
}
