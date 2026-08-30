import type { Metadata } from "next";
import { CustomizationForm } from "@/components/custom-fit/customization-form";
import { Section } from "@/components/layout/section";
import { getActiveProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Custom Fit | Sundusk",
  description: "Request made-to-measure sizing on any top, including sizes beyond XL.",
};

export const dynamic = "force-dynamic";

export default async function CustomFitPage({ searchParams }: PageProps<"/custom-fit">) {
  const params = await searchParams;
  const productParam = typeof params.product === "string" ? params.product : undefined;
  const items = await getActiveProducts("tops");

  return (
    <Section tone="sand">
      <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
        Custom fit
      </h1>
      <p className="mt-3 max-w-2xl font-body text-base text-espresso/80">
        Our stocked sizes run XS to XL. If you need something outside that range, or want a fit
        tailored to your own measurements, tell us which top and we&rsquo;ll get back to you —
        custom sizing is ₹100 extra on top of the garment price. This is a request, not an instant
        order: we&rsquo;ll confirm feasibility and timeline with you before anything is charged.
      </p>
      <div className="mt-10 max-w-xl">
        <CustomizationForm products={items} preselectedSlug={productParam} />
      </div>
    </Section>
  );
}
