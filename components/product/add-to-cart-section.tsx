"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { Size } from "@/lib/sizes";
import { SizeNotices } from "./size-notices";
import { SizeSelector } from "./size-selector";

type VariantOption = { id: string; size: string; stock: number; sku: string };

// This is where day 4's PDP gets its "Add to cart" button — held back on
// day 4 because the cart didn't exist yet (see docs/DAY-4-NOTES.md).
export function AddToCartSection({
  productSlug,
  productName,
  productImage,
  pricePaise,
  variants,
}: {
  productSlug: string;
  productName: string;
  productImage: string;
  pricePaise: number;
  variants: VariantOption[];
}) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.size === selectedSize);

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productSlug,
      productName,
      productImage,
      size: selectedVariant.size,
      sku: selectedVariant.sku,
      unitPricePaise: pricePaise,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div>
      <SizeSelector variants={variants} value={selectedSize} onChange={setSelectedSize} />
      <SizeNotices productSlug={productSlug} />
      <button
        type="button"
        disabled={!selectedVariant}
        onClick={handleAddToCart}
        className="mt-6 w-full border-0 bg-espresso px-6 py-3 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:w-auto sm:min-w-56"
      >
        {justAdded ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
