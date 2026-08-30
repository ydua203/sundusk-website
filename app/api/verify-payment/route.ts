import crypto from "crypto";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

/**
 * POST /api/verify-payment — verifies the signature Razorpay Checkout
 * hands back to the browser after a successful payment
 * (razorpay_payment_id, razorpay_order_id, razorpay_signature).
 *
 * This is a UX accelerator, not the source of truth. The webhook
 * (POST /api/webhooks/razorpay) is what actually confirms payment for
 * this store (spec section 7: "never mark an order paid from the
 * client-side success callback... the webhook is what actually confirms
 * it") — because a client-side flow can be interrupted after payment
 * genuinely succeeds (tab closed, network drop) in a way an async
 * server-to-server webhook can't be. What this route buys you: when the
 * browser *does* stay around, the customer sees "paid" immediately
 * instead of waiting a couple of seconds for /order/[orderNumber]'s
 * polling loop to catch up. It calls the exact same `fulfillPaidOrder`
 * function the webhook does, so it's just as idempotent and
 * amount-checked — there's no second, weaker path to "paid" here.
 */
export async function POST(request: Request) {
  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error("RAZORPAY_KEY_ID/SECRET not set — cannot verify payment signature");
    return NextResponse.json({ error: "Payment verification not configured" }, { status: 500 });
  }

  // Razorpay's documented client-checkout formula:
  // HMAC-SHA256(order_id + "|" + payment_id, key_secret). Distinct from
  // the webhook's HMAC, which signs the raw request body with a
  // different secret (RAZORPAY_WEBHOOK_SECRET) entirely — don't conflate
  // the two.
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  const signatureBuffer = Buffer.from(razorpay_signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // The signature proves Razorpay itself vouches for this order_id +
  // payment_id pair, but the amount used to fulfil the order still comes
  // from Razorpay's own API, not from anything the client sent — same
  // "never trust a client-supplied amount" rule /api/checkout follows for
  // order creation (spec section 7).
  let capturedAmountPaise: number;
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured") {
      return NextResponse.json({ error: "Payment is not captured" }, { status: 400 });
    }
    capturedAmountPaise =
      typeof payment.amount === "string" ? parseInt(payment.amount, 10) : payment.amount;
  } catch (err) {
    console.error("Failed to fetch payment from Razorpay", razorpay_payment_id, err);
    return NextResponse.json({ error: "Could not verify payment with Razorpay" }, { status: 502 });
  }

  const result = await fulfillPaidOrder({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    capturedAmountPaise,
  });

  if (result.status === "unknown_order" || result.status === "amount_mismatch") {
    return NextResponse.json({ error: "Could not confirm this order" }, { status: 400 });
  }

  return NextResponse.json({ verified: true, orderNumber: result.orderNumber });
}
