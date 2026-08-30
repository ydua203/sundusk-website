import type { Metadata } from "next";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/legal";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Size Guide | Sundusk",
  description: "Body measurements for XS–XL, how to measure yourself, and what to do in between sizes.",
};

// Table data is exact — spec section 10: "use exactly this data." These
// are body measurements, not garment measurements (stated below, per
// spec), and the page states plainly that the range is XS to XL — no
// "for every body" framing (spec hard rule 1).
const SIZES = [
  { size: "XS", india: 34, bust: 34, waist: 26, hips: 36 },
  { size: "S", india: 36, bust: 36, waist: 28, hips: 38 },
  { size: "M", india: 38, bust: 38, waist: 30, hips: 40 },
  { size: "L", india: 40, bust: 40, waist: 32, hips: 42 },
  { size: "XL", india: 42, bust: 42, waist: 34, hips: 44 },
];

export default function SizeGuidePage() {
  return (
    <Section tone="sand">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-espresso sm:text-4xl">
          Size Guide
        </h1>
        <p className="mt-4 font-body text-sm leading-relaxed text-espresso/80">
          Sundusk runs from XS to XL. The table below is body measurements, not garment
          measurements — how you measure yourself, not the flat-lay size of the piece.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-medium tracking-[0.08em] text-muted uppercase">
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-4">India size</th>
                <th className="py-3 pr-4">Bust (in)</th>
                <th className="py-3 pr-4">Waist (in)</th>
                <th className="py-3 pr-4">Hips (in)</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((row) => (
                <tr key={row.size} className="border-b border-line">
                  <td className="py-3 pr-4 font-medium text-espresso">{row.size}</td>
                  <td className="py-3 pr-4 text-espresso/80">{row.india}</td>
                  <td className="py-3 pr-4 text-espresso/80">{row.bust}</td>
                  <td className="py-3 pr-4 text-espresso/80">{row.waist}</td>
                  <td className="py-3 pr-4 text-espresso/80">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 space-y-6">
          <div>
            <h2 className="font-body text-xs font-medium tracking-[0.14em] text-terra uppercase">
              How to measure
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-1.5 font-body text-sm leading-relaxed text-espresso/80">
              <li>
                <strong className="font-medium text-espresso">Bust</strong> — wrap the tape
                around the fullest part of your bust, straight across your back.
              </li>
              <li>
                <strong className="font-medium text-espresso">Waist</strong> — measure around the
                narrowest part of your natural waist, usually just above the navel.
              </li>
              <li>
                <strong className="font-medium text-espresso">Hips</strong> — wrap the tape
                around the fullest part of your hips.
              </li>
            </ul>
            <p className="mt-3 font-body text-sm leading-relaxed text-espresso/80">
              Use a soft measuring tape, keep it snug but not tight, and measure over light
              clothing or none at all for the truest number.
            </p>
          </div>

          <div>
            <h2 className="font-body text-xs font-medium tracking-[0.14em] text-terra uppercase">
              Between sizes?
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-espresso/80">
              If your measurements fall between two sizes, we&rsquo;d generally suggest sizing up
              — our tops are cut fitted rather than loose. When in doubt, message us before you
              order rather than after: we don&rsquo;t offer size exchanges, so this is the one
              step that actually prevents a wrong-size order.
            </p>
          </div>

          <div>
            <h2 className="font-body text-xs font-medium tracking-[0.14em] text-terra uppercase">
              Need a size beyond XL?
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-espresso/80">
              Custom, made-to-order sizing is available as a separate request — see{" "}
              <a
                href="/custom-fit"
                className="text-espresso underline underline-offset-4 hover:text-terra"
              >
                Custom Fit
              </a>
              .
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-line pt-6 font-body text-sm text-muted">
          Still unsure which size to take? WhatsApp us on{" "}
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="text-espresso underline underline-offset-4 hover:text-terra"
          >
            {SUPPORT_PHONE_DISPLAY}
          </a>{" "}
          — we&rsquo;d rather spend two minutes helping you choose than have you guess.
        </p>
      </div>
    </Section>
  );
}
