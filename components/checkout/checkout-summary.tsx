import type { CartItem } from "@/context/cart-context";
import { formatPaise } from "@/lib/money";
import { SHIPPING_FLAT_PAISE } from "@/lib/shipping";

export function CheckoutSummary({
  items,
  subtotalPaise,
}: {
  items: CartItem[];
  subtotalPaise: number;
}) {
  const totalPaise = subtotalPaise + SHIPPING_FLAT_PAISE;

  return (
    <div className="border border-line p-6">
      <h2 className="font-display text-xl font-semibold text-espresso">
        Order summary
      </h2>

      <ul className="mt-4 divide-y divide-line font-body text-sm">
        {items.map((item) => (
          <li
            key={item.variantId}
            className="flex justify-between gap-4 py-3 first:pt-0"
          >
            <span className="text-espresso">
              {item.productName}{" "}
              <span className="text-muted">
                — {item.size} × {item.quantity}
              </span>
            </span>
            <span className="shrink-0 text-espresso">
              {formatPaise(item.unitPricePaise * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-line pt-4 font-body text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="text-espresso">{formatPaise(subtotalPaise)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="text-espresso">{formatPaise(SHIPPING_FLAT_PAISE)}</dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt className="text-espresso">Total</dt>
          <dd className="text-espresso">{formatPaise(totalPaise)}</dd>
        </div>
      </dl>
      <p className="mt-3 font-body text-xs text-muted">
        Price inclusive of all taxes.
      </p>
    </div>
  );
}
