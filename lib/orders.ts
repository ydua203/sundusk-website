import "server-only";

import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { ORDER_STATUSES } from "@/lib/order-status";

/**
 * Full order + its items, by the human-readable order number ("SD1001").
 * Used by /order/[orderNumber] and by the email senders.
 */
export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

/**
 * Status only — backs the lightweight polling endpoint the order page uses
 * while waiting for the webhook to land. Deliberately doesn't return
 * anything else (name, address, items) so polling every couple of seconds
 * doesn't repeatedly ship PII to the client.
 */
export async function getOrderStatusByNumber(orderNumber: string) {
  const [row] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber));
  return row?.status ?? null;
}

export async function getOrderById(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

/** Order history for /account — newest first, no items (list view only). */
export async function getOrdersByCustomerId(customerId: string) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

/**
 * Admin order list (admin panel v2) — optional status filter and a
 * search across order number, email, and phone, all case-insensitive.
 * `status` is checked against ORDER_STATUSES rather than trusted as an
 * arbitrary string — not for injection safety (Drizzle parameterises
 * `eq` regardless), but so a mistyped/stale ?status= in a bookmarked URL
 * is silently ignored rather than producing a query that just happens to
 * match nothing.
 */
export async function getAdminOrders({
  status,
  q,
}: {
  status?: string;
  q?: string;
}) {
  const conditions = [];

  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    conditions.push(eq(orders.status, status));
  }

  const query = q?.trim();
  if (query) {
    const pattern = `%${query}%`;
    conditions.push(
      or(
        ilike(orders.orderNumber, pattern),
        ilike(orders.email, pattern),
        ilike(orders.phone, pattern),
      ),
    );
  }

  return db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));
}
