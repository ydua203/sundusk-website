import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "About | Sundusk",
  description: "A small, honest edit of tops for the Indian market. Sizes XS–XL.",
};

// New copy — not in spec section 10A (which gives verbatim text only for
// the policy pages). Kept deliberately short and free of anything that
// can't be backed up: no invented founding story, no "artisan" or
// "handcrafted" language for what are, factually, batch-produced garments
// — same discipline as the homepage's "Why Sundusk" section and spec hard
// rule 2 (never claim products are one-of-a-kind).
export default function AboutPage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-xs font-medium tracking-[0.14em] text-muted uppercase">
          About
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
          A small edit, done properly.
        </h1>

        <div className="mt-8 space-y-5 font-body text-base leading-relaxed text-espresso/80">
          <p>
            Sundusk makes tops. Not a hundred of them — six, at the moment, sized XS to XL,
            priced to actually make sense. We&rsquo;d rather do a short list well than a long one
            carelessly.
          </p>
          <p>
            Every product photo on this site is the real garment — the same one that ships to
            you, shot in ordinary daylight rather than a studio built to flatter a screen.
            What&rsquo;s pictured is what arrives.
          </p>
          <p>
            We&rsquo;re based in Delhi, and we ship across India. Every order is prepaid and
            confirmed only once payment clears — no cash on delivery, no exceptions.
          </p>
          <p>
            Sizing is honest rather than generous: real body measurements, published on the{" "}
            <Link
              href="/size-guide"
              className="text-espresso underline underline-offset-4 hover:text-terra"
            >
              size guide
            </Link>
            , with someone on WhatsApp if you&rsquo;d rather ask than guess. Dresses are next.
          </p>
        </div>
      </div>
    </Section>
  );
}
