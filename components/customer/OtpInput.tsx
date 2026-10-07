"use client";

import { useId } from "react";

// One field for the 6-digit SMS code. autocomplete="one-time-code" lets
// phones offer the code from the SMS automatically.
export function OtpInput({
  value,
  onChange,
  label,
  autoFocus,
  error,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
  autoFocus?: boolean;
  error?: string | null;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        name="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        autoFocus={autoFocus}
        placeholder="••••••"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        aria-invalid={error ? true : undefined}
        className="input-base min-h-12 w-full px-4 text-center font-mono text-xl tracking-[0.5em]"
      />
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
