import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Section } from "@/components/layout/section";
import { formatPaise } from "@/lib/money";
import { ORDER_STATUSES } from "@/lib/order-status";
import { getAdminOrders } from "@/lib/orders";
import { getAdminUser } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "Admin — Orders | Sundusk",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["all", ...ORDER_STATUSES] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Still at /admin — moves to /admin/orders once the dashboard (phase D)
// takes this URL over. Building search/filter here now rather than
// waiting avoids doing this page twice.
export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin">) {
  const admin = await getAdminUser();
  if (!admin) redirect("/account/login");

  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const activeFilter = statusParam && STATUS_FILTERS.includes(statusParam as never)
    ? statusParam
    : "all";

  const allOrders = await getAdminOrders({
    status: activeFilter === "all" ? undefined : activeFilter,
    q,
  });

  return (
    <Section tone="sand">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">Orders</h1>
        <div className="flex items-center gap-5">
          <Link
            href="/admin/stock"
            className="font-body text-sm text-espresso underline underline-offset-4 hover:text-terra"
          >
            Stock →
          </Link>
          <a
            href="/api/admin/orders/export"
            className="border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Status filter — plain links, not client state, so the filtered
          view is bookmarkable/shareable and needs no JS to work. */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin" : `/admin?status=${s}`}
            className={`px-3 py-1.5 font-body text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
              activeFilter === s
                ? "bg-espresso text-cream"
                : "border border-line text-muted hover:border-espresso hover:text-espresso"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Search — plain GET form, server-filtered, no client JS. Preserves
          the current status filter as a hidden field so search + filter
          compose instead of one resetting the other. */}
      <form action="/admin" method="GET" className="mt-4 flex max-w-sm gap-2">
        {activeFilter !== "all" && (
          <input type="hidden" name="status" value={activeFilter} />
        )}
        <label htmlFor="admin-order-search" className="sr-only">
          Search by order number, email, or phone
        </label>
        <input
          id="admin-order-search"
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Order number, email, or phone"
          className="w-full border border-line bg-sand px-3 py-2 font-body text-sm text-espresso placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra"
        />
        <button
          type="submit"
          className="shrink-0 border-0 bg-espresso px-4 py-2 font-body text-sm font-medium tracking-[0.08em] text-cream uppercase transition-colors hover:bg-terra"
        >
          Search
        </button>
      </form>
      {q && (
        <p className="mt-2 font-body text-xs text-muted">
          {allOrders.length} result{allOrders.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;.{" "}
          <Link href={activeFilter === "all" ? "/admin" : `/admin?status=${activeFilter}`} className="underline underline-offset-4 hover:text-terra">
            Clear
          </Link>
        </p>
      )}

      {allOrders.length === 0 ? (
        <p className="mt-10 font-body text-sm text-muted">No orders match.</p>
      ) : (
        <>
          {/* Mobile — stacked cards, no horizontal scroll at any width
              (admin panel v2 audit: the old table forced sideways
              scrolling on a phone to see Total/Status). */}
          <div className="mt-10 divide-y divide-line border-y border-line sm:hidden">
            {allOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block py-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-body text-sm font-medium text-espresso underline-offset-4">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 font-body text-sm text-muted">
                  <span>{order.shippingName}</span>
                  <span className="text-espresso">{formatPaise(order.totalPaise)}</span>
                </div>
                <div className="mt-0.5 font-body text-xs text-muted">
                  {formatDate(order.createdAt)}
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop — real table. */}
          <div className="mt-10 hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse font-body text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium tracking-[0.08em] text-muted uppercase">
                  <th className="py-3 pr-4">Order</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-espresso underline underline-offset-4 hover:text-terra"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted">{formatDate(order.createdAt)}</td>
                    <td className="py-3 pr-4">{order.shippingName}</td>
                    <td className="py-3 pr-4">{formatPaise(order.totalPaise)}</td>
                    <td className="py-3 pr-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Section>
  );
}
