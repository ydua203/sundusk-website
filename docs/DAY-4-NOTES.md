# Day 4 — build notes

## What was built

Product detail page: gallery, size selector as pills, size-guide link,
accordions (spec section 12, day 4).

- [lib/products.ts](../lib/products.ts) — `getProductBySlug()`, product +
  its variants in two plain queries (no relations config needed for a
  single join this simple), variants sorted XS→XL explicitly since
  alphabetical order would put L before S.
- [lib/sizes.ts](../lib/sizes.ts) — `SIZES` (the canonical XS→XL order)
  and `SIZE_GUIDE` (spec section 10's exact table), shared so the size
  selector and the future `/size-guide` page never disagree.
- [components/product/product-gallery.tsx](../components/product/product-gallery.tsx)
  — main frame + numbered thumbnail strip, `'use client'` for the active-index
  state. Same placeholder-box approach as the grid (day 3) — swaps to
  `next/image` on day 12.
- [components/product/size-selector.tsx](../components/product/size-selector.tsx)
  — pills, not a dropdown, per the spec's explicit instruction. Built on
  **native radio inputs** (visually hidden via `sr-only`) with styled
  `<label>`s, not custom buttons with hand-rolled ARIA — real keyboard
  navigation and screen-reader semantics come from the browser for free.
  Sold-out sizes (`stock <= 0`) render struck-through and disabled — real
  inventory state, which spec section 1 doesn't forbid (only *fabricated*
  scarcity is banned).
- [components/product/size-notices.tsx](../components/product/size-notices.tsx)
  — the verbatim copy from spec section 10A, directly under the selector:
  "Find your size →", the no-exchanges line, the WhatsApp line.
- [components/product/accordion-item.tsx](../components/product/accordion-item.tsx)
  — native `<details>`/`<summary>`, not a client-side accordion. Toggle,
  keyboard support, and screen-reader semantics all come from the browser,
  so this stays a Server Component (spec section 13: client components
  only where interactivity actually demands it — a disclosure widget
  doesn't). Three items — Fabric, Fit, Care — mapped straight from the
  three separate DB columns, each only rendered if that column has data.
- `/products/[slug]` — `force-dynamic` like `/shop` and `/collections/tops`
  (day 3), `notFound()` for an inactive or nonexistent slug.

### A real bug caught and fixed today: `notFound()` returning HTTP 200

First pass shipped a `loading.tsx` for this route, same pattern as day 3's
`/shop` and `/collections/tops`. Testing `curl -i` against a nonexistent
slug showed the *page content* correctly rendered "This page could not be
found" — but the **HTTP status code was 200, not 404**.

Cause: a `loading.tsx` file makes Next wrap the page in a `<Suspense>`
boundary and start streaming the response shell immediately. By the time
the async Server Component actually runs the DB query and calls
`notFound()`, the response headers — including the 200 status — are
already committed; a status code can't change after the first byte is
sent. The *content* is right, but a real crawler, uptime monitor, or
`curl -o /dev/null -w '%{http_code}'` check would report the page as
live when it isn't. That's a genuine SEO/correctness bug, not a cosmetic
one, so `app/products/[slug]/loading.tsx` was removed rather than kept —
this route no longer shows a skeleton while loading, it blocks until the
query resolves and returns the correct status. `/shop` and
`/collections/tops` keep their `loading.tsx` — neither ever calls
`notFound()`, so this failure mode doesn't apply to them.

Verified with real requests, not just reasoning about it: reproduced the
200-with-404-content bug, removed the file, re-tested — `curl -o /dev/null
-w '%{http_code}' .../products/does-not-exist` now correctly returns `404`.

## What you should check

```bash
npm run dev
```

- `/products/terra-wrap-top` — gallery frame reading "photo 1 of 6" with 6
  numbered thumbnails below; click a thumbnail, the main frame updates.
- Size row shows XS/S/M/L/XL as pills. Click one — it fills espresso/cream.
  Tab to a pill with the keyboard — you should see a visible focus ring
  even though the actual focused element (the radio input) is invisible.
- Directly under the pills: "Find your size →" (links to `/size-guide` —
  404 for now, that page is day 11), the no-exchanges line, the WhatsApp
  line.
- Fabric / Fit / Care accordions — click a heading, it expands, the `+`
  rotates into a `×`. No JavaScript framework involved; try it with JS
  disabled in DevTools and it still works (native `<details>`).
- `/products/does-not-exist` — confirm both the content *and* the status
  code: `curl -s -o /dev/null -w '%{http_code}\n'
  http://localhost:3000/products/does-not-exist` should print `404`.

## Next up

Day 5 (spec section 12): cart — context + localStorage, cart page,
quantity, remove, totals. This is also where an "Add to cart" button
lands on the product page you just built — it doesn't exist yet today,
deliberately: there's no cart to add to until day 5 builds it, and a
button that's visually present but silently does nothing on click would
be worse than not having it yet.
