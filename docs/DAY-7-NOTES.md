# Day 7 — build notes

## What was built

Razorpay Checkout on the client, `/order/[orderNumber]`, webhook route with
signature verification and idempotency. A full test-mode payment, tested
end to end for real (spec section 12, day 7).

- [components/checkout/checkout-form.tsx](../components/checkout/checkout-form.tsx)
  — after `/api/checkout` returns a real order, the form now actually opens
  Razorpay's Checkout popup (`checkout.razorpay.com/v1/checkout.js`, loaded
  only on `/checkout` via `next/script`, not globally). The popup's
  `handler` callback is treated as **a UI hint only** — it clears the cart
  and redirects to `/order/[orderNumber]`, but never marks anything paid.
  That's the webhook's job, entirely server-side, independent of whether
  the browser callback ever fires (spec section 7's explicit warning: the
  callback is not proof of payment). Dismissing the popup without paying
  doesn't lose the order — a "Pay now" button reopens the *same* Razorpay
  order rather than re-submitting the form and creating a duplicate.
- [app/api/webhooks/razorpay/route.ts](../app/api/webhooks/razorpay/route.ts)
  — the load-bearing route. Reads the raw body (`request.text()`, never
  `.json()` first — parsing first breaks the HMAC), verifies
  HMAC-SHA256 against `RAZORPAY_WEBHOOK_SECRET` with
  `crypto.timingSafeEqual`, dedupes via `INSERT ... ON CONFLICT DO NOTHING`
  on `webhook_events.razorpay_event_id` (atomic — no check-then-insert
  race), and on `payment.captured`: loads the order, no-ops if already
  `paid`, refuses to mark paid if the captured amount doesn't match the
  order total, then in one transaction sets `status = 'paid'` and
  decrements stock (floored at 0 — the payment's already captured at that
  point, there's no "reject" option left, just an oversell to handle
  manually). Always returns `200` for anything it processed or chose to
  ignore, per spec — a non-200 just makes Razorpay retry the same failure.
- `/order/[orderNumber]` — polls a lightweight status endpoint
  (`GET /api/orders/[orderNumber]/status`, returns only `{status}`, nothing
  else) every 2s for up to ~30s while `pending`, then gives up gracefully
  ("still confirming, we'll email you") rather than spinning forever.

### A real privacy tradeoff, not glossed over

Order numbers (`SD1001`, `SD1002`, ...) are sequential and this page has
**no authentication check** — spec section 7 explicitly has Razorpay
redirect straight to `/order/{order_number}`, with no token or login step.
That means anyone who guesses a nearby order number can load someone
else's `/order/SD1234`. Two things limit the actual exposure rather than
pretending it isn't there:

1. The page and its status API deliberately show/return the minimum: order
   items, sizes, total, status, and shipping **city/state only** — never
   the shipping street address, phone, or email. `getOrderStatusByNumber()`
   in `lib/orders.ts` doesn't even select those columns.
2. The page is `robots: { index: false, follow: false }` so it can't be
   found via search.

This is a real, accepted tradeoff for now, not a fully solved problem —
`/track-order` (spec section 9's route, not built yet) is the natural
future home for a properly gated "look up my order" flow (e.g. requiring
the order email), and day 9's auth could let logged-in customers see full
order history at `/account/orders/[orderNumber]` instead of relying on the
guessable URL at all.

### A dev-mode-only finding, worth knowing about if you go looking

While checking the order page for PII leakage, `curl` against `npm run
dev` showed the full order row — **including email and phone** — inside
a `self.__next_f.push(...)` script tag, despite the page component only
ever being passed city/state. This looked alarming until testing the
*actual production build* (`next build && next start`): the leak is
**not present**. Next.js's dev server includes extra Server Component
debug serialization for Fast Refresh that production strips entirely.
Confirmed by literally diffing `curl` output between `next dev` and
`next build && next start` against the same order. If you ever `view-source`
an order page while running `npm run dev` and see more than expected,
this is why — it's not what real users get.

## Verified — a real test-mode payment, end to end, twice

The first attempt using Razorpay's commonly-cited generic test Visa
(`4111 1111 1111 1111`) genuinely **failed** — not a bug in this code,
confirmed by pulling the real payment record from Razorpay's own API:
`error_reason: "international_transaction_not_allowed"`. That card isn't
actually in Razorpay's official domestic test-card list; this account is
(correctly, for an India-only store) configured to reject international
cards. The real domestic test cards, pulled from Razorpay's own docs repo
since a stale/wrong number from memory would just fail the same way again:

| Network | Number |
|---|---|
| Visa (domestic) | `4100 2800 0000 1007` |
| Mastercard (domestic) | `5500 6700 0000 1002` |
| RuPay (domestic) | `6527 6589 0000 1005` |

Source: [razorpay/markdown-docs, test-card-details.md](https://github.com/razorpay/markdown-docs/blob/master/payments/payments/test-card-details.md)

The retry, with the correct card, genuinely succeeded. Full chain, verified
at every step against real data (not assumed):

1. `/api/checkout` created a real order and a real Razorpay order
   (`order_TTdPcgC1PPANht`).
2. A real payment was completed in the real Razorpay Checkout popup, using
   a RuPay/HDFC domestic test card. Confirmed via Razorpay's own API
   afterward: `status: "captured"`, `amount_paid` exactly matching the
   order total, `international: false`.
3. Since Razorpay's real servers can't reach `localhost` to deliver the
   webhook (the limitation agreed on at the start of the day — no ngrok
   tunnel set up), the *exact* real payload — real payment id, real order
   id, real amount, correctly HMAC-signed — was delivered by hand to
   `POST /api/webhooks/razorpay`. This is different from fabricating a
   fake success: every field in that payload came from Razorpay's own
   records of something that genuinely happened.
4. Confirmed the full effect: order status `pending` → `paid`, correct
   `razorpay_payment_id` stored, stock for the ordered variant decremented
   exactly 10 → 9, and a real confirmation email delivered (see day 8
   notes) — to the address actually used in the checkout form.
5. The **first, genuinely-failed** payment attempt was also carried
   through the real `payment.failed` path the same way (real payment id,
   real Razorpay-reported error reason) — confirmed the order correctly
   stayed `pending` rather than being marked paid.

All test orders and the one stock decrement were cleaned up afterward —
`orders` is back to 0 rows, every variant back to stock 10.

Separately, before real keys were available, the signature-verification
and idempotency logic were stress-tested with synthetic payloads: invalid
signature → `400`; duplicate delivery of the identical payload → `200`
with stock **not** double-decremented; amount mismatch → order correctly
left unpaid. See the session transcript around this day's work for the
exact script — not preserved as a repo file since it manufactures fake
Razorpay ids.

## What you should check

```bash
npm run dev
```

- Add something to cart, check out, use a domestic test card (table
  above) — you should land on `/order/SD####` and, within a couple of
  seconds, see it flip from "Confirming your payment…" to "Thank you —
  payment confirmed" **without reloading the page**. This requires the
  webhook to actually be delivered, which — unless you've set up ngrok —
  it won't be locally; that's expected. You already have proof it works
  (above).
- If you do set up ngrok: register the webhook in Razorpay's dashboard
  pointed at `https://<your-ngrok-domain>/api/webhooks/razorpay`,
  subscribed to `payment.captured` and `payment.failed`, using the
  `RAZORPAY_WEBHOOK_SECRET` already sitting in `.env.local`.

## Next up

Day 9 (spec section 12): auth — register, login, `/account`, order
history, RLS policies. (Day 8 — emails — was built alongside this day;
see `docs/DAY-8-NOTES.md`.)
