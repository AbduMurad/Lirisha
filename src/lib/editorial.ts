/**
 * Full-bleed frames used outside the catalogue.
 *
 * These are written by `npm run assets:import` into prisma/catalogue.images.json.
 * They are read here at build time rather than at request time so the home page
 * doesn't need a database round-trip for its hero, and so a missing manifest is
 * a build error rather than a blank hero in front of a customer.
 */
import manifest from "../../prisma/catalogue.images.json";

export type Frame = { url: string; width: number; height: number; blur: string };

const e = manifest.editorial as Record<string, Frame>;

export type HeroSlide = { wide: Frame; portrait: Frame; alt: string };

/**
 * Three frames, cream → black → burgundy, each shipping a wide crop for
 * desktop and a portrait for phones.
 *
 * They were chosen by measuring the mean luminance of the corner where the
 * hero block lands in RTL, not by eye. Anything much above ~110 there cannot
 * hold ivory type however hard the scrim is pushed — the original hero frame
 * measured 164, which is why its headline kept reading weak.
 */
export const HERO_SLIDES: HeroSlide[] = [
  { wide: e["hero-1-wide"], portrait: e["hero-1-portrait"], alt: "عباية شامبانيا بحواف مطرزة" },
  { wide: e["hero-2-wide"], portrait: e["hero-2-portrait"], alt: "طقم بني بتطريز معدني" },
  { wide: e["hero-3-wide"], portrait: e["hero-3-portrait"], alt: "طقم عنابي بربطة خصر" },
].filter((s) => s.wide && s.portrait);

export const EDITORIAL_IMAGES = {
  atelier: e.atelier,
  packaging: [e["packaging-1"], e["packaging-2"], e["packaging-3"]].filter(Boolean),
};

/**
 * Dropped in once the reels are exported from Meta Business Suite and encoded
 * by scripts/build-hero-video.mjs. Absent until then, and the hero falls back
 * to the still — so the page never waits on a file that isn't there.
 */
export const HERO_VIDEO: { mp4: string; webm?: string } | null = null;
