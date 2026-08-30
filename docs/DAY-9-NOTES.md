# Day 9 — build notes

## What was built

Auth: register, login, `/account`, order history, RLS policies (spec
section 12, day 9).

- [lib/supabase/server.ts](../lib/supabase/server.ts),
  [lib/supabase/client.ts](../lib/supabase/client.ts) — the standard
  `@supabase/ssr` server/browser client split. The server client is used
  from Server Components and Route Handlers (reads the session from
  cookies via `next/headers`); the browser client is used from the two
  forms and the sign-out button.
- [middleware.ts](../middleware.ts) — required by `@supabase/ssr` to keep
  the session cookie fresh on every request, and also does the actual
  route gating: `/account/*` requires a session, `/admin/*` requires a
  session **and** an email in `ADMIN_EMAILS` (spec section 9's exact
  words: "check the email against the ADMIN_EMAILS env list in
  middleware"). Uses `getUser()`, not `getSession()` — `getSession()`
  trusts whatever's in the cookie without asking Supabase's auth server to
  confirm it's still valid; Supabase's own SSR guidance is explicit that
  server-side code should never rely on it.
- [drizzle/0002_handle_new_user_trigger.sql](../drizzle/0002_handle_new_user_trigger.sql)
  — a Postgres trigger on `auth.users` that auto-creates the matching
  `customers` row the moment someone signs up, pulling name/phone out of
  the signup call's metadata. Hand-written SQL, not something
  `drizzle-kit generate` can produce from `db/schema.ts` — `auth.users`
  isn't a table this project's schema owns, so there's nothing to diff
  against. Applied through the normal `npm run db:migrate` flow anyway, so
  every environment gets it the same way.
- `/account/register`, `/account/login` — client-side forms calling
  `supabase.auth.signUp()` / `signInWithPassword()` directly (no custom
  API route needed for these — Supabase Auth already is the API). Zod
  validation shared between field-level UI feedback and nothing else this
  time — Supabase does its own server-side validation on top, there's no
  separate backend endpoint of ours to keep in sync with.
- `/account` — order history, Server Component, redirects to
  `/account/login` if unauthenticated (defense in depth — middleware
  already does this, but the page needs the user object to fetch orders
  regardless, so the check is free).
- `/account/orders/[orderNumber]` — single order detail. Reuses
  `OrderStatusView` from day 7 unchanged (it already only polls while
  `status === "pending"`, so a random past paid/shipped/delivered order
  just renders statically — no new component needed). **Ownership
  checked, not just existence** — an order that exists but isn't the
  signed-in user's (someone else's, or a guest order with `customer_id`
  null) 404s exactly like a nonexistent one, rather than leaking whose
  order number belongs to whom.
- `/api/checkout` now attaches `customerId` when the request carries a
  valid session — so a signed-in customer's orders show up in their
  history automatically. Guest checkout is completely unaffected: no
  session, `customerId` stays `null`, exactly as before.

## A real bug found and fixed, not just noted

Tested account deletion by creating a real Supabase Auth user, then
deleting it through the admin API — the matching `customers` row **did
not** go with it. `customers.id` had no actual foreign key to
`auth.users.id` in the database; the schema comment *said* "id matches
Supabase auth.users.id" but nothing enforced it. Fixed with a real FK
(`drizzle/0003_customers_auth_users_fk.sql`, `ON DELETE CASCADE`), using
`drizzle-orm/supabase`'s `authUsers` reference table so `db/schema.ts`
documents the relationship instead of just asserting it in a comment.
Re-tested with a fresh user afterward — this time the `customers` row
was actually gone. This isn't just tidiness: the privacy policy (spec
section 10A) promises "delete your account and personal data," and
without this FK, deleting an auth user would have silently left personal
data behind.

## Verified against the real Supabase project, not simulated

Supabase rejects `@example.com` (their fake-domain email validation) —
worth knowing if you write your own test scripts later. Used
`youraddress+something@gmail.com` (still delivers to the same inbox)
instead.

- **Signup**: real `signUp()` call, confirmed no session came back
  (email confirmation is on for this project by default) — the register
  form's "check your email" branch is the one that actually fires, not
  a guess about which branch would fire.
- **The auth trigger**: confirmed the `customers` row appeared
  automatically with the correct email/name/phone, without any
  application code inserting it.
- **Middleware gating**: `/account` and `/admin` without a session → real
  `307` redirects to `/account/login?next=...`; `/account/login` and
  `/account/register` themselves → `200`, not redirected.
- **RLS with a real session** (not the service-role bypass every other
  check in this project uses): signed in for real, queried `customers`
  with **no filter at all** using that session's token — got back exactly
  one row, the signed-in user's own. Confirms the day-1 RLS policies
  actually hold now that real authenticated users exist, not just that
  they parsed correctly.
- **Checkout → account linkage**: replayed a real authenticated session's
  cookies (captured directly from `@supabase/ssr`'s cookie-writing logic,
  not guessed at) against `/api/checkout`, confirmed `customer_id` landed
  correctly in the database, and confirmed the order then appeared in
  `/account`'s order history.
- **Ownership check**: created a guest order, then tried to load it via
  `/account/orders/[orderNumber]` while authenticated as someone else —
  confirmed `404`, not the order's contents. (The dev-mode-only RSC
  serialization quirk documented in day 7's notes shows up here too if
  you go looking with `curl` — same non-issue, confirmed not present in
  the production build back on day 7, not re-verified line-by-line here
  since the root cause is already established.)
- **The FK cascade fix**, above.

All test users, customers, and orders created during this were deleted
afterward — database is back to a clean baseline.

## What's deliberately not built

Password reset ("forgot password") isn't part of spec section 9's
explicit day-9 list (register, login, account, order history, RLS) — not
built, same build-order discipline as every other day. `/admin`'s actual
pages are day 10, tomorrow's work — today only built the gate
(middleware checks `ADMIN_EMAILS`), not what's behind it.

## What you should check

```bash
npm run dev
```

- `/account/register` — create a real account with your own email. If
  Supabase's email confirmation is on (it is, by default, for this
  project), you'll get a real confirmation email from Supabase — not from
  Resend, this is a separate thing from the store's transactional emails.
- Sign in at `/account/login`, confirm you land on `/account` and see
  your email.
- Add something to cart and check out while signed in — the resulting
  order should appear in your `/account` order history without you doing
  anything else.
- Try visiting `/account` in a private/incognito window (no session) —
  should redirect straight to `/account/login`.

## Next up

Day 10 (spec section 12): admin — order list, order detail, status
transitions, courier + tracking, CSV export.
