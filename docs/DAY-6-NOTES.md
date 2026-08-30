# Day 6 — build notes

## What was built

Checkout form with Zod validation, `POST /api/checkout`, order creation,
Razorpay order (spec section 12, day 6).

- [lib/validation/checkout.ts](../lib/validation/checkout.ts) — one Zod
  schema shared between the client form (field-level errors before submit)
  and the API route, so the two rules can't drift apart. The server
  re-validates everything regardless — that's not optional, it's spec
  section 7's whole point — but there's no reason to hand-maintain two
  copies of "is this a valid pincode."
- [lib/gst.ts](../lib/gst.ts) — spec section 8's GST math: rate depends on
  each item's *own* price (5% under ₹1,000, 12% at or above), not the cart
  total, and since displayed prices are GST-inclusive the component is
  computed backwards (`price × rate / (100 + rate)`), rounded once per
  line rather than once per unit to avoid compounding rounding error.
- [lib/shipping.ts](../lib/shipping.ts) — a flat shipping rate constant.
  **This is a placeholder (₹79) — spec section 10A's `/shipping` copy
  literally has this as "₹[AMOUNT]" and says not to ship it unfilled.**
  Checkout needs *some* concrete number to total against before that page
  exists (day 11), so this constant exists now with a loud `TODO` — update
  it and the `/shipping` page together once you've confirmed the real rate
  with your courier partner.
- [app/api/checkout/route.ts](../app/api/checkout/route.ts) — the whole
  spec section 7 flow up through order creation:
  1. Zod-validate the request.
  2. Look up every `variantId` in the database and use **the database's**
     price, name, size, SKU — nothing from the request body is trusted for
     money. This is the actual point of the exercise; skip to "Verified"
     below for how it was tested.
  3. Check stock per line; `409` with the specific shortages if anything's
     short. This is a fast-fail UX check only — it can't close the race
     between two people checking out the last unit at once. The webhook
     (day 7) is what atomically re-checks and decrements stock at the
     moment of payment; this route never decrements stock, matching the
     state machine in spec section 6.
  4. Insert `orders` + `order_items` in a transaction (status `pending`).
  5. Create the matching Razorpay order, store its id on the order row.
  6. **If step 5 fails, step 4's rows are deleted.** An order that could
     never be paid because Razorpay rejected it isn't a "pending" order
     worth keeping around — it's just noise in the table.
- `/checkout` — address + contact form
  ([checkout-form.tsx](../components/checkout/checkout-form.tsx)), an order
  summary with the real subtotal/shipping/total breakdown
  ([checkout-summary.tsx](../components/checkout/checkout-summary.tsx)),
  and the exact notice text from spec section 10A directly above the submit
  button. A proper `<select>` of Indian states/UTs
  ([lib/india-states.ts](../lib/india-states.ts)) instead of free text —
  a typed-in state ("UP" / "U.P." / "Uttar pradesh") would poison the CSV
  export handed to the courier on day 10.

### Where this deliberately stops short

`/checkout` submits the form, gets back a real order number and a real
Razorpay order id — and then just says so. It does not open the Razorpay
payment window. That's day 7 ("Razorpay Checkout on the client,
`/order/[orderNumber]`, webhook route"), and this follows the same call as
day 4's Add to Cart button: a "Pay now" button that opens nothing yet would
be worse than a plain confirmation that's honest about what's built. The
cart is **not** cleared on this success either — clearing it now, before a
payment has actually been confirmed, would mean an abandoned or failed
payment loses the customer's cart for nothing. It gets cleared on day 7,
at the point that actually means something (a confirmed payment).

## Verified, not just written

`curl` can drive `/api/checkout` directly since it's just JSON in, JSON
out — this is where the actual business logic lives, so it got the most
scrutiny, all against the real Supabase database:

- **Price recalculation**: sent a request for Terra Wrap Top (S, ₹1,499)
  × 1 + Sundown Tank (M, ₹799) × 2. Temporarily logged the server's
  computed totals and confirmed them against hand math: subtotal
  ₹3,097.00, GST ₹236.71 (12% on the ₹1,499 item + 5% on the ₹799 item,
  per spec section 8's per-item rate), shipping ₹79, total ₹3,176.00 —
  exact match. Log line removed after confirming.
- **Zod validation**: bad email, bad phone, bad pincode → `400` with the
  specific field errors. Empty `items` array → `400`.
- **Stock shortage — the real check, not just the schema cap**: the Zod
  schema itself caps quantity at 10, so a naive "request 999" test would
  only prove the schema works. Instead, directly set a real variant's
  stock to 2 in the database, requested 5 → `409` with
  `{requested: 5, available: 2}`. Restored stock to 10 afterward.
- **Unknown variant id** (valid UUID, doesn't exist) → `409`, treated as
  zero availability.
- **Rollback on Razorpay failure**: no Razorpay keys are configured yet
  (spec section 4's checklist — that's a day-7/launch-week step), so every
  successful-validation request reaches the Razorpay call and fails there
  by design. Confirmed the order row is created and then actually deleted:
  `select count(*) from orders` was `0` before, `0` after, across every
  test above — no orphaned pending orders left behind despite dozens of
  test requests.

**What couldn't be verified here**: the actual in-browser interactions —
clicking "Add to cart," typing into the checkout form, submitting it —
since this sandbox has no headless browser available (`chromium-cli`
isn't installed and this is a Windows box, not the usual Linux container).
`curl` confirms every page and the API route render/respond correctly,
and `tsc`/`eslint`/`next build` are all clean, but you clicking through
`/products/terra-wrap-top` → add to cart → `/checkout` → fill the form →
submit is worth doing yourself before calling this day done.

## What you should check

```bash
npm run dev
```

- Add an item to your cart, go to `/checkout`, fill the form with an
  obviously wrong pincode or phone — confirm the inline error appears
  without a page reload.
- Fill it correctly and submit — you should see "Placing order…" briefly,
  then a confirmation block with a real order number (`SD1001`, or
  whatever the sequence is at) and the total. **No payment window opens —
  that's expected, see above.**
- Check the Supabase dashboard afterward: since Razorpay isn't configured,
  your test order won't be in the `orders` table (it gets rolled back) —
  that's correct, not a bug, until day 7's keys are in place.
- Try submitting with an empty cart (clear it first) — `/checkout` redirects
  you to the empty-cart state instead of showing a form with nothing to
  buy.

## Still needed before day 7 can be fully tested

Razorpay test-mode keys in `.env.local` (`RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`) — spec section 4 has the steps. Test keys are fine
for the whole build; live keys only at launch.

## Next up

Day 7 (spec section 12): Razorpay Checkout on the client,
`/order/[orderNumber]`, the webhook route with signature verification and
idempotency — and a full test-mode payment end to end.
