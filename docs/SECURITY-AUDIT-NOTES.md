# Security audit — build notes

Not one of the 12 build days — a full security pass requested directly,
covering the whole app rather than one feature. Everything below was
verified against the real, live Supabase project and a real production
build (`npm run build && npm run start`), not just read and assumed safe.

## The critical finding: five tables had zero RLS

This is the headline issue, and it's worth explaining precisely because
the failure mode is easy to misunderstand.

This app's own server code (`db/index.ts`) queries Postgres directly over
`DATABASE_URL`, authenticating as the `postgres` role — which owns every
table and bypasses Row Level Security entirely. That's correct and by
design. But Supabase *also* auto-exposes every table in the `public`
schema as a REST API (`https://<project>.supabase.co/rest/v1/<table>`),
reachable by anyone with the **public** anon key — the same key that ships
in the browser bundle as `NEXT_PUBLIC_SUPABASE_ANON_KEY`, on every
Supabase project, always. By default, Supabase grants the `anon` role
full `SELECT, INSERT, UPDATE, DELETE` on `public` tables. RLS is the
*only* thing that restricts that grant down to something safe — and RLS
has to be turned on per table; it isn't the default.

`customers`, `addresses`, and `orders` had RLS enabled from day 9
(select-own policies). `products`, `product_variants`, `order_items`,
`customization_requests`, and `webhook_events` did not — some by
oversight, and one (`customization_requests`) by an explicit but wrong
comment in the original schema arguing RLS wasn't needed because "only
admin (service role key) ever reads this table." That reasoning
conflates *how the app happens to access a table* with *what's actually
enforceable* — the anon key access path exists regardless of whether the
app ever uses it.

**Verified live, not assumed:** queried every table via the real anon key
against the real project.

- `webhook_events` was already leaking a real row (a leftover from day 10
  testing that was never cleaned up) — full Razorpay payment IDs, order
  IDs, and amounts, to an unauthenticated request.
- `orders`, `customers`, `addresses`, `order_items`, and
  `customization_requests` all came back empty — but only because those
  tables happened to have no data in them at the time, not because
  access was blocked. Proved the difference precisely: inserted one real
  order + order_item directly, then queried both `orders` (RLS on) and
  `order_items` (RLS off) via the anon key. `orders` correctly stayed
  empty. `order_items` returned the row in full — name, size, SKU,
  price, order ID — to a request with no login at all.
- Checked write access too, via `information_schema.role_table_grants`
  rather than risking a live destructive test: `anon` had
  `DELETE, INSERT, UPDATE` on **every** table in the schema, including
  `products`. Confirmed this was real by attempting to `PATCH` a live
  product's price via the anon key straight after the fix — got a
  `204`, then checked the actual row in the database: price unchanged.
  RLS silently rejected the write. (Before the fix, this same request
  would have actually changed the price — this wasn't tested against
  the pre-fix state on purpose, to avoid actually vandalising real data
  during the audit.)

**Fix** (`db/schema.ts`, migration
`drizzle/0004_enable_rls_public_tables.sql`): RLS enabled on all five
tables.

- `products` / `product_variants` — public `SELECT` policy (the
  storefront catalog is meant to be public; `products`' policy is scoped
  to `is_active = true` so a direct API call can't see inactive/draft
  products either, matching the app's own `getActiveProducts` filter).
  No write policies — `INSERT`/`UPDATE`/`DELETE` now fully blocked for
  `anon`/`authenticated`.
- `order_items`, `customization_requests`, `webhook_events` — RLS
  enabled with **zero** policies. Nothing in this app's own code ever
  reads or writes these through Supabase's client-side API; every access
  goes through the server's `postgres`-role connection, which isn't
  affected by RLS at all. Full lock is the correct default, not an
  oversight to revisit later.

Re-verified all of the above after the fix: catalog still publicly
readable, every write attempt via the anon key rejected, all four
previously-open tables now return nothing to an anonymous request. Then
ran one complete real order through checkout → webhook → `paid` to
confirm the app's *own* writes — which go through a different DB role —
were completely unaffected by any of this. They were: order created,
webhook verified and processed, status flipped to `paid`, all exactly as
before.

## CSV/formula injection in the admin export

`GET /api/admin/orders/export` (day 10) escaped commas, quotes, and
newlines correctly, but not a leading `=`, `+`, `-`, or `@`. Every field
going into that CSV — shipping name, address lines, city, state — is
free-text from checkout with no character restriction beyond length
(`lib/validation/checkout.ts`). A customer named `=HYPERLINK("http://
evil.example","x")` (a real, working formula in Excel/Sheets/LibreOffice)
would execute the moment an admin opened the exported file — a known
vulnerability class, CWE-1236.

Fixed by prefixing any such field with a leading `'` before the existing
quote-escaping — neutralises the formula in every major spreadsheet app,
leaves the visible text unchanged for a human reading the file. Standard
OWASP-recommended mitigation, not a custom one.

## Content-Security-Policy + other security headers

There was no CSP and no other security headers at all before this pass.
Added:

- `next.config.ts` — static headers on every response:
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` denying camera/mic/geolocation (none are used),
  `Strict-Transport-Security`.
- `middleware.ts` — a real CSP, generated fresh per request with a
  nonce, following Next's own documented App Router pattern rather than
  falling back to `'unsafe-inline'` for scripts (which would have been
  simpler but meaningfully weaker). `script-src` uses the nonce plus
  `'strict-dynamic'`, which is what actually lets Razorpay's
  `checkout.js` inject whatever it needs internally for the payment
  widget without hand-maintaining an allowlist of every Razorpay
  subdomain it might touch.

Two real bugs surfaced while getting this working, both caught by
actually running a production build rather than trusting the code:

1. `Buffer.from(...).toString("base64")` for the nonce threw `EvalError:
   Code generation from strings disallowed for this context` — Node's
   `Buffer` polyfill in the Edge Runtime middleware sandbox hits a
   restriction against dynamic code generation. Fixed with `btoa()`, a
   native Web API with no polyfill involved.
2. `app/checkout/page.tsx` was a single `"use client"` file, but reading
   the nonce requires `headers()`, which only works in a Server
   Component. Split it: `app/checkout/page.tsx` is now a thin Server
   Component that reads the nonce and passes it down;
   `components/checkout/checkout-page-client.tsx` holds everything that
   actually needs `useCart()`, and passes the nonce explicitly to the
   Razorpay `<Script>` tag rather than relying on undocumented automatic
   propagation for anything business-critical.

Verified: real production build, real production server (not dev mode —
first attempt accidentally checked against a stale leftover `next dev`
process still holding port 3000, caught by comparing its headers against
what the code should produce and re-checking after actually killing it).
CSP header present and correct on every route, nonce value in the
rendered HTML matches the header's nonce, full route sweep of all 20+
pages still `200`, and the same real checkout → webhook → paid flow run
again post-CSP to confirm nothing broke.

**What I can't verify myself:** whether Razorpay's checkout widget
actually renders without a console CSP violation when a real person
clicks "Pay" — that only happens client-side in a real browser, and I
have no way to read a browser's console output. Please open `/checkout`
for real, add something to cart, and watch DevTools → Console when you
click through to payment. If anything gets blocked, it'll show as a CSP
violation there and is very likely a one-line addition to `middleware.ts`'s
`buildCsp()` to fix (a Razorpay subdomain not covered by the
`https://*.razorpay.com` wildcard, most likely).

## Dependency vulnerabilities (`npm audit`)

7 findings, all in dependencies-of-dependencies, not this project's own
code:

- **3 high** — `postcss` and `sharp`, both nested inside Next.js's own
  dependency tree. The suggested fix is a **major version bump to Next
  16** (`npm audit fix --force`), which I did not do — that's a breaking
  change to the framework this entire app is built against, and not
  something to do unilaterally days before a planned launch. Practical
  risk assessment: the `postcss` XSS/file-read issues require
  runtime-processed, attacker-influenced CSS or source maps — this app's
  CSS is Tailwind, compiled once at build time, not processed per-request
  with any user input. The `sharp`/`libvips` CVEs matter most when an
  app processes untrusted, user-uploaded images — this app has no upload
  feature; every image `next/image` touches is a developer-controlled
  file in `/public/products`. Real exposure is low given how this app
  actually uses these libraries, but it's a real advisory and worth
  revisiting with a proper regression pass whenever a Next 16 upgrade is
  actually on the table.
- **4 moderate** — `esbuild` (via `drizzle-kit`), dev-tooling only, never
  ships in the production bundle. The specific issue is that `esbuild`'s
  dev server accepts requests from any origin — only exploitable while
  physically running `drizzle-kit`'s dev tooling locally, not in
  production.

## What's deliberately not covered by this pass

- **Rate limiting** — login, registration, checkout, and `/track-order`
  have no rate limiting beyond Supabase Auth's own built-in limits on
  its endpoints. Adding real rate limiting (e.g. via Upstash/Vercel KV)
  is new infrastructure and a real decision, not something to add
  silently inside a security pass — flagging it here rather than either
  ignoring it or unilaterally standing up a new external service.
- **CSP verified structurally, not by watching a real browser's console**
  — see above.
- `/cart` and `/checkout` still don't have their own `noindex` metadata
  (both are `"use client"`, and `metadata` exports require a Server
  Component) — pre-existing gap noted in `docs/DAY-11-NOTES.md`,
  `robots.ts` already disallows both paths from being crawled either
  way.

## Verified against the real project, end to end

- Live anon-key tests against every table, both before and after the
  RLS fix (documented above).
- `information_schema.role_table_grants` checked directly rather than
  inferred.
- A full real order — checkout → signed webhook → `paid` — run twice:
  once as a baseline regression check after the RLS fix, once again
  after the CSP/header changes. Both times, real test data was deleted
  and the database confirmed empty of test rows afterward.
- `tsc --noEmit`, `eslint .`, and `next build` all clean on every change
  in this pass.
- Every route on the site (20+) hit directly against a real, running
  production build and confirmed `200`.
