export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}) {
  return (
    <div className="flex w-fit items-center overflow-hidden rounded-pill border border-neutral-200">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-navy-800 transition-colors hover:bg-neutral-100"
        aria-label="Decrease quantity"
      >
        &minus;
      </button>
      <span className="w-9 text-center font-semibold text-neutral-800">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-navy-800 transition-colors hover:bg-neutral-100"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
