import { eq, inArray } from "drizzle-orm";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, productVariants, products } from "@/db/schema";
import { lineGstPaise } from "@/lib/gst";
import { discountForSubtotal, PROMO_CODE } from "@/lib/promo";
import { SHIPPING_FLAT_PAISE } from "@/lib/shipping";
import { createClient } from "@/lib/supabase/server";
import { checkoutRequestSchema } from "@/lib/validation/checkout";

/**
 * POST /api/checkout — spec section 7.
 *
 * 1. Validate input.
 * 2. Recalculate every price from the database — never trust a client
 *    amount, the single most common payment vulnerability in e-commerce.
 * 3. Check stock for every variant; 409 with the affected items if short.
 *    (This is a fast-fail UX check only, not the final word — the webhook
 *    on day 7 is what atomically re-checks and decrements stock at the
 *    moment of payment, closing the race this check can't.)
 * 4. Compute GST (per item, spec section 8), apply a promo code discount
 *    if a valid one was sent (not in the original spec — lib/promo.ts),
 *    and the order total.
 * 5. Create the `orders` + `order_items` rows (status 'pending').
 * 6. Create the matching Razorpay order and store its id.
 *
 * Steps 5 and 6 are two different systems of record — if step 6 fails
 * after step 5 succeeded, the DB rows are rolled back rather than left
 * behind as an order that can never be paid.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email, phone, items, promoCode, ...shipping } = parsed.data;

  // Not in the original spec — day 9 addition. If the request carries a
  // valid Supabase session, the order gets linked to that customer so it
  // shows up in /account's order history. Guest checkout (no session)
  // still works exactly as before — customerId just stays null, same as
  // spec section 5 describes.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const variantIds = items.map((i) => i.variantId);
  const rows = await db
    .select({
      variantId: productVariants.id,
      stock: productVariants.stock,
      size: productVariants.size,
      sku: productVariants.sku,
      productName: products.name,
      pricePaise: products.pricePaise,
      isActive: products.isActive,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(inArray(productVariants.id, variantIds));

  const byVariantId = new Map(rows.map((r) => [r.variantId, r]));

  const shortages: { variantId: string; requested: number; available: number }[] = [];
  for (const item of items) {
    const row = byVariantId.get(item.variantId);
    if (!row || !row.isActive) {
      shortages.push({ variantId: item.variantId, requested: item.quantity, available: 0 });
      continue;
    }
    if (row.stock < item.quantity) {
      shortages.push({
        variantId: item.variantId,
        requested: item.quantity,
        available: row.stock,
      });
    }
  }
  if (shortages.length > 0) {
    return NextResponse.json(
      { error: "Some items in your cart are no longer available", shortages },
      { status: 409 },
    );
  }

  // Prices, names, sizes and SKUs all come from the database row looked up
  // above by variantId — nothing here is taken from the request body.
  const lineItems = items.map((item) => {
    const row = byVariantId.get(item.variantId)!;
    return {
      variantId: row.variantId,
      productName: row.productName,
      size: row.size,
      sku: row.sku,
      unitPricePaise: row.pricePaise,
      quantity: item.quantity,
    };
  });

  const subtotalPaise = lineItems.reduce((sum, li) => sum + li.unitPricePaise * li.quantity, 0);
  const gstPaise = lineItems.reduce(
    (sum, li) => sum + lineGstPaise(li.unitPricePaise, li.quantity),
    0,
  );
  const shippingPaise = SHIPPING_FLAT_PAISE;
  // Not in the original spec — see lib/promo.ts. The discount reduces the
  // amount payable; it doesn't reprice the goods, so gst_paise above is
  // computed from the original item prices, not the discounted total.
  // TODO: confirm with the CA whether a promo discount should reduce the
  // taxable value for invoicing — same open question as lib/gst.ts's rates.
  const discountPaise = discountForSubtotal(subtotalPaise, promoCode);
  const totalPaise = subtotalPaise + shippingPaise - discountPaise;

  const order = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(orders)
      .values({
        customerId: user?.id ?? null,
        email,
        phone,
        shippingName: shipping.name,
        shippingLine1: shipping.line1,
        shippingLine2: shipping.line2,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPincode: shipping.pincode,
        subtotalPaise,
        shippingPaise,
        discountPaise,
        // Store the canonical code, not whatever casing/whitespace the
        // customer typed.
        promoCode: discountPaise > 0 ? PROMO_CODE : null,
        gstPaise,
        totalPaise,
      })
      .returning();

    await tx.insert(orderItems).values(
      lineItems.map((li) => ({
        orderId: inserted.id,
        variantId: li.variantId,
        productName: li.productName,
        size: li.size,
        sku: li.sku,
        unitPricePaise: li.unitPricePaise,
        quantity: li.quantity,
      })),
    );

    return inserted;
  });

  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)",
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await db
      .update(orders)
      .set({ razorpayOrderId: rzpOrder.id, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, order.id));

    return NextResponse.json({
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amountPaise: totalPaise,
      discountPaise,
    });
  } catch (err) {
    console.error("Razorpay order creation failed, rolling back order", order.id, err);
    // Cascades to order_items via the FK's onDelete: "cascade" (db/schema.ts).
    await db.delete(orders).where(eq(orders.id, order.id));
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
