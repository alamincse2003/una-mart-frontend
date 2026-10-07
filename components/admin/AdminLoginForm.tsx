"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Phone, ShieldCheck } from "lucide-react";
import { adminApi, ApiError } from "@/lib/admin-api-client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { OtpInput } from "@/components/customer/OtpInput";

// Admin login = password, then a code sent by SMS to the admin's phone
// (SYSTEM_DESIGN.md "Admin accounts require an OTP on every login, plus a
// password"). Starts a 12-hour admin session.
export function AdminLoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"password" | "code">("password");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (step === "password") {
        const sent = await adminApi.login(phone.replace(/[\s-]/g, ""), password);
        setDevCode(sent.devCode);
        setPassword("");
        setStep("code");
      } else {
        await adminApi.verify(phone.replace(/[\s-]/g, ""), code);
        router.replace(next);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      if (err instanceof ApiError && err.code === "OTP_LOCKED") {
        setStep("password");
        setCode("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <p className="text-xl font-extrabold tracking-tight text-navy-800">
          UNA <span className="text-coral-700">Mart</span>
          <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wider text-neutral-500">Admin</span>
        </p>
        <h1 className="mt-6 flex items-center gap-2 text-lg font-bold text-neutral-800">
          <ShieldCheck aria-hidden width={20} height={20} className="text-navy-600" />
          {step === "password" ? "Log in" : "Enter your code"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {step === "password" ? (
            <>
              <TextField
                label="Mobile number"
                type="tel"
                inputMode="tel"
                autoComplete="username"
                required
                placeholder="01XXXXXXXXX"
                leading={<Phone width={17} height={17} />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                leading={<Lock width={17} height={17} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          ) : (
            <div>
              <p className="text-sm text-neutral-600">We sent a 6-digit code to your phone.</p>
              <div className="mt-3">
                <OtpInput value={code} onChange={setCode} label="6-digit code" autoFocus />
              </div>
              {devCode && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600">
                  <KeyRound aria-hidden width={13} height={13} />
                  Dev mode code: <span className="font-mono font-semibold">{devCode}</span>
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-md bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={busy} size="lg">
            {busy ? "Please wait…" : step === "password" ? "Continue" : "Verify & log in"}
          </Button>
          {step === "code" && (
            <button
              type="button"
              onClick={() => {
                setStep("password");
                setCode("");
                setError(null);
              }}
              className="text-sm font-semibold text-navy-600 hover:underline"
            >
              Start over
            </button>
          )}
        </form>
      </Card>
    </div>
  );
}
