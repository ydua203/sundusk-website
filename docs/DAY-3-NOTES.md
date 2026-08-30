# Day 3 — build notes

## What was built

Product card, product grid, `/shop`, `/collections/tops`, dresses
coming-soon (spec section 12, day 3).

- [lib/products.ts](../lib/products.ts) — `getActiveProducts(category?)`,
  a plain Drizzle `select` (not the relational query API — no joins are
  needed yet) filtered to `is_active = true` and ordered by `sort_order`.
- [lib/money.ts](../lib/money.ts) — `formatPaise()`, `Intl.NumberFormat`
  in `en-IN`. This is the *only* place paise gets turned into a `₹` string
  anywhere in the app so far.
- [components/product/product-card.tsx](../components/product/product-card.tsx),
  [product-grid.tsx](../components/product/product-grid.tsx) — image, name,
  price, nothing else. No "unique piece," no struck-through compare-at
  price, no stock badge — spec section 1's hard rules apply everywhere a
  product appears, not just its own page.
- `/shop`, `/collections/tops` — both `export const dynamic =
  "force-dynamic"` and both confirmed in the build output as `ƒ (Dynamic)`,
  not `○ (Static)`. This matters: without it, Next may prerender these at
  build time and serve stale prices/stock from that point forward — a
  correctness issue, not a style one, given this becomes real inventory
  data. `loading.tsx` skeletons ship for both.
- `/collections/dresses` — static, no DB call, no product grid (spec
  section 9 is explicit: "coming soon, no product grid"). Confirmed 0 KB
  of product data in its response and confirmed `○ (Static)` in the build
  output.
- [app/error.tsx](../app/error.tsx) — root error boundary. Catches a
  failed DB query (or anything else) anywhere below it while still
  rendering inside the header/footer chrome, with a retry button. This is
  the first day with a real async failure surface (the DB call), so it's
  the first day this was needed.

### Why product images are a styled placeholder, not `next/image`

The seed data (day 1) already points every product at
`/products/{slug}/1.jpg` etc., but those files don't exist — real
photography is day 12. Pointing `next/image` at a non-existent local file
doesn't fail the build (the path is a runtime string, not statically
analysable), it just 404s in the browser as a broken-image icon on every
single product, on every page, for the next nine days.

[product-image-placeholder.tsx](../components/product/product-image-placeholder.tsx)
is a flat cream box at the same 4:5 ratio the real photos will be, showing
the product name. Day 12 swaps it for `next/image` reading `product.images`
— nothing else about the card changes, and there's no layout shift because
the aspect ratio is already correct today.

## What you should check

```bash
npm run dev
```

- `/shop` — all 6 seeded products, correct prices (₹1,499 / ₹1,799 /
  ₹1,299 / ₹1,699 / ₹799 / ₹899), "6 pieces, sizes XS–XL."
- `/collections/tops` — same 6 (all are tops today), same count line.
- `/collections/dresses` — "Coming soon" and a "Shop tops" button.
  **No product cards, no prices, no product names anywhere in the page
  source** — view source and confirm.
- Click a product card — you'll land on Next's default 404 page. Expected:
  `/products/[slug]` is day 4.
- At 375px: grid should be 2 columns. Widens to 3 at `sm:`, 4 at `lg:`.
- To see `app/error.tsx` fire for real: temporarily rename `DATABASE_URL`
  in `.env.local` to something invalid, restart `npm run dev`, and load
  `/shop` — you should get the branded "Something went wrong" page with a
  working "Try again" button, still inside the header/footer, not a raw
  Next.js crash screen. Put the real value back afterward.

## Next up

Day 4 (spec section 12): product detail page — gallery, size selector as
pills, size-guide link, accordions.
