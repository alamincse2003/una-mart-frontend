import { Heart, Package, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { AuthForm } from "./AuthForm";

const BENEFITS = [
  { icon: Package, text: "Track every order in one place" },
  { icon: Zap, text: "Faster checkout with saved addresses" },
  { icon: Heart, text: "Keep your wishlist on any device" },
];

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: isRegister ? "Create account" : "Log in" }]} />
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_440px] lg:gap-14">
        <div className="lg:pt-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
            {isRegister ? "Create your UNA Mart account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-neutral-600">
            {isRegister
              ? "Join in a minute — or skip it entirely and check out as a guest."
              : "Log in to see your orders and check out faster."}
          </p>
          <ul className="mt-6 hidden flex-col gap-3 lg:flex">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-800">
                  <Icon aria-hidden width={17} height={17} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <Card className="p-5 sm:p-7">
          <AuthForm mode={mode} />
        </Card>
      </div>
    </section>
  );
}
