import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { webhookEvents } from "@/db/schema";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

// Must read the raw body for signature verification — parsing it first
// breaks the HMAC (spec section 7).
export const runtime = "nodejs";

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  error_reason?: string;
  error_description?: string;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set — cannot verify incoming webhooks");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: {
    id?: string;
    event?: string;
    payload?: { payment?: { entity?: RazorpayPaymentEntity } };
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = body.event ?? "unknown";
  const paymentEntity = body.payload?.payment?.entity;

  // Prefer Razorpay's own event id if present; fall back to a composite of
  // event type + payment id, which is stable across retries of the same
  // delivery even if Razorpay's payload shape doesn't include a top-level
  // id in every account/webhook version.
  const razorpayEventId =
    body.id ?? `${eventType}:${paymentEntity?.id ?? crypto.randomUUID()}`;

  // Atomic dedupe: INSERT ... ON CONFLICT DO NOTHING, check what came back
  // — avoids a check-then-insert race between two near-simultaneous
  // deliveries of the same event.
  const [inserted] = await db
    .insert(webhookEvents)
    .values({ razorpayEventId, eventType, payload: body })
    .onConflictDoNothing({ target: webhookEvents.razorpayEventId })
    .returning({ id: webhookEvents.id });

  if (!inserted) {
    // Duplicate delivery — already recorded (and presumably already
    // processed, or being processed). Spec section 7: return 200
    // immediately, don't reprocess.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (eventType === "payment.captured") {
      await handlePaymentCaptured(paymentEntity);
    } else if (eventType === "payment.failed") {
      console.warn("Razorpay payment.failed", {
        orderId: paymentEntity?.order_id,
        paymentId: paymentEntity?.id,
        reason: paymentEntity?.error_reason,
        description: paymentEntity?.error_description,
      });
      // Status stays 'pending' — spec section 7 step 5. The customer can
      // retry payment against the same Razorpay order from /checkout.
    } else {
      console.log("Unhandled Razorpay webhook event type:", eventType);
    }

    await db
      .update(webhookEvents)
      .set({ processedAt: new Date().toISOString() })
      .where(eq(webhookEvents.id, inserted.id));
  } catch (err) {
    // Logged, not thrown further — spec section 7 step 6: always return
    // 200 for events received, even ones that failed to process. A
    // non-200 makes Razorpay retry, which would just fail the same way
    // again and amplify whatever the underlying bug is. The event is
    // already recorded in webhook_events (with processed_at left null)
    // for manual investigation.
    console.error("Error processing Razorpay webhook", eventType, err);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentCaptured(paymentEntity: RazorpayPaymentEntity | undefined) {
  const razorpayOrderId = paymentEntity?.order_id;
  const razorpayPaymentId = paymentEntity?.id;
  const capturedAmountPaise = paymentEntity?.amount;

  if (!razorpayOrderId || !razorpayPaymentId || capturedAmountPaise === undefined) {
    console.error("payment.captured event missing order_id/payment id/amount", paymentEntity);
    return;
  }

  // Shared with POST /api/verify-payment — see lib/fulfill-order.ts for
  // why there's exactly one code path for "mark this order paid."
  await fulfillPaidOrder({ razorpayOrderId, razorpayPaymentId, capturedAmountPaise });
}
