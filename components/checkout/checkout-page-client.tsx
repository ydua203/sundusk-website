"use client";

import Link from "next/link";
import Script from "next/script";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { Section } from "@/components/layout/section";
import { useCart } from "@/context/cart-context";

// Loaded only on this page, not globally in the root layout — no other
// page needs it, and it's Razorpay's script, not ours, so there's no
// reason to ship it on every route. `nonce` comes from the CSP nonce
// middleware.ts generates per request (see app/checkout/page.tsx, the
// Server Component that reads it) — without it, this script would be
// blocked by the site's own Content-Security-Policy.
function RazorpayScript({ nonce }: { nonce: string }) {
  return (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
      nonce={nonce}
    />
  );
}

export function CheckoutPageClient({ nonce }: { nonce: string }) {
  const { items, subtotalPaise, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <Section tone="sand">
        <div className="h-9 w-32 animate-pulse bg-line" />
      </Section>
    );
  }

  if (items.length === 0) {
    return (
      <Section tone="sand" className="text-center">
        <h1 className="font-display text-3xl font-semibold text-espresso">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-3 max-w-md font-body text-base text-espresso/80">
          Add something to your cart before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
        >
          Shop tops
        </Link>
      </Section>
    );
  }

  return (
    <Section tone="sand">
      <RazorpayScript nonce={nonce} />
      <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
        Checkout
      </h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-16">
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>
        <div className="lg:col-span-1">
          <CheckoutSummary items={items} subtotalPaise={subtotalPaise} />
        </div>
      </div>
    </Section>
  );
}
