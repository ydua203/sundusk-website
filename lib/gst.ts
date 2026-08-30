// Spec section 8. Rates apply per item, based on that item's own price —
// not the cart total. A cart with an ₹800 top and a ₹1,400 item attracts
// both rates on the same order.
//
// Prices shown on the site are GST-inclusive, so GST is computed
// *backwards* out of the price for the invoice, not added on top:
//   gst_component = price * rate / (100 + rate)
//
// TODO: confirm current apparel GST rates and the ₹1,000 threshold with
// the CA before launch — spec section 8 is explicit that these numbers
// aren't authoritative.
const LOW_RATE = 5;
const HIGH_RATE = 12;
const HIGH_RATE_THRESHOLD_PAISE = 100_000; // ₹1,000

export function gstRateForUnitPricePaise(unitPricePaise: number): number {
  return unitPricePaise >= HIGH_RATE_THRESHOLD_PAISE ? HIGH_RATE : LOW_RATE;
}

/**
 * GST component of one order line (unit price x quantity), rounded once
 * for the line rather than once per unit, to avoid compounding rounding
 * error across quantity.
 */
export function lineGstPaise(unitPricePaise: number, quantity: number): number {
  const rate = gstRateForUnitPricePaise(unitPricePaise);
  const amount = unitPricePaise * quantity;
  return Math.round((amount * rate) / (100 + rate));
}
