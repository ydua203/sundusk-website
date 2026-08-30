"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/legal";
import { formatPaise } from "@/lib/money";

type OrderItem = { productName: string; size: string; quantity: number; unitPricePaise: number };

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15; // ~30s of polling before giving up on the spinner

/**
 * Spec section 7: "shows a 'confirming payment' state until the webhook
 * lands." The order is created 'pending' before payment and only becomes
 * 'paid' once the webhook processes it — this page polls a lightweight
 * status endpoint until that happens (or gives up gracefully rather than
 * spinning forever, per section 13's quality bar).
 */
export function OrderStatusView({
  orderNumber,
  initialStatus,
  items,
  subtotalPaise,
  shippingPaise,
  discountPaise,
  totalPaise,
  shippingCity,
  shippingState,
  courierName,
  trackingNumber,
}: {
  orderNumber: string;
  initialStatus: string;
  items: OrderItem[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  shippingCity: string;
  shippingState: string;
  /** Only set once the order has actually shipped — spec section 6, admin
   * ship flow (day 10). Optional because most callers of this view are
   * showing a pending/paid order that doesn't have this yet. */
  courierName?: string | null;
  trackingNumber?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pollsDone, setPollsDone] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (status !== "pending") return;
    if (pollsDone >= MAX_POLLS) {
      setGaveUp(true);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.status !== status) {
            setStatus(data.status);
            return;
          }
        }
      } catch {
        // Transient network error — just try again on the next tick.
      }
      setPollsDone((n) => n + 1);
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [status, pollsDone, orderNumber]);

  return (
    <div className="mx-auto max-w-xl">
      <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
        Order {orderNumber}
      </p>

      {status === "pending" && !gaveUp && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold text-espresso">
            Confirming your payment…
          </h1>
          <p className="mt-4 font-body text-sm text-espresso/80">
            This usually takes a few seconds. Don&rsquo;t close this page.
          </p>
        </>
      )}

      {status === "pending" && gaveUp && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold text-espresso">
            Still confirming
          </h1>
          <p className="mt-4 font-body text-sm text-espresso/80">
            This is taking longer than usual. We&rsquo;ll email you the moment it&rsquo;s
            confirmed — no need to keep this page open. If you&rsquo;re worried, WhatsApp us on{" "}
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-espresso underline underline-offset-4 hover:text-terra"
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>{" "}
            with your order number.
          </p>
        </>
      )}

      {status === "paid" && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold text-espresso">
            Thank you — payment confirmed
          </h1>
          <p className="mt-4 font-body text-sm text-espresso/80">
            A confirmation email is on its way. Dispatch within 1–2 working days, delivery in 2–4
            working days to metro cities, 4–7 elsewhere.
          </p>
        </>
      )}

      {status === "cancelled" && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold text-espresso">
            Order cancelled
          </h1>
          <p className="mt-4 font-body text-sm text-espresso/80">
            This order was cancelled and was not charged.
          </p>
        </>
      )}

      {(status === "shipped" || status === "delivered") && (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold text-espresso">
            {status === "shipped" ? "On its way" : "Delivered"}
          </h1>
          {courierName && trackingNumber ? (
            <p className="mt-4 font-body text-sm text-espresso/80">
              Shipped via <span className="font-medium text-espresso">{courierName}</span>,
              tracking number{" "}
              <span className="font-medium text-espresso">{trackingNumber}</span>.
            </p>
          ) : (
            <p className="mt-4 font-body text-sm text-espresso/80">
              We&rsquo;ll email and WhatsApp the courier and tracking number once it&rsquo;s
              assigned.
            </p>
          )}
        </>
      )}

      {status === "refunded" && (
        <h1 className="mt-3 font-display text-3xl font-semibold text-espresso">Refunded</h1>
      )}

      <div className="mt-10 border-t border-line pt-6">
        <ul>
          {items.map((item, i) => (
            <li
              key={i}
              className="flex justify-between gap-4 border-b border-line py-3 font-body text-sm first:pt-0 last:border-b-0"
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
        <dl className="mt-4 space-y-2 font-body text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="text-espresso">{formatPaise(subtotalPaise)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="text-espresso">{formatPaise(shippingPaise)}</dd>
          </div>
          {discountPaise > 0 && (
            <div className="flex justify-between">
              <dt className="text-terra">Promo discount</dt>
              <dd className="text-terra">−{formatPaise(discountPaise)}</dd>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <dt className="text-espresso">Total</dt>
            <dd className="text-espresso">{formatPaise(totalPaise)}</dd>
          </div>
        </dl>
        <p className="mt-3 font-body text-xs text-muted">
          Shipping to {shippingCity}, {shippingState}.
        </p>
      </div>

      <Link
        href="/shop"
        className="mt-10 inline-block border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
      >
        Continue shopping
      </Link>
    </div>
  );
}
