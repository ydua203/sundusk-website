"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ADMIN_SETTABLE_TRANSITIONS, transitionRestocksVariants } from "@/lib/order-status";

export function AdminStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const options = ADMIN_SETTABLE_TRANSITIONS[currentStatus] ?? [];
  const [selected, setSelected] = useState(options[0] ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (options.length === 0) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setStatus("error");
      return;
    }

    router.refresh();
    setStatus("idle");
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line p-6">
      <h2 className="font-display text-lg font-semibold text-espresso">Update status</h2>
      <label htmlFor="admin-status" className="sr-only">
        New status
      </label>
      <select
        id="admin-status"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="mt-4 w-full border border-line bg-sand px-3 py-2 font-body text-sm text-espresso capitalize focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {transitionRestocksVariants(currentStatus, selected) && (
        <p className="mt-2 font-body text-xs text-muted">
          This will add every item back to stock and log it.
        </p>
      )}
      {error && <p className="mt-2 font-body text-xs text-terra">{error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 w-full border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        {status === "submitting" ? "Updating…" : "Update"}
      </button>
    </form>
  );
}
