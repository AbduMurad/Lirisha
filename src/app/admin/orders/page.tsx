import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminShell, Card } from "@/components/admin/AdminShell";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { formatDateTime, formatPrice, formatOrderTotal } from "@/lib/format";
import { CHANNEL_LABEL_AR, type Channel } from "@/lib/attribution";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status = (ORDER_STATUSES as readonly string[]).includes(sp.status ?? "")
    ? sp.status
    : undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminShell
      title="الطلبات"
      right={
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/admin/orders"
            className="label"
            style={{ opacity: status ? 0.5 : 1 }}
          >
            الكل
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className="label"
              style={{ opacity: status === s ? 1 : 0.5 }}
            >
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      }
    >
      {!orders.length && (
        <p className="text-muted" style={{ fontSize: "var(--t-body-s)" }}>
          لا توجد طلبات بعد. سيظهر هنا كل طلب يُنشأ من الموقع قبل أن يُفتح على واتساب.
        </p>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o.id}
            id={o.ref}
            style={{ border: "0.5px solid var(--color-line)", padding: 18 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex flex-wrap items-baseline gap-3">
                  <span className="ltr num" style={{ fontWeight: 500 }}>
                    {o.ref}
                  </span>
                  <span style={{ fontSize: "var(--t-body-s)" }}>{o.customerName}</span>
                  <a
                    href={`https://wa.me/${o.phone.replace(/\D/g, "").replace(/^0/, "218")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="micro ltr num hov"
                  >
                    {o.phone}
                  </a>
                  <span className="micro">{o.city}</span>
                </p>
                <p className="micro mt-1">
                  {CHANNEL_LABEL_AR[o.channel as Channel] ?? o.channel}
                  {o.utmCampaign ? ` · حملة ${o.utmCampaign}` : ""}
                  {o.landingPath ? ` · دخلت من ${o.landingPath}` : ""}
                  {" · "}
                  <span className="num">{formatDateTime(o.createdAt)}</span>
                  {o.whatsappOpenedAt ? " · فُتح على واتساب" : " · لم يُفتح بعد"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="num" style={{ fontSize: "var(--t-body-l)" }}>
                  {formatOrderTotal(o.subtotal, o.hasQuoteItems)}
                </span>
                <StatusSelect id={o.id} value={o.status} />
              </div>
            </div>

            <ul className="hair-t mt-4 space-y-2 pt-4">
              {o.items.map((it) => (
                <li key={it.id} className="flex flex-wrap items-baseline gap-3" style={{ fontSize: "var(--t-body-s)" }}>
                  <span>{it.nameAr}</span>
                  {it.colorAr && <span className="text-muted">— {it.colorAr}</span>}
                  <span className="micro">
                    مقاس {it.size || "—"} · طول <span className="ltr num">{it.length || "—"}</span> ·
                    الكمية <span className="num">{it.qty}</span>
                  </span>
                  <span className="num text-muted">{formatPrice(it.price)}</span>
                </li>
              ))}
            </ul>

            {o.note && (
              <p className="micro mt-3">
                ملاحظة الزبونة: {o.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {orders.length > 0 && (
        <div className="mt-8">
          <Card title="كيف تُقرأ هذه الصفحة" hint="">
            <p className="text-ink2" style={{ fontSize: "var(--t-body-s)", lineHeight: 1.85 }}>
              كل طلب يُسجَّل هنا لحظة ضغط الزبونة على «إتمام الطلب عبر واتساب» — قبل أن
              تصل الرسالة. «فُتح على واتساب» يعني أن المتصفح فتح المحادثة فعلاً؛ إن بقي
              الطلب «لم يُفتح بعد» فالغالب أن المتصفح منع النافذة. رقم الطلب نفسه يظهر في
              نص الرسالة، فتستطيعين مطابقة المحادثة بالسجل هنا وبالمصدر الذي جاءت منه.
            </p>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
