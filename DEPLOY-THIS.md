# Shipping the real catalogue

Two commits are ready and verified locally (21/21 end-to-end checks, lint,
typecheck, build). The sandbox's git proxy won't push to
`AbduMurad/Lirisha`, so they come to you as a bundle instead.

| | |
|---|---|
| `fd6d055` | Stop hardcoding the Playwright browser path — this is the CI failure you hit |
| `ae6b3df` | The nine real pieces, twenty-four frames, and the crop rules behind them |

## 1 · Push them

From your clone of `Lirisha` (on `main`, at `c4bb184`):

```bash
git fetch /path/to/lirisha-catalogue.bundle HEAD:incoming
git merge --ff-only incoming
git branch -d incoming
git push origin main
```

`git log --oneline -3` should end `ae6b3df / fd6d055 / c4bb184`. CI will run
lint, typecheck, build and the 21 assertions in `scripts/verify-flow.mjs`.

## 2 · Deploy

```bash
ssh root@2.28.46.4
cd /opt/lirisha
git pull
docker compose --profile edge up -d --build
```

The container migrates itself on boot. It seeds **only a completely empty
catalogue**, so the nine new pieces will *not* replace the old placeholder rows
that are already in the volume. Reseed explicitly:

```bash
docker compose exec app node prisma/seed.mjs
```

That deletes every product and product image and writes the nine real pieces.
It leaves visitors, events and orders alone.

## 3 · Two things to do in the dashboard

<https://lirisha.abdumurad.com/admin> — the password is `ADMIN_PASSWORD` in
`/opt/lirisha/.env` on the server, and in the `SERVER-ACCESS.md` I sent you
(that file is deliberately untracked — keep it out of the repo).

1. **The WhatsApp number is still `218910000000`.** Every order hands off to
   that number. Set the real one at `/admin/settings` before the site is shown
   to anyone.
2. **Wipe the demo traffic.** The dashboard is currently full of 45 days of
   invented visitors and orders so the charts had something to show:
   ```bash
   docker compose exec app node scripts/seed-analytics.mjs --wipe
   ```
   Do this before the first real customer arrives, or the funnel numbers are
   fiction.

## 4 · Prices

Every piece reads **السعر عند الطلب**. That is deliberate — I don't know what
these garments cost, and inventing figures for a shop taking real orders would
have been worse than asking. Names, fabric and price are all editable at
`/admin/products` and save as you type; the checkout, the WhatsApp message and
the dashboard's revenue column all handle a mixed priced/on-request cart
correctly.

The names themselves are my reading of the photographs — «عباية ميكادو بتطريز
الشفق», «عباية الكريستال الفضي» and so on. The designer will have her own names
for these pieces and can type them straight over mine.

## 5 · What was left out

Thirteen of the forty-two images on the Facebook page are not product
photography: Eid and Ramadan greeting cards, the logo lockups, a colour-palette
board, a reels collage, and posts with large Arabic text burned into the image.
They're excluded. If you want any of them for an About page, they're all still
in `P:\Career\for-working\lirisha\assets` under their original numbers —
`lirisha-05, 06, 07, 08, 10, 11, 12, 13, 19, 26, 36, 37, 38`.

## 6 · Still open

- **2FA on the Hetzner account.** The SSH key I generated is root on a public
  box; the account itself is still single-factor.
- **`assets/lirisha-42 (1).jpg`** is a duplicate download — safe to delete.
- Photography per piece is thin in places: `مِعطف عباية بقَصّة إنجليزية` has one
  frame and `عباية سوداء بسليب مطرز` has two crops of a single photograph. A
  back view and a fabric macro for each piece would do more for conversion than
  any further code.
