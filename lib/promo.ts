// Not in the original spec — added mid-build as a single evergreen promo
// code. TODO: if you want multiple codes, expiry dates, or per-customer
// usage limits later, this needs a real database-backed promo_codes table
// instead of a hardcoded constant.
export const PROMO_CODE = "SUNDUSK@1";
export const PROMO_DISCOUNT_PAISE = 15000; // ₹150

function normalize(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidPromoCode(input: string): boolean {
  return normalize(input) === PROMO_CODE;
}

/**
 * Discount for a given subtotal, capped so it can never exceed the
 * subtotal itself (shipping is never discounted away) and never produce a
 * negative total.
 */
export function discountForSubtotal(subtotalPaise: number, promoCode: string | undefined): number {
  if (!promoCode || !isValidPromoCode(promoCode)) return 0;
  return Math.min(PROMO_DISCOUNT_PAISE, subtotalPaise);
}
