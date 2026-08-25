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

## Deployment — Docker Compose

One container, one volume. The image migrates itself on boot and seeds only a
genuinely empty catalogue, so redeploys never clobber dashboard edits.

```bash
cp .env.example .env     # set ADMIN_PASSWORD, AUTH_SECRET, DOMAIN, WHATSAPP_NUMBER
docker compose up -d --build            # → http://localhost:3000
docker compose --profile edge up -d     # + Caddy, automatic HTTPS for $DOMAIN
```

Point an A record at the box, set `DOMAIN` and `TLS_EMAIL`, and Caddy gets the
certificate on first request. On a public server, comment out the `ports:`
block under `app` so nothing is reachable except through TLS.

Updating is `git pull && docker compose up -d --build`. No registry needed —
`.github/workflows/docker.yml` publishes to GHCR if you'd rather the server
pull a prebuilt image, but for one box building in place is simpler.

| | |
|---|---|
| Image | ~750 MB (Next.js standalone + the Prisma CLI, so the container can migrate itself) |
| Runtime memory | ~150–250 MB |
| Data | the `lirisha-data` volume, `/data/lirisha.db` |

**Back it up.** One file, so it's one line — take it while the app runs:

```bash
docker compose exec app sh -c 'cp /data/lirisha.db /data/backup.db' \
  && docker compose cp app:/data/backup.db ./lirisha-$(date +%F).db
```

### Where to host it free

Ranked for a Libyan shop that needs Docker Compose:

1. **Your own Proxmox / Dokploy box** — genuinely free, you already run it, and
   Dokploy deploys a compose file directly. Unbeatable if the box has a public
   IP or a tunnel.
2. **[Oracle Cloud Always Free](https://www.oracle.com/cloud/free/)** — 2 Arm
   cores + 12 GB RAM, 200 GB storage, 10 TB egress, free with no expiry. The
   only real always-free VPS. Catches: card required, Arm capacity in popular
   regions is often exhausted ("out of host capacity"), and Oracle reclaims idle
   instances. Pick your home region carefully — free resources are pinned to it.
3. **[Google Cloud free tier](https://cloud.google.com/free)** — one `e2-micro`
   (1 GB RAM, 30 GB disk), free forever, but **only** in `us-west1`,
   `us-central1` or `us-east1`. This app fits in 1 GB; the cost is ~150–200 ms
   of latency from Libya.
4. **AWS / Azure** — credit- or 12-month-limited, then billed. Fine for a demo,
   wrong for a shop that should still be up next year.

Not suitable: Render, Koyeb, Railway, Fly.io. They run a single container, not a
compose file; Fly removed its free tier in 2024, Railway is credit-only, and
Render's free Postgres expires after 90 days with 30–50 s cold starts on the web
service — a cold start in front of a customer is a lost order.

If free turns painful, **Hetzner CX22 is about €4/month** for 2 vCPU / 4 GB in
Falkenstein, with far better latency to Libya than any US free tier. That is the
honest recommendation for a shop taking real orders.

### Postgres instead of SQLite

SQLite is the right default here — this is a single-writer boutique catalogue.
When it stops being enough:

```bash
docker compose --profile postgres up -d
```

then set `provider = "postgresql"` in `prisma/schema.prisma`, point
`DATABASE_URL` at `postgresql://lirisha:…@db:5432/lirisha`, and regenerate the
migrations with `npx prisma migrate dev --name init`.

**Vercel** also works, and needs the same provider switch plus managed Postgres
(Neon or Supabase) — SQLite can't work there because the filesystem is
read-only.

**Libyan Spider / cPanel** needs Node hosting. A static export cannot work: the
order records and the dashboard require a server.

## CI

`.github/workflows/ci.yml` runs lint, typecheck and build, then boots the app
against a seeded database and runs `scripts/verify-flow.mjs` — 20 assertions
over the path that actually earns money: attribution → product view → cart →
order row → WhatsApp hand-off, including the case where the customer's
ad-blocker eats `/api/track`.

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
