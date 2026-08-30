import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Returns & Exchanges | Sundusk",
  description:
    "No returns or size exchanges — damaged or defective items are replaced at no cost. Read the full policy before you order.",
};

const H2 = "font-body text-xs font-medium tracking-[0.14em] text-terra uppercase";
const P = "mt-2 font-body text-sm leading-relaxed text-espresso/80";

// Verbatim copy from spec section 10A. This is deliberately narrower than
// most returns policies, and the page says so up front rather than
// burying it — spec hard rule 3 (never mention free returns) and the
// damaged-item replacement clause below (required per the legal caveat in
// section 10A: a blanket no-returns policy has limits under the Consumer
// Protection Act 2019 where goods are defective or not as described) both
// depend on this page staying exactly as written.
export default function ReturnsPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Returns &amp; Exchanges
        </h1>
        <p className={P}>
          Please read this before you order. Our policy is narrower than most, and we would
          rather you know that up front.
        </p>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className={H2}>We do not accept returns</h2>
            <p className={P}>
              We do not accept returns, and we do not offer refunds for change of mind, or
              because a size did not fit.
            </p>
          </div>

          <div>
            <h2 className={H2}>We do not offer size exchanges</h2>
            <p className={P}>
              Please use the size guide before ordering. Every measurement we have is published
              there.
            </p>
            <p className={P}>
              If you are unsure which size to take, contact us before you order. Call or WhatsApp{" "}
              {SUPPORT_PHONE_DISPLAY}, or email {SUPPORT_EMAIL}, and we will help you choose. We
              would much rather spend two minutes on this than have you receive something that
              doesn&rsquo;t fit.
            </p>
          </div>

          <div>
            <h2 className={H2}>Damaged or defective items — we will replace these</h2>
            <p className={P}>
              If your piece arrives damaged, defective, or is not the item you ordered, we will
              replace it at no cost to you. We pay shipping both ways.
            </p>
            <p className="mt-3 font-body text-sm text-espresso/80">To raise a claim:</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 font-body text-sm leading-relaxed text-espresso/80">
              <li>Contact us within 48 hours of delivery</li>
              <li>
                By WhatsApp on {SUPPORT_PHONE_DISPLAY}, or by email to {SUPPORT_EMAIL}
              </li>
              <li>Quote your order number (SD####)</li>
              <li>Send clear photos of the item, the damage, and the outer packaging</li>
              <li>Do not remove tags or wash the item</li>
            </ul>
            <p className={P}>
              We respond within 2 working days. Once approved, your replacement is dispatched
              within 1–2 working days.
            </p>
            <p className={P}>
              Claims raised after 48 hours of delivery, or without photographs, cannot be
              processed.
            </p>
          </div>

          <div>
            <h2 className={H2}>Cancellations</h2>
            <p className={P}>
              You can cancel your order within 6 hours of placing it, provided it has not already
              been dispatched.
            </p>
            <p className={P}>Email or WhatsApp us with your order number to cancel.</p>
            <p className={P}>
              Cancellation refunds are made in full, less the payment gateway fee charged by our
              payment processor, which is not recoverable by us.
            </p>
            <p className={P}>
              After 6 hours, or once the order has been dispatched, orders cannot be cancelled.
            </p>
          </div>

          <div>
            <h2 className={H2}>Refund timeline</h2>
            <p className={P}>
              Approved refunds are returned to your original payment method within 1–7 working
              days. Once we process it, the remaining time depends on your bank.
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-line pt-6 font-body text-sm text-muted">
          Questions:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-espresso underline underline-offset-4 hover:text-terra"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          ·{" "}
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="text-espresso underline underline-offset-4 hover:text-terra"
          >
            WhatsApp {SUPPORT_PHONE_DISPLAY}
          </a>
        </p>
      </div>
    </Section>
  );
}
