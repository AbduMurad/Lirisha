export function Prose({
  eyebrow,
  title,
  lead,
  sections,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <div
      className="container-l"
      style={{ paddingBlockStart: 48, paddingBlockEnd: "var(--section-gap)" }}
    >
      <div style={{ maxInlineSize: "62ch" }}>
        {eyebrow && (
          <p className="label" style={{ color: "var(--color-goldtext)" }}>
            {eyebrow}
          </p>
        )}
        <h1 style={{ fontSize: "var(--t-h1)", lineHeight: 1.35, marginBlockStart: 10 }}>
          {title}
        </h1>
        {lead && (
          <p
            className="mt-5 text-ink2"
            style={{ fontSize: "var(--t-body-l)", lineHeight: 1.8 }}
          >
            {lead}
          </p>
        )}

        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2
                style={{
                  fontSize: "var(--t-h3)",
                  lineHeight: 1.45,
                  borderBlockEnd: "0.5px solid var(--color-gold)",
                  paddingBlockEnd: 10,
                }}
              >
                {s.heading}
              </h2>
              <div className="mt-5 space-y-4">
                {s.body.map((p, i) => (
                  <p
                    key={i}
                    className="text-ink2"
                    style={{ fontSize: "var(--t-body)", lineHeight: 1.85 }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
