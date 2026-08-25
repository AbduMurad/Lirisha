import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { EDITORIAL_IMAGES, HERO_SLIDES, HERO_VIDEO } from "@/lib/editorial";
import { HeroSlides } from "@/components/site/HeroSlides";

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


  return (
    <>
      {/* ── 1 · Hero ─────────────────────────────────────────── */}
      <section
        className="relative"
        style={{ blockSize: "calc(100svh - var(--header-h) - 40px)", minBlockSize: 460 }}
      >
        {/* Stills until the reels are exported and cut into a loop. When
            HERO_VIDEO lands it takes the desktop frame and the slideshow keeps
            phones, which is the same split the video was always going to use —
            so turning it on is one file and no restructuring. */}
        {HERO_VIDEO ? (
          <>
            <video
              className="absolute inset-0 hidden size-full object-cover md:block"
              poster={HERO_SLIDES[0]?.wide.url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            >
              <source src={HERO_VIDEO.mp4} type="video/mp4" />
              {HERO_VIDEO.webm && <source src={HERO_VIDEO.webm} type="video/webm" />}
            </video>
            <div className="md:hidden">
              <HeroSlides slides={HERO_SLIDES} />
            </div>
          </>
        ) : (
          <HeroSlides slides={HERO_SLIDES} />
        )}
        <div
          className="absolute inset-0"
          style={{
            // The frame is pale satin under a window, so the type sits on
            // near-white more often than not. Weighted for the worst case, not
            // the average one.
            background:
              "linear-gradient(to top, rgba(20,18,15,.88) 0%, rgba(20,18,15,.62) 26%, rgba(20,18,15,.20) 52%, rgba(20,18,15,0) 78%)",
          }}
        />
        <div className="container-l absolute inset-x-0 bottom-0" style={{ paddingBlockEnd: 48 }}>
          <p
            className="label"
            style={{ color: "#E7DCC8", marginBlockEnd: 14, letterSpacing: ".22em" }}
          >
            مجموعة 2026
          </p>
          <h1
            className="display"
            style={{
              fontSize: "var(--t-hero)",
              color: "#F6F2EA",
              maxInlineSize: "22ch",
            }}
          >
            أناقة بتفاصيلها
          </h1>
          <Link
            href="/shop"
            className="label mt-8 inline-block"
            style={{
              color: "#F6F2EA",
              border: "1px solid rgba(246,242,234,.5)",
              padding: "13px 32px",
              letterSpacing: ".18em",
            }}
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
                      fontFamily: "var(--font-heading)",
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
