"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import { FACET_LABEL, type Facets } from "@/lib/catalog-shared";
import { track } from "@/lib/track";

type Option = { value: string; label: string; count: number };
export type FacetOptions = Record<keyof Facets, Option[]>;

const GROUPS: (keyof Facets)[] = [
  "category",
  "occasion",
  "color",
  "fabric",
  "embroidery",
];

export function ShopShell({
  facetOptions,
  total,
  children,
}: {
  facetOptions: FacetOptions;
  total: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useSearchParams();
  // null = "whatever the stylesheet says" (2 on mobile, 3 on desktop). The
  // view switch only ever overrides an explicit choice, so no effect is needed
  // to discover the viewport.
  const [cols, setCols] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", drawer);
    return () => document.body.classList.remove("no-scroll");
  }, [drawer]);

  const active = GROUPS.flatMap((g) => {
    const v = params.get(g);
    return v ? [{ group: g, value: v }] : [];
  });

  function setFacet(group: keyof Facets, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(group) === value) next.delete(group);
    else next.set(group, value);
    track("filter_apply", { meta: { group, value } });
    router.push(`/shop?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      {/* header strip: [breadcrumb] [view switch] [filter] */}
      <div className="hair flex items-center justify-between" style={{ paddingBlockEnd: 14 }}>
        <span className="label text-muted">
          المجموعة · <span className="num">{formatNumber(total)}</span> قطعة
        </span>

        <div className="hidden items-center gap-3 md:flex">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCols(n)}
              className="label num"
              aria-pressed={(cols ?? 3) === n}
              style={{
                opacity: (cols ?? 3) === n ? 1 : 0.45,
                borderBlockEnd:
                  (cols ?? 3) === n ? "0.5px solid var(--color-ink)" : "none",
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <button className="label cta-line" onClick={() => setDrawer(true)}>
          فلترة{active.length ? ` (${active.length})` : ""}
        </button>
      </div>

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {active.map((a) => (
            <button
              key={`${a.group}-${a.value}`}
              className="label hov"
              style={{ border: "0.5px solid var(--color-line-strong)", padding: "6px 12px" }}
              onClick={() => setFacet(a.group, null)}
            >
              {facetOptions[a.group].find((o) => o.value === a.value)?.label ?? a.value} ×
            </button>
          ))}
          <button className="label hov text-muted" onClick={() => router.push("/shop")}>
            مسح الكل
          </button>
        </div>
      )}

      <div
        className="pgrid cols-2 md-cols-3 mt-10"
        style={cols === null ? undefined : { ["--cols" as string]: cols }}
      >
        {children}
      </div>

      {/* filter drawer */}
      <div className="scrim" data-open={drawer} onClick={() => setDrawer(false)} aria-hidden />
      <aside className="drawer elev" data-open={drawer} aria-hidden={!drawer} aria-label="فلترة">
        <div
          className="hair flex items-center justify-between"
          style={{ padding: "18px var(--drawer-pad)" }}
        >
          <h2 style={{ fontSize: "var(--t-h4)", fontWeight: 500 }}>فلترة</h2>
          <button className="label hov" onClick={() => setDrawer(false)}>
            إغلاق
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {GROUPS.map((g) => {
            const opts = facetOptions[g];
            if (!opts?.length) return null;
            return (
              <details key={g} open className="hair">
                <summary
                  className="label cursor-pointer list-none"
                  style={{ padding: "15px var(--drawer-pad)" }}
                >
                  {FACET_LABEL[g]}
                </summary>
                <ul style={{ paddingBlockEnd: 12 }}>
                  {opts.map((o) => {
                    const on = params.get(g) === o.value;
                    return (
                      <li key={o.value}>
                        <button
                          className="flex w-full items-center justify-between"
                          style={{
                            padding: "10px var(--drawer-pad)",
                            fontSize: "var(--t-body-s)",
                            opacity: on ? 1 : 0.75,
                          }}
                          onClick={() => setFacet(g, o.value)}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              style={{
                                inlineSize: 12,
                                blockSize: 12,
                                border: "0.5px solid var(--color-line-strong)",
                                background: on ? "var(--color-ink)" : "transparent",
                              }}
                            />
                            {o.label}
                          </span>
                          <span className="micro num">{formatNumber(o.count)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>

        <div className="hair-t" style={{ padding: "var(--drawer-pad)" }}>
          <button className="btn-solid" onClick={() => setDrawer(false)}>
            عرض النتائج (<span className="num">{formatNumber(total)}</span>)
          </button>
        </div>
      </aside>
    </>
  );
}
