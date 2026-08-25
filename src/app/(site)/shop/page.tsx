import { Suspense } from "react";
import type { Metadata } from "next";
import { getFacetOptions, getProducts, CATEGORY_LABEL, type Facets } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { ShopShell } from "@/components/site/ShopShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المجموعة",
  description: "عبايات وبشوت وجلابيات من ليريشيا — تفصيل خاص وتطريز يدوي.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => {
    const v = sp[k];
    return typeof v === "string" && v.length ? v : undefined;
  };

  const facets: Facets = {
    category: pick("category"),
    color: pick("color"),
    fabric: pick("fabric"),
    occasion: pick("occasion"),
    embroidery: pick("embroidery"),
  };

  const [products, facetOptions] = await Promise.all([
    getProducts(facets),
    getFacetOptions(),
  ]);

  const title = facets.category ? CATEGORY_LABEL[facets.category] ?? "المجموعة" : "المجموعة";

  return (
    <div
      className="container-l"
      style={{ paddingBlockStart: 40, paddingBlockEnd: "var(--section-gap)" }}
    >
      <h1 style={{ fontSize: "var(--t-h1)", lineHeight: 1.35 }}>{title}</h1>
      <p className="mt-3 max-w-[52ch] text-ink2" style={{ fontSize: "var(--t-body)", lineHeight: 1.85 }}>
        قطع محدودة تُفصَّل على المقاس. اختاري القماش والتطريز، وسنتكفّل بالباقي.
      </p>

      <div style={{ blockSize: "calc(var(--u) * 48)" }} />

      <Suspense fallback={null}>
        <ShopShell facetOptions={facetOptions} total={products.length}>
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3} />
          ))}
        </ShopShell>
      </Suspense>

      {!products.length && (
        <p className="mt-12 text-muted" style={{ fontSize: "var(--t-body-s)" }}>
          لا توجد قطع مطابقة لاختيارك حالياً.
        </p>
      )}
    </div>
  );
}
