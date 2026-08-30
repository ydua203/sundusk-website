"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Field, inputClass } from "@/components/ui/field";
import { useCart } from "@/context/cart-context";
import { INDIA_STATES } from "@/lib/india-states";
import { formatPaise } from "@/lib/money";
import { isValidPromoCode } from "@/lib/promo";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation/checkout";

type FieldErrors = Partial<Record<keyof CheckoutFormValues, string>>;

type OrderResult = {
  orderNumber: string;
  razorpayOrderId: string;
  amountPaise: number;
  discountPaise: number;
};

const EMPTY_VALUES: Record<keyof CheckoutFormValues, string> = {
  email: "",
  phone: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [promoCode, setPromoCode] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "awaiting-payment">(
    "idle",
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  // True once the Razorpay popup has been opened and dismissed (closed
  // without paying) at least once — shows a manual retry button, since the
  // order already exists and re-submitting the form would create a
  // duplicate pending order rather than reusing this one.
  const [paymentDismissed, setPaymentDismissed] = useState(false);

  const promoCodeLooksValid = promoCode.trim().length > 0 && isValidPromoCode(promoCode);

  function handleChange(field: keyof CheckoutFormValues) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  // Opens the Razorpay Checkout popup for an order that's already been
  // created server-side. Can be called again (the "Pay now" retry button)
  // without hitting /api/checkout a second time.
  function openRazorpayCheckout(order: OrderResult) {
    if (typeof window === "undefined" || !window.Razorpay) {
      setServerError(
        "Payment could not start — the payment script hasn't loaded. Refresh and try again.",
      );
      return;
    }
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      setServerError("Payment is not configured yet.");
      return;
    }

    setPaymentDismissed(false);
    const razorpay = new window.Razorpay({
      key: keyId,
      amount: order.amountPaise,
      currency: "INR",
      name: "Sundusk",
      description: `Order ${order.orderNumber}`,
      order_id: order.razorpayOrderId,
      prefill: { name: values.name, email: values.email, contact: values.phone },
      theme: { color: "#3C1800" },
      // A UI hint only — never proof of payment on its own (spec section
      // 7). /api/verify-payment re-verifies the signature server-side
      // before it does anything, and shares its actual fulfilment logic
      // with the webhook (see lib/fulfill-order.ts) — this call is purely
      // a UX accelerator (skip the order page's polling wait when the
      // browser sticks around), not a second, weaker way to mark an order
      // paid. It's awaited with a timeout so a slow/hanging request can
      // never block the redirect; if it doesn't finish in time, or the
      // tab is closed before it does, the webhook still lands and the
      // order page's polling still catches it.
      handler: async (response) => {
        try {
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
            signal: AbortSignal.timeout(5000),
          });
        } catch {
          // Ignored — the webhook is the real source of truth, this was
          // only ever a best-effort head start.
        }
        clearCart();
        router.push(`/order/${order.orderNumber}`);
      },
      modal: {
        ondismiss: () => setPaymentDismissed(true),
      },
    });
    razorpay.open();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = checkoutFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CheckoutFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (items.length === 0) {
      setServerError("Your cart is empty.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          promoCode: promoCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && Array.isArray(data.shortages)) {
          const names = data.shortages
            .map(
              (s: { variantId: string }) =>
                items.find((i) => i.variantId === s.variantId)?.productName ?? "an item",
            )
            .join(", ");
          setServerError(
            `Sorry, we ran out of stock while you were checking out: ${names}. Please update your cart.`,
          );
        } else {
          setServerError(data.error ?? "Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }

      const order: OrderResult = {
        orderNumber: data.orderNumber,
        razorpayOrderId: data.razorpayOrderId,
        amountPaise: data.amountPaise,
        discountPaise: data.discountPaise ?? 0,
      };
      setOrderResult(order);
      setStatus("awaiting-payment");
      openRazorpayCheckout(order);
    } catch {
      setServerError("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "awaiting-payment" && orderResult) {
    return (
      <div className="border border-line p-6">
        <p className="font-body text-xs font-medium tracking-[0.14em] text-terra uppercase">
          Order created
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-espresso">
          Order {orderResult.orderNumber}
        </h2>
        <p className="mt-3 font-body text-sm text-espresso/80">
          Total due: {formatPaise(orderResult.amountPaise)}
          {orderResult.discountPaise > 0 &&
            ` (${formatPaise(orderResult.discountPaise)} promo discount applied)`}
          .
        </p>
        {paymentDismissed ? (
          <>
            <p className="mt-3 font-body text-sm text-muted">
              Payment window closed. Your order is saved — you can pick up where you left off.
            </p>
            <button
              type="button"
              onClick={() => openRazorpayCheckout(orderResult)}
              className="mt-4 border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
            >
              Pay now
            </button>
          </>
        ) : (
          <p className="mt-3 font-body text-sm text-muted">
            Complete payment in the window that opened. If nothing opened, your browser may have
            blocked the pop-up.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold text-espresso">Contact</legend>
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
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold text-espresso">
          Shipping address
        </legend>
        <Field id="name" label="Full name" error={errors.name}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={handleChange("name")}
            className={inputClass}
          />
        </Field>
        <Field id="line1" label="Address line 1" error={errors.line1}>
          <input
            id="line1"
            type="text"
            autoComplete="address-line1"
            value={values.line1}
            onChange={handleChange("line1")}
            className={inputClass}
          />
        </Field>
        <Field id="line2" label="Address line 2 (optional)" error={errors.line2}>
          <input
            id="line2"
            type="text"
            autoComplete="address-line2"
            value={values.line2}
            onChange={handleChange("line2")}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="city" label="City" error={errors.city}>
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              value={values.city}
              onChange={handleChange("city")}
              className={inputClass}
            />
          </Field>
          <Field id="state" label="State" error={errors.state}>
            <select
              id="state"
              autoComplete="address-level1"
              value={values.state}
              onChange={handleChange("state")}
              className={inputClass}
            >
              <option value="" disabled>
                Select a state
              </option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="pincode" label="Pincode" error={errors.pincode}>
          <input
            id="pincode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={values.pincode}
            onChange={handleChange("pincode")}
            className={inputClass}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold text-espresso">Promo code</legend>
        <Field id="promoCode" label="Promo code (optional)">
          <input
            id="promoCode"
            type="text"
            autoComplete="off"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className={inputClass}
          />
        </Field>
        {promoCodeLooksValid && (
          <p className="font-body text-xs text-terra">₹150 off will be applied.</p>
        )}
      </fieldset>

      {serverError && (
        <p className="border border-terra bg-cream p-3 font-body text-sm text-espresso">
          {serverError}
        </p>
      )}

      <div>
        <p className="mb-4 font-body text-xs text-muted">
          Prepaid only. No returns or size exchanges. Damaged items are replaced. Cancellation
          available within 6 hours.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:w-auto sm:min-w-64"
        >
          {status === "submitting" ? "Placing order…" : "Place order"}
        </button>
      </div>
    </form>
  );
}
