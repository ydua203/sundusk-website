import Link from "next/link";
import { Section } from "@/components/layout/section";

// App Router calls this automatically for any unmatched route or an
// explicit notFound() — no route-level wiring needed beyond this file
// existing at app/not-found.tsx.
export default function NotFound() {
  return (
    <Section tone="sand" className="text-center">
      <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-espresso">
        This page has faded out.
      </h1>
      <p className="mx-auto mt-4 max-w-md font-body text-base text-espresso/80">
        We couldn&rsquo;t find what you were looking for. It may have moved, or never existed.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
      >
        Shop the edit
      </Link>
    </Section>
  );
}
