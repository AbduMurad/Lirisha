"use client";

import { useRef, useState } from "react";
import { formatNumber, formatPrice } from "@/lib/format";
import { CHANNEL_LABEL_AR, CHANNEL_COLOR, FUNNEL_RAMP, type Channel } from "@/lib/attribution";
import type { ChannelRow, DayRow } from "@/lib/analytics";

const INK = "#1A1815";
const MUTED = "#6E665C";
const LINE = "#DDD6C9";
const SURFACE = "#FBF9F5";

const W = 820;
const PAD_X = 34;

const shortDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

/* ══════════════════════════════════════════════════════════════
   Trend — two small multiples, one measure each. Never a dual axis:
   visitors and orders differ by an order of magnitude, so they get
   their own y-scale and their own plot, stacked on a shared x.
   ══════════════════════════════════════════════════════════════ */

export function TrendChart({ series }: { series: DayRow[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  if (!series.length) return null;

  const n = series.length;
  const inner = W - PAD_X * 2;
  const x = (i: number) => PAD_X + (n === 1 ? inner / 2 : (i * inner) / (n - 1));

  const maxV = Math.max(1, ...series.map((d) => d.visitors));
  const maxO = Math.max(1, ...series.map((d) => d.orders));

  const H1 = 150;
  const yV = (v: number) => H1 - 18 - (v / maxV) * (H1 - 34);

  const path = series.map((d, i) => `${i ? "L" : "M"}${x(i)},${yV(d.visitors)}`).join(" ");
  const area = `${path} L${x(n - 1)},${H1 - 18} L${x(0)},${H1 - 18} Z`;

  const H2 = 96;
  const barW = Math.max(3, Math.min(18, inner / n - 3));
  const yO = (v: number) => H2 - 18 - (v / maxO) * (H2 - 30);

  const ticks = [0, Math.floor((n - 1) / 2), n - 1];

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    // the chart is RTL-agnostic: the SVG itself is drawn left→right
    const frac = (e.clientX - box.left) / box.width;
    const px = frac * W;
    const i = Math.round(((px - PAD_X) / inner) * (n - 1));
    setHover(i >= 0 && i < n ? i : null);
  }

  const h = hover !== null ? series[hover] : null;

  return (
    <div ref={wrap} onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="relative">
      <div className="mb-1 flex items-baseline gap-3">
        <span className="label">الزيارات</span>
        <span className="micro num">{formatNumber(series.reduce((s, d) => s + d.visitors, 0))} إجمالاً</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H1}`} width="100%" role="img" aria-label="الزيارات اليومية">
        <line x1={PAD_X} x2={W - PAD_X} y1={H1 - 18} y2={H1 - 18} stroke={LINE} strokeWidth="1" />
        <line x1={PAD_X} x2={W - PAD_X} y1={yV(maxV)} y2={yV(maxV)} stroke={LINE} strokeWidth="1" strokeDasharray="2 4" />
        <text x={PAD_X - 6} y={yV(maxV) + 4} textAnchor="end" fontSize="10" fill={MUTED}>
          {maxV}
        </text>
        <path d={area} fill="#2a78d6" fillOpacity="0.10" />
        <path d={path} fill="none" stroke="#2a78d6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={10} y2={H1 - 18} stroke={INK} strokeWidth="1" strokeOpacity=".35" />
            <circle cx={x(hover)} cy={yV(series[hover].visitors)} r="5" fill="#2a78d6" stroke={SURFACE} strokeWidth="2" />
          </>
        )}
      </svg>

      <div className="mt-3 mb-1 flex items-baseline gap-3">
        <span className="label">الطلبات</span>
        <span className="micro num">{formatNumber(series.reduce((s, d) => s + d.orders, 0))} إجمالاً</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H2}`} width="100%" role="img" aria-label="الطلبات اليومية">
        <line x1={PAD_X} x2={W - PAD_X} y1={H2 - 18} y2={H2 - 18} stroke={LINE} strokeWidth="1" />
        {series.map((d, i) => {
          const top = yO(d.orders);
          const height = Math.max(d.orders ? 3 : 0, H2 - 18 - top);
          return (
            <rect
              key={d.day}
              x={x(i) - barW / 2}
              y={H2 - 18 - height}
              width={barW}
              height={height}
              rx="2"
              fill="#1c5cab"
              fillOpacity={hover === null || hover === i ? 1 : 0.35}
            />
          );
        })}
        {ticks.map((i) => (
          <text key={i} x={x(i)} y={H2 - 4} textAnchor="middle" fontSize="10" fill={MUTED}>
            {shortDay(series[i].day)}
          </text>
        ))}
      </svg>

      {h && (
        <div
          className="elev pointer-events-none absolute top-0"
          style={{
            insetInlineStart: `${(x(hover!) / W) * 100}%`,
            transform: "translateX(-50%)",
            border: `0.5px solid ${LINE}`,
            padding: "8px 10px",
            minInlineSize: 150,
          }}
        >
          <p className="micro num ltr" style={{ textAlign: "start" }}>
            {h.day}
          </p>
          <p className="label num">
            <span style={{ color: "#2a78d6" }}>■</span> {formatNumber(h.visitors)} زيارة
          </p>
          <p className="label num">
            <span style={{ color: "#1c5cab" }}>■</span> {formatNumber(h.orders)} طلب
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Channels — horizontal bars. Three hues sit below 3:1 on ivory, so
   every bar carries a visible direct label (the relief rule).
   ══════════════════════════════════════════════════════════════ */

export function ChannelBars({ rows }: { rows: ChannelRow[] }) {
  const [hover, setHover] = useState<string | null>(null);
  if (!rows.length) return <Empty />;
  const max = Math.max(1, ...rows.map((r) => r.visitors));

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div
          key={r.channel}
          onPointerEnter={() => setHover(r.channel)}
          onPointerLeave={() => setHover(null)}
        >
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="label flex items-center gap-2">
              <span
                aria-hidden
                style={{
                  inlineSize: 9,
                  blockSize: 9,
                  background: CHANNEL_COLOR[r.channel as Channel],
                  display: "inline-block",
                }}
              />
              {CHANNEL_LABEL_AR[r.channel as Channel]}
            </span>
            <span className="micro num">
              {formatNumber(r.visitors)} زيارة · {formatNumber(r.orders)} طلب
            </span>
          </div>
          <div style={{ background: "#EFEBE3", blockSize: 10, position: "relative" }}>
            <div
              style={{
                inlineSize: `${(r.visitors / max) * 100}%`,
                blockSize: "100%",
                background: CHANNEL_COLOR[r.channel as Channel],
                borderStartEndRadius: 4,
                borderEndEndRadius: 4,
                opacity: hover === null || hover === r.channel ? 1 : 0.45,
                transition: "opacity 150ms",
              }}
            />
          </div>
          {hover === r.channel && (
            <p className="micro num mt-1">
              معدل التحويل {r.conversion.toFixed(1)}% · القيمة {formatPrice(r.value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Funnel — one hue, ordinal ramp, monotone lightness, direct labels.
   ══════════════════════════════════════════════════════════════ */

export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="space-y-4">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const drop = prev && prev > 0 ? (s.value / prev) * 100 : null;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="label">{s.label}</span>
              <span className="micro num">
                {formatNumber(s.value)}
                {drop !== null ? ` · ${drop.toFixed(0)}%` : ""}
              </span>
            </div>
            <div style={{ background: "#EFEBE3", blockSize: 10 }}>
              <div
                style={{
                  inlineSize: `${(s.value / max) * 100}%`,
                  blockSize: "100%",
                  background: FUNNEL_RAMP[Math.min(i, FUNNEL_RAMP.length - 1)],
                  borderStartEndRadius: 4,
                  borderEndEndRadius: 4,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty() {
  return (
    <p className="text-muted" style={{ fontSize: "var(--t-body-s)" }}>
      لا توجد بيانات في هذه الفترة بعد.
    </p>
  );
}
