import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { productVariants, stockMovements } from "@/db/schema";
import { getAdminUser } from "@/lib/require-admin";

const bodySchema = z.object({
  changes: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        newStock: z.number().int().min(0, "Stock can't be negative"),
      }),
    )
    .min(1, "No changes to save"),
});

/**
 * Bulk stock edit (admin panel v2, phase C) — one request for however
 * many cells were changed on /admin/stock, not one request per cell
 * (explicit requirement). Every variant is re-read for its *current*
 * stock inside the transaction, not trusted from whatever the client had
 * loaded — two admins editing the same page, or an order paying in
 * between page-load and save, must not silently overwrite each other's
 * change or log a wrong delta.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const results = await db.transaction(async (tx) => {
    const applied: { variantId: string; oldStock: number; newStock: number }[] = [];

    for (const change of parsed.data.changes) {
      const [variant] = await tx
        .select({ stock: productVariants.stock })
        .from(productVariants)
        .where(eq(productVariants.id, change.variantId));

      if (!variant) continue; // silently skip a variant that no longer exists
      if (variant.stock === change.newStock) continue; // no real change, no zero-delta log row

      await tx
        .update(productVariants)
        .set({ stock: change.newStock })
        .where(eq(productVariants.id, change.variantId));

      applied.push({ variantId: change.variantId, oldStock: variant.stock, newStock: change.newStock });
    }

    return applied;
  });

  // Audit log — best-effort, outside the transaction above. Same reasoning
  // as fulfillPaidOrder and the refund/restock path (lib/fulfill-order.ts,
  // app/api/admin/orders/[id]/status/route.ts): a logging failure must
  // never be able to undo a stock edit the admin already committed to.
  for (const r of results) {
    try {
      await db.insert(stockMovements).values({
        variantId: r.variantId,
        delta: r.newStock - r.oldStock,
        reason: "manual",
        adminEmail: admin.email ?? null,
        note: null,
      });
    } catch (err) {
      console.error("Failed to log stock movement", r.variantId, err);
    }
  }

  return NextResponse.json({ ok: true, updated: results.length });
}
