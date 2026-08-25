/**
 * Full-bleed frames used outside the catalogue.
 *
 * These are written by `npm run assets:import` into prisma/catalogue.images.json.
 * They are read here at build time rather than at request time so the home page
 * doesn't need a database round-trip for its hero, and so a missing manifest is
 * a build error rather than a blank hero in front of a customer.
 */
import manifest from "../../prisma/catalogue.images.json";

type Frame = { url: string; width: number; height: number; blur: string };

const e = manifest.editorial as Record<string, Frame>;

export const EDITORIAL_IMAGES = {
  hero: e.hero,
  atelier: e.atelier,
  packaging: [e["packaging-1"], e["packaging-2"], e["packaging-3"]].filter(Boolean),
};
