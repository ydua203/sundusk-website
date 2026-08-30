import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StockTable } from "@/components/admin/stock-table";
import { Section } from "@/components/layout/section";
import { getStockOverview } from "@/lib/stock";
import { getAdminUser } from "@/lib/require-admin";

export const metadata: Metadata = {
  title: "Admin — Stock | Sundusk",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const DEFAULT_THRESHOLD = 5;

export default async function AdminStockPage({ searchParams }: PageProps<"/admin/stock">) {
  const admin = await getAdminUser();
  if (!admin) redirect("/account/login");

  const params = await searchParams;
  const lowParam = typeof params.low === "string" ? Number(params.low) : NaN;
  const threshold = Number.isInteger(lowParam) && lowParam >= 0 ? lowParam : DEFAULT_THRESHOLD;

  const rows = await getStockOverview();
  const lowCount = rows.filter((r) => r.stock <= threshold).length;

  return (
    <Section tone="sand">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">Stock</h1>
          <p className="mt-1 font-body text-sm text-muted">
            {rows.length} variant{rows.length === 1 ? "" : "s"} · {lowCount} at or below the low-stock line
          </p>
        </div>
        <Link
          href="/admin"
          className="font-body text-sm text-espresso underline underline-offset-4 hover:text-terra"
        >
          ← Orders
        </Link>
      </div>

      <form action="/admin/stock" method="GET" className="mt-6 flex items-center gap-2">
        <label htmlFor="low-threshold" className="font-body text-sm text-muted">
          Flag stock at or below
        </label>
        <input
          id="low-threshold"
          type="number"
          name="low"
          min={0}
          defaultValue={threshold}
          className="w-20 border border-line bg-sand px-2 py-1.5 font-body text-sm text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra"
        />
        <button
          type="submit"
          className="border-0 bg-espresso px-4 py-2 font-body text-sm font-medium tracking-[0.08em] text-cream uppercase transition-colors hover:bg-terra"
        >
          Set
        </button>
      </form>

      <div className="mt-10">
        <StockTable rows={rows} threshold={threshold} />
      </div>
    </Section>
  );
}
