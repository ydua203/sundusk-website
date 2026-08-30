import { Column, Heading, Hr, Row, Text } from "@react-email/components";
import { COLORS, EmailLayout, bodyFont, headingFont } from "./components/email-layout";

export type OrderConfirmedEmailProps = {
  orderNumber: string;
  shippingName: string;
  items: { productName: string; size: string; quantity: number; unitPricePaise: number }[];
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const formatPaise = (paise: number) => inr.format(paise / 100);

// Order number, items with sizes, total, delivery estimate, support
// contact — spec section 11, template 1.
export function OrderConfirmedEmail({
  orderNumber,
  shippingName,
  items,
  subtotalPaise,
  shippingPaise,
  discountPaise,
  totalPaise,
}: OrderConfirmedEmailProps) {
  const firstName = shippingName.split(" ")[0];

  return (
    <EmailLayout previewText={`Order ${orderNumber} confirmed — thank you!`}>
      <Heading
        style={{
          fontFamily: headingFont,
          color: COLORS.espresso,
          fontSize: "20px",
          margin: "0 0 8px",
        }}
      >
        Thank you, {firstName}
      </Heading>
      <Text
        style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "14px", margin: "0 0 24px" }}
      >
        Your order <strong>{orderNumber}</strong> is confirmed. Here&rsquo;s what&rsquo;s on its
        way.
      </Text>

      {items.map((item, i) => (
        <Row key={i} style={{ marginBottom: "8px" }}>
          <Column>
            <Text style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "14px", margin: 0 }}>
              {item.productName} — Size {item.size} × {item.quantity}
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "14px", margin: 0 }}>
              {formatPaise(item.unitPricePaise * item.quantity)}
            </Text>
          </Column>
        </Row>
      ))}

      <Hr style={{ borderColor: COLORS.line, margin: "16px 0" }} />

      <Row>
        <Column>
          <Text style={{ fontFamily: bodyFont, color: COLORS.muted, fontSize: "13px", margin: "2px 0" }}>
            Subtotal
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "13px", margin: "2px 0" }}>
            {formatPaise(subtotalPaise)}
          </Text>
        </Column>
      </Row>
      <Row>
        <Column>
          <Text style={{ fontFamily: bodyFont, color: COLORS.muted, fontSize: "13px", margin: "2px 0" }}>
            Shipping
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "13px", margin: "2px 0" }}>
            {formatPaise(shippingPaise)}
          </Text>
        </Column>
      </Row>
      {discountPaise > 0 && (
        <Row>
          <Column>
            <Text style={{ fontFamily: bodyFont, color: COLORS.terra, fontSize: "13px", margin: "2px 0" }}>
              Promo discount
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontFamily: bodyFont, color: COLORS.terra, fontSize: "13px", margin: "2px 0" }}>
              −{formatPaise(discountPaise)}
            </Text>
          </Column>
        </Row>
      )}
      <Row>
        <Column>
          <Text
            style={{
              fontFamily: headingFont,
              color: COLORS.espresso,
              fontSize: "16px",
              fontWeight: 600,
              margin: "8px 0 0",
            }}
          >
            Total
          </Text>
        </Column>
        <Column align="right">
          <Text
            style={{
              fontFamily: headingFont,
              color: COLORS.espresso,
              fontSize: "16px",
              fontWeight: 600,
              margin: "8px 0 0",
            }}
          >
            {formatPaise(totalPaise)}
          </Text>
        </Column>
      </Row>

      <Text style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "13px", margin: "24px 0 0" }}>
        Price inclusive of all taxes.
      </Text>
      <Text style={{ fontFamily: bodyFont, color: COLORS.espresso, fontSize: "13px", margin: "8px 0 0" }}>
        Dispatch within 1–2 working days. Delivery in 2–4 working days to metro cities, 4–7
        working days elsewhere.
      </Text>
    </EmailLayout>
  );
}
