"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, inputClass } from "@/components/ui/field";

export function AdminShipForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courierName, trackingNumber, trackingUrl }),
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
      <h2 className="font-display text-lg font-semibold text-espresso">Mark shipped</h2>
      <div className="mt-4 space-y-4">
        <Field id="courierName" label="Courier name">
          <input
            id="courierName"
            type="text"
            required
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="trackingNumber" label="Tracking number">
          <input
            id="trackingNumber"
            type="text"
            required
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="trackingUrl" label="Tracking URL (optional)">
          <input
            id="trackingUrl"
            type="url"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      {error && <p className="mt-2 font-body text-xs text-terra">{error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 w-full border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        {status === "submitting" ? "Saving…" : "Mark as shipped"}
      </button>
    </form>
  );
}
