import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Section } from "@/components/layout/section";
import { formatPaise } from "@/lib/money";
import { getOrdersByCustomerId } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My account | Sundusk",
  robots: { index: false, follow: false },
};

// Live order history — never statically cached (same reasoning as
// /shop and every other DB-backed page in this app).
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware.ts already redirects unauthenticated visitors away from
  // /account — this is defense in depth, and the page needs `user` to
  // fetch orders regardless.
  if (!user) redirect("/account/login");

  const orderList = await getOrdersByCustomerId(user.id);

  return (
    <Section tone="sand">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          My account
        </h1>
        <SignOutButton />
      </div>
      <p className="mt-2 font-body text-sm text-muted">{user.email}</p>

      <h2 className="mt-10 font-display text-xl font-semibold text-espresso">Order history</h2>
      {orderList.length === 0 ? (
        <p className="mt-4 font-body text-sm text-muted">
          No orders yet.{" "}
          <Link
            href="/shop"
            className="text-espresso underline underline-offset-4 hover:text-terra"
          >
            Start shopping →
          </Link>
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-t border-b border-line">
          {orderList.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-terra"
              >
                <div>
                  <p className="font-body text-sm font-medium text-espresso">
                    {order.orderNumber}
                  </p>
                  <p className="font-body text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {order.status}
                  </p>
                </div>
                <p className="font-body text-sm text-espresso">{formatPaise(order.totalPaise)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
