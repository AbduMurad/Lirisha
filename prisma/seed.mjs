/**
 * Seeds the catalogue from the house's own photography.
 *
 * Text lives in scripts/catalogue.mjs; image paths and blur placeholders come
 * from prisma/catalogue.images.json, which `npm run assets:import` writes. Run
 * the import before seeding if the photography has changed.
 *
 * Prices are deliberately null — every piece reads "السعر عند الطلب" until the
 * atelier enters a real figure at /admin/products. Inventing prices for a shop
 * that takes real orders would be worse than asking.
 *
 *   node prisma/seed.mjs
 */
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { PALETTE } from "../scripts/palette.mjs";
import { CATALOGUE, CARE } from "../scripts/catalogue.mjs";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

const byKey = Object.fromEntries(PALETTE.map((p) => [p.key, p]));

const SIZES = ["S", "M", "L", "XL"];
const LENGTHS = ["54", "56", "58", "60"];

async function loadImages() {
  try {
    const raw = await readFile(new URL("./catalogue.images.json", import.meta.url), "utf8");
    return JSON.parse(raw).images ?? {};
  } catch {
    console.warn(
      "prisma/catalogue.images.json is missing — seeding without images.\n" +
        "Run: node scripts/import-photos.mjs <folder-of-photographs>",
    );
    return {};
  }
}

async function main() {
  const images = await loadImages();

  await prisma.orderItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  let pos = 0;
  for (const piece of CATALOGUE) {
    const c = byKey[piece.colorKey];
    if (!c) throw new Error(`unknown colour key: ${piece.colorKey}`);
    pos += 1;

    const frames = images[piece.slug] ?? [];

    await prisma.product.create({
      data: {
        slug: piece.slug,
        nameAr: piece.nameAr,
        nameEn: piece.nameEn,
        colorAr: c.nameAr,
        colorEn: piece.colorKey,
        colorHex: c.hex,
        groupKey: piece.groupKey,
        descAr: piece.descAr,
        detailsAr: piece.detailsAr,
        careAr: CARE,
        price: piece.price ?? null,
        category: piece.category ?? "abaya",
        fabric: piece.fabric ?? "",
        occasion: piece.occasion ?? "",
        embroidery: piece.embroidery ?? "",
        sizes: JSON.stringify(piece.sizes ?? SIZES),
        lengths: JSON.stringify(piece.lengths ?? LENGTHS),
        isFeatured: Boolean(piece.featured),
        isNew: pos <= 4,
        position: pos,
        images: {
          create: frames.map((f) => ({
            url: f.url,
            width: f.width,
            height: f.height,
            alt: `${piece.nameAr} — ${c.nameAr}`,
            kind: f.kind,
            blur: f.blur ?? "",
            position: f.position,
          })),
        },
      },
    });
  }

  for (const [key, value] of Object.entries({
    whatsappNumber: process.env.WHATSAPP_NUMBER ?? "218910000000",
    instagram: "lirisha.ly",
    announcement: "توصيل داخل ليبيا • تفصيل خاص حسب الطلب",
    city: "طرابلس، ليبيا",
  })) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  const [products, imageCount] = await Promise.all([
    prisma.product.count(),
    prisma.productImage.count(),
  ]);
  console.log(`seeded ${products} products · ${imageCount} images`);
  if (!imageCount) console.warn("no images attached — run the photo import first");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
