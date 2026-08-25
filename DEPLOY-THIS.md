# Shipping the real catalogue, and turning on CD

Six commits, verified locally: lint, typecheck, build, 22/22 end-to-end
assertions, and 14/14 on the deploy harness.

| | |
|---|---|
| `fd6d055` | Stop hardcoding the Playwright browser path |
| `ae6b3df` | Nine real pieces, 24 frames, and the crop rules behind them |
| `e7a63aa` | This note |
| `765f006` | Continuous deployment: push to `main` → GHCR → Falkenstein |
| `26e597e` | `tools` profile — container logs and stats at 9.6 MB |
| *(new)* | Stop waiting on `networkidle` — the CI navigation timeout |

## 0 · Getting the commits across

The first five are pushed. Anything after them still arrives as a bundle,
because the git proxy in my sandbox refuses `AbduMurad/Lirisha` and the remedy
it names — *"add the repository to the session's sources"* — has no
implementation yet: no UI, no command, and
[an open issue](https://github.com/anthropics/claude-code/issues/76248) quoting
the same error. I have `GH_TOKEN` in my environment but won't use it to write
to a repo the proxy just declined.

From your clone, on `main`:

```bash
git fetch /path/to/lirisha-catalogue.bundle HEAD:incoming
git merge --ff-only incoming
git branch -d incoming
```

`--ff-only` on purpose: it either applies cleanly onto what you already have or
refuses, rather than improvising a merge.

## 1 · One-time setup (about five minutes)

### Repository variables
Settings → Secrets and variables → Actions → **Variables**

| Name | Value |
|---|---|
| `SITE_URL` | `https://lirisha.abdumurad.com` |

This one matters more than it looks. `NEXT_PUBLIC_SITE_URL` is baked into the
bundle at build time, so if it's missing the build doesn't fail — it silently
ships "استفسري عبر واتساب" links pointing at `localhost`. The workflow refuses
to build without it.

### Repository secrets
Same page → **Secrets**

| Name | How to get it |
|---|---|
| `DEPLOY_HOST` | `2.28.46.4` |
| `SSH_PRIVATE_KEY` | the private half of the key already authorised for `root` on the box — paste the whole file, `BEGIN`/`END` lines included |
| `SSH_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 2.28.46.4` — paste the output line |

`SSH_KNOWN_HOSTS` is not optional padding. Without a pinned host key the deploy
would accept whatever answers on that address, and hand it a root credential.

### GHCR visibility

The package doesn't exist until the first build, so the order is slightly
awkward:

1. Push. The `image` job builds and publishes `ghcr.io/abdumurad/lirisha`.
2. The `deploy` job **will fail** on `docker pull` — a new package is private,
   and the server isn't logged in.
3. Go to the package (your profile → Packages → `lirisha`) → Package settings →
   Change visibility → **Public**.
4. Actions → Deploy → *Re-run failed jobs*.

Public because the image is ~750 MB and GitHub's free plan allows 500 MB of
*private* package storage. Nothing secret is in it — the runner stage copies
only `public`, `.next`, `prisma`, `scripts`; `ADMIN_PASSWORD` and `AUTH_SECRET`
live in the server's `.env` and are injected at run time. If you'd rather keep
it private, skip step 3 and instead run `docker login ghcr.io` once on the
server with a read-only PAT.

## 2 · The first deploy

Push. Then watch Actions.

```
verify ─┐
        ├─→ deploy
image  ─┘
```

The first deploy swaps the hand-built `lirisha:local` container for the GHCR
image. That leaves the old local image on the box untouched as a manual
fallback, and it becomes the rollback target if anything goes wrong.

**Then reseed once**, to replace the placeholder catalogue still sitting in the
volume with the nine real pieces:

Actions → **Deploy** → *Run workflow* → tick **reseed** → Run.

Reseeding deletes every product and product image and writes the nine real
ones. It leaves visitors, events and orders alone. It's deliberately not part
of an ordinary deploy.

## 3 · After that

Push to `main`. That's the whole procedure.

If a build boots but never becomes healthy, `docker/release.sh` rolls back to
the previous image and fails the run — the shop keeps serving the last good
build rather than a broken one. Detection takes about 90 s (compose's
`start_period` plus a couple of intervals). To roll back deliberately, re-run
an older Deploy run, or on the box:

```bash
APP_IMAGE=ghcr.io/abdumurad/lirisha:sha-<older-sha> bash docker/release.sh
```

## 3b · Seeing what the box is doing

Instead of Dokploy — which wants 2 GB and ports 80/443 the box hasn't got
spare — the `tools` profile adds a log and stats viewer at 9.6 MB:

```bash
cd /opt/lirisha
docker compose --profile edge --profile tools up -d
ssh -N -L 8080:127.0.0.1:8080 root@2.28.46.4     # → http://localhost:8080
```

Container logs, status, and per-container CPU/memory — which is also how you'll
see whether 2 GB is actually holding up. It binds to loopback because the logs
carry customer names and phone numbers; `docker/caddy.d/logs.caddy.example` has
the subdomain route if you want it on a phone, and it requires auth to be on.

A deploy won't remove it — verified, not assumed.

**It cannot tell you the site is down**, because it dies with the box. Point
UptimeRobot's free tier at `https://lirisha.abdumurad.com/api/health` for that.

## 4 · Two things to do in the dashboard

<https://lirisha.abdumurad.com/admin> — the password is `ADMIN_PASSWORD` in
`/opt/lirisha/.env`, and in the `SERVER-ACCESS.md` I sent you. That file is
deliberately untracked; keep it out of the repo.

1. **The WhatsApp number is still `218910000000`.** Every order hands off to
   that number. Set the real one at `/admin/settings` before anyone sees the
   site.
2. **Wipe the demo traffic.** The dashboard currently shows 45 days of invented
   visitors and orders so the charts had something to render:
   ```bash
   docker compose exec app node scripts/seed-analytics.mjs --wipe
   ```
   Do this before the first real customer, or the funnel numbers are fiction.

## 5 · Prices and names

Every piece reads **السعر عند الطلب**. That's deliberate — I don't know what
these garments cost, and inventing figures for a shop taking real orders would
be worse than asking. Name, fabric and price are all editable at
`/admin/products` and save as you type.

The names are my reading of the photographs — «عباية ميكادو بتطريز الشفق»,
«عباية الكريستال الفضي». The designer will have her own names and can type them
straight over mine.

## 6 · What was left out

Thirteen of the 42 Facebook images aren't product photography: Eid and Ramadan
cards, logo lockups, a palette board, a reels collage, and posts with large
Arabic text burned in. They're excluded but still in
`P:\Career\for-working\lirisha\assets` under their original numbers —
`lirisha-05, 06, 07, 08, 10, 11, 12, 13, 19, 26, 36, 37, 38`.

## 7 · Still open

- **2FA on the Hetzner account.** More pressing now: a GitHub secret can start
  a root session on that box unattended. If you want to narrow that later,
  create a `deploy` user in the `docker` group owning `/opt/lirisha`, set the
  repo variable `DEPLOY_USER=deploy`, and swap the key — the workflow already
  reads that variable and needs no other change.
- `assets/lirisha-42 (1).jpg` is a duplicate download; safe to delete.
- Photography is thin in places: the powder-blue coat has one frame, and the
  black piece is two crops of a single photograph. A back view and a fabric
  macro per piece would do more for conversion than any further code.
