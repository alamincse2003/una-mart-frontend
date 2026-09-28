"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Tab = "login" | "register";

// No auth backend exists yet — submitting either form just simulates
// success so the flow is demoable end to end (same approach as checkout's
// order placement and the contact form).
export function AuthForm() {
  const [tab, setTab] = useState<Tab>("login");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <h3 className="text-lg font-bold text-neutral-800">
          {tab === "login" ? "Logged in" : "Account created"}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Account login isn&apos;t connected to a real backend yet — this is
          a preview of the flow.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex rounded-md border border-neutral-200 bg-neutral-50 p-1">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-sm py-2 text-sm font-semibold transition-colors ${
            tab === "login"
              ? "bg-neutral-0 text-navy-800 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`flex-1 rounded-sm py-2 text-sm font-semibold transition-colors ${
            tab === "register"
              ? "bg-neutral-0 text-navy-800 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {tab === "register" && (
          <Field label="Full Name">
            <input
              type="text"
              required
              placeholder="Full Name"
              className="input-base"
            />
          </Field>
        )}

        <Field label="Phone Number or Email">
          <input
            type="text"
            required
            placeholder="Phone Number or Email"
            className="input-base"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="input-base"
          />
        </Field>

        {tab === "login" ? (
          <div className="flex justify-end">
            <a
              href="#"
              className="text-xs font-semibold text-navy-800 hover:text-coral-600"
            >
              Forgot password?
            </a>
          </div>
        ) : (
          <Field label="Confirm Password">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirm Password"
              className="input-base"
            />
          </Field>
        )}

        <Button type="submit" variant="cta" className="mt-2 w-full">
          {tab === "login" ? "Login" : "Create Account"}
        </Button>
      </form>
    </div>
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
