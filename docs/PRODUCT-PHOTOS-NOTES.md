# Real product photos — build notes

Not a spec day — this is the "different lineup" work flagged in
[[upcoming-real-product-lineup]] memory, landing earlier than day 12
because the real shoot was ready sooner than the build order assumed.

## What changed

The 6 Day-1 placeholder products (Terra Wrap Top, Sand Linen Shirt, Cream
Poplin Blouse, Espresso Button-Down, Sundown Tank, Dune Crop Top) are
**gone** — deleted, not edited in place, since the real lineup shares no
identity with them. In their place, 6 real products named after the PDF
filenames in `sundusk-model-shoot-tops-pdf/`:

| Slug | Name | Photos |
|---|---|---|
| black-lace-polka-dot-top | Black Lace Polka Dot Top | 4 |
| black-lace-top | Black Lace Top | 4 |
| blue-japanese-top | Blue Japanese Top | 6 |
| blue-striped-top | Blue Striped Top | 4 |
| bubble-pink-top | Bubble Pink Top | 3 |
| white-polka-dot-top | White Polka Dot Top | 6 |

Two obvious filename typos corrected in the display name: "japenese" →
"Japanese", "strip" → "Striped". "polka top" → "Polka Dot Top" for both
polka-dot products, matching the actual pattern name and each other.

## Where the photos came from, and a real bug caught along the way

`sundusk-model-shoot-tops-pdf/all-tops-with-white-background.pdf` is a
7-page ghost-mannequin reference sheet (one page — the navy top — has a
front and back page, hence 7 pages for 6 products). The 6 individual
per-top PDFs (80–230MB each) contain the actual model-shoot photos, 3–6
per top, no other content — confirmed no embedded text anywhere in them
(checked programmatically), so measurements are not hiding in these files.

**Extraction went through two failed attempts before the real problem was
found**, both caught by actually looking at output rather than assuming
success:

1. First attempt pulled the raw embedded image bytes directly
   (`doc.extract_image(xref)`). Result: several photos came out **sideways**.
   Cause: some pages place their image via a content-stream transform
   matrix that includes a 90° rotation, which raw asset extraction
   completely bypasses — it hands back the unrotated source bytes. Fixed
   by rendering each full page instead (`page.get_pixmap()`), which
   respects whatever transform is on the page, the same way a PDF viewer
   would.
2. After that fix, one photo's background signage read
   **backward** ("GIFT BOXES & HAMPERS" as "SЯEPMAH & SEXOB TFIG").
   Investigated properly rather than shrugged off: extracted the raw
   source bytes again and rotated them with *nothing else applied* —
   still backward. That isolates it conclusively: the mirroring is baked
   into the original photo (almost certainly a front-camera mirror effect
   from however it was shot/exported), not introduced by any extraction
   step here.

Mirroring only matters for product accuracy on **asymmetric** designs —
which shoulder is bare, which side a diagonal seam runs. Both asymmetric
pieces in this batch were checked directly against the ghost-mannequin
reference:
- **Bubble Pink Top** (one-shoulder): confirmed correctly oriented,
  verified with a direct side-by-side crop comparison against the
  reference — bare shoulder matches on both.
- **Black Lace Top** (diagonal lace hem insert): checked against the
  reference but the detail is low-contrast (black lace on black fabric)
  and small in frame in every available shot, so orientation **couldn't
  be conclusively verified either way**. Left as extracted. Low
  real-world stakes — a subtle diagonal trim direction is not something a
  customer is likely to notice or care about, unlike the one-shoulder cut.

The other 4 products have symmetric designs (dots, stripes, mock-neck cap
sleeves, centered keyhole/button) — mirroring, where present, only affects
unreadable background text, not what the garment looks like on. Not
corrected; not worth the effort for a background detail nobody's buying.

## Crop pipeline

Rendered each page at 16x zoom (source pages are ~288×432pt →
~4600×6900px, well above the 2048×2560 target), center-cropped to exactly
4:5 (never stretched — cropped from whichever axis had the excess,
verified this doesn't cut off heads or feet by reviewing a contact sheet
of every photo before cropping, not just trusting the math), resized to
2048×2560, saved as JPEG quality 88. Output: ~1MB per photo, 27 photos
total, ~26MB in `public/products/`.

Tooling: Python + PyMuPDF (`pip install pymupdf`) for PDF rendering,
Pillow for the crop/resize/encode. Not Node/sharp (already a project
dependency) — extraction and inspection needed a PDF library first, and
switching tools mid-pipeline for the crop step alone wasn't worth it.

## What's still a placeholder — deliberately not invented

**Update, same day:** prices and the model note arrived a few hours after
the photos and are now real, confirmed values in `db/seed.ts` — see
below. Only fabric/fit/care remain outstanding.

- **Fabric / fit / care** — set to visible `[TODO: confirm ...]` text
  that actually renders on the live product page (see `db/seed.ts`).
  These are factual claims about a real product; inventing plausible-
  sounding fabric composition would be actively wrong, not just
  incomplete, so this follows the same visible-placeholder convention
  spec section 10A uses for unconfirmed policy copy. **Still open.**
- ~~Price~~ — confirmed by the user: ₹999 (Blue Striped), ₹1,299 (Black
  Lace Polka Dot, Black Lace, White Polka Dot), ₹1,499 (Blue Japanese,
  Bubble Pink). All within spec section 1's ₹700–1800 band.
- ~~Model measurements~~ — confirmed: one model throughout the shoot,
  5'5", wears a size XS. `model_note` on all 6 products reads "Model is
  5'5" and wears a size XS". Weight (50kg) was also given but left out of
  the customer-facing text — height + size worn is the standard
  fit-reference convention (matches spec section 5's own example), and
  weight doesn't help a customer judge fit the way those two do.

## Also done: swapped the placeholder image component for real photos

`ProductImagePlaceholder` (the flat labeled box every product surface
used since day 3) is deleted — real photography exists for the whole
catalog now, so the reason for it is gone. Replaced with
`components/product/product-image.tsx`, a thin `next/image` wrapper used
by the product grid, the gallery (main frame + real thumbnail previews,
not numbered placeholder buttons), and the cart line item. Cart items now
carry a `productImage` field (`CartItem` type in
`context/cart-context.tsx`) so a cart line can show the real photo — any
cart saved in a browser before this change won't have that field, but
since nothing has actually launched yet, no real customer cart exists to
worry about migrating.

## Verified

- `tsc`, `eslint`, `next build` all clean.
- Confirmed against the real dev server: `/shop` lists all 6 real product
  names; every product's `/products/{slug}/1.jpg` source file serves
  `200`; `next/image`'s own optimization endpoint
  (`/_next/image?url=...`) also serves `200` for a sample, not just the
  raw file; the PDP gallery for a 3-photo product shows all 3 real
  thumbnails; the `[TODO: confirm ...]` fabric/fit/care markers render
  visibly on the live page as intended.
- Not verified in a real browser: clicking through gallery thumbnails,
  confirming `next/image`'s responsive `sizes` behave well at 375px —
  same headless-browser limitation noted in earlier days' notes.

## Update 2026-08-26: white-background cover photo added

On request: photo 1 for every product is now the ghost-mannequin shot
from `all-tops-with-white-background.pdf` (a proper catalogue cover),
with the model photos pushed to 2.jpg onward. Two attempts:

1. First pass reused the model-photo pipeline's color-based white-margin
   trim. Broke immediately on the pale pink top — light fabric against a
   white background is too close in pixel value to "white" for a
   tolerance-based diff to tell apart, so the trim ate most of the actual
   garment, leaving a badly zoomed-in crop (caught by looking at the
   output before shipping it, not by a second bug report).
2. Fixed by switching to the PDF's **exact placement geometry**
   (`page.get_image_info()`'s `bbox`) instead of guessing from color —
   this is exact, not a heuristic, so it can't be fooled by a light-colored
   garment. Padding (never cropping) fills the gap to reach 4:5, same
   safe-direction principle as the model-photo pipeline.

Verified: all 6 covers reviewed directly (not sampled) after the fix, all
33 photos across the whole catalogue re-confirmed at exactly 2048×2560,
and the live grid/PDP gallery confirmed serving `1.jpg` (the cover) first
everywhere a product image appears.

**This "verification" turned out to be wrong for two of the six** — see
the next update. Reviewing each cover in isolation and confirming it
looked like a plausible garment photo was not the same as confirming it
matched the *right* garment. That gap is exactly how the bug below got
past this check.

## Update 2026-08-27: two covers were cross-assigned, found by the user

User report: on `black-lace-polka-dot-top` and `white-polka-dot-top`,
the cover photo (`1.jpg`) didn't match the model photos on the same page.

Root cause: the two products' names are colour-inverted from what they
sound like — `black lace polka dot top.pdf` is actually a **white**
garment with black dots and black lace trim (the "black" in the name
refers to the lace), and `white polka top.pdf` is actually a **black**
garment with white dots. When the white-background covers were added in
the update above, the two covers were assigned by guessing from the
product name instead of checking the source PDF, and landed in the wrong
folders — `black-lace-polka-dot-top/1.jpg` held the black-garment cover,
`white-polka-dot-top/1.jpg` held the white-garment cover. Confirmed this
was only the covers: `2.jpg` onward in both folders was already correct
in each folder — extracted straight from that folder's own PDF, so
per-photo extraction never crossed products, only the covers did.

First response to the user's report was to re-inspect the existing
`1.jpg` files and reason from what a "black lace polka dot top" *ought*
to look like — which is the same unverified assumption that caused the
bug, so naturally it looked consistent and the report was (wrongly)
treated as a caching issue. Actually resolved only after rendering page 1
of both source PDFs directly and comparing pixels against what was
already in `2.jpg` in each folder. Fixed with a plain file swap (no
re-crop needed, both files were already correctly sized and padded from
the update above) and re-verified both against their respective PDFs and
existing model photos afterward.

**Lesson for any future photo work on this project:** verify a cover
against its own product's other photos and, ideally, the source PDF —
never against what the product name "should" imply. The name is not
ground truth; the PDF is.

## Next up

Waiting on: real fabric/fit/care copy for all 6 products — the one
remaining placeholder. Otherwise back to the day-by-day plan — day 9
(auth) and day 10 (admin) are next.
