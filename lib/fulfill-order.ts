import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, productVariants, stockMovements } from "@/db/schema";
import { sendOrderConfirmedEmail } from "@/lib/email/send-order-confirmed-email";

export type FulfillPaidOrderResult =
  | { status: "fulfilled"; orderNumber: string }
  | { status: "already_paid"; orderNumber: string }
  | { status: "unknown_order" }
  | { status: "amount_mismatch"; orderNumber: string };

/**
 * The single place an order actually gets marked paid, stock decremented,
 * and the confirmation email queued (spec section 6: stock decrements
 * here, and only here). Two callers, both server-to-server-verified
 * before they ever reach this function:
 *
 * 1. POST /api/webhooks/razorpay — Razorpay's own async `payment.captured`
 *    delivery. The authoritative path; works even if the customer's
 *    browser closes the instant payment succeeds.
 * 2. POST /api/verify-payment — the client checkout callback, after its
 *    signature has been verified server-side. A UX accelerator only: it
 *    lets the order page skip straight to "paid" instead of polling for
 *    a few seconds, but it is not trusted on its own merit — it calls
 *    this exact same function, so it's just as idempotent and
 *    amount-checked as the webhook. If the browser never gets here (tab
 *    closed, network drop), the webhook still lands and does the job.
 *
 * Both callers hitting this for the same order — expected, not a bug —
 * is handled by the `already_paid` no-op below.
 */
export async function fulfillPaidOrder({
  razorpayOrderId,
  razorpayPaymentId,
  capturedAmountPaise,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  capturedAmountPaise: number;
}): Promise<FulfillPaidOrderResult> {
  const [order] = await db.select().from(orders).where(eq(orders.razorpayOrderId, razorpayOrderId));
  if (!order) {
    console.error("fulfillPaidOrder: unknown razorpay_order_id", razorpayOrderId);
    return { status: "unknown_order" };
  }

  if (order.status === "paid") {
    return { status: "already_paid", orderNumber: order.orderNumber };
  }

  if (capturedAmountPaise !== order.totalPaise) {
    console.error("fulfillPaidOrder: amount mismatch — NOT marking paid", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      expectedPaise: order.totalPaise,
      capturedPaise: capturedAmountPaise,
    });
    return { status: "amount_mismatch", orderNumber: order.orderNumber };
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: "paid", razorpayPaymentId, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, order.id));

    // Floored at 0 rather than allowed to go negative — the payment has
    // already been captured at this point, so there's no "reject" option
    // left; a floor of 0 just keeps the number sane for admin to see
    // rather than silently overselling *and* showing a negative count.
    for (const item of items) {
      await tx
        .update(productVariants)
        .set({ stock: sql`greatest(${productVariants.stock} - ${item.quantity}, 0)` })
        .where(eq(productVariants.id, item.variantId));
    }
  });

  // Audit trail (admin panel v2), deliberately OUTSIDE the transaction
  // above and best-effort, same reasoning as the email send below: this
  // is telemetry, not the payment path. Learned the hard way while
  // testing this exact change — an earlier version put this insert
  // inside the transaction above, and confirmed live that with the
  // stock_movements migration not yet applied, that made the *entire
  // payment confirmation* fail and roll back, including the order's
  // status='paid' update and the real stock decrement — every real
  // payment would have silently stayed "pending" forever until the
  // migration ran. A missing audit-log table must never be able to take
  // down order fulfillment; moved here so it can't.
  for (const item of items) {
    try {
      await db.insert(stockMovements).values({
        variantId: item.variantId,
        delta: -item.quantity,
        reason: "order_paid",
        adminEmail: null,
        note: `Order ${order.orderNumber} paid`,
      });
    } catch (err) {
      console.error("Failed to log stock movement", order.id, order.orderNumber, item.variantId, err);
    }
  }

  // After the transaction commits, never inside it (spec section 11) — a
  // failed email must never roll back a paid order.
  try {
    await sendOrderConfirmedEmail(order.id);
  } catch (err) {
    console.error("Failed to send order-confirmed email", order.id, order.orderNumber, err);
  }

  return { status: "fulfilled", orderNumber: order.orderNumber };
}
