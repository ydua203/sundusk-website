import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPaise } from "@/lib/money";
import { ProductImage } from "./product-image";

// Deliberately just image, name, price — no "unique piece" language, no
// struck-through compare-at price, no stock-count badge. Spec section 1's
// hard rules (no false exclusivity claims, no fake urgency) apply to every
// surface a product appears on, not just its own page.
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <ProductImage src={product.images[0]} alt={product.name} />
      <div className="mt-3 space-y-0.5">
        <h3 className="font-display text-base font-medium text-espresso transition-colors group-hover:text-terra">
          {product.name}
        </h3>
        <p className="font-body text-sm text-muted">
          {formatPaise(product.pricePaise)}
        </p>
      </div>
    </Link>
  );
}
