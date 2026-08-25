/**
 * Generates fabric-swatch placeholders so the catalogue renders before the
 * real photography is dropped in. Each file is a soft satin gradient with a
 * diagonal sheen and film grain — abstract on purpose, so it never pretends
 * to be a product photo. Replace 1:1 by file name.
 *
 *   node scripts/make-placeholders.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { PALETTE } from "./palette.mjs";

const OUT = "public/images/products";
const W = 1200;
const H = 1680;

function svg({ base, light, dark, sheen }, seed) {
  const a = 8 + (seed % 5) * 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%"  stop-color="${light}"/>
      <stop offset="45%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
    <linearGradient id="s" x1="0" y1="0" x2="1" y2="1"
      gradientTransform="rotate(${a} 0.5 0.5)">
      <stop offset="0%"   stop-color="${sheen}" stop-opacity="0"/>
      <stop offset="42%"  stop-color="${sheen}" stop-opacity=".55"/>
      <stop offset="52%"  stop-color="${sheen}" stop-opacity=".18"/>
      <stop offset="70%"  stop-color="${sheen}" stop-opacity=".42"/>
      <stop offset="100%" stop-color="${sheen}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="34%" r="74%">
      <stop offset="60%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".30"/>
    </radialGradient>
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${seed}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="26"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g filter="url(#soft)"><rect width="100%" height="100%" fill="url(#s)"/></g>
  <rect width="100%" height="100%" fill="url(#v)"/>
  <rect width="100%" height="100%" filter="url(#n)" opacity=".055"/>
</svg>`;
}

await mkdir(OUT, { recursive: true });

let n = 0;
for (const p of PALETTE) {
  for (let i = 0; i < 3; i++) {
    const file = `${OUT}/${p.key}-${i + 1}.jpg`;
    await sharp(Buffer.from(svg(p, i * 7 + p.seed)))
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(file);
    n += 1;
  }
}
console.log(`wrote ${n} placeholder images to ${OUT}`);
