/**
 * DEMO DATA ONLY — generates 45 days of plausible traffic, events and
 * WhatsApp orders so the dashboard can be evaluated before the site is live.
 *
 *   node scripts/seed-analytics.mjs        # add demo data
 *   node scripts/seed-analytics.mjs --wipe # remove ALL visitors/events/orders
 *
 * Run the wipe before going live.
 */
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

const DAYS = 45;

// A Libyan abaya brand with 4.6k Facebook followers: Facebook dominates,
// Instagram second, a trickle of direct and referral.
const CHANNEL_MIX = [
  ["facebook", 0.46],
  ["instagram", 0.27],
  ["direct", 0.13],
  ["whatsapp", 0.07],
  ["google", 0.04],
  ["referral", 0.03],
];

const CITIES = ["طرابلس", "بنغازي", "مصراتة", "الزاوية", "سبها", "زليتن", "البيضاء"];
const NAMES = ["أمل", "هدى", "نور", "سارة", "مريم", "رنا", "آية", "خديجة", "سلمى", "ليلى", "زينب", "فاطمة"];

const REFERRER = {
  facebook: "https://m.facebook.com/",
  instagram: "https://l.instagram.com/",
  whatsapp: "https://wa.me/",
  google: "https://www.google.com/",
  referral: "https://libyanshopping.example/",
  direct: null,
};

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];

function weightedChannel() {
  const r = Math.random();
  let acc = 0;
  for (const [c, w] of CHANNEL_MIX) {
    acc += w;
    if (r <= acc) return c;
  }
  return "direct";
}

function device() {
  const r = Math.random();
  return r < 0.78 ? "mobile" : r < 0.88 ? "tablet" : "desktop";
}

async function wipe() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.event.deleteMany();
  await prisma.visitor.deleteMany();
  console.log("wiped visitors, events and orders");
}

async function main() {
  if (process.argv.includes("--wipe")) return wipe();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: { take: 1, orderBy: { position: "asc" } } },
  });
  if (!products.length) throw new Error("seed the catalogue first: node prisma/seed.mjs");

  let visitors = 0;
  let events = 0;
  let orders = 0;

  for (let d = DAYS - 1; d >= 0; d -= 1) {
    // gentle growth toward today + weekend lift (Fri/Sat in Libya)
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - d);
    const weekend = [5, 6].includes(day.getDay());
    const growth = 1 + (DAYS - d) / DAYS;
    const n = Math.round((12 + rnd(14)) * growth * (weekend ? 1.35 : 1));

    for (let i = 0; i < n; i += 1) {
      const channel = weightedChannel();
      const at = new Date(day);
      at.setHours(9 + rnd(14), rnd(60), rnd(60));

      const id = randomUUID();
      const landing = Math.random() < 0.5 ? "/" : `/product/${pick(products).slug}`;

      await prisma.visitor.create({
        data: {
          id,
          channel,
          utmSource: channel === "facebook" || channel === "instagram" ? channel : null,
          utmMedium: channel === "facebook" || channel === "instagram" ? "social" : null,
          utmCampaign:
            channel === "facebook" && Math.random() < 0.45
              ? pick(["ramadan-edit", "new-arrivals", "bisht-launch"])
              : null,
          referrer: REFERRER[channel],
          landingPath: landing,
          device: device(),
          firstSeenAt: at,
          lastSeenAt: at,
        },
      });
      visitors += 1;

      const push = async (type, extra = {}, offsetMin = 0) => {
        const t = new Date(at.getTime() + offsetMin * 60000);
        await prisma.event.create({
          data: { visitorId: id, type, createdAt: t, ...extra },
        });
        events += 1;
      };

      // page views: 1–5
      const pages = 1 + rnd(5);
      for (let p = 0; p < pages; p += 1) await push("page_view", { path: "/" }, p);

      // product views
      const viewed = [];
      const nViews = Math.random() < 0.62 ? 1 + rnd(4) : 0;
      for (let v = 0; v < nViews; v += 1) {
        const prod = pick(products);
        viewed.push(prod);
        await push("product_view", { productId: prod.id, path: `/product/${prod.slug}` }, 1 + v);
      }

      // add to cart
      const carted = [];
      if (viewed.length && Math.random() < 0.26) {
        const prod = pick(viewed);
        carted.push(prod);
        await push("add_to_cart", { productId: prod.id, meta: JSON.stringify({ size: "M" }) }, 6);
        if (Math.random() < 0.3) {
          const extra = pick(viewed);
          carted.push(extra);
          await push("add_to_cart", { productId: extra.id }, 7);
        }
      }

      // checkout + order
      if (carted.length && Math.random() < 0.42) {
        await push("checkout_start", {}, 9);

        const items = carted.map((p) => ({
          productId: p.id,
          nameAr: p.nameAr,
          colorAr: p.colorAr,
          slug: p.slug,
          image: p.images[0]?.url ?? "",
          price: p.price,
          size: pick(["S", "M", "L", "XL"]),
          length: pick(["54", "56", "58", "60"]),
          qty: 1,
        }));
        const subtotal = items.reduce((s, it) => s + (it.price ?? 0), 0);
        const opened = Math.random() < 0.88;

        // 45% of opened orders get confirmed on WhatsApp
        const status = !opened
          ? "pending"
          : Math.random() < 0.45
            ? pick(["confirmed", "paid", "delivered", "shipped"])
            : Math.random() < 0.15
              ? "cancelled"
              : "opened";

        const ref = `LR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const createdAt = new Date(at.getTime() + 10 * 60000);

        await prisma.order.create({
          data: {
            ref,
            visitorId: id,
            customerName: pick(NAMES),
            phone: `09${1 + rnd(3)}${String(rnd(10000000)).padStart(7, "0")}`,
            city: pick(CITIES),
            subtotal,
            hasQuoteItems: items.some((it) => it.price === null),
            status,
            whatsappOpenedAt: opened ? createdAt : null,
            confirmedAt: ["confirmed", "paid", "shipped", "delivered"].includes(status)
              ? createdAt
              : null,
            channel,
            utmSource: channel,
            landingPath: landing,
            referrer: REFERRER[channel],
            createdAt,
            updatedAt: createdAt,
            items: { create: items },
          },
        });
        await push("order_created", { meta: JSON.stringify({ ref, subtotal }) }, 10);
        if (opened) await push("whatsapp_click", { meta: JSON.stringify({ ref }) }, 10);
        orders += 1;
      }
    }
  }

  console.log(`demo data: ${visitors} visitors · ${events} events · ${orders} orders`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
