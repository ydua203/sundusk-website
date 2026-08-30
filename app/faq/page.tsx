import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { formatPaise } from "@/lib/money";
import { SHIPPING_FLAT_PAISE } from "@/lib/shipping";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "FAQ | Sundusk",
  description: "Sizing, payment, shipping, and returns questions, answered.",
};

const LINK = "text-espresso underline underline-offset-4 hover:text-terra";

// Every answer here restates a fact that already exists elsewhere on the
// site (size guide, shipping, returns, checkout) rather than introducing
// anything new — an FAQ is the easiest page on a site to accidentally
// contradict a policy on, so nothing here should be checked against
// anything but those other pages.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What sizes do you carry?",
    a: (
      <>
        XS to XL, in real body measurements — see the{" "}
        <Link href="/size-guide" className={LINK}>
          size guide
        </Link>
        . Need something beyond XL? See{" "}
        <Link href="/custom-fit" className={LINK}>
          Custom Fit
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I exchange for a different size?",
    a: (
      <>
        No — we don&rsquo;t offer size exchanges. Please check the{" "}
        <Link href="/size-guide" className={LINK}>
          size guide
        </Link>{" "}
        before ordering, or message us on WhatsApp first if you&rsquo;re unsure. Full policy on{" "}
        <Link href="/returns" className={LINK}>
          Returns &amp; Exchanges
        </Link>
        .
      </>
    ),
  },
  {
    q: "What if my order arrives damaged or wrong?",
    a: (
      <>
        We replace it at no cost to you, shipping both ways — contact us within 48 hours of
        delivery with photos. Details on{" "}
        <Link href="/returns" className={LINK}>
          Returns &amp; Exchanges
        </Link>
        .
      </>
    ),
  },
  {
    q: "Do you offer Cash on Delivery?",
    a: "No. All orders are prepaid through Razorpay — UPI, cards, net banking, and wallets.",
  },
  {
    q: "How much is shipping?",
    a: `A flat ${formatPaise(SHIPPING_FLAT_PAISE)} on every order, shown at checkout before you pay.`,
  },
  {
    q: "How long does delivery take?",
    a: "Dispatch within 1–2 working days of payment, then 2–4 working days to metro cities or 4–7 to the rest of India.",
  },
  {
    q: "How do I track my order?",
    a: (
      <>
        We email and WhatsApp a tracking number once your order ships. You can also look it up
        any time on{" "}
        <Link href="/track-order" className={LINK}>
          Track Order
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I cancel my order?",
    a: (
      <>
        Yes, within 6 hours of placing it, as long as it hasn&rsquo;t been dispatched — email or
        WhatsApp us with your order number. Refunds are made in full, less the payment gateway
        fee. Details on{" "}
        <Link href="/returns" className={LINK}>
          Returns &amp; Exchanges
        </Link>
        .
      </>
    ),
  },
  {
    q: "Do I need an account to order?",
    a: "No — guest checkout is available. An account just gives you order history in one place.",
  },
  {
    q: "Are prices inclusive of tax?",
    a: "Yes. Every price shown is inclusive of GST — no surprises at checkout beyond shipping.",
  },
];

export default function FaqPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">FAQ</h1>

        <dl className="mt-10 divide-y divide-line border-t border-b border-line">
          {FAQS.map((item) => (
            <div key={item.q} className="py-6 first:pt-0 last:pb-0">
              <dt className="font-display text-lg font-semibold text-espresso">{item.q}</dt>
              <dd className="mt-2 font-body text-sm leading-relaxed text-espresso/80">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 font-body text-sm text-muted">
          Something else on your mind?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
            {SUPPORT_EMAIL}
          </a>{" "}
          ·{" "}
          <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className={LINK}>
            WhatsApp {SUPPORT_PHONE_DISPLAY}
          </a>
        </p>
      </div>
    </Section>
  );
}
