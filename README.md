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
npm run assets:import ./photos  # crops the photography → public/images + a manifest
npm run db:seed               # 9 pieces, 24 frames
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

## The photography

The catalogue is the house's own photography, transcribed from the brand's
Facebook gallery. `scripts/catalogue.mjs` is the single source of truth: it
names each piece, its copy, and the source frames that belong to it.

```bash
npm run assets:import ~/photos     # folder holding lirisha-01.jpg … lirisha-42.jpg
npm run db:seed
```

The import writes `public/images/products/*.webp`, the full-bleed frames in
`public/images/editorial/`, and `prisma/catalogue.images.json` (paths + blur
placeholders), which both the seed and the home page read.

**Why the crops are hand-placed.** The house blurs faces in its own
photographs. A 5:7 centre-crop of a full-length model shot puts that blur in the
middle of the product card, where it reads as a defect rather than a choice — so
each frame declares where its crop window starts:

```js
{ src: "lirisha-18", kind: "front", top: 0.33, x: 0.35 }
```

`top` is the fraction of source height the window begins at, `x` its horizontal
centre. The window is then the largest one of the target ratio that fits below
it, clamped to the image. `sharp`'s `position: "attention"` is exactly wrong
here — it finds the face.

Adding a piece means adding an entry to `CATALOGUE` and re-running both
commands. Prices are deliberately `null`: every piece reads **السعر عند الطلب**
until a real figure is entered at `/admin/products`.

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

That is the by-hand path. In practice pushing to `main` deploys — see
**Continuous deployment** below.

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
   (1 GB RAM, 30 GB disk), only in `us-west1`, `us-central1` or `us-east1`.
   **It is not actually free for a website.** Google bills every external IPv4
   attached to a standard VM at
   [$0.005/hour ≈ $3.60/month](https://cloud.google.com/vpc/network-pricing);
   the free allowance is one hour a month. A public site needs a public IP, so
   the "always free" VM costs about $3.60/month — for 1 GB of RAM, in the US,
   ~150–200 ms from Libya.
4. **AWS / Azure** — credit- or 12-month-limited, then billed. Fine for a demo,
   wrong for a shop that should still be up next year.

Given (3), **Hetzner CX22 at ~€4/month** is within pennies of the GCP bill and
gives 2 vCPU / 4 GB in Falkenstein — four times the memory and a third of the
latency. Unless the box is genuinely free (option 1 or 2), pay the €4.

### The domain

A VM gives you an IP, not a hostname — Compute Engine has no free `*.run.app`
equivalent (that's Cloud Run, which can't run a compose file). So:

- **Fastest real URL, zero cost:** a subdomain of a domain you already own —
  `lirisha.abdumurad.com`. One A record, done.
- **For the brand:** `lirisha.ly` through Libyan Spider, or a cheaper
  `.com`/`.store` at Cloudflare Registrar (sold at cost).
- **Throwaway demo only:** `sslip.io` / `nip.io` resolve `<your-ip>.sslip.io`
  to that IP and Let's Encrypt will issue for it, so HTTPS works with no
  registration at all. Fine to show a client, wrong for a shop.

Whichever you pick, three things have to line up:

1. `NEXT_PUBLIC_SITE_URL` is **baked in at build time** (a Docker build arg), so
   set it in `.env` *before* `docker compose up -d --build`. Otherwise the
   "استفسري عبر واتساب" links will carry `localhost` URLs.
2. Open **tcp:80 and tcp:443** in the VPC firewall. Caddy's HTTP-01 challenge
   needs port 80 or no certificate is ever issued.
3. Reserve a **static** external IP and keep it attached — ephemeral IPs change
   on stop/start. (Attached static and ephemeral cost the same; an *unattached*
   reserved IP is billed at double, so don't leave one dangling.)

On Cloudflare, set the record to **DNS-only (grey cloud)** until Caddy has the
certificate, then turn the proxy on if you want it.

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
against a seeded database and runs `scripts/verify-flow.mjs` — 22 assertions
over the path that actually earns money: attribution → product view → cart →
order row → WhatsApp hand-off, including the case where the customer's
ad-blocker eats `/api/track`.

## Continuous deployment

`.github/workflows/deploy.yml`, on every push to `main`:

```
verify ─┐                          (calls ci.yml — same gate a PR gets)
        ├─→ deploy → ssh → docker/release.sh
image  ─┘                          (build → GHCR → smoke-test the container)
```

`verify` and `image` run in parallel and `deploy` waits on both, so nothing
unverified reaches the shop while the build still overlaps the tests. The
server stops building anything: a CPX12 has 2 GB it would rather spend serving,
and `npm ci` already died at 1 GB once.

**What runs on the box** is `docker/release.sh`, piped over SSH rather than
inlined in the workflow so it can be read, linted, and run by hand:

```bash
APP_IMAGE=ghcr.io/abdumurad/lirisha:sha-<sha> bash docker/release.sh
```

It records what is currently serving, pulls the exact tag, swaps the container,
and waits on compose's healthcheck. **If the new build never becomes healthy it
rolls back to the previous image** and exits non-zero — the shop keeps serving
the last good build instead of a broken one. It also syncs the checkout to the
deployed commit so `docker-compose.yml` matches the image, unless the tree has
local edits, in which case it warns and leaves them alone (the `ports:` block
is commented out by hand on a public server; reverting that would republish the
app on `:3000`).

Deploys pin `sha-<commit>`, never `latest` — two deploys of a moving tag are
indistinguishable, and rolling back to one is guesswork.

### Testing the deploy without a server

```bash
bash scripts/test-release.sh     # needs docker; leaves nothing behind
```

Stands up a throwaway registry, pushes stand-in images that honour the same
`/api/health` contract, and drives cold start → rolling upgrade → failed deploy
→ rollback → pruning. Deploy logic is otherwise only testable in production,
and the failure path is the one you least want to meet live. This is what
caught `${APP_IMAGE%%:*}` stripping a registry port and silently disabling
image pruning.

## Seeing what the box is doing

The `tools` profile adds [Dozzle](https://dozzle.dev) — container logs, status
and per-container CPU/memory in a browser, so "why did that order not arrive"
doesn't begin with an SSH session and `docker logs --tail`.

```bash
docker compose --profile edge --profile tools up -d
```

Measured at **9.6 MB resident** (capped at 128 MB), which matters on a 2 GB box.
The Docker socket is mounted read-only and `--enable-actions` / `--enable-shell`
are left off, so it can observe containers but not touch them. It is *not*
removed by a deploy: `release.sh` runs `up --remove-orphans` with only the
`edge` profile, and Compose leaves profile-disabled services alone (verified).

**It binds to loopback**, because these logs carry customer names, phone numbers
and cities. Reach it through a tunnel:

```bash
ssh -N -L 8080:127.0.0.1:8080 root@<host>     # → http://localhost:8080
```

To put it on a subdomain instead, see `docker/caddy.d/logs.caddy.example` —
it needs `DOZZLE_AUTH_PROVIDER=simple` and a generated users file. Dozzle's
own `--help` claims only `forward-proxy` is supported; that text is stale, and
`simple` does gate the API (`/api/version` answers 200 unauthenticated, 401
with it). Files in `docker/caddy.d/` are gitignored, so enabling a route won't
dirty the checkout and block a deploy's config sync.

One thing this deliberately does not do: **tell you the site is down**. A log
viewer on the box dies with the box. An external check against
`https://lirisha.abdumurad.com/api/health` — UptimeRobot's free tier is enough —
is what actually pages you.

### Reseeding

Replacing the catalogue is destructive, so it is never part of an ordinary
deploy. Run the workflow manually — Actions → Deploy → *Run workflow* — and
tick **reseed**.

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
