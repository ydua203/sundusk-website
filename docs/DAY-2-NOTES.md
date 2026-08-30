# Day 2 — build notes

## What was built

Layout shell (spec section 12, day 2): header, nav, footer, mobile menu,
section primitives.

- [components/layout/container.tsx](../components/layout/container.tsx) —
  max-width + gutter primitive, mobile-first padding (tight at 375px, opens
  up at `sm:`).
- [components/layout/section.tsx](../components/layout/section.tsx) — the
  `tone="sand" | "cream"` vertical-rhythm primitive from spec section 3
  ("section rhythm alternates sand → sand → cream → sand"). Wraps its
  children in `Container` by default; pass `noContainer` for a full-bleed
  section.
- [components/layout/header.tsx](../components/layout/header.tsx) — sticky
  top bar: hamburger (mobile only) + wordmark + desktop nav on the left,
  account/cart icon links on the right.
- [components/layout/mobile-nav.tsx](../components/layout/mobile-nav.tsx) —
  the hamburger's full-screen nav panel, `'use client'` since it's the one
  genuinely interactive piece. Traps Tab focus in the panel while open,
  closes on Escape or on route change, returns focus to the trigger button
  on close, locks body scroll while open. This is the primary nav surface
  for most visitors — 85%+ of traffic is phones (spec section 1).
- [components/layout/footer.tsx](../components/layout/footer.tsx) — legal
  entity name, address, GSTIN, phone, email, WhatsApp, Instagram, and every
  policy link, on an espresso background (spec section 3 names "buttons,
  footer" as espresso's designated background uses, alongside sand/cream —
  so this isn't a fourth background, it's the one the token was defined for).
- [components/icons.tsx](../components/icons.tsx) — five inline SVGs (cart,
  user, menu, close, Instagram), square-capped strokes to match the sharp,
  flat aesthetic. No icon library added — spec section 2 names what's
  allowed to be installed and an icon package isn't on it, and five glyphs
  isn't worth a dependency.
- [lib/nav-links.ts](../lib/nav-links.ts) — the nav link lists, shared by
  header, mobile menu, and footer so they can't drift apart.
- `app/layout.tsx` now renders `<Header />` / `<main id="main-content">` /
  `<Footer />` around every page, plus a "Skip to content" link that's
  visually hidden until focused (keyboard nav requirement, spec section 13).
- `app/page.tsx` (still the day-1 diagnostic page, not the real homepage)
  now runs through `Section`/`Container` instead of raw divs, so the
  primitives are proven working, not just written.

### One placeholder left deliberately visible

The footer's legal entity name renders literally as `[PROPRIETORSHIP NAME]`
— spec section 1 says a Pvt Ltd registration is in progress but not yet
holding the GSTIN, so the sole-proprietorship name that does hold it isn't
confirmed yet. Section 10A's rule for the policy pages ("leave brackets
visible... so it cannot ship unfilled") applies just as much to the footer,
since it's a legal reference too. Search the codebase for
`LEGAL_ENTITY_NAME` when the real name is confirmed — it's one `const` in
`footer.tsx`, nothing else references it yet.

## What you should check

```bash
npm run dev
```

Open `http://localhost:3000`:

- **Desktop width (≥768px):** header shows the Sundusk wordmark, then Shop
  / Tops / Dresses / About inline, then account and cart icons on the
  right. No hamburger visible.
- **Narrow the window below 768px (or open DevTools device toolbar at
  375px):** the inline nav disappears, a hamburger appears on the left.
  Click it — a full-screen panel should slide in with large nav links,
  account/cart at the bottom, and a close (×) button. Page scroll should be
  locked while it's open.
- **Keyboard:** with the panel open, press Tab repeatedly — focus should
  cycle through the panel's links/buttons only, never escape to content
  behind it. Press Escape — panel closes, focus returns to the hamburger
  button (you should see the focus ring land back on it).
- **Footer**, any page width: Sundusk wordmark, `[PROPRIETORSHIP NAME]`
  placeholder + address + GSTIN, a Help column with all 8 policy links, a
  Contact column (email/phone/WhatsApp), and an Instagram link.
- Click any footer or header link that isn't `/` — you'll get Next's
  default 404 page. **Expected** — those routes (`/shop`, `/about`, etc.)
  are days 3+ work, not built yet.
- Tab to the very first thing on the page before anything else — a "Skip
  to content" link should appear (top-left, espresso background); pressing
  Enter should jump focus past the header to the main content.

## Next up

Day 3 (spec section 12): product card, product grid, `/shop`,
`/collections/tops`, dresses coming-soon.
