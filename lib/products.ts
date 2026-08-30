import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { SIZES } from "@/lib/sizes";

export type ProductCategory = "tops" | "dresses";

/**
 * Active products, optionally filtered to one category, ordered for the
 * grid (spec section 5's `sort_order`). Used by /shop and
 * /collections/tops — dresses has no grid yet (section 9: "coming soon,
 * no product grid"), so there's no dresses query.
 */
export async function getActiveProducts(category?: ProductCategory) {
  const where = category
    ? and(eq(products.isActive, true), eq(products.category, category))
    : eq(products.isActive, true);

  return db.select().from(products).where(where).orderBy(asc(products.sortOrder));
}

export type Product = Awaited<ReturnType<typeof getActiveProducts>>[number];

/**
 * One active product plus its variants, sorted XS -> XL (not alphabetical
 * — that would put L before S). Returns null if the slug doesn't match an
 * active product; callers should call notFound().
 */
export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)));

  if (!product) return null;

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));

  variants.sort(
    (a, b) => SIZES.indexOf(a.size as (typeof SIZES)[number]) - SIZES.indexOf(b.size as (typeof SIZES)[number]),
  );

  return { ...product, variants };
}

export type ProductWithVariants = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
