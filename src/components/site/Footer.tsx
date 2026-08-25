import Link from "next/link";

export function Footer({
  whatsappNumber,
  instagram,
  facebook,
  city,
}: {
  whatsappNumber: string;
  instagram: string;
  facebook: string;
  city: string;
}) {
  const cols = [
    {
      title: "المتجر",
      links: [
        { href: "/shop", label: "كل القطع" },
        { href: "/shop?occasion=مناسبات", label: "لمناسباتك" },
        { href: "/shop?occasion=يومي", label: "لكل يوم" },
        { href: "/shop?embroidery=تطريز يدوي", label: "المطرّز يدوياً" },
      ],
    },
    {
      title: "الدار",
      links: [
        { href: "/atelier", label: "الأتيليه" },
        { href: "/size-guide", label: "دليل المقاسات" },
        { href: "/care", label: "العناية بالقطعة" },
        { href: "/shipping", label: "الشحن والإرجاع" },
      ],
    },
  ];

  return (
    <footer style={{ background: "var(--color-ink)", color: "var(--color-sand)" }}>
      <div
        className="container-l"
        style={{ paddingBlock: "calc(var(--u) * 72)" }}
      >
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--t-h2)",
                color: "var(--color-goldlight)",
                lineHeight: 1.4,
              }}
            >
              ليريشيا
            </p>
            <p
              className="mt-3 max-w-[46ch]"
              style={{ fontSize: "var(--t-body-s)", color: "#C7BFB2", lineHeight: 1.85 }}
            >
              أناقة بتفاصيلها. عبايات وبشوت مصنوعة في طرابلس بتطريز يدوي وتفصيل
              خاص، لقطعة تشبهك وحدك.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p
                className="label"
                style={{
                  color: "var(--color-goldlight)",
                  borderBlockEnd: "0.5px solid rgba(201,169,106,.4)",
                  paddingBlockEnd: 10,
                }}
              >
                {c.title}
              </p>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hov" style={{ fontSize: "var(--t-body-s)" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-col gap-4 pt-8 md:flex-row md:items-center md:justify-between"
          style={{ borderBlockStart: "0.5px solid rgba(201,169,106,.35)" }}
        >
          <div className="flex flex-wrap items-center gap-5" style={{ fontSize: "var(--t-body-s)" }}>
            <a
              className="hov"
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              واتساب <span className="ltr num">+{whatsappNumber.replace(/\D/g, "")}</span>
            </a>
            <a
              className="hov"
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              إنستغرام <span className="ltr">@{instagram}</span>
            </a>
            <a className="hov" href={facebook} target="_blank" rel="noopener noreferrer">
              فيسبوك
            </a>
          </div>
          <p className="micro" style={{ color: "#9A9186" }}>
            {city} · <span className="num ltr">© {new Date().getFullYear()}</span> ليريشيا
          </p>
        </div>
      </div>
    </footer>
  );
}
