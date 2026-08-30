import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import {
  GSTIN,
  LEGAL_ENTITY_NAME,
  POLICY_LAST_UPDATED,
  REGISTERED_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service | Sundusk",
  description: "The terms that apply when you place an order with Sundusk.",
};

const H2 = "font-body text-xs font-medium tracking-[0.14em] text-terra uppercase";
const P = "mt-2 font-body text-sm leading-relaxed text-espresso/80";

// Verbatim copy from spec section 10A. [DATE] and the proprietorship name
// stay as visible placeholders (via lib/legal.ts) until they're confirmed
// — the spec is explicit that bracketed TODOs must ship visible, not
// silently guessed at.
export default function TermsPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 font-body text-xs text-muted">Last updated: {POLICY_LAST_UPDATED}</p>

        <p className={P}>
          This website is operated by {LEGAL_ENTITY_NAME}, a sole proprietorship trading as
          Sundusk (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By placing an order you
          agree to these terms.
        </p>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className={H2}>Business details</h2>
            <p className={P}>
              {LEGAL_ENTITY_NAME}
              <br />
              {REGISTERED_ADDRESS.line1}, {REGISTERED_ADDRESS.line2}, {REGISTERED_ADDRESS.city}{" "}
              {REGISTERED_ADDRESS.pincode}
              <br />
              GSTIN: {GSTIN}
              <br />
              Email: {SUPPORT_EMAIL}
              <br />
              Phone: {SUPPORT_PHONE_DISPLAY}
            </p>
          </div>

          <div>
            <h2 className={H2}>Products and pricing</h2>
            <p className={P}>
              All prices are in Indian Rupees and are inclusive of GST. Shipping is charged
              separately and shown at checkout.
            </p>
            <p className={P}>
              We may change prices at any time. The price that applies to your order is the price
              displayed when you place it.
            </p>
            <p className={P}>
              Product photographs are taken as accurately as we can manage, but colour may vary
              slightly between screens and fabric. Slight variation in measurement is normal in
              stitched garments.
            </p>
            <p className={P}>
              Sizes range from XS to XL. Measurements are published on our size guide.
            </p>
          </div>

          <div>
            <h2 className={H2}>Orders</h2>
            <p className={P}>
              Placing an order is an offer to buy. We confirm your order by email once payment is
              received. We may decline or cancel an order — for example if an item is out of
              stock, if we cannot deliver to your address, or if we suspect fraud. If we cancel,
              we refund you in full.
            </p>
          </div>

          <div>
            <h2 className={H2}>Payment</h2>
            <p className={P}>
              All orders are prepaid through Razorpay. We do not offer Cash on Delivery. We do not
              store your card details; payment information is handled entirely by Razorpay.
            </p>
          </div>

          <div>
            <h2 className={H2}>Delivery</h2>
            <p className={P}>
              We deliver across India. Delivery timelines are estimates and are not guaranteed.
              Risk passes to you on delivery.
            </p>
            <p className={P}>
              You are responsible for giving a complete and accurate delivery address and a
              reachable phone number. Orders that fail delivery because of an incorrect address or
              an unreachable recipient are not refundable.
            </p>
          </div>

          <div>
            <h2 className={H2}>Returns</h2>
            <p className={P}>
              Our returns policy forms part of these terms. We do not accept returns or size
              exchanges. Damaged or defective items are replaced. See our Returns &amp; Exchanges
              page for the full policy.
            </p>
          </div>

          <div>
            <h2 className={H2}>Your account</h2>
            <p className={P}>
              If you create an account, you are responsible for keeping your password secure and
              for activity under your account. Tell us immediately if you suspect unauthorised
              access.
            </p>
          </div>

          <div>
            <h2 className={H2}>Acceptable use</h2>
            <p className={P}>
              You may not use this site for unlawful purposes, attempt to gain unauthorised
              access to it, or copy our photographs, product descriptions, or brand assets for
              commercial use without our written permission.
            </p>
          </div>

          <div>
            <h2 className={H2}>Intellectual property</h2>
            <p className={P}>
              All content on this site — photographs, text, designs, the Sundusk name and logo —
              belongs to us and may not be reproduced without permission.
            </p>
          </div>

          <div>
            <h2 className={H2}>Liability</h2>
            <p className={P}>
              To the extent permitted by law, our liability for any order is limited to the
              amount you paid for that order. We are not liable for indirect or consequential
              loss.
            </p>
            <p className={P}>
              Nothing in these terms limits your rights under the Consumer Protection Act, 2019.
            </p>
          </div>

          <div>
            <h2 className={H2}>Changes</h2>
            <p className={P}>
              We may update these terms. The version published here at the time you order is the
              version that applies.
            </p>
          </div>

          <div>
            <h2 className={H2}>Governing law</h2>
            <p className={P}>
              These terms are governed by the laws of India. Disputes are subject to the
              exclusive jurisdiction of the courts of Delhi.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
