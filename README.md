# ليريشيا · Lirisha

Arabic-first (RTL) storefront for a Libyan abaya and bisht house, with a cart
that checks out over WhatsApp and a first-party analytics dashboard that ties
every WhatsApp order back to the traffic source that produced it.

- **Storefront** — editorial home, filterable gallery, product pages with size
  and length selection, cart drawer.
- **Checkout** — every order is written to the database *before* the customer
  is handed to WhatsApp, with a short reference (`LR-XXXX`) that appears in the
  message. That reference is what makes a WhatsApp conversation attributable.
- **Dashboard** — traffic by source, purchase funnel, per-product performance,
  order management, and store settings. No third-party analytics, no cookies
  shared with anyone.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Language | TypeScript |
| Styling | Tailwind v4 + a small hand-written token layer (`src/app/globals.css`) |
| Data | Prisma 6 · SQLite in dev, Postgres in production |
| Fonts | Reem Kufi (display) + IBM Plex Sans Arabic (body), self-hosted via `next/font` |
| Auth | Signed HMAC cookie for `/admin` — one shared password, no user table |

## Running it

```bash
npm install
cp .env.example .env          # then edit ADMIN_PASSWORD + AUTH_SECRET
npm run db:migrate            # creates prisma/dev.db
npm run db:seed               # 24 products across 9 silhouettes
npm run assets:placeholders   # fabric-swatch placeholders, until real photos land
npm run db:demo               # OPTIONAL — 45 days of fake traffic so the dashboard has data
npm run dev
```

- Storefront → <http://localhost:3000>
- Dashboard → <http://localhost:3000/admin> (password from `.env`)

**Before going live run `npm run db:demo:wipe`** — it deletes every visitor,
event and order, including the demo ones.

### Environment

```
DATABASE_URL          file:./dev.db          # or a Postgres URL
ADMIN_PASSWORD        …                      # dashboard password — change it
AUTH_SECRET           …                      # long random string, signs the admin cookie
NEXT_PUBLIC_SITE_URL  https://lirisha.ly
WHATSAPP_NUMBER       218910000000           # initial value; editable in /admin/settings
```

## Real photography

Drop a folder of shots per silhouette and run:

```bash
node scripts/import-photos.mjs ~/photos/satin-embroidered --group satin-embroidered
```

It centre-crops to 5:7 (2:3 for the first frame), encodes WebP, generates blur
placeholders, and prints a block to paste into `prisma/seed.mjs`. Shot order per
piece: full-length front, full-length back, three-quarter in motion, fabric
macro, embroidery detail, cuff.

## Deployment

The schema and the code are hosting-agnostic; only the Prisma provider changes.

**Vercel / any managed Postgres**

1. `prisma/schema.prisma` → `provider = "postgresql"`
2. `DATABASE_URL` → the Postgres connection string
3. `npx prisma migrate dev --name init` to regenerate migrations for Postgres
4. Deploy. `npm run build` already runs `prisma generate`.

**Your own VPS (Docker / Dokploy / Hetzner)**

Either keep SQLite (mount `prisma/dev.db` on a volume — fine for this traffic
volume) or point at a Postgres container. `npm run db:deploy && npm run start`.

**Libyan Spider / cPanel** — needs Node hosting; a static export cannot work
here because the order records and the dashboard require a server.

## How attribution works

1. A first-party cookie (`lir_vid`, one year) is issued in `src/proxy.ts`.
2. The first `/api/track` call resolves the channel from `utm_source` first and
   the referrer second, and **writes it once** — first-touch, never overwritten.
   A woman who arrives from a Facebook post, leaves, and returns a week later by
   typing the URL still counts as Facebook when she orders.
3. Every event (`page_view`, `product_view`, `add_to_cart`, `checkout_start`,
   `whatsapp_click`, `order_created`) is stored against that visitor.
4. `POST /api/orders` freezes the attribution onto the order row, so the
   dashboard stays correct even if the visitor record is later pruned.
5. `sendBeacon` marks `whatsappOpenedAt` at the instant the browser hands off to
   `wa.me` — the one event that would otherwise be lost to the navigation.

## Project layout

```
prisma/schema.prisma        data model
prisma/seed.mjs             catalogue seed (edit this to add pieces)
scripts/                    placeholders, photo import, demo traffic, screenshots
src/app/(site)/             storefront routes
src/app/admin/              dashboard routes (each page calls requireAdmin())
src/app/api/                track · orders · admin login
src/components/site/        storefront components
src/components/admin/       dashboard components + charts
src/lib/                    prisma · format · attribution · analytics · whatsapp
src/proxy.ts                visitor cookie (Next 16 renamed middleware → proxy)
```

`DESIGN.md` holds the design system and the rules behind it.
`PROJECT-BRIEF.md` is the handover brief for whoever builds the next phase.
