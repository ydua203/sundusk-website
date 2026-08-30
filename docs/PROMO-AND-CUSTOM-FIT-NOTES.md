# Promo code + custom-fit — build notes

Not in the original 12-day plan — added mid-build on request, between days
6 and 7. Documented separately from the `DAY-N-NOTES.md` files since it
doesn't map to a single spec day.

## The one real conflict, and how it was resolved

Spec section 1's hard rule #1 originally read: *"Never claim size
inclusivity. The range stops at XL. No 'for every body', no 'all sizes',
no plus-size language."* A "customize sizes beyond XL" feature is close to
exactly what that rule exists to prevent, so this wasn't built silently —
it was flagged, and the resolution was a deliberate choice, not a default:

- The rule itself was **updated** (in both `CLAUDE.md` and
  `docs/sundusk-claude-code-spec.md`) rather than quietly ignored or left
  contradicting what actually ships. It now permits factual, narrow
  mentions of custom sizing ("need a size beyond XL? custom sizing
  available on request") while still banning general-inclusivity language
  ("for every body," "we fit everyone"). Standard product pages still say
  XS–XL and nothing changed about that.
- Custom fit is a **separate service reachable from its own page**
  (`/custom-fit`), not a claim about the standard size range.

## Promo code

- [lib/promo.ts](../lib/promo.ts) — a single hardcoded evergreen code,
  `SUNDUSK@1`, ₹150 off. Matching is trim + case-insensitive. **This is
  deliberately not a database table** — same reasoning as
  `SHIPPING_FLAT_PAISE` (lib/shipping.ts): one code, no expiry, no per-customer
  limits, so a constant is proportionate. If you want multiple codes,
  expiry dates, or usage limits later, this needs a real `promo_codes`
  table instead — don't bolt more codes onto this constant.
- The discount is capped at the subtotal (`Math.min(discount, subtotal)`)
  so shipping is never discounted away and the total can never go
  negative — Razorpay requires a positive amount.
- **GST is computed from the original item prices, not the discounted
  total** — the discount reduces the amount payable, it doesn't reprice
  the goods. This is the same open question already flagged in
  `lib/gst.ts`: **confirm with your CA whether a promo discount should
  reduce the taxable value for invoicing purposes.** Don't treat the
  current behavior as authoritative.
- An unrecognized or missing code is **not an error** — checkout proceeds
  at full price silently. Blocking a purchase over a mistyped coupon would
  be worse than just not giving the discount.
- New columns on `orders`: `discount_paise` (default 0) and `promo_code`
  (nullable, stores the canonical code when a discount was applied, not
  whatever casing the customer typed).
- Surfaced in the checkout form: a "Promo code" field shows an inline "₹150
  off will be applied" the moment a matching code is typed (client-side
  check, not authoritative — the server always recalculates), and the
  post-order confirmation states the actual discount applied.

## Custom fit

- **Request form, not instant checkout** — this was the single biggest
  scope decision. A custom garment has no stock to check and no fixed
  price; a self-checkout flow would need to either fake a price (dishonest)
  or block on a live consultation anyway. Instead: customer submits a
  request (product, contact info, optional bust/waist/hips in inches, and
  required notes), staff review it and arrange payment — a Razorpay
  payment link or manual follow-up — once feasibility and timeline are
  confirmed. **No payment happens on this page.**
- New table: `customization_requests` (see `db/schema.ts`) — denormalizes
  `product_name` at submission time (same reasoning as `order_items`: if
  the product is later edited or deactivated, the historical request
  shouldn't silently change). `status` is a simple three-state
  `new → contacted → closed`, meant for manual triage in the admin panel
  (day 10) — there's no automated transition logic here, unlike the real
  order state machine in spec section 6.
- **No RLS** on this table, unlike `customers`/`addresses`/`orders`. Those
  three have RLS because a signed-in customer can read their own rows via
  `auth.uid()`. Customization requests aren't tied to an account at all —
  the form doesn't require login — so there's no `auth.uid()` to scope a
  policy to. Only admin (via the service role key, which bypasses RLS
  regardless) ever reads this table.
- `POST /api/customization-requests` — validates, looks up the product
  (must exist and be active), inserts the row. That's the whole flow; there
  is deliberately no price calculation, stock check, or Razorpay call here.
- `/custom-fit` — the request form. Supports `?product=<slug>` to
  preselect a product, used by the link on every product page (directly
  below the size-exchange notices, alongside the existing "Find your
  size →" and WhatsApp lines). Also linked from the footer's Help column.

## Verified against the real database

- **Promo code**: temporarily logged computed totals, confirmed a
  whitespace/lowercase code (`"  sundusk@1  "`) still matched and produced
  the correct discount (₹1,499 subtotal + ₹79 shipping − ₹150 = ₹1,428
  total); confirmed an unrecognized code and no code both fall through to
  full price without error. Log line removed after confirming. Checkout
  still rolls back cleanly on Razorpay's missing-credentials error (same
  as day 6) — `orders` stayed at 0 rows through every test.
- **Customization requests**: submitted one with full measurements and one
  with notes only — both persisted correctly, `bust_in`/`waist_in`/`hips_in`
  correctly `null` when omitted, `product_name` correctly denormalized,
  `status` defaulted to `new`. Confirmed rejections: empty notes → `400`,
  an out-of-range measurement (999) → `400` with the specific field error,
  an unknown product id → `400`. Test rows deleted afterward.
- `tsc`, `eslint`, and `next build` all clean; both new routes correctly
  render as dynamic in the build's route table.

**Not verified**: the actual in-browser form interactions (typing, seeing
the "add to cart"-style disabled/enabled states, watching the promo
confirmation appear as you type) — same headless-browser limitation noted
in `docs/DAY-6-NOTES.md`. Worth clicking through both forms yourself.

## What's still open

- No admin UI exists yet to review `customization_requests` — that's day
  10's job, and this table should be added to that day's scope when you
  get there.
- The ₹100 customization surcharge is stated as copy on `/custom-fit` but
  isn't charged anywhere in code — there's no checkout flow for custom
  orders yet, by design (see "request form, not instant checkout" above).
  If you eventually want self-service custom checkout, that's a genuinely
  new flow (custom price entry, no stock check, probably a manually-issued
  Razorpay payment link) — not a small extension of today's work.
