/**
 * Builds the catalogue's image set from the house photography.
 *
 *   node scripts/import-photos.mjs <source-folder>
 *
 * The manifest lives in scripts/catalogue.mjs. Each frame names a source file
 * and where its crop window starts, because a plain centre-crop is wrong here:
 * the house blurs faces in its own photographs, and a 5:7 centre-crop of a
 * full-length model shot puts that blur in the middle of the product card. So
 * the window is placed explicitly — `top` is the fraction of source height the
 * crop begins at, `x` the horizontal centre — and the window is then the
 * largest one of the target ratio that fits below it.
 *
 * Outputs, per frame:
 *   · public/images/products/<slug>-<n>.webp      5:7, 1200×1680  (card + gallery)
 *   · public/images/products/<slug>-1-hero.webp   2:3, 1200×1800  (PDP hero only)
 *   · a 12px blur placeholder, inlined as base64
 *
 * Plus the full-bleed editorial frames in public/images/editorial/.
 *
 * Everything lands in prisma/catalogue.images.json, which the seed reads. Run
 * this whenever the photography changes, then re-seed.
 */
import sharp from "sharp";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { CATALOGUE, EDITORIAL, CARD_AR, HERO_AR } from "./catalogue.mjs";

const SRC = process.argv[2];
if (!SRC) {
  console.error("usage: node scripts/import-photos.mjs <source-folder>");
  process.exit(1);
}

const OUT_P = "public/images/products";
const OUT_E = "public/images/editorial";
await mkdir(OUT_P, { recursive: true });
await mkdir(OUT_E, { recursive: true });

/**
 * The largest window of aspect ratio `ar` that fits inside W×H starting no
 * higher than `top`, centred horizontally on `x`. Clamped to the image on every
 * side, so a bad offset degrades to a valid crop instead of throwing.
 */
function window_(W, H, ar, { top = 0, x = 0.5 } = {}) {
  const startY = Math.round(Math.min(Math.max(0, top), 0.9) * H);
  let h = H - startY;
  let w = h * ar;
  if (w > W) {
    w = W;
    h = w / ar;
  }
  w = Math.floor(w);
  h = Math.floor(h);
  const left = Math.round(Math.min(Math.max(0, x * W - w / 2), W - w));
  const y = Math.min(startY, H - h);
  return { left, top: y, width: w, height: h };
}

async function resolve(src) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const p = path.join(SRC, src + ext);
    try {
      await access(p);
      return p;
    } catch {
      /* next */
    }
  }
  throw new Error(`source frame not found: ${src} (looked in ${SRC})`);
}

async function render(input, outPath, ar, targetW, targetH, focus) {
  const img = sharp(input).rotate();
  const { width: W, height: H } = await img.metadata();
  const box = window_(W, H, ar, focus);
  await sharp(input)
    .rotate()
    .extract(box)
    .resize(targetW, targetH, { fit: "cover" })
    .webp({ quality: 82, effort: 5 })
    .toFile(outPath);
  return box;
}

async function blurOf(input, ar, focus) {
  const img = sharp(input).rotate();
  const { width: W, height: H } = await img.metadata();
  const box = window_(W, H, ar, focus);
  const buf = await sharp(input)
    .rotate()
    .extract(box)
    .resize(12, Math.round(12 / ar), { fit: "cover" })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

// ── catalogue frames ──────────────────────────────────────────
const images = {};
let frameCount = 0;

for (const piece of CATALOGUE) {
  const rows = [];

  for (const [i, frame] of piece.frames.entries()) {
    const input = await resolve(frame.src);
    const focus = { top: frame.top ?? 0, x: frame.x ?? 0.5 };
    const n = i + 1;
    const stem = `${piece.slug}-${n}${frame.suffix ?? ""}`;

    await render(input, path.join(OUT_P, `${stem}.webp`), CARD_AR, 1200, 1680, focus);
    if (i === 0) {
      await render(input, path.join(OUT_P, `${stem}-hero.webp`), HERO_AR, 1200, 1800, focus);
    }

    rows.push({
      url: `/images/products/${stem}.webp`,
      heroUrl: i === 0 ? `/images/products/${stem}-hero.webp` : undefined,
      width: 1200,
      height: 1680,
      kind: frame.kind ?? "detail",
      position: i,
      blur: await blurOf(input, CARD_AR, focus),
      source: frame.src,
    });
    frameCount += 1;
  }

  images[piece.slug] = rows;
}

// ── editorial frames ──────────────────────────────────────────
const editorial = {};
for (const e of EDITORIAL) {
  const input = await resolve(e.src);
  const focus = { top: e.top ?? 0, x: e.x ?? 0.5 };
  const h = Math.round(e.width / e.ar);
  await render(input, path.join(OUT_E, `${e.key}.webp`), e.ar, e.width, h, focus);
  editorial[e.key] = {
    url: `/images/editorial/${e.key}.webp`,
    width: e.width,
    height: h,
    blur: await blurOf(input, e.ar, focus),
    source: e.src,
  };
}

await writeFile(
  "prisma/catalogue.images.json",
  JSON.stringify({ images, editorial }, null, 2),
  "utf8",
);

console.log(
  `${frameCount} catalogue frames across ${CATALOGUE.length} pieces → ${OUT_P}\n` +
    `${EDITORIAL.length} editorial frames → ${OUT_E}\n` +
    `manifest → prisma/catalogue.images.json`,
);
