import Link from "next/link";
import { formatPaise } from "@/lib/money";

export function CartSummary({
  subtotalPaise,
  itemCount,
}: {
  subtotalPaise: number;
  itemCount: number;
}) {
  return (
    <div className="border border-line p-6">
      <h2 className="font-display text-xl font-semibold text-espresso">
        Order summary
      </h2>
      <dl className="mt-4 space-y-2 font-body text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">
            Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
          </dt>
          <dd className="text-espresso">{formatPaise(subtotalPaise)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="text-muted">Calculated at checkout</dd>
        </div>
      </dl>
      <p className="mt-4 font-body text-xs text-muted">
        Price inclusive of all taxes.
      </p>
      <Link
        href="/checkout"
        className="mt-6 block w-full border-0 bg-espresso px-6 py-3 text-center font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
      >
        Checkout
      </Link>
    </div>
  );
}
