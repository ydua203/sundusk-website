import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/layout/section";
import { ProductGrid } from "@/components/product/product-grid";
import { getActiveProducts } from "@/lib/products";

// Real homepage — replaces the day-1 fonts/palette placeholder. Built out
// of the original day order at the user's request rather than waiting for
// day 11 (see CLAUDE.md's build-log note on why it was a placeholder this
// long); the rest of day 11 — size guide, about, shipping/returns, etc. —
// is still pending, so links here point only at routes that already exist.

const BUTTON =
  "inline-block border-0 bg-espresso px-7 py-3.5 font-body text-sm font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:bg-terra";
const TEXT_LINK =
  "text-espresso underline underline-offset-4 transition-colors hover:text-terra";

// Live inventory and pricing on the storefront's front door — same
// reasoning as /shop: never statically prerendered/cached, or an admin
// price or active/inactive edit wouldn't show up here.
export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await getActiveProducts();

  return (
    <>
      {/* Hero — bespoke rather than built on <Section>, since the shared
          primitive always forces vertical padding (spec's whitespace rule
          for every other section) and this needs the photo to sit flush
          against the header with no sand gap above it. */}
      <section className="border-b border-line bg-sand">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-4/5 lg:order-2">
            <Image
              src="/products/bubble-pink-top/2.jpg"
              alt="The Bubble Pink Top, worn outdoors in natural light"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-6 px-6 py-16 sm:px-10 sm:py-24 lg:order-1 lg:px-16 lg:py-0">
            <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
              New — six tops, sizes XS–XL
            </p>
            <h1 className="font-display text-4xl font-semibold text-espresso sm:text-5xl">
              Dressed like the light hasn&rsquo;t faded yet.
            </h1>
            <p className="max-w-md font-body text-base text-espresso/80">
              Sundusk is a small, honest edit of tops — cut clean, priced
              fair, and shot in the same light we&rsquo;d actually wear them
              in.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <Link href="/shop" className={BUTTON}>
                Shop the edit
              </Link>
              <p className="font-body text-xs text-muted">
                Prepaid checkout · dispatched in 1–2 days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured — the full, current catalogue. Six products is small
          enough that "featured" and "everything we sell" are the same
          list; no curation logic needed at this size. */}
      <Section tone="sand">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
              The edit
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-espresso sm:text-4xl">
              Everything we make right now
            </h2>
          </div>
          <Link href="/shop" className={TEXT_LINK}>
            View full shop →
          </Link>
        </div>
        <p className="mt-3 font-body text-sm text-muted">
          Tops today. Dresses are next —{" "}
          <Link href="/collections/dresses" className={TEXT_LINK}>
            see what&rsquo;s coming
          </Link>
          .
        </p>
        <div className="mt-10">
          <ProductGrid products={items} />
        </div>
      </Section>

      {/* Editorial / brand voice. Turns two of the hard rules (no
          one-of-a-kind claims, no size-inclusivity overclaim) into actual
          copy instead of just avoiding the claims silently — spec section
          1's voice guidance ("confident, warm, lightly witty") applies
          here more than anywhere else on the site. */}
      <Section tone="cream">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
            Why Sundusk
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
            We don&rsquo;t do one-of-a-kind. We do it well, repeatedly.
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-espresso/80">
            Every top here is made in a real batch, sized XS to XL, so the
            fit you like today is still here if you want it again next
            month. That&rsquo;s not a compromise — it&rsquo;s the whole
            plan.
          </p>
          <p className="mt-4 font-body text-base leading-relaxed text-espresso/80">
            The photos are the actual garments, shot in daylight, on a real
            person — not a studio rig built to flatter a screen.
          </p>
        </div>
      </Section>

      {/* Practical trust signals + closing CTA. Stated plainly, nothing
          fabricated (spec hard rule 4) — no delivery-speed claims we
          haven't published elsewhere, no COD mention either way. */}
      <Section tone="sand">
        <div className="grid gap-10 border-y border-line py-10 sm:grid-cols-3 sm:divide-x sm:divide-line sm:py-0">
          <div className="sm:px-8 sm:py-10">
            <h3 className="font-display text-lg font-semibold text-espresso">
              Sizes XS–XL
            </h3>
            <p className="mt-2 font-body text-sm text-muted">
              Cut to real measurements, not vanity sizing. Need something
              beyond XL?{" "}
              <Link href="/custom-fit" className={TEXT_LINK}>
                Request custom sizing →
              </Link>
            </p>
          </div>
          <div className="sm:px-8 sm:py-10">
            <h3 className="font-display text-lg font-semibold text-espresso">
              Prepaid checkout
            </h3>
            <p className="mt-2 font-body text-sm text-muted">
              Every order is confirmed only after payment clears, processed
              securely through Razorpay.
            </p>
          </div>
          <div className="sm:px-8 sm:py-10">
            <h3 className="font-display text-lg font-semibold text-espresso">
              Dispatched fast
            </h3>
            <p className="mt-2 font-body text-sm text-muted">
              Orders leave within 1–2 working days of payment confirmation.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
            Ready when you are.
          </h2>
          <Link href="/shop" className={`${BUTTON} mt-6`}>
            Shop the edit
          </Link>
        </div>
      </Section>
    </>
  );
}
