import Image from "next/image";
import Link from "next/link";
import { getProducts, CATEGORY_LABEL } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    getProducts({}, 8),
    getProducts({ category: "abaya" }, 6),
  ]);

  const hero = featured[0]?.images[0]?.url ?? "/images/editorial/hero.jpg";

  return (
    <>
      {/* ── 1 · Hero ─────────────────────────────────────────── */}
      <section
        className="relative"
        style={{ blockSize: "calc(100svh - var(--header-h) - 40px)", minBlockSize: 460 }}
      >
        <Image
          src={hero}
          alt="مجموعة ليريشيا"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,24,21,.62) 0%, rgba(26,24,21,.28) 34%, rgba(26,24,21,0) 66%)",
          }}
        />
        <div className="container-l absolute inset-x-0 bottom-0" style={{ paddingBlockEnd: 48 }}>
          <p
            className="label"
            style={{ color: "var(--color-goldlight)", marginBlockEnd: 10 }}
          >
            مجموعة 2026
          </p>
          <h1
            style={{
              fontSize: "var(--t-display)",
              lineHeight: 1.3,
              color: "var(--color-ivory)",
              fontWeight: 400,
              maxInlineSize: "18ch",
            }}
          >
            أناقة بتفاصيلها
          </h1>
          <Link
            href="/shop"
            className="cta-line label mt-6 inline-block"
            style={{ color: "var(--color-ivory)" }}
          >
            اكتشفي المجموعة
          </Link>
        </div>
      </section>

      {/* ── 2 · New arrivals rail ────────────────────────────── */}
      <section style={{ marginBlockStart: "var(--section-gap)" }}>
        <div className="container-l">
          <SectionLabel title="وصل حديثاً" href="/shop" />
        </div>
        <div className="rail mt-8">
          {featured.map((p) => (
            <div key={p.id} className="w-[62vw] max-w-[300px] md:w-[300px]">
              <ProductCard product={p} sizes="300px" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 3 · Editorial · the atelier ──────────────────────── */}
      <section
        style={{ marginBlockStart: "var(--section-gap)", background: "var(--color-linen)" }}
      >
        <div className="container-l grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="crop-45 relative">
            <Image
              src={featured[2]?.images[0]?.url ?? hero}
              alt="الأتيليه"
              fill
              sizes="(min-width:768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="label" style={{ color: "var(--color-goldtext)" }}>
              الأتيليه
            </p>
            <h2 style={{ fontSize: "var(--t-h2)", lineHeight: 1.4, marginBlockStart: 12 }}>
              تفاصيل صغيرة صنعت هذا الجمال
            </h2>
            <p
              className="mt-5 text-ink2"
              style={{ fontSize: "var(--t-body)", lineHeight: 1.85, maxInlineSize: "46ch" }}
            >
              انسيابية الساتان مع تطريز يدوي متقن. كل قطعة تُفصَّل في طرابلس على
              مقاسك، بخيوط تُختار واحداً واحداً، لتعكس شخصيتك الفريدة.
            </p>
            <Link href="/atelier" className="cta-line label mt-7 inline-block">
              تعرّفي على الحرفة
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 · Category triptych ────────────────────────────── */}
      <section className="container-l" style={{ marginBlockStart: "var(--section-gap)" }}>
        <SectionLabel title="تسوّقي حسب النوع" />
        <div
          className="mt-8 grid gap-[var(--grid-gutter)] md:grid-cols-3"
        >
          {(["abaya", "bisht", "jalabiya"] as const).map((cat, i) => {
            const p = featured.find((f) => f.category === cat) ?? featured[i];
            return (
              <Link key={cat} href={`/shop?category=${cat}`} className="group block">
                <div className="crop-57 relative">
                  {p?.images[0] && (
                    <Image
                      src={p.images[0].url}
                      alt={CATEGORY_LABEL[cat]}
                      fill
                      sizes="(min-width:768px) 33vw, 90vw"
                      className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                  )}
                  <span
                    className="absolute bottom-5 label"
                    style={{
                      insetInlineStart: 20,
                      color: "var(--color-ivory)",
                      fontSize: "var(--t-h4)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {CATEGORY_LABEL[cat]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 5 · Occasion edit ────────────────────────────────── */}
      <section className="container-l" style={{ marginBlockStart: "var(--section-gap)", marginBlockEnd: "var(--section-gap)" }}>
        <SectionLabel title="لمناسباتك" href="/shop?occasion=مناسبات" />
        <div className="pgrid cols-2 mt-8">
          {latest.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

function SectionLabel({ title, href }: { title: string; href?: string }) {
  return (
    <div
      className="flex items-baseline justify-between"
      style={{ borderBlockEnd: "0.5px solid var(--color-gold)", paddingBlockEnd: 12 }}
    >
      <h2 style={{ fontSize: "var(--t-h3)", lineHeight: 1.45 }}>{title}</h2>
      {href && (
        <Link href={href} className="label hov text-muted">
          عرض الكل
        </Link>
      )}
    </div>
  );
}
