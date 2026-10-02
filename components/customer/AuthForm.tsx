"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Info } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

type Mode = "login" | "register";

// Auth UI ahead of the backend (POST /auth/login, /auth/register in
// SYSTEM_DESIGN.md). Validation is real; submission is not wired yet, and
// the form says so instead of pretending the user is signed in.
// Wire handleSubmit to apiClient once the NestJS auth module exists.
export function AuthForm({ mode }: { mode: Mode }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isRegister = mode === "register";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isRegister && password !== confirm) {
      setConfirmError("Passwords don't match.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-info-bg text-info">
          <Info aria-hidden width={22} height={22} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-neutral-800">Accounts are coming soon</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">
          You don&apos;t need an account to order — check out as a guest and
          track your order with your order number and mobile number.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products" variant="cta">
            Continue shopping
          </ButtonLink>
          <ButtonLink href="/track-order" variant="secondary">
            Track an order
          </ButtonLink>
        </div>
      </div>
    );
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
      className="flex h-11 w-11 items-center justify-center text-neutral-500 hover:text-neutral-800"
    >
      {showPassword ? <EyeOff aria-hidden width={18} height={18} /> : <Eye aria-hidden width={18} height={18} />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isRegister && (
        <TextField label="Full name" name="name" required autoComplete="name" />
      )}

      <TextField
        label="Mobile number or email"
        name="username"
        required
        autoComplete="username"
        inputMode="email"
      />

      <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={isRegister ? "At least 8 characters." : undefined}
          trailing={passwordToggle}
        />

      {isRegister ? (
        <TextField
          label="Confirm password"
          name="confirm-password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setConfirmError(null);
          }}
          error={confirmError}
        />
      ) : (
        <div className="-mt-1 flex justify-end">
          <Link href="/contact" className="text-sm font-semibold text-navy-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" className="mt-1 w-full">
        {isRegister ? "Create account" : "Log in"}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        {isRegister ? "Already have an account? " : "New to UNA Mart? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-semibold text-navy-600 hover:underline"
        >
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
