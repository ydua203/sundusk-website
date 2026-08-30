"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Field, inputClass } from "@/components/ui/field";
import {
  customizationRequestSchema,
  type CustomizationRequestValues,
} from "@/lib/validation/customization";

type ProductOption = { id: string; slug: string; name: string };

type FormState = {
  productId: string;
  name: string;
  email: string;
  phone: string;
  bustIn: string;
  waistIn: string;
  hipsIn: string;
  notes: string;
};

type FieldErrors = Partial<Record<keyof CustomizationRequestValues, string>>;

export function CustomizationForm({
  products,
  preselectedSlug,
}: {
  products: ProductOption[];
  preselectedSlug?: string;
}) {
  const preselected = products.find((p) => p.slug === preselectedSlug);
  const [values, setValues] = useState<FormState>({
    productId: preselected?.id ?? "",
    name: "",
    email: "",
    phone: "",
    bustIn: "",
    waistIn: "",
    hipsIn: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange<K extends keyof FormState>(field: K) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const payload = {
      productId: values.productId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      bustIn: values.bustIn === "" ? undefined : Number(values.bustIn),
      waistIn: values.waistIn === "" ? undefined : Number(values.waistIn),
      hipsIn: values.hipsIn === "" ? undefined : Number(values.hipsIn),
      notes: values.notes,
    };

    const parsed = customizationRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CustomizationRequestValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setStatus("submitting");
    try {
      const res = await fetch("/api/customization-requests", {
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
      setStatus("success");
    } catch {
      setServerError("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-line p-6">
        <p className="font-body text-xs font-medium tracking-[0.14em] text-terra uppercase">
          Request received
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-espresso">
          We&rsquo;ll be in touch
        </h2>
        <p className="mt-3 font-body text-sm text-espresso/80">
          We reply within 24 hours, Monday to Saturday, by email or WhatsApp — whichever you gave
          us. No payment has been taken; we&rsquo;ll confirm the fit and price with you first.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field id="productId" label="Which top?" error={errors.productId}>
        <select
          id="productId"
          value={values.productId}
          onChange={handleChange("productId")}
          className={inputClass}
        >
          <option value="" disabled>
            Select a top
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field id="name" label="Name" error={errors.name}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange("name")}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="email" label="Email" error={errors.email}>
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
        <Field id="phone" label="Phone" error={errors.phone}>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={10}
            value={values.phone}
            onChange={handleChange("phone")}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="font-body text-xs text-muted">
        Measurements in inches — leave blank if you&rsquo;re not sure, we can help you figure them
        out.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="bustIn" label="Bust" error={errors.bustIn}>
          <input
            id="bustIn"
            type="text"
            inputMode="numeric"
            value={values.bustIn}
            onChange={handleChange("bustIn")}
            className={inputClass}
          />
        </Field>
        <Field id="waistIn" label="Waist" error={errors.waistIn}>
          <input
            id="waistIn"
            type="text"
            inputMode="numeric"
            value={values.waistIn}
            onChange={handleChange("waistIn")}
            className={inputClass}
          />
        </Field>
        <Field id="hipsIn" label="Hips" error={errors.hipsIn}>
          <input
            id="hipsIn"
            type="text"
            inputMode="numeric"
            value={values.hipsIn}
            onChange={handleChange("hipsIn")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="notes" label="Tell us what you need" error={errors.notes}>
        <textarea
          id="notes"
          rows={4}
          value={values.notes}
          onChange={handleChange("notes")}
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
        className="w-full border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:w-auto sm:min-w-64"
      >
        {status === "submitting" ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
