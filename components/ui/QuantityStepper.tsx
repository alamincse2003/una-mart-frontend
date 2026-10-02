import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = "md",
  label = "Quantity",
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}) {
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const buttonClass = `flex ${box} items-center justify-center text-navy-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:bg-transparent`;

  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-fit items-center overflow-hidden rounded-pill border border-neutral-300 bg-neutral-0"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={disabled || quantity <= min}
        className={buttonClass}
        aria-label="Decrease quantity"
      >
        <Minus width={16} height={16} />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 text-center text-sm font-semibold tabular-nums text-neutral-800"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={disabled || quantity >= max}
        className={buttonClass}
        aria-label="Increase quantity"
      >
        <Plus width={16} height={16} />
      </button>
    </div>
  );
}
