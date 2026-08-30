# Day 8 — build notes

## What was built

Emails: Resend, React Email templates, confirmation and shipped (spec
section 12, day 8 — literally those two templates; delivered and welcome
are explicitly later days, see "What's deliberately not built" below).

- [lib/email/resend-client.ts](../lib/email/resend-client.ts) — the Resend
  SDK throws **synchronously at construction** if the API key is missing
  (`new Resend("")` throws immediately, verified directly). Building it
  eagerly at module load would crash any route that merely *imports* an
  email-sending function the moment `RESEND_API_KEY` is unset — exactly
  the state this repo started the day in. Built lazily instead, only on
  first actual send.
- [emails/components/email-layout.tsx](../emails/components/email-layout.tsx)
  — the shared espresso-header/sand-body shell (spec section 11). Custom
  web fonts (Fraunces/Hanken Grotesk) aren't reliably supported by email
  clients, so headings fall back to Georgia (closest serif match) and body
  copy to Helvetica/Arial — a deliberate, common substitution for email,
  not an oversight.
- [emails/order-confirmed.tsx](../emails/order-confirmed.tsx),
  [emails/order-shipped.tsx](../emails/order-shipped.tsx) — the two
  templates. Confirmed shows items with sizes, subtotal/shipping/discount/
  total (discount line only appears when one was applied), and the same
  dispatch/delivery estimate text as `/shipping`'s future copy. Shipped
  shows courier, tracking number, and an optional tracking link.
- [lib/email/send-order-confirmed-email.ts](../lib/email/send-order-confirmed-email.ts)
  — called by the webhook's `payment.captured` handler, **after** its
  transaction commits, never inside it (spec section 11: a failed email
  must never roll back a paid order). Re-fetches the order by id rather
  than taking it as a parameter, so it stays a clean, independently
  callable unit — useful later if admin ever needs a "resend confirmation"
  button.
- [lib/email/send-order-shipped-email.ts](../lib/email/send-order-shipped-email.ts)
  — built and ready, **not called from anywhere yet**. Its trigger is day
  10's admin "mark shipped" action (`POST /api/admin/orders/[id]/ship`),
  which doesn't exist until then. Built today because day 8's scope is
  explicitly "confirmation and shipped," not because it's wired up yet —
  same pattern as day 6 building the checkout-notice copy before checkout
  itself could take payment.

### What's deliberately not built

**Delivered** and **welcome** emails (spec section 11 lists four
templates total) are not part of day 8's scope per the build table —
delivered naturally belongs with day 10 (admin marks an order delivered)
and welcome with day 9 (account creation). Building them now would mean
guessing at trigger points that don't exist yet.

## Verified for real, not just rendered locally

- Both templates render to valid HTML (`<!DOCTYPE html>`, correct byte
  length, every dynamic field present) — checked via a temporary debug
  route hit with `curl` against the real Next.js dev server, not a
  standalone script. (A standalone `tsx` render attempt failed on a JSX
  runtime mismatch — esbuild's default classic-JSX transform needs
  `React` in scope, which Next's own SWC pipeline doesn't require; rather
  than add an unnecessary `import React` to source files just to satisfy
  an external test tool, the template was verified through the actual
  runtime path instead. Debug route deleted after confirming.)
- **A real email was sent and delivered**, once you added a real
  `RESEND_API_KEY` to `.env.local` mid-build: a manually-triggered
  `payment.captured` webhook for a real test order produced a real
  `resend.emails.send()` call with `error: null` and a real message id —
  and separately, a direct explicit send confirmed the same. `hello@sundusk.in`
  is apparently already verified as a sender domain in Resend (the send
  succeeded without a domain error).
- Confirmed again, for real, during day 7's actual end-to-end payment
  test: the webhook's `payment.captured` handler successfully triggered
  `sendOrderConfirmedEmail` with no errors logged, for the real order that
  was really paid for with a real (test-mode) card.
- **Worth knowing**: the Resend API response included
  `x-resend-daily-quota: 1` and `x-resend-monthly-quota: 8` in its
  headers — that reads like a very limited plan. Worth checking the
  Resend dashboard before relying on this for real order volume.

## What you should check

- Look at your inbox for the test emails sent during today's build — one
  manually-triggered order-confirmed email, one direct test send, and one
  genuine order-confirmed email from the real end-to-end payment test
  (day 7). Check formatting looks right on both desktop and mobile mail
  clients if you can — email rendering is notoriously inconsistent across
  clients (Gmail web vs. Gmail app vs. Outlook can all differ slightly)
  and this was only checked as raw HTML, not eyeballed in every client.
- Check the Resend dashboard's quota/plan page given the low numbers in
  the response headers above.

## Next up

Day 9 (spec section 12): auth — register, login, `/account`, order
history, RLS policies.
