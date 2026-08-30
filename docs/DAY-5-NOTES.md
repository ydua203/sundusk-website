# Day 5 — build notes

## What was built

Cart: context + localStorage, cart page, quantity, remove, totals (spec
section 12, day 5).

- [context/cart-context.tsx](../context/cart-context.tsx) — React context +
  `useState`, not Zustand/Redux (spec section 2 rules those out explicitly
  for the cart). Persists to `localStorage` under `sundusk-cart-v1`.
  Hydrates from storage in a `useEffect` *after* mount, not during the
  initial render — `localStorage` doesn't exist during SSR, and reading it
  synchronously would make the server-rendered HTML disagree with the
  client's first paint (a hydration mismatch). Exposes `isHydrated` so
  pages can avoid showing "cart is empty" for a frame before a real,
  previously-saved cart has loaded.
- `/cart` — line items with a quantity stepper and a separate explicit
  "Remove" action (deliberately two different controls, not one — dragging
  quantity down to 0 silently removing the line would be a surprising way
  to lose an item), an order summary, and a real empty-cart state.
- The PDP's `SizeSelector` (day 4) is now **controlled** (`value`/`onChange`
  props) instead of managing its own state — a parent needs to know the
  selected size to enable "Add to cart" and know which variant to add.
  [add-to-cart-section.tsx](../components/product/add-to-cart-section.tsx)
  is that parent: size selector + the notices + the button, disabled until
  a size is picked, briefly showing "Added ✓" after a click.
- The header's cart icon ([cart-link.tsx](../components/layout/cart-link.tsx))
  is now a small client island showing a live item-count badge — the rest
  of the header stays a Server Component.

## What you should check

```bash
npm run dev
```

- Add a size + item on `/products/terra-wrap-top` — button goes from
  disabled to enabled once you pick a size, shows "Added ✓" briefly, and
  the header cart badge appears with the right count.
- `/cart` — quantity +/− (− disables at 1, doesn't silently remove),
  "Remove" actually removes the line, subtotal updates live.
- Reload the page — the cart survives (localStorage). Open DevTools →
  Application → Local Storage → `sundusk-cart-v1` to see the raw JSON.
- Empty the cart — `/cart` shows the empty state with a link back to
  `/shop`.

## Next up

Day 6: checkout form + `/api/checkout` — see docs/DAY-6-NOTES.md (built in
the same session as this one).
