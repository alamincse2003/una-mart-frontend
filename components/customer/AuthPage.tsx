import Link from "next/link";
import { Heart, Package, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AuthForm } from "./AuthForm";

const BENEFITS = [
  { icon: Package, text: "Track every order in one place" },
  { icon: Zap, text: "Faster checkout — no extra codes for your own number" },
  { icon: Heart, text: "Track or cancel orders in one tap" },
];

const TABS = [
  { mode: "login", href: "/login", label: "Log in" },
  { mode: "register", href: "/register", label: "Create account" },
] as const;

/** Only same-site paths ("/checkout"), never "//evil.com" or full URLs. */
export function safeNext(value: string | string[] | undefined): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function AuthPage({ mode, next = "/account" }: { mode: "login" | "register"; next?: string }) {
  const isRegister = mode === "register";
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: isRegister ? "Create account" : "Log in" }]} />

      <div className="mt-6 grid overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0 shadow-sm lg:grid-cols-[1fr_1.1fr]">
        {/* Brand panel — desktop only; mobile goes straight to the form. */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-navy-800 to-navy-900 p-10 text-neutral-0 lg:flex">
          <span
            aria-hidden
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-coral-400/25 blur-3xl"
          />
          <span
            aria-hidden
            className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-coral-400/10 blur-3xl"
          />

          <div className="relative">
            <p className="text-2xl font-extrabold tracking-tight">
              UNA <span className="text-coral-400">Mart</span>
            </p>
            <h2 className="mt-8 text-3xl font-bold leading-tight">
              {isRegister ? "Join UNA Mart in a minute." : "Good to see you again."}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-navy-100">
              {isRegister
                ? "Everything you need, in one place — with faster checkout and your orders at your fingertips."
                : "Pick up where you left off — your orders, wishlist and addresses are a login away."}
            </p>
          </div>

          <ul className="relative mt-10 flex flex-col gap-4">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium text-navy-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-400/15 text-coral-400 ring-1 ring-coral-400/30">
                  <Icon aria-hidden width={18} height={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="p-6 sm:p-10">
          <div
            role="tablist"
            aria-label="Account"
            className="grid grid-cols-2 gap-1 rounded-pill bg-neutral-100 p-1"
          >
            {TABS.map((tab) => {
              const active = tab.mode === mode;
              return (
                <Link
                  key={tab.mode}
                  href={next === "/account" ? tab.href : `${tab.href}?next=${encodeURIComponent(next)}`}
                  role="tab"
                  aria-selected={active}
                  className={`rounded-pill px-4 py-2 text-center text-sm font-semibold transition-colors ${
                    active
                      ? "bg-neutral-0 text-navy-800 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-800"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <h1 className="mt-7 text-2xl font-bold tracking-tight text-neutral-800">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600">
            {isRegister
              ? "Join in a minute with your mobile number — no password needed."
              : "We'll text a one-time code to your mobile number."}
          </p>

          <div className="mt-6">
            <AuthForm mode={mode} next={next} />
          </div>
        </div>
      </div>
    </section>
  );
}
