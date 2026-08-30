import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import {
  GRIEVANCE_OFFICER_NAME,
  LEGAL_ENTITY_NAME,
  POLICY_LAST_UPDATED,
  REGISTERED_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Sundusk",
  description: "What Sundusk collects, why, who it's shared with, and your rights over it.",
};

const H2 = "font-body text-xs font-medium tracking-[0.14em] text-terra uppercase";
const P = "mt-2 font-body text-sm leading-relaxed text-espresso/80";

// Verbatim copy from spec section 10A.
export default function PrivacyPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 font-body text-xs text-muted">Last updated: {POLICY_LAST_UPDATED}</p>

        <p className={P}>
          {LEGAL_ENTITY_NAME}, trading as Sundusk, operates this website. This policy explains
          what we collect, why, and what you can do about it.
        </p>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className={H2}>What we collect</h2>
            <p className={P}>
              When you place an order: your name, email address, phone number, and delivery
              address.
            </p>
            <p className={P}>
              When you create an account: your name, email address, and password (stored
              encrypted — we cannot see it).
            </p>
            <p className={P}>
              Automatically: basic analytics such as pages viewed and approximate location,
              through Google Analytics.
            </p>
          </div>

          <div>
            <h2 className={H2}>What we do not collect</h2>
            <p className={P}>
              We never see or store your card number, CVV, UPI PIN, or bank credentials. Payments
              are processed entirely by Razorpay on their own systems.
            </p>
          </div>

          <div>
            <h2 className={H2}>Why we collect it</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5 font-body text-sm leading-relaxed text-espresso/80">
              <li>To process, pack, and deliver your order</li>
              <li>To send order confirmations and delivery updates</li>
              <li>To answer your questions and handle claims</li>
              <li>To meet our tax and accounting obligations</li>
              <li>To understand which pages people use, so we can improve the site</li>
            </ul>
          </div>

          <div>
            <h2 className={H2}>Who we share it with</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5 font-body text-sm leading-relaxed text-espresso/80">
              <li>Razorpay — to process your payment</li>
              <li>Our courier partner — your name, address, and phone, to deliver</li>
              <li>Resend — to send transactional email</li>
              <li>Supabase — our database provider, which stores this data</li>
              <li>Google Analytics — anonymised usage data</li>
              <li>Our accountant and the tax authorities, where the law requires it</li>
            </ul>
            <p className={P}>We do not sell your data. We do not share it with advertisers.</p>
          </div>

          <div>
            <h2 className={H2}>Marketing</h2>
            <p className={P}>
              We only send marketing email if you opt in. Every marketing email has an
              unsubscribe link. Order-related emails are not marketing and are sent for every
              order.
            </p>
          </div>

          <div>
            <h2 className={H2}>How long we keep it</h2>
            <p className={P}>
              Order and invoice records are kept for 8 years, as Indian tax law requires. Account
              data is kept until you ask us to delete it. Analytics data is kept for 14 months.
            </p>
          </div>

          <div>
            <h2 className={H2}>Your rights</h2>
            <p className={P}>
              You can ask us to show you the data we hold about you, correct anything that is
              wrong, or delete your account and personal data. We will act on your request within
              30 days.
            </p>
            <p className={P}>
              We cannot delete invoice records within the statutory retention period, even at your
              request.
            </p>
            <p className={P}>
              Write to{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-espresso underline underline-offset-4 hover:text-terra"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              to make a request.
            </p>
          </div>

          <div>
            <h2 className={H2}>Security</h2>
            <p className={P}>
              The site runs over HTTPS. Passwords are hashed. Database access is restricted. No
              system is perfectly secure, but we take this seriously and will tell you promptly
              if a breach affects your data.
            </p>
          </div>

          <div>
            <h2 className={H2}>Cookies</h2>
            <p className={P}>
              We use cookies to keep your cart and your login session working, and for analytics.
              You can block cookies in your browser, but the cart and login will stop working if
              you do.
            </p>
          </div>

          <div>
            <h2 className={H2}>Children</h2>
            <p className={P}>This site is not intended for anyone under 18.</p>
          </div>

          <div>
            <h2 className={H2}>Grievance officer</h2>
            <p className={P}>As required under Indian law:</p>
            <p className={P}>
              Name: {GRIEVANCE_OFFICER_NAME}
              <br />
              Email: {SUPPORT_EMAIL}
              <br />
              Phone: {SUPPORT_PHONE_DISPLAY}
              <br />
              Address: {REGISTERED_ADDRESS.line1}, {REGISTERED_ADDRESS.line2},{" "}
              {REGISTERED_ADDRESS.city} {REGISTERED_ADDRESS.pincode}
            </p>
            <p className={P}>
              We acknowledge complaints within 48 hours and resolve them within 30 days.
            </p>
          </div>

          <div>
            <h2 className={H2}>Changes</h2>
            <p className={P}>
              We will update the date at the top of this page when this policy changes.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
