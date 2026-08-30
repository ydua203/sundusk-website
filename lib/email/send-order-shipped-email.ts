import "server-only";

import { render } from "@react-email/components";
import { OrderShippedEmail } from "@/emails/order-shipped";
import { getOrderById } from "@/lib/orders";
import { getResendClient } from "./resend-client";

const FROM = process.env.EMAIL_FROM || "Sundusk <hello@sundusk.in>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "hellosundusk.in@gmail.com";

/**
 * Not called anywhere yet — day 10's admin "mark shipped" action
 * (POST /api/admin/orders/[id]/ship) is this function's trigger, and that
 * route doesn't exist until then. Built now, alongside the template,
 * because day 8's scope is explicitly "confirmation and shipped."
 */
export async function sendOrderShippedEmail(
  orderId: string,
  shipment: { courierName: string; trackingNumber: string; trackingUrl?: string },
) {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — skipping shipped email for order ${orderId}`);
    return;
  }

  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`sendOrderShippedEmail: order ${orderId} not found`);
  }

  const html = await render(
    OrderShippedEmail({
      orderNumber: order.orderNumber,
      shippingName: order.shippingName,
      courierName: shipment.courierName,
      trackingNumber: shipment.trackingNumber,
      trackingUrl: shipment.trackingUrl,
    }),
  );

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: REPLY_TO,
    subject: `Order shipped — ${order.orderNumber}`,
    html,
  });

  if (error) {
    throw new Error(`Resend rejected shipped email for ${order.orderNumber}: ${error.message}`);
  }
}
