"use client";

export function QuantityStepper({
  quantity,
  onChange,
  max = 10,
}: {
  quantity: number;
  onChange: (next: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        className="flex h-9 w-9 items-center justify-center text-espresso transition-colors hover:text-terra disabled:cursor-not-allowed disabled:text-line"
      >
        −
      </button>
      <span
        className="flex h-9 w-9 items-center justify-center font-body text-sm text-espresso"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        className="flex h-9 w-9 items-center justify-center text-espresso transition-colors hover:text-terra disabled:cursor-not-allowed disabled:text-line"
      >
        +
      </button>
    </div>
  );
}
