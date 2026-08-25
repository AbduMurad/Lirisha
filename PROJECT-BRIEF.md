# Lirisha — project brief

Handover document for whoever (human or AI) builds the next phase. Read
`DESIGN.md` before touching anything visual; it is not a style guide, it is a
set of constraints with reasons.

## The business, in one paragraph

Lirisha (ليريشيا) is a Libyan abaya and bisht house in Tripoli, online-only,
~4.6k followers on Facebook and an Instagram at `lirisha.ly`. Tagline: **أناقة
بتفاصيلها**. Pieces are satin, crêpe, nida, chiffon and silk, largely
hand-embroidered, frequently made to measure. Customers arrive from Facebook and
Instagram, ask for a price in DMs, and order over WhatsApp. The site exists to
replace the DM negotiation with a browsable catalogue and a structured order —
without removing WhatsApp, which is where Libyan customers actually want to
close.

## Decisions already locked

| Decision | Why |
|---|---|
| Arabic-first, `dir="rtl"`, English secondary | The customer base is Libyan. English is a later `[lang]` segment, not a day-one requirement. |
| Cart → WhatsApp, order row written first | An order that only exists as a WhatsApp message can't be counted, attributed, or followed up. The `LR-XXXX` ref in the message is the join key. |
| No payment integration | Cash on delivery is the norm; card rails in Libya are not worth the build. |
| First-party analytics, no GA4 | The one question that matters — *which source produced this WhatsApp order* — is exactly the question third-party analytics can't answer once the customer leaves for `wa.me`. |
| Prices per product, nullable | Ready-to-wear carries a price; bridal and bespoke are `السعر عند الطلب`. `price: null` drives that everywhere. |
| SQLite dev / Postgres prod, one schema | Hosting is undecided. Only the provider line changes. |
| Prisma **6**, not 7 | Prisma 7 requires driver adapters and moves the datasource URL out of the schema. Not worth the complexity here. Revisit only if you need it. |
| Next.js 16 | `middleware` is renamed `proxy` (`src/proxy.ts`), `params`/`searchParams` are Promises, Turbopack is the default builder. |

## Data model

`Product` → `ProductImage` (1:n). Colourways are **separate products** sharing a
`groupKey` — Totême's convention: each colourway gets its own URL, its own
photography, its own place in the grid, and the colour lives in the product name
(`عباية ساتان مطرزة — رملي`). `sizes` and `lengths` are JSON string arrays.

`Visitor` (cookie id, first-touch channel + UTMs, device) → `Event`
(`page_view`, `product_view`, `add_to_cart`, `remove_from_cart`, `cart_open`,
`checkout_start`, `whatsapp_click`, `order_created`, `filter_apply`).

`Order` → `OrderItem`. The order **snapshots** the attribution *and* the item
name and price, so history survives catalogue edits and visitor pruning.

`Setting` is a key/value table so the WhatsApp number and the announcement bar
are editable from the dashboard without a redeploy.

## Order flow, precisely

1. `add()` in `CartProvider` writes to `localStorage` and fires `add_to_cart`.
2. Drawer step 2 collects name / WhatsApp number / city / note.
3. `POST /api/orders` — **re-reads every price from the database**; the client
   never sets a price. Creates the `Order` + `OrderItem`s with a collision-safe
   `LR-XXXX` ref, freezes the visitor's channel onto the order, and returns a
   `wa.me` URL with the Arabic message already composed.
4. The client fires `whatsapp_click`, then `sendBeacon`s
   `POST /api/orders/opened`, which stamps `whatsappOpenedAt` and moves the
   status to `opened`. Beacon, not fetch, because the tab is navigating away.
5. The owner works the order in `/admin/orders`; statuses are
   `pending → opened → confirmed → paid → shipped → delivered` (or `cancelled`).
   `confirmed` and beyond count as revenue.

The gap this design accepts: if the customer never sends the message she typed,
the order sits at `opened`. That is visible in the dashboard rather than hidden,
which is the point.

## What is deliberately not built

- **A product editor in the dashboard.** Prices, publish and featured flags are
  editable; adding a piece or changing photography still goes through
  `prisma/seed.mjs` or Prisma Studio. This is the single highest-value next
  feature.
- **English.** All copy is Arabic. Add `[lang]` as a route segment; the token
  layer is already logical-property-only, so nothing in the CSS needs touching.
- **Search.** 24 pieces don't need it. Add it past ~80.
- **Wishlist / accounts.** Deliberate — accounts are friction for a WhatsApp
  purchase, and a heart on every card is app furniture.
- **Image CDN.** `next/image` over `/public` is enough at this volume.
- **Email.** There is no transactional email; WhatsApp is the channel.

## Next phases, in the order they pay off

1. **Product editor + image upload in `/admin`** — removes the developer from
   the day-to-day. Reuse the existing server actions in `src/app/admin/actions.ts`.
2. **Real photography** — `scripts/import-photos.mjs` handles the crops and the
   WebP encoding; the shot list is in the README. This changes how the site looks
   more than any code will.
3. **English `[lang]` segment** once there is GCC traffic worth the translation.
4. **A "made to measure" flow** — the length selector already has a
   `تفصيل حسب الطلب` option that currently just annotates the order. Turning that
   into a measurement form is a small, high-margin feature.
5. **WhatsApp Business API** — would let the dashboard read the conversation
   status instead of inferring it. Only worth it above ~200 orders a month.

## Rules for the next builder

- Read `DESIGN.md`. The anti-pattern list at the bottom is not optional.
- Never write a physical CSS property (`margin-left`, `text-align: right`).
- Never format a price by hand — use `src/lib/format.ts`.
- Never trust a client-supplied price.
- Attribution is **first touch and immutable**. Do not "improve" it into
  last-touch; the whole point is that a Facebook post that produced a sale three
  weeks later still gets credit for it.
- Run `npm run db:demo:wipe` before the site goes live.
- Change `ADMIN_PASSWORD` and `AUTH_SECRET` before the site is reachable from
  the internet.
