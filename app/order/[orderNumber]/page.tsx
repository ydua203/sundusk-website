import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderStatusView } from "@/components/order/order-status-view";
import { Section } from "@/components/layout/section";
import { getOrderByNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/order/[orderNumber]">): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} | Sundusk`,
    // Not indexed, and deliberately not linked from anywhere crawlable —
    // order numbers are sequential and this page has no auth check. See
    // docs/DAY-7-NOTES.md for why, and what the real fix is.
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params }: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <Section tone="sand">
      <OrderStatusView
        orderNumber={order.orderNumber}
        initialStatus={order.status}
        items={order.items.map((i) => ({
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
          unitPricePaise: i.unitPricePaise,
        }))}
        subtotalPaise={order.subtotalPaise}
        shippingPaise={order.shippingPaise}
        discountPaise={order.discountPaise}
        totalPaise={order.totalPaise}
        shippingCity={order.shippingCity}
        shippingState={order.shippingState}
        courierName={order.courierName}
        trackingNumber={order.trackingNumber}
      />
    </Section>
  );
}
