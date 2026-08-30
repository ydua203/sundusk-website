import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderShippedEmail } from "@/lib/email/send-order-shipped-email";
import { canShipOrder } from "@/lib/order-status";
import { getAdminUser } from "@/lib/require-admin";

const bodySchema = z.object({
  courierName: z.string().trim().min(1, "Enter a courier name").max(200),
  trackingNumber: z.string().trim().min(1, "Enter a tracking number").max(200),
  trackingUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

/**
 * The only route that ever sets status "shipped" — requires order status
 * "paid" going in (spec section 6: pending -> paid -> shipped ->
 * delivered, no skipping), and sends the shipped email (day 8's template,
 * unused until now — this is its trigger).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  if (!canShipOrder(order.status)) {
    return NextResponse.json(
      { error: `Cannot ship an order in "${order.status}" status — it must be "paid" first` },
      { status: 409 },
    );
  }

  await db
    .update(orders)
    .set({
      status: "shipped",
      courierName: parsed.data.courierName,
      trackingNumber: parsed.data.trackingNumber,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, id));

  // After the DB write commits, never before — same reasoning as every
  // other email send in this app (spec section 11).
  try {
    await sendOrderShippedEmail(order.id, {
      courierName: parsed.data.courierName,
      trackingNumber: parsed.data.trackingNumber,
      trackingUrl: parsed.data.trackingUrl,
    });
  } catch (err) {
    console.error("Failed to send shipped email", order.id, order.orderNumber, err);
  }

  return NextResponse.json({ ok: true });
}
