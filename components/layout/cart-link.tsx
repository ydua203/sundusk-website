"use client";

import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { useCart } from "@/context/cart-context";

// The count badge needs live client state, so this one piece of the header
// is a client island — Header itself (and the rest of the nav) stays a
// Server Component.
export function CartLink() {
  const { itemCount, isHydrated } = useCart();
  const showBadge = isHydrated && itemCount > 0;

  return (
    <Link
      href="/cart"
      aria-label={
        showBadge ? `Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}` : "Cart"
      }
      className="relative text-espresso transition-colors hover:text-terra"
    >
      <CartIcon className="h-5 w-5" />
      {showBadge && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center bg-terra px-1 font-body text-[10px] font-semibold text-cream"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
