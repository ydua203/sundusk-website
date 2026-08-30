import type { ReactNode } from "react";

/**
 * Horizontal max-width + gutter, used inside every Section. Padding starts
 * tight for 375px (spec section 1: mobile first, 85%+ of traffic is phones)
 * and opens up at wider breakpoints.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 sm:px-10 ${className}`}>
      {children}
    </div>
  );
}
