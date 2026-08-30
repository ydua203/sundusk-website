# SUNDUSK — BUILD SPEC FOR CLAUDE CODE

Paste this whole file into Claude Code as project context at the start of every session, or save it as `CLAUDE.md` in the repo root so it loads automatically.

---

## 0. WHO YOU ARE BUILDING FOR

I am a DevOps engineer, comfortable with terminals and Git, new to Next.js app-router specifics. Explain *why* when you make an architectural choice. Do not ask permission for every file — write the whole feature, then tell me what to run and what to check.

Build one feature at a time in the order in section 12. Do not scaffold everything at once.

---

## 1. THE PRODUCT

**Sundusk** — a direct-to-consumer women's fashion storefront for the Indian market.

- Trading name: Sundusk
- Legal entity: **[PROPRIETORSHIP NAME]**, a sole proprietorship
  (a Private Limited registration is in progress; until it completes, every
  legal reference on the site — footer, terms, invoices, policies — must name
  the proprietorship that holds the GSTIN below. Do not write "Nuvara Apparel
  Private Limited" anywhere until that entity exists and holds its own GSTIN.)
- Registered address: D-43 Mahendru Enclave, near Model Town 3, Delhi 110033
- GSTIN: 07AWDPS0826R1ZY
- Support email (replies go here): hellosundusk.in@gmail.com
- Support phone / WhatsApp: +91 93101 13431
- Jurisdiction for disputes: Delhi
- Launch: 1 September 2026
- 6 products at launch. Tops only. Dresses category exists but shows "Coming soon".
- Sizes XS–XL. One colourway per product. Price band ₹700–₹1,800.
- Prepaid only via Razorpay. **No cash on delivery, anywhere, ever.**
- Own courier partner — no Shiprocket or courier API integration. Admin enters a tracking number and courier name manually.

### Hard rules — never violate these in code or copy

1. **Never claim general size inclusivity.** Standard stock runs XS–XL only — no "for every body", no "all sizes", no plus-size language. Custom, made-to-order sizing beyond XL is a distinct paid service (see `/custom-fit`, added after this spec was written — docs/PROMO-AND-CUSTOM-FIT-NOTES.md) and may be mentioned factually on product pages ("need a size beyond XL? custom sizing available on request"). Never frame it as the standard range being larger than it is, and never use inclusivity language ("we fit every body") to describe it — it's a bespoke request process, not a size offering.
2. **Never claim products are unique or one-of-a-kind.** Designs repeat across customers.
3. **Never mention cash on delivery or free returns.** Returns are size-exchange only, customer pays return shipping.
4. **No fake urgency.** No countdown timers, no "12 people viewing", no fabricated stock scarcity, no struck-through compare-at prices.
5. **Mobile first.** 85%+ of traffic is phones. Every component is designed at 375px first.

---

## 2. STACK

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript, strict mode |
| Styling | Tailwind CSS v4 |
| Database | Supabase Postgres, accessed via Drizzle ORM |
| Auth | Supabase Auth (email + password) |
| Payments | Razorpay Standard Checkout |
| Email | Resend + React Email |
| Images | Local files in `/public/products`, served through `next/image` |
| Validation | Zod on every API route input |
| Hosting | Vercel |

### Why local images rather than a CDN bucket

With 6 products and roughly 36 photos, files in `/public` are served from Vercel's edge CDN, optimised by `next/image`, cached immutably, and cost nothing. A storage bucket adds a network hop, a signed-URL layer, and configuration for no gain at this size. Revisit past ~50 products.

Store as `/public/products/{slug}/{1..6}.jpg`. Source images 2048×2560 (4:5). Never break the 4:5 ratio — mixed aspect ratios are the single thing that makes a fashion store look amateur.

### Do NOT install

Redux, Zustand for cart (use React context + localStorage), any UI kit beyond shadcn/ui primitives, any analytics beyond GA4, any animation library beyond CSS transitions.

---

## 3. DESIGN SYSTEM

Define these in `app/globals.css` as Tailwind v4 `@theme` tokens.

```
--color-sand:     #FBF2E4   /* page background, default */
--color-cream:    #FFE7C3   /* alternating sections */
--color-espresso: #3C1800   /* text, buttons, footer */
--color-terra:    #B5622F   /* accent — badges, hover states only */
--color-line:     #E4D3B8   /* borders, dividers */
--color-muted:    #A98A68   /* placeholder text, meta */
```

Fonts via `next/font/google`:
- Display / headings: **Fraunces**, weights 400/600/700, optical sizing on
- Body / UI: **Hanken Grotesk**, weights 300/400/500/600

Rules:
- **Three colours on screen at any time.** Terracotta is an accent, not a fourth background.
- Border radius **0px** everywhere. Sharp corners read editorial; rounded reads generic SaaS.
- No box shadows. Flat surfaces on sand.
- Buttons: espresso background, cream label, uppercase, `letter-spacing: 0.14em`, hover to terracotta.
- Generous vertical whitespace. It is the cheapest luxury signal available.
- Section rhythm alternates sand → sand → cream → sand so the page breathes.

Aesthetic target: sun-faded, warm, editorial. Deliberately **not** generic boho cream-and-terracotta — no mandalas, no script fonts, no "wanderlust".

Voice: confident, warm, lightly witty. A stylish friend, never preachy, never over-claiming.

---

## 4. ENVIRONMENT VARIABLES

Create `.env.local`. Never commit it. Add `.env.local` to `.gitignore` in the first commit.

```bash
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# --- Razorpay ---
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# --- Resend ---
RESEND_API_KEY=
EMAIL_FROM="Sundusk <hello@sundusk.in>"
EMAIL_REPLY_TO=hellosundusk.in@gmail.com

# --- App ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=email1@example.com,email2@example.com
```

### How to get the Supabase values

1. Go to supabase.com, create a project. Pick region **Mumbai (ap-south-1)** — closest to your customers, meaningfully lower latency than the default US region.
2. Set a strong database password when prompted and save it in a password manager. You cannot view it again.
3. **Project Settings → API** gives you:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never expose to the browser)
4. **Project Settings → Database → Connection string → URI**, and switch the toggle to **Transaction pooler** (port 6543). Copy it and replace `[YOUR-PASSWORD]` with the password from step 2. That is `DATABASE_URL`.

Use the pooler, not the direct connection on port 5432. Vercel serverless functions open a new connection per invocation and will exhaust a direct Postgres connection limit under any real traffic.

Append `?sslmode=require` if Drizzle complains about SSL.

### Razorpay values

Dashboard → Settings → API Keys → Generate. The secret is shown once. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the same value as `RAZORPAY_KEY_ID` — the key ID is safe in the browser, the secret never is.

Webhook secret comes from Dashboard → Settings → Webhooks when you create the webhook (see section 7).

Test keys are fine for the whole build. Swap to live keys only at launch, and re-run one real payment.

### Resend

`hello@sundusk.in` must be a verified domain sender in Resend. **A Gmail address cannot be used as the from address** — Resend only sends from domains you have verified with SPF, DKIM and DMARC records. Verify the domain first; DNS propagation can take a few hours, so do this on day one.

---

## 5. DATABASE SCHEMA

Drizzle, in `db/schema.ts`. Generate and run migrations with `drizzle-kit`.

```
products
  id              uuid pk default gen_random_uuid()
  slug            text unique not null
  name            text not null
  description     text not null
  fabric          text
  fit             text
  care            text
  model_note      text            -- "Model is 5'6" and wears a size S"
  price_paise     integer not null    -- store money in paise, never floats
  category        text not null        -- 'tops' | 'dresses'
  weight_grams    integer not null default 250
  hsn_code        text
  images          jsonb not null       -- ["/products/terra-wrap-top/1.jpg", ...]
  is_active       boolean not null default true
  sort_order      integer not null default 0
  created_at      timestamptz not null default now()
  updated_at      timestamptz not null default now()

product_variants
  id              uuid pk
  product_id      uuid fk -> products.id on delete cascade
  size            text not null        -- 'XS' | 'S' | 'M' | 'L' | 'XL'
  sku             text unique not null -- 'SD-TWT-XS'
  stock           integer not null default 0
  unique (product_id, size)

customers
  id              uuid pk              -- matches Supabase auth.users.id
  email           text unique not null
  name            text
  phone           text
  created_at      timestamptz not null default now()

addresses
  id              uuid pk
  customer_id     uuid fk -> customers.id on delete cascade
  name            text not null
  phone           text not null
  line1           text not null
  line2           text
  city            text not null
  state           text not null
  pincode         text not null
  is_default      boolean not null default false

orders
  id              uuid pk
  order_number    text unique not null      -- 'SD1001', sequential
  customer_id     uuid fk -> customers.id nullable   -- null for guest checkout
  email           text not null
  phone           text not null
  status          text not null default 'pending'
  shipping_name   text not null
  shipping_line1  text not null
  shipping_line2  text
  shipping_city   text not null
  shipping_state  text not null
  shipping_pincode text not null
  subtotal_paise  integer not null
  shipping_paise  integer not null default 0
  gst_paise       integer not null
  total_paise     integer not null
  razorpay_order_id    text unique
  razorpay_payment_id  text unique         -- unique = idempotency guard
  courier_name    text
  tracking_number text
  admin_note      text
  created_at      timestamptz not null default now()
  updated_at      timestamptz not null default now()

order_items
  id              uuid pk
  order_id        uuid fk -> orders.id on delete cascade
  variant_id      uuid fk -> product_variants.id
  product_name    text not null      -- denormalised snapshot
  size            text not null
  sku             text not null
  unit_price_paise integer not null  -- price at time of order
  quantity        integer not null

webhook_events
  id              uuid pk
  razorpay_event_id text unique not null
  event_type      text not null
  payload         jsonb not null
  processed_at    timestamptz
  created_at      timestamptz not null default now()
```

### Non-negotiables

- **All money in paise as integers.** Never a float, never a decimal column. ₹1,499 is `149900`. Format for display only at the last moment.
- **Denormalise product name, size, SKU and price onto `order_items`.** If you edit a product later, historical orders must not silently change.
- `razorpay_payment_id` is `unique` — this is the database-level idempotency guard against duplicate webhook delivery.
- Enable **Row Level Security** on `customers`, `addresses` and `orders`. Customers may read only rows where the id matches `auth.uid()`. All writes go through server routes using the service role key.

---

## 6. ORDER STATE MACHINE

```
pending ──► paid ──► shipped ──► delivered
   │          │
   │          └──► refunded
   └──► cancelled
```

- `pending` — order row created, Razorpay order created, payment not yet confirmed
- `paid` — webhook verified the payment. **Stock decrements here, and only here.**
- `shipped` — admin has entered courier name and tracking number
- `delivered` — admin marks manually
- `cancelled` — admin cancels an unpaid or pre-dispatch order
- `refunded` — admin has refunded through the Razorpay dashboard and mirrored it here

Enforce transitions in a single function. Reject invalid jumps — `pending` must never go straight to `shipped`.

Order numbers: a Postgres sequence starting at 1001, formatted `SD{n}`. Do not generate them in application code — concurrent requests will collide.

---

## 7. RAZORPAY FLOW

This is the part that must be exactly right. Read it twice.

### Checkout

1. Client posts the cart to `POST /api/checkout`.
2. Server **recalculates every price from the database.** Never trust an amount sent by the client — that is the single most common payment vulnerability in e-commerce.
3. Server checks stock for every variant. If anything is short, return 409 with the affected items.
4. Server computes GST (see section 8), creates an `orders` row with status `pending`, calls Razorpay Orders API, stores `razorpay_order_id`, returns it to the client.
5. Client opens Razorpay Checkout with that order id.
6. On success Razorpay redirects to `/order/{order_number}`, which shows a "confirming payment" state until the webhook lands.

### Webhook — `POST /api/webhooks/razorpay`

This route must be `export const runtime = 'nodejs'` and must read the **raw body** for signature verification. Parsing the body before verifying breaks the HMAC.

```
1. Read raw body.
2. Verify HMAC-SHA256 of the body against RAZORPAY_WEBHOOK_SECRET,
   compared with crypto.timingSafeEqual. Reject with 400 on mismatch.
3. Insert into webhook_events. If razorpay_event_id already exists,
   return 200 immediately — this is a duplicate delivery.
4. On payment.captured:
     - Load the order by razorpay_order_id
     - If status is already 'paid', return 200 (idempotent)
     - Verify the paid amount matches the order total exactly
     - In a single transaction: set status='paid',
       store razorpay_payment_id, decrement stock for each item
     - Queue the confirmation email
5. On payment.failed: leave status as 'pending', log it.
6. Always return 200 for events you have processed or chosen to ignore.
   Non-200 makes Razorpay retry, which amplifies any bug.
```

**Why this matters:** Razorpay does not guarantee exactly-once delivery. Without the `webhook_events` table and the unique constraint on `razorpay_payment_id`, a retried webhook double-decrements stock or sends two confirmation emails. This has to be right on day one — it is very hard to reason about after orders exist.

Register the webhook at Razorpay Dashboard → Settings → Webhooks, pointing at `https://sundusk.in/api/webhooks/razorpay`, subscribed to `payment.captured` and `payment.failed`. For local testing use `ngrok` or the Vercel preview URL.

Never mark an order paid from the client-side success callback. The callback is a UI hint, not proof of payment.

---

## 8. GST

Indian apparel GST is split by unit price:

- Garment priced **under ₹1,000** → **5%**
- Garment priced **₹1,000 and above** → **12%**

This applies **per item**, not to the cart total. A cart with a ₹800 top and a ₹1,400 dress attracts both rates.

Prices shown on the site are **GST-inclusive**. Indian shoppers expect the label price to be the price charged. So the stored `price_paise` is the final price, and GST is computed backwards for the invoice:

```
gst_component = price * rate / (100 + rate)
```

Store `gst_paise` on the order for invoicing. Show a "Price inclusive of all taxes" line at checkout.

Put HSN codes on products — your CA will supply them. Confirm current rates with the CA before launch; do not treat the numbers above as authoritative.

---

## 9. ROUTES

### Storefront
```
/                          home
/shop                      all products
/collections/tops          tops
/collections/dresses       "Coming soon" state, no product grid
/products/[slug]           product detail
/cart                      cart
/checkout                  address form → Razorpay
/order/[orderNumber]       order status / confirmation
/account                   order history (auth required)
/account/login
/account/register
/account/orders/[orderNumber]
/about
/size-guide
/shipping
/returns
/faq
/track-order
/contact
/privacy
/terms
```

### API
```
POST /api/checkout                 create order + Razorpay order
POST /api/webhooks/razorpay        payment webhook
GET  /api/products                 (admin)
POST /api/admin/orders/[id]/status update status
POST /api/admin/orders/[id]/ship   courier + tracking
GET  /api/admin/orders/export      CSV
```

### Admin — `/admin`, protected
```
/admin                     order list: number, date, customer, total, status
/admin/orders/[id]         detail, status control, courier + tracking entry
/admin/products            list, toggle active
/admin/products/[id]       edit copy, price, stock per size
```

Admin auth: Supabase Auth session, then check the email against the `ADMIN_EMAILS` env list in middleware. Two people only. Do not build a roles table for two users.

Admin CSV export columns: order number, date, name, phone, address lines, city, state, pincode, items with sizes, total, status. That is what you hand your courier partner.

---

## 10. PAGE CONTENT

### Size guide — use exactly this data

| Size | India size | Bust (in) | Waist (in) | Hips (in) |
|---|---|---|---|---|
| XS | 34 | 34 | 26 | 36 |
| S | 36 | 36 | 28 | 38 |
| M | 38 | 38 | 30 | 40 |
| L | 40 | 40 | 32 | 42 |
| XL | 42 | 42 | 34 | 44 |

These are body measurements, not garment measurements. Include how to measure, a "between sizes" note, and a line inviting people to WhatsApp for sizing help. State plainly that the range is XS to XL.

Put a **"Find your size →"** link directly beneath the size selector on every product page. That single link does more for return rate than anything else on the page.

### Footer must contain
Legal entity name, address, GSTIN, phone, email, all policy links, Instagram. Indian e-commerce rules expect a real address and a reachable grievance contact.

---

## 10A. POLICY PAGES — FULL COPY

Render these verbatim. `[SQUARE BRACKETS]` mark values still to be confirmed — leave them visible in the code as `TODO` comments so they cannot ship unfilled.

### `/shipping` — Shipping & Delivery

```
SHIPPING & DELIVERY

DISPATCH
Orders are dispatched within 1–2 working days of payment.

DELIVERY
2–4 working days to metro cities.
4–7 working days to the rest of India.
We deliver across India.

SHIPPING CHARGES
A flat shipping charge of ₹[AMOUNT] applies to every order. The exact
amount is shown at checkout before you pay — there are no charges added
afterwards.

TRACKING
Once your order is dispatched, we send a tracking number by email and
WhatsApp. If you haven't received it within 3 working days of ordering,
write to us and we'll resend it.

PAYMENT
We accept UPI, credit cards, debit cards, net banking, and wallets
through Razorpay.

We do not offer Cash on Delivery. All orders are prepaid.

DELAYS
Festival weeks, heavy rain, and courier disruptions happen. If your order
is running late, we will contact you before you have to ask.

Questions: hellosundusk.in@gmail.com  ·  WhatsApp +91 93101 13431
```

### `/returns` — Returns & Exchanges

```
RETURNS & EXCHANGES

Please read this before you order. Our policy is narrower than most, and
we would rather you know that up front.

WE DO NOT ACCEPT RETURNS
We do not accept returns, and we do not offer refunds for change of mind,
or because a size did not fit.

WE DO NOT OFFER SIZE EXCHANGES
Please use the size guide before ordering. Every measurement we have is
published there.

If you are unsure which size to take, contact us before you order. Call or
WhatsApp +91 93101 13431, or email hellosundusk.in@gmail.com, and we will
help you choose. We would much rather spend two minutes on this than have
you receive something that doesn't fit.

DAMAGED OR DEFECTIVE ITEMS — WE WILL REPLACE THESE
If your piece arrives damaged, defective, or is not the item you ordered,
we will replace it at no cost to you. We pay shipping both ways.

To raise a claim:
· Contact us within 48 hours of delivery
· By WhatsApp on +91 93101 13431, or by email to hellosundusk.in@gmail.com
· Quote your order number (SD####)
· Send clear photos of the item, the damage, and the outer packaging
· Do not remove tags or wash the item

We respond within 2 working days. Once approved, your replacement is
dispatched within 1–2 working days.

Claims raised after 48 hours of delivery, or without photographs, cannot
be processed.

CANCELLATIONS
You can cancel your order within 6 hours of placing it, provided it has
not already been dispatched.

Email or WhatsApp us with your order number to cancel.

Cancellation refunds are made in full, less the payment gateway fee
charged by our payment processor, which is not recoverable by us.

After 6 hours, or once the order has been dispatched, orders cannot be
cancelled.

REFUND TIMELINE
Approved refunds are returned to your original payment method within
1–7 working days. Once we process it, the remaining time depends on your
bank.

QUESTIONS
hellosundusk.in@gmail.com  ·  WhatsApp +91 93101 13431
```

### `/terms` — Terms of Service

```
TERMS OF SERVICE

Last updated: [DATE]

This website is operated by [PROPRIETORSHIP NAME], a sole proprietorship
trading as Sundusk ("we", "us", "our"). By placing an order you agree to
these terms.

BUSINESS DETAILS
[PROPRIETORSHIP NAME]
D-43 Mahendru Enclave, near Model Town 3, Delhi 110033
GSTIN: 07AWDPS0826R1ZY
Email: hellosundusk.in@gmail.com
Phone: +91 93101 13431

PRODUCTS AND PRICING
All prices are in Indian Rupees and are inclusive of GST. Shipping is
charged separately and shown at checkout.

We may change prices at any time. The price that applies to your order is
the price displayed when you place it.

Product photographs are taken as accurately as we can manage, but colour
may vary slightly between screens and fabric. Slight variation in
measurement is normal in stitched garments.

Sizes range from XS to XL. Measurements are published on our size guide.

ORDERS
Placing an order is an offer to buy. We confirm your order by email once
payment is received. We may decline or cancel an order — for example if
an item is out of stock, if we cannot deliver to your address, or if we
suspect fraud. If we cancel, we refund you in full.

PAYMENT
All orders are prepaid through Razorpay. We do not offer Cash on Delivery.
We do not store your card details; payment information is handled entirely
by Razorpay.

DELIVERY
We deliver across India. Delivery timelines are estimates and are not
guaranteed. Risk passes to you on delivery.

You are responsible for giving a complete and accurate delivery address
and a reachable phone number. Orders that fail delivery because of an
incorrect address or an unreachable recipient are not refundable.

RETURNS
Our returns policy forms part of these terms. We do not accept returns or
size exchanges. Damaged or defective items are replaced. See our Returns
& Exchanges page for the full policy.

YOUR ACCOUNT
If you create an account, you are responsible for keeping your password
secure and for activity under your account. Tell us immediately if you
suspect unauthorised access.

ACCEPTABLE USE
You may not use this site for unlawful purposes, attempt to gain
unauthorised access to it, or copy our photographs, product descriptions,
or brand assets for commercial use without our written permission.

INTELLECTUAL PROPERTY
All content on this site — photographs, text, designs, the Sundusk name
and logo — belongs to us and may not be reproduced without permission.

LIABILITY
To the extent permitted by law, our liability for any order is limited to
the amount you paid for that order. We are not liable for indirect or
consequential loss.

Nothing in these terms limits your rights under the Consumer Protection
Act, 2019.

CHANGES
We may update these terms. The version published here at the time you
order is the version that applies.

GOVERNING LAW
These terms are governed by the laws of India. Disputes are subject to
the exclusive jurisdiction of the courts of Delhi.
```

### `/privacy` — Privacy Policy

```
PRIVACY POLICY

Last updated: [DATE]

[PROPRIETORSHIP NAME], trading as Sundusk, operates this website. This
policy explains what we collect, why, and what you can do about it.

WHAT WE COLLECT
When you place an order: your name, email address, phone number, and
delivery address.
When you create an account: your name, email address, and password (stored
encrypted — we cannot see it).
Automatically: basic analytics such as pages viewed and approximate
location, through Google Analytics.

WHAT WE DO NOT COLLECT
We never see or store your card number, CVV, UPI PIN, or bank credentials.
Payments are processed entirely by Razorpay on their own systems.

WHY WE COLLECT IT
· To process, pack, and deliver your order
· To send order confirmations and delivery updates
· To answer your questions and handle claims
· To meet our tax and accounting obligations
· To understand which pages people use, so we can improve the site

WHO WE SHARE IT WITH
· Razorpay — to process your payment
· Our courier partner — your name, address, and phone, to deliver
· Resend — to send transactional email
· Supabase — our database provider, which stores this data
· Google Analytics — anonymised usage data
· Our accountant and the tax authorities, where the law requires it

We do not sell your data. We do not share it with advertisers.

MARKETING
We only send marketing email if you opt in. Every marketing email has an
unsubscribe link. Order-related emails are not marketing and are sent for
every order.

HOW LONG WE KEEP IT
Order and invoice records are kept for 8 years, as Indian tax law requires.
Account data is kept until you ask us to delete it. Analytics data is kept
for 14 months.

YOUR RIGHTS
You can ask us to show you the data we hold about you, correct anything
that is wrong, or delete your account and personal data. We will act on
your request within 30 days.

We cannot delete invoice records within the statutory retention period,
even at your request.

Write to hellosundusk.in@gmail.com to make a request.

SECURITY
The site runs over HTTPS. Passwords are hashed. Database access is
restricted. No system is perfectly secure, but we take this seriously and
will tell you promptly if a breach affects your data.

COOKIES
We use cookies to keep your cart and your login session working, and for
analytics. You can block cookies in your browser, but the cart and login
will stop working if you do.

CHILDREN
This site is not intended for anyone under 18.

GRIEVANCE OFFICER
As required under Indian law:

Name: [GRIEVANCE OFFICER NAME]
Email: hellosundusk.in@gmail.com
Phone: +91 93101 13431
Address: D-43 Mahendru Enclave, near Model Town 3, Delhi 110033

We acknowledge complaints within 48 hours and resolve them within 30 days.

CHANGES
We will update the date at the top of this page when this policy changes.
```

### `/contact` — Contact

```
CONTACT

Questions about sizing, an order, or anything else — we answer all of them.

Email:     hellosundusk.in@gmail.com
WhatsApp:  +91 93101 13431
Phone:     +91 93101 13431
Instagram: @sundusk.official

We reply within 24 hours, Monday to Saturday.

NOT SURE ABOUT YOUR SIZE?
Message us before you order. We don't offer size exchanges, so we would
rather help you get it right the first time.

[PROPRIETORSHIP NAME]
D-43 Mahendru Enclave
near Model Town 3
Delhi 110033
GSTIN: 07AWDPS0826R1ZY
```

### Product page and checkout notices

Because there are no size exchanges, this must be visible before purchase, not buried in a policy page.

On every product page, directly under the size selector:
```
Find your size →           (links to /size-guide)
No size exchanges — please check measurements before ordering.
Unsure? WhatsApp us on +91 93101 13431.
```

On the checkout page, above the pay button:
```
Prepaid only. No returns or size exchanges. Damaged items are replaced.
Cancellation available within 6 hours.
```

A required "I have read the returns policy" checkbox is **not** wanted — it adds friction and does not create a stronger legal position than clear, prominent notice does.

### Legal caveat for the developer

These are drafted to be accurate to the stated business, plain-spoken, and compliant with the Consumer Protection (E-Commerce) Rules 2020 in structure — mandatory seller identity, grievance officer, and clear return/refund terms. They are **not** a substitute for review by a lawyer or CA before launch. Flag this to me at the end of the build. In particular, a blanket no-returns policy has limits under the Consumer Protection Act 2019 where goods are defective or not as described, which is why the damaged-item replacement clause exists and must never be removed.

---

## 11. EMAILS

React Email templates, sent via Resend, in Sundusk's palette — espresso header, sand body, Fraunces headings.

1. **Order confirmed** — order number, items with sizes, total, delivery estimate, support contact
2. **Shipped** — courier name, tracking number, tracking link if the courier has one
3. **Delivered** — short, plus a request for a photo review
4. **Welcome** — on account creation, minimal

Send from `hello@sundusk.in`, reply-to `hellosundusk.in@gmail.com`.

Send email **after** the database transaction commits, never inside it. A failed email must never roll back a paid order. Wrap sends in try/catch and log failures — do not throw out of the webhook.

---

## 12. BUILD ORDER

12 days, ~3 hours a day. Do not skip ahead — later steps depend on earlier ones.

| Day | Work |
|---|---|
| 1 | Next.js + TS + Tailwind scaffold, design tokens, fonts, Supabase project, Drizzle connected, schema migrated, seed script with 6 products × 5 sizes. **Also: start Resend domain verification — DNS takes hours.** |
| 2 | Layout shell: header, nav, footer, mobile menu, section primitives |
| 3 | Product card, product grid, `/shop`, `/collections/tops`, dresses coming-soon |
| 4 | Product detail page: gallery, size selector as pills not a dropdown, size-guide link, accordions |
| 5 | Cart: context + localStorage, cart page, quantity, remove, totals |
| 6 | Checkout form with Zod validation, `POST /api/checkout`, order creation, Razorpay order |
| 7 | Razorpay Checkout on the client, `/order/[orderNumber]`, webhook route with signature verification and idempotency. **Test a full test-mode payment end to end.** |
| 8 | Emails: Resend, React Email templates, confirmation and shipped |
| 9 | Auth: register, login, `/account`, order history, RLS policies |
| 10 | Admin: order list, order detail, status transitions, courier + tracking, CSV export |
| 11 | Static pages, SEO metadata, sitemap, robots, OG images, 404 |
| 12 | Real photos, live Razorpay keys, one real ₹ payment and refund, mobile pass on a real phone, Lighthouse, deploy |

Days 1, 6, 7 and 10 are the load-bearing ones. If you fall behind, cut the account system (day 9) before you cut anything else — guest checkout covers launch.

---

## 13. QUALITY BAR

- TypeScript strict. No `any`. No `@ts-ignore`.
- Zod-validate every API input at the boundary.
- Every money value in paise, integer, formatted only at render.
- Server Components by default; `'use client'` only where interactivity demands it.
- Every image through `next/image` with explicit width and height, `priority` on the hero only.
- Real `<label>` on every input, keyboard navigable, visible focus rings — do not strip outlines.
- No secret ever imported into a client component. `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` are server-only.
- Loading and error states on every async surface. No spinner-forever.
- Test at 375px width before calling anything done.

---

## 14. FIRST INSTRUCTION

Start with Day 1 only.

Scaffold the project, set up Tailwind v4 with the design tokens in section 3, wire up `next/font` for Fraunces and Hanken Grotesk, connect Drizzle to Supabase, write `db/schema.ts` from section 5, generate and run the migration, and write a seed script that inserts 6 placeholder tops with 5 size variants each and stock of 10 per size.

Then tell me exactly which commands to run, and what I should see when it works.

Do not build any UI beyond a bare page that proves the fonts and colours load.
