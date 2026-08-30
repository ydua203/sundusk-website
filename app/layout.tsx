import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

// Display font — headings. Loaded as a variable font with the optical-size
// axis enabled (spec 3: "optical sizing on"); usage in the app is still
// restricted to weights 400/600/700 as the spec specifies.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

// Body / UI font.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-hanken",
  display: "swap",
});

// Needed so relative URLs in metadata (the opengraph-image route, etc.)
// resolve to absolute ones — without this, social previews would embed a
// broken relative path instead of a real image URL.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Note: no title *template* here on purpose — every page across the site
// already sets its own full "X | Sundusk" string (checked before adding
// this), and a template would double up on top of that ("X | Sundusk |
// Sundusk") rather than compose with it.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sundusk",
  description:
    "Sundusk — women's tops for the Indian market. Sun-faded, warm, editorial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand text-espresso">
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:bg-espresso focus-visible:px-4 focus-visible:py-2 focus-visible:font-body focus-visible:text-sm focus-visible:font-medium focus-visible:text-cream"
        >
          Skip to content
        </a>
        <CartProvider>
          <Header />
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
