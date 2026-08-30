"use client";

import Link from "next/link";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Section } from "@/components/layout/section";
import { useCart } from "@/context/cart-context";

// Entirely client-rendered — the cart lives in localStorage, there's
// nothing for the server to fetch (spec section 2: React context +
// localStorage, no server-side cart).
export default function CartPage() {
  const { items, subtotalPaise, itemCount, isHydrated } = useCart();

  // Avoid flashing "empty cart" for a real cart before localStorage has
  // been read (see context/cart-context.tsx's isHydrated comment).
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
          Nothing here yet — have a look at what&rsquo;s in the shop.
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
      <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
        Your cart
      </h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-16">
        <ul className="lg:col-span-2">
          {items.map((item) => (
            <CartLineItem key={item.variantId} item={item} />
          ))}
        </ul>
        <div className="lg:col-span-1">
          <CartSummary subtotalPaise={subtotalPaise} itemCount={itemCount} />
        </div>
      </div>
    </Section>
  );
}
