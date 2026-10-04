import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

// Labelled form control with hint + error text wired up via
// aria-describedby / aria-invalid, so screen readers announce them.
interface FieldShellProps {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className = "",
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label}
        {required && (
          <span aria-hidden className="text-danger">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  className,
  trailing,
  leading,
  ...inputProps
}: FieldShellProps &
  InputHTMLAttributes<HTMLInputElement> & {
    /** Control rendered inside the input's right edge (e.g. show-password). */
    trailing?: ReactNode;
    /** Decorative icon rendered inside the input's left edge. */
    leading?: ReactNode;
  }) {
  const generatedId = useId();
  const id = inputProps.id ?? generatedId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={inputProps.required}
      className={className}
    >
      <div className="relative">
        {leading && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400"
          >
            {leading}
          </span>
        )}
        <input
          {...inputProps}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`input-base ${leading ? "pl-10" : ""} ${trailing ? "pr-12" : ""}`}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
      </div>
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  ...textareaProps
}: FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const id = textareaProps.id ?? generatedId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={textareaProps.required}
      className={className}
    >
      <textarea
        {...textareaProps}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className="input-base resize-y"
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  children,
  ...selectProps
}: FieldShellProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const generatedId = useId();
  const id = selectProps.id ?? generatedId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={selectProps.required}
      className={className}
    >
      <div className="relative">
        <select
          {...selectProps}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className="input-base cursor-pointer appearance-none pr-10"
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          width={16}
          height={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
        />
      </div>
    </FieldShell>
  );
}
