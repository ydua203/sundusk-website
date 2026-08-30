import { Section } from "@/components/layout/section";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function TopsLoading() {
  return (
    <Section tone="sand">
      <div className="h-9 w-24 animate-pulse bg-line" />
      <div className="mt-2 h-4 w-40 animate-pulse bg-line" />
      <div className="mt-10">
        <ProductGridSkeleton />
      </div>
    </Section>
  );
}
