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

/**
 * Poll until `fn` returns something truthy, or give up and return null.
 *
 * Everything this file waits for is asynchronous in a way a fixed sleep can
 * only guess at: a tracking beacon in flight, a row being written, a drawer
 * animating. `waitForTimeout(800)` passes on a fast machine and fails on a
 * loaded 2-core CI runner, which is the least useful kind of test.
 *
 * Returning null rather than throwing is deliberate — the caller still reports
 * a clean FAIL line, so a broken run prints which assertion died instead of a
 * stack trace with the remaining checks unrun.
 */
async function until(fn, { timeout = 15000, interval = 250 } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    // `fn` may be a plain accessor (`() => waUrl`) or an async query, and may
    // throw either way — await inside try covers all three.
    let value = null;
    try {
      value = await fn();
    } catch {
      value = null;
    }
    if (value) return value;
    if (Date.now() > deadline) return null;
    await new Promise((r) => setTimeout(r, interval));
  }
}

const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  extraHTTPHeaders: { referer: "https://m.facebook.com/" },
});
const page = await ctx.newPage();

// Generous, because a loaded CI runner is legitimately slow; the assertions
// below poll, so this only bounds genuine hangs.
page.setDefaultNavigationTimeout(45_000);
page.setDefaultTimeout(20_000);

// This suite once failed in CI with a bare navigation timeout and nothing to
// go on — not reproducible locally under a cold image cache, a single-core
// server, or both processes fighting over one core. Rather than guess again
// next time, collect enough to tell a slow page from a broken one.
const consoleErrors = [];
const badResponses = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
});
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message.slice(0, 200)}`));
page.on("response", (r) => {
  if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url().slice(0, 120)}`);
});

function diagnose(err) {
  console.error(`\n─── run failed: ${String(err?.message ?? err).split("\n")[0]}`);
  console.error(`url at failure   : ${page.url()}`);
  console.error(`checks completed : ${checks.length}`);
  if (badResponses.length) console.error(`http >= 400      :\n  ${badResponses.slice(0, 10).join("\n  ")}`);
  if (consoleErrors.length) console.error(`console errors   :\n  ${consoleErrors.slice(0, 10).join("\n  ")}`);
  if (!badResponses.length && !consoleErrors.length) {
    const timedOut = /timeout/i.test(String(err?.name) + String(err?.message));
    console.error(
      timedOut
        ? "nothing failed and nothing errored — the page was slow, not broken"
        : "no HTTP failures or console errors were captured before this",
    );
  }
}
process.on("uncaughtException", (e) => { diagnose(e); process.exit(1); });
process.on("unhandledRejection", (e) => { diagnose(e); process.exit(1); });

// Block the wa.me hand-off so the run doesn't wander off to WhatsApp.
let waUrl = null;
await ctx.route("**://wa.me/**", (route) => {
  waUrl = route.request().url();
  return route.abort();
});

// Never `networkidle`. This suite is about attribution, the cart and the order
// row; it does not care whether the product photography has finished decoding.
// Waiting for the network to fall quiet tied it to next/image throughput, and
// on a cold CI cache /shop issues 17 optimiser requests through sharp while
// competing with Chromium for two cores — which is how a 30s navigation
// timeout got in front of a working money path.
const READY = "domcontentloaded";

// 1 · land from a Facebook link with a campaign tag
await page.goto(`${BASE}/?utm_source=facebook&utm_medium=social&utm_campaign=verify-run`, {
  waitUntil: READY,
});

const vid = await until(async () => (await ctx.cookies()).find((c) => c.name === "lir_vid")?.value);
check("visitor cookie issued", Boolean(vid), vid?.slice(0, 8));

// Written by /api/track, which is a beacon in flight at this point.
const visitor = vid ? await until(() => prisma.visitor.findUnique({ where: { id: vid } })) : null;
check("visitor row created", Boolean(visitor));
check("channel resolved to facebook", visitor?.channel === "facebook", visitor?.channel);
check("utm campaign captured", visitor?.utmCampaign === "verify-run", visitor?.utmCampaign ?? "—");

// 2 · open a product
await page.goto(`${BASE}/shop`, { waitUntil: READY });
// The markup is what matters, not the photography — `attached`, not `visible`.
const firstProduct = page.locator('a[href^="/product/"]').first();
await firstProduct.waitFor({ state: "attached", timeout: 20000 });
const href = await firstProduct.getAttribute("href");
check("shop lists at least one piece", Boolean(href), href ?? "—");

await page.goto(`${BASE}${href}`, { waitUntil: READY });

const slug = href?.split("/").pop();
const product = slug ? await prisma.product.findUnique({ where: { slug } }) : null;
if (!product) {
  check("product resolved from the shop grid", false, slug ?? "no href");
  throw new Error(`no product for slug ${slug} — is the catalogue seeded?`);
}
const pv = await until(async () => {
  const n = await prisma.event.count({
    where: { visitorId: vid, type: "product_view", productId: product.id },
  });
  return n > 0 ? n : null;
});
check("product_view tracked", Boolean(pv), `${pv ?? 0} event(s)`);

// 3 · add to bag — Playwright waits for actionability, so no sleep is needed
// before the click; the sleep after it was waiting on the tracking beacon.
await page.getByRole("button", { name: /أضيفي إلى الحقيبة/ }).click();
const atc = await until(async () => {
  const n = await prisma.event.count({ where: { visitorId: vid, type: "add_to_cart" } });
  return n > 0 ? n : null;
});
check("add_to_cart tracked", Boolean(atc));

// 4 · check out. fill() waits for the field to be editable, so the drawer's
// transition needs no sleep of its own.
await page.getByRole("button", { name: "متابعة الطلب" }).click();
await page.getByPlaceholder("الاسم الكامل").fill("اختبار آلي");
await page.getByPlaceholder("0910000000").fill("0913334444");
await page.getByPlaceholder("طرابلس").fill("طرابلس");
await page.getByRole("button", { name: "إتمام الطلب عبر واتساب" }).click();

// The row is written server-side before the browser is handed to wa.me.
const order = await until(
  () =>
    prisma.order.findFirst({
      where: { visitorId: vid },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  { timeout: 20000 },
);

check("order row created", Boolean(order), order?.ref);
check("attribution frozen onto order", order?.channel === "facebook", order?.channel);
check("campaign frozen onto order", order?.utmCampaign === "verify-run", order?.utmCampaign ?? "—");
check(
  "server-side price used (client never sets it)",
  order?.subtotal === (product.price ?? 0) * (order?.items[0]?.qty ?? 0),
  `${order?.subtotal} vs ${product.price}`,
);
// The catalogue ships price-on-request until the atelier enters real figures,
// so the quote path is the live path, not an edge case. If a piece has no
// price the order must say so rather than quietly reading as free.
check(
  "unpriced piece flagged as a quote, not as zero",
  product.price === null ? order?.hasQuoteItems === true : order?.hasQuoteItems === false,
  `price ${product.price} → hasQuoteItems ${order?.hasQuoteItems}`,
);
check("size and length captured", Boolean(order?.items[0]?.size && order?.items[0]?.length),
  `${order?.items[0]?.size} / ${order?.items[0]?.length}`);
// The hand-off, the beacon that stamps it, and the confirmation render all
// race this assertion — each gets polled rather than slept on.
const handoff = await until(() => waUrl, { timeout: 10000 });
check("whatsapp hand-off attempted", Boolean(handoff));
check(
  "reference is in the whatsapp message",
  Boolean(handoff && order && decodeURIComponent(handoff).includes(order.ref)),
);

const stamped = order
  ? await until(async () => {
      const o = await prisma.order.findUnique({ where: { id: order.id } });
      return o?.whatsappOpenedAt ? o : null;
    }, { timeout: 10000 })
  : null;
check("whatsappOpenedAt stamped", Boolean(stamped?.whatsappOpenedAt));

const refShown = order
  ? await until(async () => ((await page.textContent("body"))?.includes(order.ref) ? true : null), {
      timeout: 10000,
    })
  : null;
check("confirmation shows the reference", Boolean(refShown));

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
// Any active piece will do — the catalogue may be entirely price-on-request.
const priced = await prisma.product.findFirst({ where: { isActive: true } });
if (!priced) throw new Error("no active products — seed the catalogue first");
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
