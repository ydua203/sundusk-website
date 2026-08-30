"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Field, inputClass } from "@/components/ui/field";
import { OrderStatusView } from "@/components/order/order-status-view";
import { trackOrderSchema, type TrackOrderValues } from "@/lib/validation/track-order";

type FieldErrors = Partial<Record<keyof TrackOrderValues, string>>;

const EMPTY_VALUES: Record<keyof TrackOrderValues, string> = { orderNumber: "", email: "" };

type OrderResult = {
  orderNumber: string;
  status: string;
  items: { productName: string; size: string; quantity: number; unitPricePaise: number }[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  shippingCity: string;
  shippingState: string;
  courierName: string | null;
  trackingNumber: string | null;
};

export function TrackOrderForm() {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);

  function handleChange(field: keyof TrackOrderValues) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setResult(null);

    const parsed = trackOrderSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof TrackOrderValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("idle");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (result) {
    return (
      <OrderStatusView
        orderNumber={result.orderNumber}
        initialStatus={result.status}
        items={result.items}
        subtotalPaise={result.subtotalPaise}
        shippingPaise={result.shippingPaise}
        discountPaise={result.discountPaise}
        totalPaise={result.totalPaise}
        shippingCity={result.shippingCity}
        shippingState={result.shippingState}
        courierName={result.courierName}
        trackingNumber={result.trackingNumber}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-md space-y-6">
      <Field id="orderNumber" label="Order number" error={errors.orderNumber}>
        <input
          id="orderNumber"
          type="text"
          placeholder="SD1001"
          autoCapitalize="characters"
          value={values.orderNumber}
          onChange={handleChange("orderNumber")}
          className={inputClass}
        />
      </Field>
      <Field id="email" label="Email used at checkout" error={errors.email}>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange("email")}
          className={inputClass}
        />
      </Field>

      {serverError && (
        <p className="border border-terra bg-cream p-3 font-body text-sm text-espresso">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        {status === "submitting" ? "Looking up…" : "Track order"}
      </button>
    </form>
  );
}
