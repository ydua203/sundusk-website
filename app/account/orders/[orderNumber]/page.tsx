import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrderStatusView } from "@/components/order/order-status-view";
import { Section } from "@/components/layout/section";
import { getOrderByNumber } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/account/orders/[orderNumber]">): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} | Sundusk`,
    robots: { index: false, follow: false },
  };
}

export default async function AccountOrderPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const order = await getOrderByNumber(orderNumber);
  // Ownership check, not just existence — a guest order (customer_id
  // null) or someone else's order both 404 here rather than leak order
  // details to whoever happens to be signed in.
  if (!order || order.customerId !== user.id) notFound();

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
