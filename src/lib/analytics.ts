import { prisma } from "./prisma";
import { CHANNELS, type Channel } from "./attribution";

export type Range = 7 | 30 | 90;

export const RANGE_LABEL: Record<Range, string> = {
  7: "آخر 7 أيام",
  30: "آخر 30 يوماً",
  90: "آخر 90 يوماً",
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function windowStart(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
}

export type Overview = {
  visitors: number;
  newVisitors: number;
  pageViews: number;
  productViews: number;
  addToCart: number;
  checkoutStart: number;
  orders: number;
  whatsappOpened: number;
  confirmed: number;
  pipelineValue: number;
  confirmedValue: number;
  /** orders ÷ visitors */
  conversion: number;
};

export type ChannelRow = {
  channel: Channel;
  visitors: number;
  productViews: number;
  addToCart: number;
  orders: number;
  value: number;
  conversion: number;
};

export type DayRow = { day: string; visitors: number; orders: number };

export type ProductRow = {
  id: string;
  slug: string;
  nameAr: string;
  colorAr: string;
  image: string;
  price: number | null;
  views: number;
  addToCart: number;
  ordered: number;
  value: number;
};

export async function getDashboard(days: number) {
  const start = windowStart(days);

  const [events, visitors, orders, products] = await Promise.all([
    prisma.event.findMany({
      where: { createdAt: { gte: start } },
      select: { type: true, visitorId: true, productId: true, createdAt: true },
    }),
    prisma.visitor.findMany({
      where: { OR: [{ lastSeenAt: { gte: start } }, { firstSeenAt: { gte: start } }] },
      select: { id: true, channel: true, firstSeenAt: true, device: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: start } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        nameAr: true,
        colorAr: true,
        price: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);

  const channelOf = new Map(visitors.map((v) => [v.id, v.channel as Channel]));

  // ── overview ──────────────────────────────────────────────
  const activeVisitors = new Set(events.map((e) => e.visitorId));
  const count = (t: string) => events.filter((e) => e.type === t).length;

  const CONFIRMED = new Set(["confirmed", "paid", "shipped", "delivered"]);
  const confirmedOrders = orders.filter((o) => CONFIRMED.has(o.status));

  const overview: Overview = {
    visitors: activeVisitors.size,
    newVisitors: visitors.filter((v) => v.firstSeenAt >= start).length,
    pageViews: count("page_view"),
    productViews: count("product_view"),
    addToCart: count("add_to_cart"),
    checkoutStart: count("checkout_start"),
    orders: orders.length,
    whatsappOpened: orders.filter((o) => o.whatsappOpenedAt).length,
    confirmed: confirmedOrders.length,
    pipelineValue: orders.reduce((s, o) => s + o.subtotal, 0),
    confirmedValue: confirmedOrders.reduce((s, o) => s + o.subtotal, 0),
    conversion: activeVisitors.size ? (orders.length / activeVisitors.size) * 100 : 0,
  };

  // ── by channel ────────────────────────────────────────────
  const blank = () => ({ visitors: new Set<string>(), productViews: 0, addToCart: 0, orders: 0, value: 0 });
  const acc = new Map<Channel, ReturnType<typeof blank>>(CHANNELS.map((c) => [c, blank()]));

  for (const e of events) {
    const ch = channelOf.get(e.visitorId) ?? "direct";
    const row = acc.get(ch);
    if (!row) continue;
    row.visitors.add(e.visitorId);
    if (e.type === "product_view") row.productViews += 1;
    if (e.type === "add_to_cart") row.addToCart += 1;
  }
  for (const o of orders) {
    const row = acc.get((o.channel as Channel) ?? "direct");
    if (!row) continue;
    row.orders += 1;
    row.value += o.subtotal;
  }

  const byChannel: ChannelRow[] = CHANNELS.map((channel) => {
    const r = acc.get(channel)!;
    return {
      channel,
      visitors: r.visitors.size,
      productViews: r.productViews,
      addToCart: r.addToCart,
      orders: r.orders,
      value: r.value,
      conversion: r.visitors.size ? (r.orders / r.visitors.size) * 100 : 0,
    };
  })
    .filter((r) => r.visitors > 0 || r.orders > 0)
    .sort((a, b) => b.visitors - a.visitors || b.orders - a.orders);

  // ── daily series ──────────────────────────────────────────
  const dayMap = new Map<string, { v: Set<string>; o: number }>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dayMap.set(dayKey(d), { v: new Set(), o: 0 });
  }
  for (const e of events) {
    dayMap.get(dayKey(e.createdAt))?.v.add(e.visitorId);
  }
  for (const o of orders) {
    const bucket = dayMap.get(dayKey(o.createdAt));
    if (bucket) bucket.o += 1;
  }
  const series: DayRow[] = [...dayMap.entries()].map(([day, b]) => ({
    day,
    visitors: b.v.size,
    orders: b.o,
  }));

  // ── product performance ───────────────────────────────────
  const pAcc = new Map<string, { views: number; atc: number; ordered: number; value: number }>();
  const bump = (id: string) =>
    pAcc.get(id) ?? (pAcc.set(id, { views: 0, atc: 0, ordered: 0, value: 0 }), pAcc.get(id)!);

  for (const e of events) {
    if (!e.productId) continue;
    if (e.type === "product_view") bump(e.productId).views += 1;
    if (e.type === "add_to_cart") bump(e.productId).atc += 1;
  }
  for (const o of orders) {
    for (const it of o.items) {
      if (!it.productId) continue;
      const r = bump(it.productId);
      r.ordered += it.qty;
      r.value += (it.price ?? 0) * it.qty;
    }
  }

  const topProducts: ProductRow[] = products
    .map((p) => {
      const r = pAcc.get(p.id) ?? { views: 0, atc: 0, ordered: 0, value: 0 };
      return {
        id: p.id,
        slug: p.slug,
        nameAr: p.nameAr,
        colorAr: p.colorAr,
        image: p.images[0]?.url ?? "",
        price: p.price,
        views: r.views,
        addToCart: r.atc,
        ordered: r.ordered,
        value: r.value,
      };
    })
    .filter((p) => p.views || p.addToCart || p.ordered)
    .sort((a, b) => b.ordered - a.ordered || b.views - a.views)
    .slice(0, 10);

  // ── funnel ────────────────────────────────────────────────
  const funnel = [
    { label: "زيارات", value: overview.visitors },
    { label: "مشاهدة قطعة", value: new Set(events.filter((e) => e.type === "product_view").map((e) => e.visitorId)).size },
    { label: "إضافة للحقيبة", value: new Set(events.filter((e) => e.type === "add_to_cart").map((e) => e.visitorId)).size },
    { label: "بدء الطلب", value: new Set(events.filter((e) => e.type === "checkout_start").map((e) => e.visitorId)).size },
    { label: "طلب على واتساب", value: overview.whatsappOpened },
  ];

  const devices = ["mobile", "tablet", "desktop"].map((d) => ({
    device: d,
    visitors: visitors.filter((v) => v.device === d && activeVisitors.has(v.id)).length,
  }));

  return { overview, byChannel, series, topProducts, funnel, devices, recentOrders: orders.slice(0, 8) };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
