import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Mirrors the noindex set already applied per-page (order
      // confirmations, account, admin, cart/checkout) — belt and braces,
      // since a crawler that ignores <meta robots> would otherwise still
      // be free to walk these paths.
      disallow: ["/account", "/admin", "/api", "/cart", "/checkout", "/order"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
