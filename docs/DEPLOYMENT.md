# Deploying Sundusk to Vercel

This app needs zero special configuration to deploy — it's a standard
Next.js 15 App Router project, and Vercel is built by the same company
that builds Next.js. The only real work is getting the right environment
variables into Vercel and pointing the external services (Razorpay's
webhook, Supabase's auth allowlist) at the real production URL instead of
`localhost`.

## Prerequisites

- A GitHub (or GitLab/Bitbucket) account — Vercel deploys from a git
  repo, not a local folder upload.
- A Vercel account, signed up with that same git provider.
- Every external service already set up for **real production
  credentials** — Supabase project, Razorpay (live keys, once you're
  ready — see the note in step 5), Resend with a verified sending domain.
  Section 4 of `CLAUDE.md` has the full list and where to find each value.

This repo is currently local-only — `git remote -v` shows nothing. You'll
need to push it to a real GitHub repo before Vercel can see it.

## 1. Push to GitHub

```bash
# Create a new, empty repo on GitHub first (github.com/new), then:
git remote add origin https://github.com/<your-username>/sundusk-website.git
git branch -M main
git push -u origin main
```

`.env.local` will **not** be pushed — it's gitignored (`.gitignore` has
`.env*` with `!.env.example` as the one exception). That's correct and
intentional; real secrets never belong in git, Vercel included.

## 2. Import the project into Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** →
   pick the repo you just pushed.
2. Framework Preset: Vercel auto-detects **Next.js** — leave it.
3. Build command, output directory, install command: leave all as
   detected defaults. Nothing in this project needs a custom build step.
4. **Don't click Deploy yet** — add the environment variables first
   (step 3), or the first build will fail on a missing `DATABASE_URL`.

## 3. Environment variables

In the import screen (or later under **Project Settings → Environment
Variables**), add every variable from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
RESEND_API_KEY
EMAIL_FROM
EMAIL_REPLY_TO
NEXT_PUBLIC_SITE_URL
ADMIN_EMAILS
```

A few of these need a **different value in production** than what's in
your local `.env.local`:

- **`NEXT_PUBLIC_SITE_URL`** — set this to your real production URL
  (e.g. `https://sundusk.in`, or the `https://your-project.vercel.app`
  URL Vercel assigns if you haven't attached a custom domain yet). It
  drives the sitemap, robots.txt, and OG image URLs — leaving it as
  `http://localhost:3000` in production would silently break all three.
- **`ADMIN_EMAILS`** — make sure this is the real admin email(s) you
  actually want to be able to sign into `/admin`, not a leftover test
  address.
- **`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID`**
  — test keys are fine for your first deploy to confirm everything
  works end to end. Swap to live keys only when you're actually ready to
  take real payments (see step 5).

Any variable **not** prefixed `NEXT_PUBLIC_` is server-only by design
(spec section 13) — Vercel keeps it out of the browser bundle
automatically, same as `.env.local` does locally.

## 4. Deploy

Click **Deploy**. First build takes a few minutes. When it finishes,
you'll get a `https://<project-name>.vercel.app` URL — open it and check
the homepage loads with real images and the product grid.

If `NEXT_PUBLIC_SITE_URL` wasn't final yet (e.g. you're waiting on a
custom domain), update it now to whatever URL you're actually live on,
then **redeploy** (Vercel → Deployments → ⋯ → Redeploy) so the sitemap
and OG image pick up the change.

## 5. Point the external services at the real URL

Two things still point at `localhost` / your dev tunnel and need
updating once you have a real deployed URL:

**Razorpay webhook** — Dashboard → Settings → Webhooks → your existing
webhook (or add a new one). URL: `https://<your-domain>/api/webhooks/razorpay`.
Subscribe to `payment.captured` and `payment.failed`. Razorpay gives you
a new webhook secret when you do this — put that in `RAZORPAY_WEBHOOK_SECRET`
in Vercel's env vars (not the old dev one), then redeploy.

**Supabase Auth allowed URLs** — Dashboard → Authentication → URL
Configuration. Add your production URL to both **Site URL** and
**Redirect URLs**. Without this, login/signup redirects can silently fail
or bounce back to `localhost` in production — an easy thing to miss
since it works perfectly in local dev either way.

**Going live with real payments** (day 12 of the build plan): switch
`RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/`NEXT_PUBLIC_RAZORPAY_KEY_ID` to
your live keys, register a **live-mode** webhook (live and test mode
webhooks are separate in Razorpay's dashboard), redeploy, then run one
real ₹ payment and refund yourself before telling anyone else the site
is live.

## 6. Custom domain (optional, whenever you're ready)

Project Settings → Domains → add `sundusk.in` (or whatever you've
registered) → follow Vercel's DNS instructions (usually one A record or
CNAME at your domain registrar). Vercel issues and renews the TLS
certificate automatically — nothing to configure there. Once it's
attached, update `NEXT_PUBLIC_SITE_URL` to match and redeploy.

## 7. After every deploy, check

- `/sitemap.xml` and `/robots.txt` resolve and reference the real domain,
  not `localhost`.
- `/admin` still requires login (this doesn't change between local and
  production, but worth a real check once — see `docs/DAY-10-NOTES.md`
  for why this was worth verifying carefully the first time).
- Run a Lighthouse pass (Chrome DevTools → Lighthouse, against the real
  deployed URL, not local dev — dev-mode Next.js is never representative
  of production performance).
- If you just went live with real Razorpay keys: the one real ₹ payment
  + refund from day 12 of the build plan.

## What Vercel needs zero config for

- **Images** — `next/image` serving from `/public/products` works
  identically on Vercel with no `remotePatterns` or domain config, since
  every image is local, not fetched from an external host.
- **The Razorpay webhook route's Node runtime** — `export const runtime
  = "nodejs"` in `app/api/webhooks/razorpay/route.ts` (needed for raw-body
  HMAC verification) is fully supported on Vercel as-is.
- **Database connection pooling** — already using Supabase's transaction
  pooler on port 6543 (spec section 4), which is the correct choice for
  Vercel's serverless functions opening a fresh connection per
  invocation. Nothing to change here for deployment.
