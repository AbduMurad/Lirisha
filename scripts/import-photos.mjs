/**
 * Turns a folder of raw photographs into the catalogue's image set.
 *
 *   node scripts/import-photos.mjs <source-folder> [--group satin-embroidered]
 *
 * What it does, per file, in filename order:
 *   · centre-crops to 5:7 (the card + gallery ratio) at 1200×1680
 *   · also writes a 2:3 rendition at 1200×1800 for the first shot of a group
 *     (the PDP hero)
 *   · encodes WebP q82 + a tiny base64 blur placeholder
 *   · writes public/images/products/<group>-<n>.webp
 *   · prints a ready-to-paste `images:` block for prisma/seed.mjs
 *
 * Photography notes that matter more than any of this: shoot the full length
 * with the hem in frame, always include a back shot, and keep one background
 * across the whole grid. A 1:1 crop or a mixed-background grid is the fastest
 * way to make the collection look cheap.
 */
import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/import-photos.mjs <source-folder> [--group <key>]");
  process.exit(1);
}
const gi = process.argv.indexOf("--group");
const group = gi > -1 ? process.argv[gi + 1] : path.basename(src).toLowerCase().replace(/[^a-z0-9-]+/g, "-");

const OUT = "public/images/products";
const EXT = /\.(jpe?g|png|webp|avif|heic|tiff?)$/i;

await mkdir(OUT, { recursive: true });

const files = (await readdir(src)).filter((f) => EXT.test(f)).sort();
if (!files.length) {
  console.error(`no images found in ${src}`);
  process.exit(1);
}

const manifest = [];

for (const [i, file] of files.entries()) {
  const input = path.join(src, file);
  const n = i + 1;

  const ratios = i === 0 ? [["", 1200, 1800], ["-card", 1200, 1680]] : [["", 1200, 1680]];

  for (const [suffix, w, h] of ratios) {
    const name = `${group}-${n}${suffix}.webp`;
    await sharp(input)
      .rotate()
      .resize(w, h, { fit: "cover", position: "attention" })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(OUT, name));
  }

  const blurBuf = await sharp(input).resize(12, 17, { fit: "cover" }).webp({ quality: 40 }).toBuffer();

  manifest.push({
    url: `/${OUT.replace(/^public\//, "")}/${group}-${n}.webp`,
    width: i === 0 ? 1200 : 1200,
    height: i === 0 ? 1800 : 1680,
    kind: n === 1 ? "front" : n === 2 ? "back" : n === 3 ? "three-quarter" : "detail",
    position: i,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    source: file,
  });
}

await writeFile(
  path.join(OUT, `${group}.manifest.json`),
  JSON.stringify(manifest, null, 2),
  "utf8",
);

console.log(`\n${files.length} images → ${OUT}/${group}-*.webp\n`);
console.log("paste into prisma/seed.mjs:\n");
console.log(
  JSON.stringify(
    manifest.map(({ url, width, height, kind, position }) => ({ url, width, height, kind, position })),
    null,
    2,
  ),
);
