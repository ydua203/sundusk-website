import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/legal";

// Spec section 3's palette, applied to email since Tailwind classes don't
// travel into a rendered email — every value here is inlined per-element
// instead, which is also just more reliable across email clients than
// relying on a <style> block (many strip them).
export const COLORS = {
  sand: "#FBF2E4",
  espresso: "#3C1800",
  terra: "#B5622F",
  line: "#E4D3B8",
  muted: "#A98A68",
};

// Fraunces/Hanken Grotesk (the site's actual fonts) aren't reliably
// supported by email clients — most strip @font-face or silently fall
// back. Georgia stands in for Fraunces' serif character on headings;
// Helvetica/Arial for body copy, the same reasoning most transactional
// email design defaults to.
export const headingFont = "Georgia, 'Times New Roman', serif";
export const bodyFont = "Helvetica, Arial, sans-serif";

// Espresso header, sand body, Fraunces-style (Georgia) headings — spec
// section 11. Shared by every template so they can't drift apart.
export function EmailLayout({
  previewText,
  children,
}: {
  previewText: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: COLORS.sand, margin: 0, padding: 0, fontFamily: bodyFont }}>
        <Section style={{ backgroundColor: COLORS.espresso, padding: "32px 24px" }}>
          <Text
            style={{
              color: COLORS.sand,
              fontFamily: headingFont,
              fontSize: "24px",
              fontWeight: 600,
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Sundusk
          </Text>
        </Section>
        <Container style={{ backgroundColor: COLORS.sand, padding: "32px 24px", maxWidth: "480px" }}>
          {children}
          <Hr style={{ borderColor: COLORS.line, margin: "32px 0 16px" }} />
          <Text style={{ color: COLORS.muted, fontFamily: bodyFont, fontSize: "12px", margin: 0 }}>
            Questions? Email{" "}
            <a href="mailto:hellosundusk.in@gmail.com" style={{ color: COLORS.espresso }}>
              hellosundusk.in@gmail.com
            </a>{" "}
            or WhatsApp{" "}
            <a href={SUPPORT_WHATSAPP_URL} style={{ color: COLORS.espresso }}>
              {SUPPORT_PHONE_DISPLAY}
            </a>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
