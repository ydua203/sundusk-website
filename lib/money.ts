// All money is stored in paise as integers (spec section 5) and formatted
// for display only here, at render time — never anywhere upstream.

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 149900 -> "₹1,499" */
export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}
