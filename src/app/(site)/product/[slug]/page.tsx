import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getProductBySlug,
  getRelated,
  getSiblings,
  parseList,
  CATEGORY_LABEL,
} from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { ProductBuy } from "@/components/site/ProductBuy";
import { ProductCard } from "@/components/site/ProductCard";
import { PageView } from "@/components/site/PageView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "غير موجود" };
  return {
    title: `${p.nameAr} — ${p.colorAr}`,
    description: p.descAr.slice(0, 160),
    openGraph: {
      title: p.nameAr,
      description: p.descAr.slice(0, 160),
      images: p.images[0]?.url ? [p.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [siblings, related, settings] = await Promise.all([
    getSiblings(product.groupKey, product.id),
    getRelated(product.category, product.id, 4),
    getSettings(),
  ]);

  const sizes = parseList(product.sizes);
  const lengths = parseList(product.lengths);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const accordions = [
    { title: "التفاصيل", body: product.detailsAr },
    { title: "العناية بالقطعة", body: product.careAr },
    {
      title: "الشحن والإرجاع",
      body: "التوصيل داخل ليبيا خلال 3 إلى 7 أيام عمل حسب المدينة. القطع المفصّلة على المقاس غير قابلة للإرجاع، ويمكن تعديل المقاس مرة واحدة مجاناً خلال أسبوع من الاستلام.",
    },
  ].filter((a) => a.body);

  return (
    <>
      <Suspense fallback={null}>
        <PageView productId={product.id} />
      </Suspense>

      <div className="container-l" style={{ paddingBlockStart: 24 }}>
        <nav className="micro">
          <Link href="/" className="hov">
            الرئيسية
          </Link>
          {" / "}
          <Link href={`/shop?category=${product.category}`} className="hov">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[55%_1fr] lg:gap-[var(--grid-gutter)]">
          {/* media — a vertical stack, never a carousel */}
          <div className="space-y-2">
            {product.images.map((im, i) => (
              <div
                key={im.id}
                className={i === 0 ? "crop-23 relative" : "crop-57 relative"}
              >
                <Image
                  src={im.url}
                  alt={im.alt || product.nameAr}
                  fill
                  priority={i === 0}
                  sizes="(min-width:1024px) 55vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
            {!product.images.length && <div className="crop-23 relative" />}
          </div>

          {/* info */}
          <div>
            <div className="lg:sticky" style={{ insetBlockStart: "calc(var(--header-h) + 24px)" }}>
              <h1 style={{ fontSize: "var(--t-h4)", fontWeight: 500, lineHeight: 1.5 }}>
                {product.nameAr}
                {product.colorAr && <span className="text-muted"> — {product.colorAr}</span>}
              </h1>
              <p
                className="num mt-2 text-muted"
                style={{ fontSize: "var(--t-body-l)" }}
              >
                {formatPrice(product.price)}
              </p>

              <p
                className="mt-5 text-ink2"
                style={{ fontSize: "var(--t-body)", lineHeight: 1.85, maxInlineSize: "46ch" }}
              >
                {product.descAr}
              </p>

              {siblings.length > 0 && (
                <div className="mt-6">
                  <span className="micro">اللون</span>
                  <div className="mt-3 flex items-center gap-3">
                    <span
                      style={{
                        inlineSize: 24,
                        blockSize: 24,
                        borderRadius: "50%",
                        background: product.colorHex,
                        boxShadow: "inset 0 0 0 1px var(--color-ink)",
                      }}
                      title={product.colorAr}
                    />
                    {siblings.map((s) => (
                      <Link
                        key={s.id}
                        href={`/product/${s.slug}`}
                        title={s.colorAr}
                        aria-label={s.colorAr}
                        style={{
                          inlineSize: 24,
                          blockSize: 24,
                          borderRadius: "50%",
                          background: s.colorHex,
                          boxShadow: "inset 0 0 0 0.5px var(--color-line)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-7">
                <ProductBuy
                  product={{
                    id: product.id,
                    slug: product.slug,
                    nameAr: product.nameAr,
                    colorAr: product.colorAr,
                    price: product.price,
                    image: product.images[0]?.url ?? "",
                  }}
                  sizes={sizes}
                  lengths={lengths}
                  whatsappNumber={settings.whatsappNumber}
                  siteUrl={siteUrl}
                />
              </div>

              <div className="mt-9">
                {accordions.map((a) => (
                  <details key={a.title} className="hair">
                    <summary
                      className="label cursor-pointer list-none"
                      style={{ paddingBlock: 16 }}
                    >
                      {a.title}
                    </summary>
                    <p
                      className="text-ink2"
                      style={{
                        fontSize: "var(--t-body-s)",
                        lineHeight: 1.85,
                        paddingBlockEnd: 18,
                      }}
                    >
                      {a.body}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section style={{ marginBlock: "var(--section-gap)" }}>
            <h2
              style={{
                fontSize: "var(--t-h3)",
                borderBlockEnd: "0.5px solid var(--color-gold)",
                paddingBlockEnd: 12,
              }}
            >
              قد يعجبكِ أيضاً
            </h2>
            <div className="pgrid cols-2 md-cols-4 mt-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
