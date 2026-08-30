import type { ElementType, ReactNode } from "react";
import { Container } from "./container";

type SectionTone = "sand" | "cream";

const TONE_CLASS: Record<SectionTone, string> = {
  sand: "bg-sand",
  cream: "bg-cream",
};

/**
 * Vertical rhythm primitive. Pass `tone` to alternate sand -> sand -> cream
 * -> sand down the page (spec section 3) — generous vertical padding is,
 * per the spec, "the cheapest luxury signal available," so this is where
 * that whitespace lives rather than being repeated ad hoc per page.
 *
 * `noContainer` opts out of the max-width gutter for sections that need to
 * bleed full-width (e.g. an edge-to-edge image).
 */
export function Section({
  children,
  tone = "sand",
  as: Tag = "section",
  className = "",
  noContainer = false,
}: {
  children: ReactNode;
  tone?: SectionTone;
  as?: ElementType;
  className?: string;
  noContainer?: boolean;
}) {
  return (
    <Tag className={`${TONE_CLASS[tone]} py-16 sm:py-24 ${className}`}>
      {noContainer ? children : <Container>{children}</Container>}
    </Tag>
  );
}
