import Link from "next/link";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/legal";

// The first three lines are verbatim copy from spec section 10A — required
// directly beneath the size selector on every product page, not buried in
// a policy page, because there are no size exchanges (spec section 1, hard
// rule 3). The last line (custom sizing) is not in the original spec —
// added alongside the /custom-fit feature. It's kept factual and narrow
// ("beyond XL, on request") rather than any "we fit every body" framing,
// per the updated hard rule 1 in CLAUDE.md.
export function SizeNotices({ productSlug }: { productSlug: string }) {
  return (
    <div className="mt-3 space-y-1.5 font-body text-sm">
      <Link
        href="/size-guide"
        className="inline-block text-espresso underline underline-offset-4 transition-colors hover:text-terra"
      >
        Find your size →
      </Link>
      <p className="text-muted">
        No size exchanges — please check measurements before ordering.
      </p>
      <p className="text-muted">
        Unsure? WhatsApp us on{" "}
        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="text-espresso underline underline-offset-4 hover:text-terra"
        >
          {SUPPORT_PHONE_DISPLAY}
        </a>
        .
      </p>
      <p className="text-muted">
        Need a size beyond XL? Custom sizing is available on request — ₹100 extra.{" "}
        <Link
          href={`/custom-fit?product=${productSlug}`}
          className="text-espresso underline underline-offset-4 hover:text-terra"
        >
          Request custom sizing →
        </Link>
      </p>
    </div>
  );
}
