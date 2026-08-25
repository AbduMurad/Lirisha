# Lirisha — design system

Derived by measuring the live production CSS of houses that win at this, not by
taste: **Totême** (`theme.css`, 254 KB), **Cecilie Bahnsen** (`app.css`),
**Khaite**, **Brunello Cucinelli** (Awwwards SOTD, Jul 2026), **Serotoninn**
(Awwwards E-commerce Honors, Jul 2026). Full research notes:
`docs/design-research.md`.

Everything below is implemented in `src/app/globals.css`.

---

## The five rules

1. **5:7 crops. Never 1:1.** Totême `padding-block-start: 140%`, Khaite
   `aspect-ratio: 5/7`, Cecilie Bahnsen `0.8`. A square crop amputates the hem of
   a floor-length garment — it is the category's original sin. 2:3 for the PDP
   hero, 4:5 for fabric macros, 16:10 for editorial breaks. Never mixed inside
   one grid.
2. **Hover is `opacity`, and nothing else.** No scale, no lift, no shadow, no
   colour change. Guarded by `@media (hover: hover)` so touch devices never get
   a stuck state.
3. **Radius 0. Shadow none. Hairlines at 0.5px.** Totême's 254 KB stylesheet
   contains zero drop shadows. Elevation is expressed as 95 % ivory +
   `backdrop-filter: blur(34px)` — never a black scrim.
4. **Two weights, ceiling 48px.** The largest token on a site selling €4,500
   dresses is 40px at weight 300. Arabic Kufi needs ~20 % more size for the same
   optical weight, so display caps at 48px; weights are 400 and 500 only.
5. **Logical properties only.** `margin-inline`, `inset-inline`,
   `text-align: start`. Totême's stylesheet has **zero** `margin-left` and zero
   `text-align: left`. For an Arabic-first build this is structural, not
   stylistic — one physical property and you own an RTL bug forever.

## Tokens

### Colour

Two grounds and one ink carry the whole site. Cucinelli's flagship runs a
two-colour palette (`#F1EDE7` / `#282828`); this is that, warm-shifted.

| Role | Token | Hex | Contrast on ivory |
|---|---|---|---|
| Page | `--color-ivory` | `#FBF9F5` | — |
| Surface | `--color-sand` | `#F1EDE7` | — |
| Surface 2 | `--color-linen` | `#E7E1D7` | — |
| Hairline | `--color-line` | `#DDD6C9` | — |
| Headings | `--color-ink` | `#1A1815` | 16.85:1 |
| Body | `--color-charcoal` | `#2A2724` | 14.12:1 |
| Secondary | `--color-ink2` | `#57504A` | 7.53:1 |
| Captions | `--color-muted` | `#6E665C` | 5.37:1 |
| Disabled | `--color-muted2` | `#8C8378` | 3.55:1 — non-text only |

**Gold has three values and three jobs, and no others.** Gold is the single
fastest way to make an abaya store look cheap.

| Token | Hex | Allowed use |
|---|---|---|
| `--color-gold` | `#A9884E` | 0.5px rules, dividers, icon strokes. **3.16:1 — never text.** |
| `--color-goldtext` | `#8A6E3C` | the only gold permitted as text. 4.56:1 ✓AA |
| `--color-goldlight` | `#C9A96A` | gold on the charcoal footer only. 7.90:1 ✓AA |

No gradient tokens exist. No gold gradient. Ever.

### Type

Display **Reem Kufi** (Arabic subset 8.9 KB — remarkable), body **IBM Plex Sans
Arabic**, whose Latin sibling is metrically matched by the same foundry. Cairo
was rejected: correct, competent, and instantly reads "template". Noto Kufi and
Alexandria were rejected as the UAE Government Design System faces.

| Token | px | line-height | weight |
|---|---|---|---|
| `--t-micro` | 11 | 1.85 | 400 |
| `--t-label` | 12 | 1.80 | 500 |
| `--t-body-s` | 14 | 1.75 | 400 |
| `--t-body` | 16 | 1.75 | 400 |
| `--t-body-l` | 18 | 1.70 | 400 |
| `--t-h4` | 20 | 1.50 | 500 |
| `--t-h3` | 24 | 1.45 | 500 |
| `--t-h2` | 32 | 1.40 | 500 |
| `--t-h1` | 40 | 1.35 | 500 |
| `--t-display` | 48 | 1.30 | 400 |

**`letter-spacing: 0`. Always.** Arabic is a connected script; tracking breaks
the ligatures and reads as corrupted text, not as elegance. That kills luxury's
favourite idiom — the tracked uppercase micro-label — and Arabic has no
uppercase, no small caps and no italics to replace it. Emphasis comes from a
weight step (400 → 500), a colour step, or a 0.5px rule above the label.

### Space

`--u: clamp(1px, .04px + .0667vw, 1.4px)` — exactly 1px at a 1500px viewport,
capped at 1.4px. The whole page scales as one organism between 1440 and 2100
and then stops, so the 5:7 crop stays imposing on a 27" display.

The luxury inversion: **page margin 32px, grid gutter 64px.** Mainstream
best practice recommends 24–32px between cards; Totême runs double the maximum
*between products* while keeping the page edge tight. On the gallery, the gap
between two product images must be visibly wider than the gap to the page edge.
That single inversion is what separates a lookbook from a catalogue.

### Motion

Three tokens, no more. `--dur-fast: 150ms` (hover) · `--dur: 300ms` (image
crossfade) · `--dur-slow: 600ms` (drawers). Two curves:
`--ease: cubic-bezier(.25,1,.5,1)` and `--ease-drawer: cubic-bezier(.16,1,.3,1)`.
Serotoninn ships **one** easing curve in a 106 KB stylesheet, used 23 times.

## Numerals

Libya is Maghreb: **Western digits (0–9)**, never Arabic-Indic. `١٢٥٠ د.ل` reads
as foreign to a Libyan customer. Two live traps, both verified:

```js
new Intl.NumberFormat('ar-LY').format(1250)  // "1.250"  ← European separators
new Intl.NumberFormat('ar-EG').format(1250)  // "١٬٢٥٠"  ← silently Arabic-Indic
```

Every price on the site goes through the one pinned formatter in
`src/lib/format.ts`:

```js
new Intl.NumberFormat('ar-u-nu-latn', { style: 'currency', currency: 'LYD',
  minimumFractionDigits: 0, maximumFractionDigits: 0 })
```

`font-variant-numeric: tabular-nums` on every price so the grid's price column
doesn't jitter between rows.

## RTL

- `<html lang="ar" dir="rtl">`, set once, never per element.
- `--dir` is `1` in LTR and `-1` in RTL. The cart drawer's transform is
  `translateX(calc(var(--dir) * 100%))` — one rule, both directions, no JS
  branch. In RTL the drawer enters from the **left**, because the bag lives at
  the inline-end of the header.
- Never read `element.scrollLeft` — it is negative in RTL on Firefox/Safari and
  positive-decreasing on Chrome. The rails use `scroll-snap-type: inline
  mandatory` instead, which is direction-aware.
- The PDP media column is a **vertical stack, not a carousel** — it is the
  strongest luxury pattern and it sidesteps every RTL carousel bug.
- `dir="ltr"` on phone, email and size inputs, with `text-align: start` (not
  `right`) so a Latin entry doesn't right-align.

## Dashboard charts

The storefront palette is deliberately two colours, which is useless for
encoding data — so the dashboard borrows a validated categorical palette and
keeps everything else in brand ink.

- Channels use a fixed 7-slot hue order, never cycled. Validated against the
  ivory surface: lightness band ✓, chroma floor ✓, adjacent-pair CVD ΔE 9.1 ✓,
  normal-vision ΔE 19.6 ✓. Three hues fall below 3:1 contrast, so **every bar
  carries a visible direct label** — the relief rule.
- The funnel uses a single-hue ordinal ramp (`#86b6ef → #104281`), monotone
  lightness with gaps ≥ 0.06.
- **No dual-axis charts.** Visitors and orders differ by an order of magnitude,
  so they are two stacked small multiples sharing an x-axis, each with its own
  scale.

## Anti-patterns

Square crops · mixed ratios in one grid · flat-lay abayas (an abaya has no shape
off a body) · watermarks · Cairo everywhere · letter-spaced Arabic · 700-weight
Arabic at 14px · 72–96px bold heroes · Arabic body at line-height 1.5 · mixed
numeral systems · `-40%` badges · strikethrough prices · countdown timers ·
"only 2 left" · star ratings on cards · testimonial carousels · QUICK ADD slabs
over the photo · trust-badge strips · free-shipping progress bars · exit-intent
popups · rounded cards · drop shadows · gold gradients · gold fills · hover
states that scale or lift · multiple easing curves · scroll-triggered fade-up on
every element · auto-rotating hero carousels · black scrims under overlay text ·
blanket `scaleX(-1)` on icons · `text-align: right` on inputs · machine-translated
microcopy.
