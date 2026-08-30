import type { Metadata } from "next";
import {
  GSTIN,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  LEGAL_ENTITY_NAME,
  REGISTERED_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_WHATSAPP_URL,
} from "@/lib/legal";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Contact | Sundusk",
  description: "Questions about sizing, an order, or anything else — reach Sundusk here.",
};

const LINK = "text-espresso underline underline-offset-4 hover:text-terra";

// Verbatim copy from spec section 10A.
export default function ContactPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Contact
        </h1>
        <p className="mt-4 font-body text-sm leading-relaxed text-espresso/80">
          Questions about sizing, an order, or anything else — we answer all of them.
        </p>

        <dl className="mt-8 space-y-2 font-body text-sm">
          <div>
            <dt className="inline text-muted">Email: </dt>
            <dd className="inline">
              <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
                {SUPPORT_EMAIL}
              </a>
            </dd>
          </div>
          <div>
            <dt className="inline text-muted">WhatsApp: </dt>
            <dd className="inline">
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className={LINK}>
                {SUPPORT_PHONE_DISPLAY}
              </a>
            </dd>
          </div>
          <div>
            <dt className="inline text-muted">Phone: </dt>
            <dd className="inline">
              <a href={`tel:${SUPPORT_PHONE_TEL}`} className={LINK}>
                {SUPPORT_PHONE_DISPLAY}
              </a>
            </dd>
          </div>
          <div>
            <dt className="inline text-muted">Instagram: </dt>
            <dd className="inline">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={LINK}>
                {INSTAGRAM_HANDLE}
              </a>
            </dd>
          </div>
        </dl>

        <p className="mt-6 font-body text-sm text-espresso/80">
          We reply within 24 hours, Monday to Saturday.
        </p>

        <div className="mt-10 border-t border-line pt-8">
          <h2 className="font-body text-xs font-medium tracking-[0.14em] text-terra uppercase">
            Not sure about your size?
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-espresso/80">
            Message us before you order. We don&rsquo;t offer size exchanges, so we would rather
            help you get it right the first time.
          </p>
        </div>

        <p className="mt-10 font-body text-sm leading-relaxed text-muted">
          {LEGAL_ENTITY_NAME}
          <br />
          {REGISTERED_ADDRESS.line1}
          <br />
          {REGISTERED_ADDRESS.line2}
          <br />
          {REGISTERED_ADDRESS.city} {REGISTERED_ADDRESS.pincode}
          <br />
          GSTIN: {GSTIN}
        </p>
      </div>
    </Section>
  );
}
