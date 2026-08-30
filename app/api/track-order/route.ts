import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import { trackOrderSchema } from "@/lib/validation/track-order";

/**
 * Guest order lookup — the real fix for the gap noted in docs/DAY-7-NOTES.md:
 * /order/[orderNumber] has no auth check and order numbers are sequential,
 * so it was never meant to be a general "look anyone's order up" surface.
 * This route requires the order's own email to match before returning
 * anything, and returns the same generic error whether the order number
 * doesn't exist or the email doesn't match it — telling those two cases
 * apart would let someone brute-force which order numbers are real.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = trackOrderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid order number and email address." },
      { status: 400 },
    );
  }

  const order = await getOrderByNumber(parsed.data.orderNumber);

  if (!order || order.email.toLowerCase() !== parsed.data.email) {
    return NextResponse.json(
      { error: "We couldn't find an order matching that number and email." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
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
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    courierName: order.courierName,
    trackingNumber: order.trackingNumber,
  });
}
