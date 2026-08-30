"use client";

import { useId } from "react";
import { SIZES, type Size } from "@/lib/sizes";

type VariantStock = { size: string; stock: number };

/**
 * Pills, not a dropdown (spec section 12, day 4). Built on native radio
 * inputs (visually hidden) + styled labels rather than custom button/ARIA
 * state — that gets keyboard nav, grouping, and screen-reader semantics
 * for free instead of hand-rolled.
 *
 * Sold-out sizes are shown struck through and disabled — real inventory
 * state, not the fabricated scarcity spec section 1 rules out.
 *
 * Controlled (value/onChange), not self-managed — since day 5, the parent
 * (AddToCartSection) needs to know the selected size to enable "Add to
 * cart" and know which variant to add.
 */
export function SizeSelector({
  variants,
  value,
  onChange,
}: {
  variants: VariantStock[];
  value: Size | null;
  onChange: (size: Size) => void;
}) {
  const groupName = useId();
  const stockBySize = new Map(variants.map((v) => [v.size, v.stock]));

  return (
    <fieldset>
      <legend className="font-body text-xs font-medium tracking-[0.14em] text-espresso uppercase">
        Size
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const stock = stockBySize.get(size) ?? 0;
          const soldOut = stock <= 0;
          const inputId = `${groupName}-${size}`;

          return (
            <div key={size}>
              <input
                type="radio"
                id={inputId}
                name={groupName}
                value={size}
                disabled={soldOut}
                checked={value === size}
                onChange={() => onChange(size)}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={`flex h-11 min-w-11 items-center justify-center border px-3 font-body text-sm font-medium transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terra ${
                  soldOut
                    ? "cursor-not-allowed border-line text-muted line-through"
                    : "cursor-pointer border-espresso text-espresso hover:border-terra hover:text-terra peer-checked:bg-espresso peer-checked:text-cream peer-checked:hover:text-cream"
                }`}
              >
                {size}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
