"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StockRow } from "@/lib/stock";

export function StockTable({ rows, threshold }: { rows: StockRow[]; threshold: number }) {
  const router = useRouter();
  // Only variants the admin has actually typed a different number into —
  // not a full copy of every row, so "any pending changes?" is just
  // "is this object non-empty" and the save payload is naturally small.
  const [edited, setEdited] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const changeCount = Object.keys(edited).length;

  function handleChange(variantId: string, original: number, raw: string) {
    const value = raw === "" ? original : Math.max(0, Math.trunc(Number(raw)));
    setEdited((prev) => {
      const next = { ...prev };
      if (value === original || Number.isNaN(value)) {
        delete next[variantId];
      } else {
        next[variantId] = value;
      }
      return next;
    });
  }

  async function handleSave() {
    setStatus("saving");
    setError(null);

    const changes = Object.entries(edited).map(([variantId, newStock]) => ({ variantId, newStock }));

    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setEdited({});
      setStatus("idle");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  // Grouped only for the visual product-name break in the list — the sort
  // order itself (lowest stock first, across the whole store) never
  // changes, this just avoids repeating a product's name on every row
  // when its sizes happen to sit next to each other after that sort.
  const withGroupBreaks = useMemo(() => {
    let lastProductId: string | null = null;
    return rows.map((row) => {
      const showProductName = row.productId !== lastProductId;
      lastProductId = row.productId;
      return { ...row, showProductName };
    });
  }, [rows]);

  return (
    <div>
      <div className="divide-y divide-line border-y border-line">
        {withGroupBreaks.map((row) => {
          const displayed = edited[row.variantId] ?? row.stock;
          const low = displayed <= threshold;
          return (
            <div
              key={row.variantId}
              className={`flex items-center justify-between gap-4 py-3 ${low ? "bg-cream" : ""}`}
            >
              <div className="min-w-0">
                {row.showProductName && (
                  <p className="font-body text-sm font-medium text-espresso">
                    {row.productName}{" "}
                    <span className="font-normal text-muted">
                      · {row.productTotal} total
                    </span>
                  </p>
                )}
                <p className="font-body text-xs text-muted">
                  {row.size} · {row.sku}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {low && (
                  <span className="font-body text-xs font-medium tracking-[0.06em] text-terra uppercase">
                    Low
                  </span>
                )}
                <label htmlFor={`stock-${row.variantId}`} className="sr-only">
                  Stock for {row.productName} {row.size}
                </label>
                <input
                  id={`stock-${row.variantId}`}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  defaultValue={row.stock}
                  onChange={(e) => handleChange(row.variantId, row.stock, e.target.value)}
                  className={`w-20 border px-2 py-1.5 text-right font-body text-sm text-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra ${
                    edited[row.variantId] !== undefined ? "border-terra bg-sand" : "border-line bg-sand"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky save bar — only appears once something's actually
          changed, so the page stays quiet otherwise. */}
      {changeCount > 0 && (
        <div className="sticky bottom-0 mt-0 flex items-center justify-between gap-4 border-t border-line bg-espresso px-4 py-3 sm:px-6">
          <p className="font-body text-sm text-cream">
            {changeCount} change{changeCount === 1 ? "" : "s"} pending
          </p>
          <div className="flex items-center gap-3">
            {error && <p className="font-body text-xs text-terra">{error}</p>}
            <button
              type="button"
              onClick={() => setEdited({})}
              disabled={status === "saving"}
              className="font-body text-sm text-cream underline underline-offset-4 hover:text-terra disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={status === "saving"}
              className="border-0 bg-cream px-5 py-2 font-body text-sm font-medium tracking-[0.1em] text-espresso uppercase transition-colors hover:bg-terra hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "saving" ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
