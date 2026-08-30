import { config } from "dotenv";

// dotenv/config only auto-loads `.env` — Next.js convention is `.env.local`.
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * The real launch lineup — replaces the 6 Day-1 placeholder products
 * (Terra Wrap Top etc.) as of the 2026-08-25 model shoot. Names come from
 * the filenames in sundusk-model-shoot-tops-pdf/ (two obvious typos fixed:
 * "japenese" -> "Japanese", "strip" -> "Striped"; "polka" -> "Polka Dot"
 * for consistency with the other polka-dot product's naming). Photos are
 * the real model-shoot images, cropped to 4:5 — see
 * docs/PRODUCT-PHOTOS-NOTES.md for the extraction/crop process and the
 * mirroring issue found and corrected in the source PDFs. `1.jpg` for
 * every product is the white-background ghost-mannequin shot from
 * all-tops-with-white-background.pdf (the catalogue cover), added
 * 2026-08-25 — model photos start at `2.jpg`.
 *
 * Prices and the model note are real, confirmed by the user on 2026-08-25
 * — one model throughout the shoot, 5'5", wears a size XS. (Weight was
 * also given — 50kg — but left out of the customer-facing note: height +
 * size worn is the standard fit-reference convention spec section 5's
 * example follows, and a model's weight doesn't help a customer judge fit
 * the way those two do.)
 *
 * Still placeholder / still needed from the user, deliberately not
 * invented here:
 * - fabric / fit / care: real factual claims about the product. Left as
 *   visible "[TODO: ...]" markers (would render on the live product page)
 *   rather than guessed, matching the placeholder-bracket convention
 *   spec section 10A uses for policy-page copy.
 */

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const FABRIC_TODO = "[TODO: confirm fabric composition]";
const FIT_TODO = "[TODO: confirm fit notes]";
const CARE_TODO = "[TODO: confirm care instructions]";
const MODEL_NOTE = "Model is 5'5\" and wears a size XS";

type SeedProduct = {
  slug: string;
  name: string;
  skuCode: string;
  description: string;
  photoCount: number;
  pricePaise: number;
  sortOrder: number;
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "black-lace-polka-dot-top",
    name: "Black Lace Polka Dot Top",
    skuCode: "BLPD",
    description:
      "A cream camisole with black polka dots and a black lace trim at the neckline, finished with slim adjustable straps.",
    photoCount: 5,
    pricePaise: 129900,
    sortOrder: 1,
  },
  {
    slug: "black-lace-top",
    name: "Black Lace Top",
    skuCode: "BLT",
    description:
      "A fitted black top with a mock neck and lace-trimmed cap sleeves, finished with an asymmetric diagonal lace insert at the hem.",
    photoCount: 5,
    pricePaise: 129900,
    sortOrder: 2,
  },
  {
    slug: "blue-japanese-top",
    name: "Blue Japanese Top",
    skuCode: "BJT",
    description:
      "A structured top in deep navy with a stand collar, single button closure, and a keyhole cutout at the front — ties open at the back.",
    photoCount: 7,
    pricePaise: 149900,
    sortOrder: 3,
  },
  {
    slug: "blue-striped-top",
    name: "Blue Striped Top",
    skuCode: "BST",
    description:
      "A fitted tank in blue and red pinstripe cotton, cut with a sweetheart neckline and slim straps.",
    photoCount: 5,
    pricePaise: 99900,
    sortOrder: 4,
  },
  {
    slug: "bubble-pink-top",
    name: "Bubble Pink Top",
    skuCode: "BPT",
    description:
      "A one-shoulder top in soft pink chiffon, with a draped sleeve on one side over a fitted, boned bodice.",
    photoCount: 4,
    pricePaise: 149900,
    sortOrder: 5,
  },
  {
    slug: "white-polka-dot-top",
    name: "White Polka Dot Top",
    skuCode: "WPD",
    description:
      "A fitted bustier top in black with cream polka dots, cut with structured bust seams and a whisper of lace along the neckline.",
    photoCount: 7,
    pricePaise: 129900,
    sortOrder: 6,
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. See .env.local.example.");
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  console.log(`Seeding ${PRODUCTS.length} products x ${SIZES.length} sizes...`);

  for (const p of PRODUCTS) {
    const images = Array.from(
      { length: p.photoCount },
      (_, i) => `/products/${p.slug}/${i + 1}.jpg`,
    );

    const [product] = await db
      .insert(schema.products)
      .values({
        slug: p.slug,
        name: p.name,
        description: p.description,
        fabric: FABRIC_TODO,
        fit: FIT_TODO,
        care: CARE_TODO,
        modelNote: MODEL_NOTE,
        pricePaise: p.pricePaise,
        category: "tops",
        images,
        sortOrder: p.sortOrder,
      })
      .onConflictDoUpdate({
        target: schema.products.slug,
        set: {
          name: p.name,
          description: p.description,
          fabric: FABRIC_TODO,
          fit: FIT_TODO,
          care: CARE_TODO,
          modelNote: MODEL_NOTE,
          pricePaise: p.pricePaise,
          images,
          sortOrder: p.sortOrder,
          updatedAt: new Date().toISOString(),
        },
      })
      .returning();

    for (const size of SIZES) {
      await db
        .insert(schema.productVariants)
        .values({
          productId: product.id,
          size,
          sku: `SD-${p.skuCode}-${size}`,
          stock: 10,
        })
        .onConflictDoUpdate({
          target: [schema.productVariants.productId, schema.productVariants.size],
          set: { sku: `SD-${p.skuCode}-${size}`, stock: 10 },
        });
    }

    console.log(`  ✓ ${p.name} (${p.slug}) — 5 variants, ${p.photoCount} photos seeded`);
  }

  console.log("Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
