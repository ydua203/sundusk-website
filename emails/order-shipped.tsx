import { Heading, Text } from "@react-email/components";
import { COLORS, EmailLayout, bodyFont, headingFont } from "./components/email-layout";

export type OrderShippedEmailProps = {
  orderNumber: string;
  shippingName: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
};

// Courier name, tracking number, tracking link if the courier has one —
// spec section 11, template 2. Not wired to a trigger yet — day 10's admin
// "mark shipped" action calls this; that route doesn't exist until then.
export function OrderShippedEmail({
  orderNumber,
  shippingName,
  courierName,
  trackingNumber,
  trackingUrl,
}: OrderShippedEmailProps) {
  const firstName = shippingName.split(" ")[0];

  return (
    <EmailLayout previewText={`Order ${orderNumber} has shipped`}>
      <Heading
        style={{
          fontFamily: headingFont,
          color: COLORS.espresso,
          fontSize: "20px",
          margin: "0 0 8px",
        }}
      >
        On its way, {firstName}
      </Heading>
      <Text
        style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "14px", margin: "0 0 16px" }}
      >
        Order <strong>{orderNumber}</strong> has shipped with {courierName}.
      </Text>
      <Text
        style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "14px", margin: "0 0 4px" }}
      >
        Tracking number: <strong>{trackingNumber}</strong>
      </Text>
      {trackingUrl && (
        <Text style={{ fontFamily: bodyFont, fontSize: "14px", margin: "8px 0 0" }}>
          <a href={trackingUrl} style={{ color: COLORS.terra }}>
            Track your order →
          </a>
        </Text>
      )}
    </EmailLayout>
  );
}
