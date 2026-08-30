import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminShipForm } from "@/components/admin/ship-form";
import { AdminStatusForm } from "@/components/admin/status-form";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Section } from "@/components/layout/section";
import { formatPaise } from "@/lib/money";
import { getOrderById } from "@/lib/orders";
import { getAdminUser } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/orders/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Admin — Order ${id} | Sundusk`, robots: { index: false, follow: false } };
}

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const admin = await getAdminUser();
  if (!admin) redirect("/account/login");

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <Section tone="sand">
      <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">Order</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          {order.orderNumber}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-16">
        <div className="space-y-10 lg:col-span-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-espresso">Items</h2>
            <ul className="mt-4 divide-y divide-line border-t border-b border-line">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 py-3 font-body text-sm first:pt-0"
                >
                  <span>
                    {item.productName} — {item.size} × {item.quantity}{" "}
                    <span className="text-muted">({item.sku})</span>
                  </span>
                  <span className="shrink-0">
                    {formatPaise(item.unitPricePaise * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 font-body text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatPaise(order.subtotalPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>{formatPaise(order.shippingPaise)}</dd>
              </div>
              {order.discountPaise > 0 && (
                <div className="flex justify-between">
                  <dt className="text-terra">Discount</dt>
                  <dd className="text-terra">−{formatPaise(order.discountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <dt>Total</dt>
                <dd>{formatPaise(order.totalPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">GST (for invoicing)</dt>
                <dd className="text-muted">{formatPaise(order.gstPaise)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-espresso">
              Customer &amp; shipping
            </h2>
            <dl className="mt-4 space-y-1 font-body text-sm">
              <div>
                <dt className="inline text-muted">Name: </dt>
                <dd className="inline">{order.shippingName}</dd>
              </div>
              <div>
                <dt className="inline text-muted">Email: </dt>
                <dd className="inline">{order.email}</dd>
              </div>
              <div>
                <dt className="inline text-muted">Phone: </dt>
                <dd className="inline">{order.phone}</dd>
              </div>
              <div>
                <dt className="inline text-muted">Address: </dt>
                <dd className="inline">
                  {order.shippingLine1}
                  {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}, {order.shippingCity},{" "}
                  {order.shippingState} {order.shippingPincode}
                </dd>
              </div>
            </dl>
          </div>

          {order.courierName && (
            <div>
              <h2 className="font-display text-xl font-semibold text-espresso">Shipment</h2>
              <p className="mt-4 font-body text-sm">
                {order.courierName} — {order.trackingNumber}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <AdminStatusForm orderId={order.id} currentStatus={order.status} />
          {order.status === "paid" && <AdminShipForm orderId={order.id} />}
        </div>
      </div>
    </Section>
  );
}
