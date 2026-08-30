import "server-only";

import { render } from "@react-email/components";
import { OrderConfirmedEmail } from "@/emails/order-confirmed";
import { getOrderById } from "@/lib/orders";
import { getResendClient } from "./resend-client";

const FROM = process.env.EMAIL_FROM || "Sundusk <hello@sundusk.in>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "hellosundusk.in@gmail.com";

/**
 * Called after the webhook's payment.captured transaction commits — never
 * from inside it (spec section 11: a failed email must never roll back a
 * paid order). The caller is expected to wrap this in try/catch; this
 * function doesn't swallow errors itself so the caller can decide how to
 * log them with the right context (which order, which webhook event).
 */
export async function sendOrderConfirmedEmail(orderId: string) {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `RESEND_API_KEY not set — skipping order-confirmed email for order ${orderId}`,
    );
    return;
  }

  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`sendOrderConfirmedEmail: order ${orderId} not found`);
  }

  const html = await render(
    OrderConfirmedEmail({
      orderNumber: order.orderNumber,
      shippingName: order.shippingName,
      items: order.items.map((i) => ({
        productName: i.productName,
        size: i.size,
        quantity: i.quantity,
        unitPricePaise: i.unitPricePaise,
      })),
      subtotalPaise: order.subtotalPaise,
      shippingPaise: order.shippingPaise,
      discountPaise: order.discountPaise,
      totalPaise: order.totalPaise,
    }),
  );

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.email,
    replyTo: REPLY_TO,
    subject: `Order confirmed — ${order.orderNumber}`,
    html,
  });

  if (error) {
    throw new Error(`Resend rejected order-confirmed email for ${order.orderNumber}: ${error.message}`);
  }
}
