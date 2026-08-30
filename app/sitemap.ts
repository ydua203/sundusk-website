import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Only public, indexable pages — deliberately excludes /account/*,
// /admin/*, /order/[orderNumber], /cart, /checkout, /track-order: all
// either noindex already (order confirmations — sequential, unauthed,
// see docs/DAY-7-NOTES.md) or behind auth, so listing them here would
// just invite crawlers into pages that immediately redirect or 401.
const STATIC_ROUTES = [
  "",
  "/shop",
  "/collections/tops",
  "/collections/dresses",
  "/about",
  "/size-guide",
  "/custom-fit",
  "/shipping",
  "/returns",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
