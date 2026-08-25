import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { getDashboard, RANGE_LABEL, type Range } from "@/lib/analytics";
import { AdminShell, Card, Stat } from "@/components/admin/AdminShell";
import { ChannelBars, Funnel, TrendChart } from "@/components/admin/Charts";
import {
  formatDateTime,
  formatNumber,
  formatPrice,
  formatPercent,
  formatOrderTotal,
} from "@/lib/format";
import { CHANNEL_LABEL_AR, type Channel } from "@/lib/attribution";
import { STATUS_LABEL } from "@/lib/orders";

export const dynamic = "force-dynamic";

const RANGES: Range[] = [7, 30, 90];

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const range = (RANGES.find((r) => String(r) === sp.range) ?? 30) as Range;
  const d = await getDashboard(range);

  return (
    <AdminShell
      title="نظرة عامة"
      right={
        <div className="flex items-center gap-4">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}`}
              className="label"
              style={{
                opacity: r === range ? 1 : 0.5,
                borderBlockEnd: r === range ? "0.5px solid var(--color-ink)" : "none",
              }}
            >
              {RANGE_LABEL[r]}
            </Link>
          ))}
        </div>
      }
    >
      <div className="grid gap-[1px] sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="زوّار"
          value={formatNumber(d.overview.visitors)}
          sub={`${formatNumber(d.overview.newVisitors)} زائرة جديدة`}
        />
        <Stat
          label="طلبات واتساب"
          value={formatNumber(d.overview.orders)}
          sub={`${formatNumber(d.overview.whatsappOpened)} فُتحت فعلياً على واتساب`}
        />
        <Stat
          label="قيمة الطلبات"
          value={formatPrice(d.overview.pipelineValue)}
          sub={`منها ${formatPrice(d.overview.confirmedValue)} مؤكَّدة`}
        />
        <Stat
          label="معدل التحويل"
          value={formatPercent(d.overview.conversion)}
          sub="طلب لكل زائرة"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="الحركة اليومية" hint={RANGE_LABEL[range]}>
            <TrendChart series={d.series} />
          </Card>
        </div>

        <Card title="مسار الشراء" hint="زائرات فريدات">
          <Funnel steps={d.funnel} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="من أين تأتي الزائرات" hint="أول زيارة، ثابتة">
          <ChannelBars rows={d.byChannel} />
          <div className="hair-t mt-6 pt-4">
            <table className="w-full" style={{ fontSize: "var(--t-body-s)" }}>
              <thead>
                <tr>
                  {["المصدر", "زيارات", "طلبات", "تحويل", "القيمة"].map((h, i) => (
                    <th
                      key={h}
                      className="micro"
                      style={{ textAlign: i === 0 ? "start" : "end", paddingBlockEnd: 8 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.byChannel.map((r) => (
                  <tr key={r.channel}>
                    <td style={{ paddingBlock: 6 }}>{CHANNEL_LABEL_AR[r.channel as Channel]}</td>
                    <td className="num" style={{ textAlign: "end" }}>{formatNumber(r.visitors)}</td>
                    <td className="num" style={{ textAlign: "end" }}>{formatNumber(r.orders)}</td>
                    <td className="num" style={{ textAlign: "end" }}>{formatPercent(r.conversion)}</td>
                    <td className="num" style={{ textAlign: "end" }}>{formatPrice(r.value)}</td>
                  </tr>
                ))}
                {!d.byChannel.length && (
                  <tr>
                    <td colSpan={5} className="micro" style={{ paddingBlock: 8 }}>
                      لا توجد زيارات مسجّلة بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="أكثر القطع تفاعلاً" hint="مشاهدة ← حقيبة ← طلب">
          <table className="w-full" style={{ fontSize: "var(--t-body-s)" }}>
            <thead>
              <tr>
                {["القطعة", "مشاهدات", "حقيبة", "طلبات"].map((h, i) => (
                  <th
                    key={h}
                    className="micro"
                    style={{ textAlign: i === 0 ? "start" : "end", paddingBlockEnd: 8 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.topProducts.map((p) => (
                <tr key={p.id} className="hair">
                  <td style={{ paddingBlock: 8 }}>
                    <Link href={`/product/${p.slug}`} className="hov">
                      {p.nameAr} <span className="text-muted">— {p.colorAr}</span>
                    </Link>
                  </td>
                  <td className="num" style={{ textAlign: "end" }}>{formatNumber(p.views)}</td>
                  <td className="num" style={{ textAlign: "end" }}>{formatNumber(p.addToCart)}</td>
                  <td className="num" style={{ textAlign: "end" }}>{formatNumber(p.ordered)}</td>
                </tr>
              ))}
              {!d.topProducts.length && (
                <tr>
                  <td colSpan={4} className="micro" style={{ paddingBlock: 8 }}>
                    لا توجد مشاهدات مسجّلة بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="أحدث الطلبات" hint="آخر 8 طلبات">
          <table className="w-full" style={{ fontSize: "var(--t-body-s)" }}>
            <thead>
              <tr>
                {["الرقم", "الزبونة", "المدينة", "المصدر", "القيمة", "الحالة", "التاريخ"].map((h, i) => (
                  <th key={h} className="micro" style={{ textAlign: i === 0 ? "start" : "start", paddingBlockEnd: 8 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.recentOrders.map((o) => (
                <tr key={o.id} className="hair">
                  <td style={{ paddingBlock: 8 }}>
                    <Link href={`/admin/orders#${o.ref}`} className="ltr num hov">
                      {o.ref}
                    </Link>
                  </td>
                  <td>{o.customerName}</td>
                  <td>{o.city}</td>
                  <td>{CHANNEL_LABEL_AR[o.channel as Channel] ?? o.channel}</td>
                  <td className="num">{formatOrderTotal(o.subtotal, o.hasQuoteItems)}</td>
                  <td>{STATUS_LABEL[o.status] ?? o.status}</td>
                  <td className="micro num">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
              {!d.recentOrders.length && (
                <tr>
                  <td colSpan={7} className="micro" style={{ paddingBlock: 8 }}>
                    لا توجد طلبات في هذه الفترة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminShell>
  );
}
