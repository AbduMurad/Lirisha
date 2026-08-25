/** Client-safe catalogue vocabulary — no Prisma import, so it can be bundled. */

export type Facets = {
  category?: string;
  color?: string;
  fabric?: string;
  occasion?: string;
  embroidery?: string;
};

export const CATEGORY_LABEL: Record<string, string> = {
  abaya: "عبايات",
  bisht: "بشوت",
  jalabiya: "جلابيات",
  sheila: "شيلات",
};

export const FACET_LABEL: Record<keyof Facets, string> = {
  category: "النوع",
  color: "اللون",
  fabric: "القماش",
  occasion: "المناسبة",
  embroidery: "التطريز",
};

export const parseList = (json: string): string[] => {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};

export type ProductCardData = {
  id: string;
  slug: string;
  nameAr: string;
  colorAr: string;
  price: number | null;
  isNew: boolean;
  category: string;
  images: { id: string; url: string; alt: string }[];
};
