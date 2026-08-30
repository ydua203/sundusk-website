"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { useCart, type CartItem } from "@/context/cart-context";
import { formatPaise } from "@/lib/money";
import { QuantityStepper } from "./quantity-stepper";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <li className="flex gap-4 border-b border-line py-6 first:pt-0 last:border-b-0">
      <Link href={`/products/${item.productSlug}`} className="w-24 shrink-0 sm:w-28">
        <ProductImage src={item.productImage} alt={item.productName} sizes="112px" />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.productSlug}`}
            className="font-display text-base font-medium text-espresso transition-colors hover:text-terra"
          >
            {item.productName}
          </Link>
          <p className="mt-1 font-body text-sm text-muted">Size {item.size}</p>
          <p className="mt-1 font-body text-sm text-espresso">
            {formatPaise(item.unitPricePaise)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <QuantityStepper
            quantity={item.quantity}
            onChange={(next) => updateQuantity(item.variantId, next)}
          />
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            className="font-body text-xs font-medium tracking-[0.08em] text-muted uppercase underline underline-offset-4 transition-colors hover:text-terra"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="shrink-0 font-body text-sm font-medium text-espresso">
        {formatPaise(item.unitPricePaise * item.quantity)}
      </p>
    </li>
  );
}
