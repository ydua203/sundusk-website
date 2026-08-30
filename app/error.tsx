"use client";

import { useEffect } from "react";
import { Section } from "@/components/layout/section";

// Root error boundary — catches render-time errors anywhere below it,
// including a failed DB query in /shop or /collections/tops. Nests inside
// the root layout (unlike global-error.tsx), so header/footer still show.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section tone="sand" className="text-center">
      <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
        Error
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-espresso">
        Something went wrong
      </h1>
      <p className="mx-auto mt-4 max-w-md font-body text-base text-espresso/80">
        That&rsquo;s on us, not you. Try again, or reach us on WhatsApp if it
        keeps happening.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra"
      >
        Try again
      </button>
    </Section>
  );
}
