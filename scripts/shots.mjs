import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT ?? "/tmp/shots";

const EXE = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

/**
 * A full-page screenshot fires before lazy images below the fold have been
 * requested, so the capture shows blur placeholders and reads as a broken
 * page. Scroll the whole document first, then return to the top.
 */
async function settle(p) {
  await p.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    // An <img> that never gets a src fires neither load nor error, so every
    // wait here is raced against a deadline rather than trusted to settle.
    const deadline = (ms) => new Promise((r) => setTimeout(r, ms));
    await Promise.race([
      Promise.all(
        [...document.images]
          .filter((i) => !i.complete)
          .map(
            (i) =>
              new Promise((r) => {
                i.addEventListener("load", r, { once: true });
                i.addEventListener("error", r, { once: true });
              }),
          ),
      ),
      deadline(4000),
    ]);
  });
  await p.waitForTimeout(400);
}

async function shot(path, name, opts = {}) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  if (opts.full) await settle(page);
  await page.waitForTimeout(opts.wait ?? 900);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: opts.full ?? false });
  console.log(name);
}

await shot("/", "01-home");
await shot("/", "01b-home-full", { full: true });
await shot("/shop", "02-shop", { full: true });

// first product
await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
const href = await page.locator('a[href^="/product/"]').first().getAttribute("href");
await shot(href, "03-product", { full: true });

// add to cart → drawer
await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /أضيفي إلى الحقيبة/ }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/04-cart-drawer.png` });
console.log("04-cart-drawer");

// checkout step
await page.getByRole("button", { name: "متابعة الطلب" }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/05-checkout.png` });
console.log("05-checkout");

// admin
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD ?? "lirisha2026");
await page.getByRole("button", { name: "دخول" }).click();
await page.waitForURL("**/admin", { timeout: 15000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/06-admin.png`, fullPage: true });
console.log("06-admin");

await shot("/admin/orders", "07-admin-orders");
await shot("/admin/products", "08-admin-products");

// mobile
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mp = await m.newPage();
await mp.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mp.waitForTimeout(900);
await mp.screenshot({ path: `${OUT}/09-mobile-home.png` });
await mp.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
await mp.waitForTimeout(900);
await mp.screenshot({ path: `${OUT}/10-mobile-shop.png` });
console.log("mobile");

await browser.close();
