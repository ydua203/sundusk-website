import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccordionItem } from "@/components/product/accordion-item";
import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { ProductGallery } from "@/components/product/product-gallery";
import { Section } from "@/components/layout/section";
import { formatPaise } from "@/lib/money";
import { getProductBySlug } from "@/lib/products";

// Live price/stock — never statically prerendered/cached (see day 3 notes
// for why this matters once real orders exist).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} | Sundusk`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <Section tone="sand">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 font-body text-lg text-espresso">
            {formatPaise(product.pricePaise)}
          </p>
          <p className="mt-1 font-body text-xs text-muted">
            Price inclusive of all taxes.
          </p>

          <p className="mt-6 font-body text-base leading-relaxed text-espresso/80">
            {product.description}
          </p>

          {product.modelNote && (
            <p className="mt-3 font-body text-xs text-muted">
              {product.modelNote}
            </p>
          )}

          <div className="mt-8">
            <AddToCartSection
              productSlug={product.slug}
              productName={product.name}
              productImage={product.images[0]}
              pricePaise={product.pricePaise}
              variants={product.variants}
            />
          </div>

          {(product.fabric || product.fit || product.care) && (
            <div className="mt-10 divide-y divide-line border-t border-b border-line">
              {product.fabric && (
                <AccordionItem title="Fabric">{product.fabric}</AccordionItem>
              )}
              {product.fit && (
                <AccordionItem title="Fit">{product.fit}</AccordionItem>
              )}
              {product.care && (
                <AccordionItem title="Care">{product.care}</AccordionItem>
              )}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
