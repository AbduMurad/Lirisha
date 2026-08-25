import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { EDITORIAL_IMAGES } from "@/lib/editorial";

export const dynamic = "force-dynamic";

/** Three ways into the same nine pieces, by what the woman is dressing for. */
const EDITS = [
  { label: "لمناسباتك", href: "/shop?occasion=مناسبات", slug: "kristal-fiddi-shambani" },
  { label: "المطرّز يدوياً", href: "/shop?embroidery=تطريز يدوي", slug: "mikado-shafaq-aaji" },
  { label: "لكل يوم", href: "/shop?occasion=يومي", slug: "mi3taf-injlizi-samawi" },
];

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    getProducts({}, 8),
    getProducts({ category: "abaya" }, 6),
  ]);

  const hero = EDITORIAL_IMAGES.hero;

  return (
    <>
      {/* ── 1 · Hero ─────────────────────────────────────────── */}
      <section
        className="relative"
        style={{ blockSize: "calc(100svh - var(--header-h) - 40px)", minBlockSize: 460 }}
      >
        <Image
          src={hero.url}
          alt="مجموعة ليريشيا"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={hero.blur}
          className="object-cover"
          // The frame is a 3:4 portrait; on a wide viewport `cover` crops
          // vertically, and centring lands on the head. Bias downward so the
          // embroidered sleeve — the thing being sold — stays in shot.
          style={{ objectPosition: "center 62%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            // The hero frame is pale satin under a window, so the type sits on
            // near-white more often than not. Weighted for the worst case, not
            // the average one.
            background:
              "linear-gradient(to top, rgba(26,24,21,.80) 0%, rgba(26,24,21,.46) 30%, rgba(26,24,21,0) 68%)",
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
              src={EDITORIAL_IMAGES.atelier.url}
              alt="تطريز يدوي على قطعة من ليريشيا"
              fill
              sizes="(min-width:768px) 45vw, 90vw"
              placeholder="blur"
              blurDataURL={EDITORIAL_IMAGES.atelier.blur}
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

      {/* ── 4 · Edits ────────────────────────────────────────── */}
      <section className="container-l" style={{ marginBlockStart: "var(--section-gap)" }}>
        <SectionLabel title="تسوّقي حسب المناسبة" />
        <div className="mt-8 grid gap-[var(--grid-gutter)] md:grid-cols-3">
          {EDITS.map((edit, i) => {
            const p = featured.find((f) => f.slug === edit.slug) ?? featured[i];
            const img = p?.images[0];
            return (
              <Link key={edit.label} href={edit.href} className="group block">
                <div className="crop-57 relative">
                  {img && (
                    <Image
                      src={img.url}
                      alt={edit.label}
                      fill
                      sizes="(min-width:768px) 33vw, 90vw"
                      className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                  )}
                  <span
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      blockSize: "45%",
                      background:
                        "linear-gradient(to top, rgba(26,24,21,.55), rgba(26,24,21,0))",
                    }}
                  />
                  <span
                    className="absolute bottom-5 label"
                    style={{
                      insetInlineStart: 20,
                      color: "var(--color-ivory)",
                      fontSize: "var(--t-h4)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {edit.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 4b · The box ─────────────────────────────────────── */}
      <section className="container-l" style={{ marginBlockStart: "var(--section-gap)" }}>
        <SectionLabel title="تصلك مغلّفة" />
        <div className="mt-8 grid gap-[var(--grid-gutter)] md:grid-cols-3">
          {EDITORIAL_IMAGES.packaging.map((img, i) => (
            <div key={img.url} className="relative" style={{ aspectRatio: "1 / 1" }}>
              <Image
                src={img.url}
                alt="تغليف ليريشيا"
                fill
                sizes="(min-width:768px) 33vw, 90vw"
                placeholder="blur"
                blurDataURL={img.blur}
                className="object-cover"
                style={{ opacity: i === 1 ? 1 : 0.97 }}
              />
            </div>
          ))}
        </div>
        <p
          className="mt-6 text-ink2"
          style={{ fontSize: "var(--t-body-s)", lineHeight: 1.85, maxInlineSize: "52ch" }}
        >
          كل قطعة تُطوى وتُغلَّف باسمك قبل أن تخرج من الأتيليه. البطاقة مكتوبة
          بخطّ اليد، والتوصيل داخل ليبيا.
        </p>
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
