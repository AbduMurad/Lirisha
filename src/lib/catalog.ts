import { prisma } from "./prisma";
import { CATEGORY_LABEL, type Facets } from "./catalog-shared";

export { CATEGORY_LABEL, FACET_LABEL, parseList } from "./catalog-shared";
export type { Facets } from "./catalog-shared";

export const productSelect = {
  include: { images: { orderBy: { position: "asc" as const } } },
};

export async function getProducts(facets: Facets = {}, take?: number) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(facets.category ? { category: facets.category } : {}),
      ...(facets.color ? { colorAr: facets.color } : {}),
      ...(facets.fabric ? { fabric: facets.fabric } : {}),
      ...(facets.occasion ? { occasion: facets.occasion } : {}),
      ...(facets.embroidery ? { embroidery: facets.embroidery } : {}),
    },
    ...productSelect,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    ...(take ? { take } : {}),
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    ...productSelect,
  });
}

export async function getSiblings(groupKey: string | null, excludeId: string) {
  if (!groupKey) return [];
  return prisma.product.findMany({
    where: { groupKey, isActive: true, NOT: { id: excludeId } },
    ...productSelect,
  });
}

export async function getRelated(category: string, excludeId: string, take = 4) {
  return prisma.product.findMany({
    where: { category, isActive: true, NOT: { id: excludeId } },
    ...productSelect,
    take,
    orderBy: { createdAt: "desc" },
  });
}

/** Facet values with live counts, for the filter drawer. */
export async function getFacetOptions() {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      category: true,
      colorAr: true,
      fabric: true,
      occasion: true,
      embroidery: true,
    },
  });

  const tally = (pick: (r: (typeof rows)[number]) => string) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const v = pick(r).trim();
      if (v) m.set(v, (m.get(v) ?? 0) + 1);
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));
  };

  return {
    category: tally((r) => r.category).map((o) => ({
      ...o,
      label: CATEGORY_LABEL[o.value] ?? o.value,
    })),
    color: tally((r) => r.colorAr).map((o) => ({ ...o, label: o.value })),
    fabric: tally((r) => r.fabric).map((o) => ({ ...o, label: o.value })),
    occasion: tally((r) => r.occasion).map((o) => ({ ...o, label: o.value })),
    embroidery: tally((r) => r.embroidery).map((o) => ({ ...o, label: o.value })),
  };
}

export type ProductWithImages = Awaited<ReturnType<typeof getProducts>>[number];
