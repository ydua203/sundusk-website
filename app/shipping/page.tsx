import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { formatPaise } from "@/lib/money";
import { SHIPPING_FLAT_PAISE } from "@/lib/shipping";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Shipping & Delivery | Sundusk",
  description:
    "Dispatch times, delivery estimates, and shipping charges for Sundusk orders across India.",
};

const H2 = "font-body text-xs font-medium tracking-[0.14em] text-terra uppercase";
const P = "mt-2 font-body text-sm leading-relaxed text-espresso/80";

// Verbatim copy from spec section 10A, "Render these verbatim." The flat
// rate below isn't rendered as a literal "[AMOUNT]" bracket, unlike the
// [DATE]-style placeholders on /terms and /privacy — checkout already
// charges a concrete number (lib/shipping.ts's SHIPPING_FLAT_PAISE) for
// real orders, so showing customers a broken "[AMOUNT]" here would just
// be wrong, not cautious. The TODO instead lives where it actually
// matters: next to the constant that drives both this page and checkout.
export default function ShippingPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Shipping &amp; Delivery
        </h1>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className={H2}>Dispatch</h2>
            <p className={P}>Orders are dispatched within 1–2 working days of payment.</p>
          </div>

          <div>
            <h2 className={H2}>Delivery</h2>
            <p className={P}>
              2–4 working days to metro cities.
              <br />
              4–7 working days to the rest of India.
              <br />
              We deliver across India.
            </p>
          </div>

          <div>
            <h2 className={H2}>Shipping charges</h2>
            <p className={P}>
              A flat shipping charge of {formatPaise(SHIPPING_FLAT_PAISE)} applies to every
              order. The exact amount is shown at checkout before you pay — there are no charges
              added afterwards.
            </p>
          </div>

          <div>
            <h2 className={H2}>Tracking</h2>
            <p className={P}>
              Once your order is dispatched, we send a tracking number by email and WhatsApp. If
              you haven&rsquo;t received it within 3 working days of ordering, write to us and
              we&rsquo;ll resend it. You can also look your order up any time on{" "}
              <Link
                href="/track-order"
                className="text-espresso underline underline-offset-4 hover:text-terra"
              >
                Track Order
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className={H2}>Payment</h2>
            <p className={P}>
              We accept UPI, credit cards, debit cards, net banking, and wallets through Razorpay.
            </p>
            <p className={P}>We do not offer Cash on Delivery. All orders are prepaid.</p>
          </div>

          <div>
            <h2 className={H2}>Delays</h2>
            <p className={P}>
              Festival weeks, heavy rain, and courier disruptions happen. If your order is running
              late, we will contact you before you have to ask.
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
