/**
 * End-to-end check of the thing that matters: a visitor arriving from a
 * Facebook link adds a piece, checks out, and the order lands in the database
 * with the right attribution, the right total, and a WhatsApp URL that carries
 * the reference.
 *
 *   node scripts/verify-flow.mjs
 */
import { chromium } from "playwright";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

const BASE = process.env.BASE ?? "http://localhost:3000";
// CI installs its own browser (`npx playwright install chromium`), so the
// default launch is correct there. Only override when a sandbox pins the
// binary somewhere Playwright can't discover it.
const EXE = process.env.PLAYWRIGHT_CHROMIUM_PATH;

const checks = [];
const check = (name, pass, detail = "") => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  extraHTTPHeaders: { referer: "https://m.facebook.com/" },
});
const page = await ctx.newPage();

// Block the wa.me hand-off so the run doesn't wander off to WhatsApp.
let waUrl = null;
await ctx.route("**://wa.me/**", (route) => {
  waUrl = route.request().url();
  return route.abort();
});

// 1 · land from a Facebook link with a campaign tag
await page.goto(`${BASE}/?utm_source=facebook&utm_medium=social&utm_campaign=verify-run`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(1200);

const vid = (await ctx.cookies()).find((c) => c.name === "lir_vid")?.value;
check("visitor cookie issued", Boolean(vid), vid?.slice(0, 8));

const visitor = vid ? await prisma.visitor.findUnique({ where: { id: vid } }) : null;
check("visitor row created", Boolean(visitor));
check("channel resolved to facebook", visitor?.channel === "facebook", visitor?.channel);
check("utm campaign captured", visitor?.utmCampaign === "verify-run", visitor?.utmCampaign ?? "—");

// 2 · open a product
await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
const href = await page.locator('a[href^="/product/"]').first().getAttribute("href");
await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const slug = href.split("/").pop();
const product = await prisma.product.findUnique({ where: { slug } });
const pv = await prisma.event.count({ where: { visitorId: vid, type: "product_view", productId: product.id } });
check("product_view tracked", pv > 0, `${pv} event(s)`);

// 3 · add to bag
await page.getByRole("button", { name: /أضيفي إلى الحقيبة/ }).click();
await page.waitForTimeout(800);
const atc = await prisma.event.count({ where: { visitorId: vid, type: "add_to_cart" } });
check("add_to_cart tracked", atc > 0);

// 4 · check out
await page.getByRole("button", { name: "متابعة الطلب" }).click();
await page.waitForTimeout(400);
await page.getByPlaceholder("الاسم الكامل").fill("اختبار آلي");
await page.getByPlaceholder("0910000000").fill("0913334444");
await page.getByPlaceholder("طرابلس").fill("طرابلس");
await page.getByRole("button", { name: "إتمام الطلب عبر واتساب" }).click();
await page.waitForTimeout(2500);

const order = await prisma.order.findFirst({
  where: { visitorId: vid },
  include: { items: true },
  orderBy: { createdAt: "desc" },
});

check("order row created", Boolean(order), order?.ref);
check("attribution frozen onto order", order?.channel === "facebook", order?.channel);
check("campaign frozen onto order", order?.utmCampaign === "verify-run", order?.utmCampaign ?? "—");
check(
  "server-side price used (client never sets it)",
  order?.subtotal === (product.price ?? 0) * (order?.items[0]?.qty ?? 0),
  `${order?.subtotal} vs ${product.price}`,
);
check("size and length captured", Boolean(order?.items[0]?.size && order?.items[0]?.length),
  `${order?.items[0]?.size} / ${order?.items[0]?.length}`);
check("whatsapp hand-off attempted", Boolean(waUrl));
check("reference is in the whatsapp message", Boolean(waUrl && order && decodeURIComponent(waUrl).includes(order.ref)));
check("whatsappOpenedAt stamped", Boolean(order?.whatsappOpenedAt));
check("confirmation shows the reference", (await page.textContent("body")).includes(order?.ref ?? "@@"));

// 5 · the dashboard's attribution query sees it
const fbOrders = await prisma.order.count({ where: { channel: "facebook" } });
check("facebook orders visible to the dashboard query", fbOrders > 0, `${fbOrders} order(s)`);

// 6 · a customer whose ad-blocker eats /api/track must still be able to order.
//     The proxy issues the cookie but no Visitor row exists, which used to
//     violate the Event foreign key and 500 the checkout.
const blocked = await browser.newContext({
  extraHTTPHeaders: { referer: "https://www.instagram.com/" },
});
const bp = await blocked.newPage();
await bp.route("**/api/track", (r) => r.abort());
await bp.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
const priced = await prisma.product.findFirst({ where: { price: { not: null }, isActive: true } });
const blockedRes = await bp.evaluate(async (productId) => {
  const r = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ productId, size: "M", length: "56", qty: 1 }],
      customer: { name: "بدون تتبع", phone: "0915556666", city: "مصراتة" },
    }),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}, priced.id);

check("order succeeds with tracking blocked", blockedRes.status === 200, `HTTP ${blockedRes.status}`);
const blockedOrder = blockedRes.body?.ref
  ? await prisma.order.findUnique({ where: { ref: blockedRes.body.ref } })
  : null;
check(
  "attribution recovered from the referer header",
  blockedOrder?.channel === "instagram",
  blockedOrder?.channel ?? "—",
);
if (blockedOrder) await prisma.order.delete({ where: { id: blockedOrder.id } });
if (blockedOrder?.visitorId)
  await prisma.visitor.delete({ where: { id: blockedOrder.visitorId } }).catch(() => {});
await blocked.close();

// 7 · admin is actually protected
const anon = await browser.newContext();
const anonPage = await anon.newPage();
const res = await anonPage.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
check("admin redirects anonymous visitors", anonPage.url().includes("/admin/login"), anonPage.url());
check("admin responded 200 after redirect", res.status() === 200, String(res.status()));

// cleanup: remove the test order + visitor so the demo data stays clean
if (order) await prisma.order.delete({ where: { id: order.id } });
if (vid) await prisma.visitor.delete({ where: { id: vid } }).catch(() => {});

await browser.close();
await prisma.$disconnect();

const failed = checks.filter((c) => !c.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
