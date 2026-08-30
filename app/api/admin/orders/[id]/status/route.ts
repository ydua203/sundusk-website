import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orderItems, orders, productVariants, stockMovements } from "@/db/schema";
import { isValidAdminStatusTransition, transitionRestocksVariants } from "@/lib/order-status";
import { getAdminUser } from "@/lib/require-admin";

// The union here is intentionally narrower than the full status column —
// "paid" and "shipped" aren't reachable through this endpoint at all (see
// lib/order-status.ts), so there's no case where a request could even ask
// for them.
const bodySchema = z.object({
  status: z.enum(["cancelled", "refunded", "delivered"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // middleware.ts already gates /api/admin/* — this is defense in depth,
  // not the only check.
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (!isValidAdminStatusTransition(order.status, parsed.data.status)) {
    return NextResponse.json(
      { error: `Cannot move an order from "${order.status}" to "${parsed.data.status}"` },
      { status: 409 },
    );
  }

  const restocks = transitionRestocksVariants(order.status, parsed.data.status);
  const items = restocks
    ? await db.select().from(orderItems).where(eq(orderItems.orderId, id))
    : [];

  // The status write + the actual restock share one transaction — an
  // admin clicking "refund" needs both to happen together, or neither.
  // The audit-log insert does NOT share it; see the long comment in
  // lib/fulfill-order.ts for why, verified live there first: a missing
  // stock_movements table must never be able to block the real mutation
  // (the refund + restock itself), only the logging of it.
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: parsed.data.status, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id));

    for (const item of items) {
      await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
        .where(eq(productVariants.id, item.variantId));
    }
  });

  for (const item of items) {
    try {
      await db.insert(stockMovements).values({
        variantId: item.variantId,
        delta: item.quantity,
        reason: "order_cancelled",
        adminEmail: admin.email ?? null,
        note: `Refund on order ${order.orderNumber}`,
      });
    } catch (err) {
      console.error("Failed to log stock movement", order.id, order.orderNumber, item.variantId, err);
    }
  }

  return NextResponse.json({ ok: true, status: parsed.data.status, restocked: restocks });
}
