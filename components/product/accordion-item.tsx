import type { ReactNode } from "react";

// Native <details>/<summary> — toggle, keyboard support, and screen-reader
// semantics come from the browser, so this stays a Server Component
// (spec section 13: Server Components by default, 'use client' only where
// interactivity actually demands it — this doesn't).
export function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group py-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between font-body text-sm font-medium tracking-[0.05em] text-espresso uppercase">
        {title}
        <span
          aria-hidden="true"
          className="font-display text-lg text-muted transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-3 font-body text-sm leading-relaxed text-espresso/80">
        {children}
      </div>
    </details>
  );
}
