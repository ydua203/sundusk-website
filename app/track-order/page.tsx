import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { TrackOrderForm } from "@/components/track-order/track-order-form";

export const metadata: Metadata = {
  title: "Track Order | Sundusk",
  description: "Look up your Sundusk order status with your order number and email.",
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Track Order
        </h1>
        <p className="mt-3 font-body text-sm text-muted">
          Enter your order number and the email you used at checkout.
        </p>
      </div>
      <div className="mt-10">
        <TrackOrderForm />
      </div>
    </Section>
  );
}
