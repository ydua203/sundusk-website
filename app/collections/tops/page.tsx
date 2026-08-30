import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { ProductGrid } from "@/components/product/product-grid";
import { getActiveProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Tops | Sundusk",
  description:
    "Tops for the Indian market, sizes XS to XL. Sun-faded, warm, editorial.",
};

export const dynamic = "force-dynamic";

export default async function TopsPage() {
  const items = await getActiveProducts("tops");

  return (
    <Section tone="sand">
      <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
        Tops
      </h1>
      <p className="mt-2 font-body text-sm text-muted">
        {items.length} piece{items.length === 1 ? "" : "s"}, sizes XS–XL.
      </p>
      <div className="mt-10">
        <ProductGrid products={items} />
      </div>
    </Section>
  );
}
