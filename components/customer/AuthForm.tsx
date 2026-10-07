"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Phone, User } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { OtpInput } from "./OtpInput";

type Mode = "login" | "register";

const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
const RESEND_SECONDS = 60;

// Phone-first auth (ARCHITECTURE.md D3): no passwords for shoppers. Step 1
// sends a 6-digit code by SMS, step 2 verifies it and starts a session; the
// account is created on first login. "Create account" also saves the name.
export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const toast = useToast();
  const { verifyOtp, updateMe } = useAuth();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (step !== "code") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const cleanPhone = phone.replace(/[\s-]/g, "");

  async function sendCode() {
    const sent = await apiClient.requestOtp(cleanPhone, "login");
    setDevCode(sent.devCode);
    setResendAt(Date.now() + RESEND_SECONDS * 1000);
    setNow(Date.now());
    setStep("code");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (step === "phone") {
      if (isRegister && name.trim().length < 2) return setError("Please enter your full name.");
      if (!BD_PHONE.test(cleanPhone)) return setError("Enter an 11-digit mobile number, e.g. 01712345678.");
    } else if (!/^\d{6}$/.test(code)) {
      return setError("Enter the 6-digit code from the SMS.");
    }

    setBusy(true);
    try {
      if (step === "phone") {
        await sendCode();
      } else {
        const me = await verifyOtp(cleanPhone, code);
        if (isRegister && name.trim() && me.name !== name.trim()) await updateMe({ name: name.trim() });
        toast(isRegister ? "Welcome to UNA Mart!" : "You're logged in");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      if (err instanceof ApiError && err.code === "OTP_LOCKED") setCode("");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setBusy(true);
    try {
      await sendCode();
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {step === "phone" ? (
        <>
          {isRegister && (
            <TextField
              label="Full name"
              name="name"
              required
              autoComplete="name"
              placeholder="e.g. Rahim Uddin"
              leading={<User width={17} height={17} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <TextField
            label="Mobile number"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            leading={<Phone width={17} height={17} />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            hint="We'll send a 6-digit code by SMS."
          />
        </>
      ) : (
        <div>
          <p className="text-sm text-neutral-700">
            Enter the code we sent to <span className="font-semibold text-neutral-800">{cleanPhone}</span>.{" "}
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="font-semibold text-navy-600 hover:underline"
            >
              Change number
            </button>
          </p>
          <div className="mt-3">
            <OtpInput value={code} onChange={setCode} label="6-digit code" autoFocus />
          </div>
          {devCode && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600">
              <KeyRound aria-hidden width={13} height={13} />
              Dev mode code: <span className="font-mono font-semibold">{devCode}</span>
            </p>
          )}
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0 || busy}
            className="mt-2 text-sm font-semibold text-navy-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-neutral-500 disabled:no-underline"
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={busy} className="mt-1 w-full">
        {busy
          ? "Please wait…"
          : step === "phone"
            ? "Send code"
            : isRegister
              ? "Verify & create account"
              : "Verify & log in"}
      </Button>
    </form>
  );
}
