import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { SIZES } from "@/lib/sizes";

export type StockRow = {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  sku: string;
  stock: number;
  productTotal: number;
};

/**
 * Every product variant, joined with its product name — the flat list
 * /admin/stock renders. Sorted lowest stock first (what's actually
 * running out, across the whole store, is the thing worth seeing first),
 * tie-broken by size order (XS..XL) so equal-stock rows aren't in
 * database-insertion order.
 *
 * `productTotal` is computed here rather than in the client, so the page
 * always shows a real total even before any JS has run.
 */
export async function getStockOverview(): Promise<StockRow[]> {
  const rows = await db
    .select({
      variantId: productVariants.id,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      size: productVariants.size,
      sku: productVariants.sku,
      stock: productVariants.stock,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .orderBy(asc(productVariants.stock));

  const totalsByProduct = new Map<string, number>();
  for (const row of rows) {
    totalsByProduct.set(row.productId, (totalsByProduct.get(row.productId) ?? 0) + row.stock);
  }

  return rows
    .map((row) => ({ ...row, productTotal: totalsByProduct.get(row.productId) ?? 0 }))
    .sort((a, b) => {
      if (a.stock !== b.stock) return a.stock - b.stock;
      return SIZES.indexOf(a.size as (typeof SIZES)[number]) - SIZES.indexOf(b.size as (typeof SIZES)[number]);
    });
}
