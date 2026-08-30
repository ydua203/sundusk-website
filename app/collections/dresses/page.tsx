import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Dresses | Sundusk",
  description: "Dresses are coming to Sundusk soon.",
};

// Spec section 9: dresses shows a "coming soon" state — no product grid,
// no DB query. There are no dress products to fetch yet.
export default function DressesComingSoonPage() {
  return (
    <Section tone="sand" className="text-center">
      <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
        Dresses
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-espresso">
        Coming soon
      </h1>
      <p className="mx-auto mt-4 max-w-md font-body text-base text-espresso/80">
        We&rsquo;re starting with tops — dresses are next. Come back soon, or
        have a look at what&rsquo;s live now.
      </p>
      <Link
        href="/collections/tops"
        className="mt-8 inline-block border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
      >
        Shop tops
      </Link>
    </Section>
  );
}
