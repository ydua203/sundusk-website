import { headers } from "next/headers";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";

// Server Component wrapper, existing only to read the per-request CSP
// nonce (set by middleware.ts on the request headers) and hand it to the
// client page — headers() only works in a Server Component, and the
// actual checkout page needs useCart(), which doesn't.
export default async function CheckoutPage() {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? "";
  return <CheckoutPageClient nonce={nonce} />;
}
