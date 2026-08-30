import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { customizationRequests, products } from "@/db/schema";
import { customizationRequestSchema } from "@/lib/validation/customization";

/**
 * POST /api/customization-requests — not in the original spec, see
 * docs/PROMO-AND-CUSTOM-FIT-NOTES.md.
 *
 * This is lead capture, not checkout: no price is calculated, no stock is
 * checked, no Razorpay order is created. Staff review submissions in admin
 * and arrange payment separately once they've confirmed the request is
 * feasible — there's no "recalculate from the database" step here because
 * there's no fixed price to recalculate; a custom garment's price is a
 * conversation, not a lookup.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = customizationRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { productId, name, email, phone, bustIn, waistIn, hipsIn, notes } = parsed.data;

  const [product] = await db
    .select({ id: products.id, name: products.name, isActive: products.isActive })
    .from(products)
    .where(eq(products.id, productId));

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Choose a product from the list" }, { status: 400 });
  }

  const [request_] = await db
    .insert(customizationRequests)
    .values({
      productId: product.id,
      productName: product.name,
      name,
      email,
      phone,
      bustIn,
      waistIn,
      hipsIn,
      notes,
    })
    .returning({ id: customizationRequests.id });

  return NextResponse.json({ id: request_.id });
}
