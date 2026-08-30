# Day 11 — build notes

## What was built

Static pages, SEO metadata, sitemap, robots, OG image, 404 (spec section
12, day 11) — plus the real homepage, which the spec's build order never
explicitly scheduled a day for (see the note in `CLAUDE.md`'s build log)
and was actually built a day earlier than this, on request, once the
day-1 placeholder had been sitting there long enough to look unfinished.

**Static pages** — nine new routes, all under [app/](../app/):
- `/shipping`, `/returns`, `/terms`, `/privacy`, `/contact` — rendered
  **verbatim** from spec section 10A, as instructed. `[DATE]`,
  `[PROPRIETORSHIP NAME]`, and `[GRIEVANCE OFFICER NAME]` stay visible
  bracketed placeholders (now centralised in
  [lib/legal.ts](../lib/legal.ts) rather than copy-pasted per page —
  `footer.tsx`'s own copy of `LEGAL_ENTITY_NAME` was folded into this too,
  so there's one place to update when the real entity is confirmed, not
  six). `/shipping`'s flat rate is the one exception to "verbatim
  bracket": checkout already charges a real ₹79 placeholder
  (`lib/shipping.ts`), so showing customers a literal `[AMOUNT]` would be
  broken, not cautious — the page shows the real configured number and
  the TODO lives in the code next to the constant that actually drives
  both surfaces.
- `/size-guide` — the exact XS–XL measurement table from spec section 10,
  how-to-measure instructions, a "between sizes" note, and a WhatsApp CTA.
  States plainly that the range is XS to XL, no "for every body" framing
  (hard rule 1). The `Find your size →` link on every product page (day
  4) has pointed here since it was written — this is the first day it
  resolves to something real instead of a 404.
- `/about`, `/faq` — new copy, not in the spec verbatim. Kept to facts
  already established elsewhere on the site (sizing, no exchanges, GST-
  inclusive pricing, prepaid-only) rather than inventing anything new —
  an FAQ is the easiest page on a site to accidentally contradict a real
  policy on, so every answer here was checked against the page it
  restates, not written from scratch.
- `/track-order` — genuinely new functionality, not just copy. See below.

**`/track-order`** — a guest order lookup, gated by the order's own
email. This is the real fix for a gap flagged back in
[docs/DAY-7-NOTES.md](DAY-7-NOTES.md): `/order/[orderNumber]` has no auth
check and order numbers are sequential (`SD1001`, `SD1002`, ...), so it
was never meant to be a general "look up any order" surface — it only
works today because it's not linked from anywhere crawlable. The new
`POST /api/track-order` requires the order's email to match, and —
important — returns the **identical generic error** whether the order
number doesn't exist or the email just doesn't match it. Telling those
two cases apart would let someone incrementally guess which order
numbers are real. Verified this directly: correct email returns the full
order, wrong email and a nonexistent order number both come back with
the same 404 and message.

While building this, `OrderStatusView` (shared by `/order/[orderNumber]`,
`/account/orders/[orderNumber]`, and now `/track-order`) got a real gap
closed too: it already had `shipped` and `delivered` order statuses
falling through to a generic capitalised heading with no courier or
tracking number shown — which defeats the entire purpose of a tracking
page. It now shows the courier name and tracking number once an order
has shipped.

**SEO infrastructure:**
- [app/sitemap.ts](../app/sitemap.ts) — every public static route plus
  every active product page, generated from the same `getActiveProducts`
  query the storefront itself uses (so a deactivated product silently
  disappears from the sitemap too, not just the grid). Deliberately
  excludes `/account/*`, `/admin/*`, `/order/[orderNumber]`,
  `/cart`, `/checkout` — auth-gated or already-noindex pages have no
  business being offered to a crawler.
- [app/robots.ts](../app/robots.ts) — disallows the same private/
  transactional paths, points at the sitemap. Belt-and-braces alongside
  the per-page `noindex` metadata that already existed on
  `/order/[orderNumber]`, not a replacement for it.
- [app/opengraph-image.tsx](../app/opengraph-image.tsx) — a generated
  1200×630 share-card image (brand colours, wordmark, no external font
  fetch — kept dependency-free) that every page inherits unless it
  defines its own.
- [app/not-found.tsx](../app/not-found.tsx) — branded 404, matches the
  rest of the site's copy voice instead of Next's default page.
- `metadataBase` added to the root layout — without it, the OG image's
  relative URL wouldn't resolve to anything a social platform could
  actually fetch. Did **not** add a title template (`"%s | Sundusk"`):
  every existing page already sets its own full `"X | Sundusk"` string,
  and a template would have doubled up on top of that rather than
  composed with it — checked this before adding it, not after.

**The real homepage** — replaces the day-1 fonts/palette placeholder.
Hero (real product photography, not a placeholder swatch grid), the full
6-product catalogue, an editorial section that turns two of the hard
rules (no one-of-a-kind claims, no size-inclusivity overclaim) into
actual brand voice, and a trust-signals strip with nothing fabricated.
One real bug from this while researching hero copy, unrelated to the
homepage itself: the product **descriptions** (not just the cover
photos, which were already fixed) for Black Lace Polka Dot Top and White
Polka Dot Top were swapped in the live database — found by reading
`db/seed.ts` for hero-image research, confirmed against the live DB, and
fixed in both places. See `docs/PRODUCT-PHOTOS-NOTES.md`'s 2026-08-27
update for the fuller story of how that swap happened in the first
place.

## What's deliberately not built

- `/cart` and `/checkout` don't have `noindex` metadata — both are
  `"use client"` components, and `metadata` exports only work from
  Server Components. Fixing this properly means splitting each into a
  server wrapper + client component, which felt like real churn for
  marginal benefit given `robots.ts` already disallows both paths from
  being crawled. Flagging the gap rather than silently leaving it
  unmentioned.
- No custom font in the OG image — satori (what `next/og`'s
  `ImageResponse` uses) needs a font file fetched and embedded to render
  anything but its built-in fallback, and brand colours + a plain
  wordmark were judged enough to look distinctly Sundusk in a link
  preview without that dependency.
- `/faq` and `/about` are original copy, not spec-verbatim — flagging
  this explicitly since almost everything else on the site so far has
  either come straight from the spec or from real product data. If
  either reads wrong for the brand, it's the one page this week you
  should actually read closely rather than skim.

## Verified

- `tsc --noEmit`, `eslint .`, and a full `next build` are all clean —
  the build's route table shows every new static page, plus
  `/sitemap.xml`, `/robots.txt`, and `/opengraph-image` registered
  correctly.
- Every new route hit directly against the real dev server: all nine
  static pages return `200`, an unmapped URL returns `404` and renders
  the branded not-found page, `/sitemap.xml` and `/robots.txt` both
  return real, well-formed content.
- `/track-order` exercised against a real order row (inserted directly,
  not through full checkout — checkout and the webhook path were already
  verified on days 6 and 7, this was specifically testing the new lookup
  and auth logic): correct email returns the full order including
  courier/tracking; wrong email and a nonexistent order number both
  return the same generic 404. Test order deleted afterward, confirmed
  zero orders left in the table.

## What you should check

```bash
npm run dev
```

- Walk the footer links — `/size-guide`, `/shipping`, `/returns`,
  `/faq`, `/contact`, `/privacy`, `/terms`, `/track-order` — all of them
  were dead links until today.
- Read `/about` and `/faq` specifically — these are the two pages this
  week with copy I wrote rather than copy the spec or you gave me.
- `/track-order` needs a real order to test against — place one for real
  (or reuse a test one) and try the wrong email on purpose to confirm it
  fails the same way a nonexistent order number does.

## Day 12 — what's next, and what needs you directly

Day 12 per the spec: real photos (already done, days 8–9), live Razorpay
keys, one real ₹ payment and refund, a mobile pass on a real phone,
Lighthouse, deploy.

Live keys are in progress — you're generating them in the Razorpay
dashboard now. The rest of day 12 isn't code I can run for you: a real
payment needs your actual card and actual money, a mobile pass needs a
real phone in your hand, and a deploy needs your Vercel account. Once the
live keys are in `.env.local`, tell me and we can figure out together
which of those you want to do next and what, if anything, I can prep on
the code side first (a pre-deploy checklist, a Lighthouse pass against
the local build, etc.).
