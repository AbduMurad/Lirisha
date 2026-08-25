---

# Lirisha — Design Foundation Research
### Award-winning & best-in-class fashion e-commerce, synthesized for a Libyan luxury abaya/bisht house (Arabic-first, RTL)

**Method note:** rather than relying on secondhand "best of" listicles, I pulled the live production CSS and markup of several of the sites cited below (Totême `theme.css`, 254 KB; Cecilie Bahnsen `app.css`, 97 KB; Serotoninn `main.css`, 106 KB; Khaite, Roland Mouret) and extracted their actual tokens — aspect ratios, type scales, easing curves, border widths. Numbers quoted as "measured" come from those files, not from a blog post. Every Google Font recommendation was verified against the live `fonts.googleapis.com/css2` endpoint, including subset weights and byte sizes.

---

## 1. Pattern inventory

### P1 — The sticky-hero handoff
**Who:** Totême (`.sec-Hero-revealEffect`), Khaite, Cecilie Bahnsen, MIU MIU *A House that we shaped*.

**Measured:** Totême's hero is `block-size: 100vh; clip-path: border-box; position: relative`, containing `.sec-Hero_StickyContainer { block-size: 0; inset-block-start: 100%; position: sticky }` and `.sec-Hero_StickyElement { block-size: 100svh; inset-block-end: 0; inset-inline: 0; position: absolute }`. The hero image is pinned; the first content section slides up over it. Note `100svh` — the small-viewport unit, so mobile browser chrome doesn't clip it.

**Why it works:** it buys one full screen of pure image with zero UI competing, then hands off to commerce without a scroll-jack. Nothing is "animated"; the browser does it with `position: sticky`. No JS, no jank, works with reduced-motion for free.

**For Lirisha:** one full-bleed campaign frame of a single abaya on a single model, `100svh`, wordmark and a single Arabic CTA (`اكتشفي المجموعة`) bottom-inline-start. The New Arrivals row slides over it. Do **not** put a carousel here — Cecilie Bahnsen runs *one* image with *one* CTA ("Fall Winter 2026" → "Discover the collection"), and it reads more expensive than any rotator.

---

### P2 — Grid density is a user control, not a designer decision
**Who:** Totême (`view-switch.js`), Roland Mouret (`?grid=3`, `data-columns-desktop="3"` / `data-columns-mobile="2"`).

**Measured:** Totême ships `<view-switch data-mobile-view="Two" data-desktop-view="Four">` with desktop buttons labelled literally **2 / 4 / 8** (`aria-label="Change view 4 column grid"`, `aria-pressed="true"` on 4), and a mobile toggle that cycles 2↔3. Default grid class is `clc-ProductGrid-mobileTwo clc-ProductGrid-desktopFour`.

**Why it works:** browse mode (8-up, contact-sheet) and evaluate mode (2-up, near-editorial) are genuinely different tasks. Offering the switch is a signal of confidence — the merchandise survives being looked at closely *and* being scanned fast.

**For Lirisha:** ship **2 / 3** desktop (not 4/8 — an abaya catalogue is smaller and the silhouette needs width) and **1 / 2** mobile. The 1-up mobile view is the killer feature for abayas specifically: a floor-length garment at 1-up on a phone is nearly life-proportioned. Label the buttons with numerals, not grid icons — icons need mirroring logic in RTL; numerals don't.

---

### P3 — The tall portrait crop (5:7), never square
**Measured, three independent confirmations:**
- Totême: `.prd-Card_MediaContainer:after { padding-block-start: 140% }` → exactly **5:7** (0.714).
- Khaite: `aspect-ratio: 5/7` declared inline on the homepage.
- Cecilie Bahnsen: `aspect-ratio: 0.8` → **4:5**.

Totême's editorial blocks use a separate ratio set: `4/5`, `2/3`, `9/16`, `16/10`, `16/9`, driven by `--Media_AspectRatio`.

**Why it works:** 1:1 is a marketplace convention (Amazon, Instagram) and reads as such. 5:7 forces the photographer to include the hem — which is the whole point of a floor-length garment — and gives the model headroom, which is what makes it look like a lookbook page rather than a listing.

**For Lirisha:** **5:7 is the correct default** and is the single highest-leverage decision in this document. An abaya at 1:1 is either cropped mid-calf or shot so far back the fabric detail dies. Lock 5:7 for every PLP card and enforce it in the CMS. Reserve **2:3** for the one full-length "hero shot" on the PDP, **4:5** for detail/fabric crops, and **16:9 / 16:10** for editorial break-blocks only.

---

### P4 — The quiet card: all controls hidden until hover
**Measured (Totême):**
```
.prd-Card:hover .prd-Card_GalleryArrow    { opacity: 1 }
.prd-Card:hover .prd-Card_GalleryPagination { opacity: 1 }
.prd-Card:hover .prd-Card_Colors          { opacity: 1 }
.prd-Card_Button:hover                    { opacity: .6 }
.util-Hover_Fade:hover                    { opacity: .6 }
```
all wrapped in `@media (hover:hover), (min-width:1600px)`. Card body gap: `.prd-CardMini_Body { margin-block-start: 8px }`.

**Two things worth stealing verbatim.** First: the *entire* hover vocabulary of a €4,500-dress site is **`opacity: .6`**. No scale, no shadow lift, no colour change, no border. Second: the hover guard `@media (hover:hover)` — touch devices never enter a hover state and never get a stuck overlay.

**Why it works:** the grid at rest is nothing but photographs. Arrows, dots and swatches — the "app" furniture — only exist for the one card you're pointing at.

**For Lirisha:** at rest a card shows image + name + price only. On hover: crossfade to shot 2 (`opacity .3s ease`), reveal a hairline pagination row and colourway dots. **No quick-add button.** An abaya is a considered purchase with sizing and length variables; a quick-add is a mass-market tell (see §6).

---

### P5 — Colourway lives in the product name
**Measured (Totême PLP payload):** `"Asymmetric scarf dress black"`, `"Army leather jacket camel"`, `"Belted suede bucket bag brown"` — every colourway is a separate product with the colour appended in sentence case, and `compareAtPrice: "0.0"` on all of them.

**Why it works:** the card needs no swatch row to be complete, the name is scannable at 12px, and every colourway gets its own URL, its own photography, its own place in the grid.

**For Lirisha:** adopt the convention in Arabic — `عباية حرير مطرزة — رملي` (descriptor · material · garment · colour, separated by an en-dash rather than a trailing word, because Arabic sentence case doesn't disambiguate the colour the way English does). Keep the swatch dots on hover as a *shortcut*, not as the primary carrier of the information.

---

### P6 — Everything secondary is a drawer; the page never unloads
**Measured (Totême drawer variants in one stylesheet):** `account`, `backInStock`, `central`, `comingSoon`, `country`, `fromBottom`, `fromLeft`, `fromRight`, `fullScreen`, `help`, `multipleSizes`, `preorder`, `productColours`, `productDetails`, `productDetailsMobile`, `sizeGuide`, `storeAvailability`, `subnav`. Drawer chrome: `--Color_Background-drawer: #fffffff2` (95% white) + `--Effect_Blur-drawer: blur(34px)`; `--Drawer_Spacing: 32px`; the colour drawer is height-capped at `75vh`.

**Why it works:** a size guide that navigates away from the PDP costs you the sale. Eighteen drawers means the customer's place in the grid or on the product is never lost.

**For Lirisha — cart specifically:** **cart drawer, not cart page.** Rationale: the abaya AOV is high but the basket is small (1–2 items); a full cart page is a decision checkpoint you don't want. The drawer should hold: line items at 5:7 thumbnails, quantity, subtotal, a *single* primary CTA, and one line of shipping copy. Keep a `/cart` URL alive for deep links and for the "review everything" case, but never route the add-to-bag action there. Use `blur(34px)` behind 95% ivory rather than a black scrim — the scrim is the cheapest-looking element in most stores.

---

### P7 — One "Filter" button → drawer → removable chips
**Measured (Totême):** the PLP header is a three-column grid — breadcrumbs · view-switch · `<button class="clc-ProductGrid_FilterButton" data-drawers-trigger="collection-filters">Filter</button>`. Facet groups in the drawer are `Availability`, `Colour`, `Material`, `Bag style`, each a `<details>`-style accordion with a sticky header (`.clc-ProductGridFacet_Header { position: sticky; inset-block-start: 0; border-block-end: 1px solid var(--Color_Border-secondary); padding: 15px }`). Applied facets render below as removable chips (`facet-remove.js`, `.clc-ProductGridFacets_ActiveFacet { margin-block-start: 10px; margin-inline-end: 10px }`). Checkbox hover: `background-color: var(--Color_Surface-primary); opacity: .6`.

**Why it works:** a permanent left rail (the SSENSE/Net-a-Porter model) is right for a 200,000-SKU marketplace and wrong for a 60-piece house — it advertises that you need machinery to find anything. The drawer keeps the grid full-bleed.

**For Lirisha:** facet groups, in this order — **النوع** (abaya / bisht / jalabiya / sheila / inner), **اللون**, **القماش** (crêpe, nida, silk, linen, chiffon, georgette), **التطريز** (plain / embroidered / hand-beaded / crystal), **المناسبة** (everyday / occasion / bridal), **الطول**. Note that Hanayen — the largest Gulf abaya retailer — separates exactly these axes at nav level (Abaya 1,222 / Sheila 134 / Under-Abaya 29 / Jalabiya 32), and Aab merchandises by occasion (everyday, occasion, workwear) rather than by garment. **Occasion is the intent axis in modest fashion; garment type is the taxonomy axis. Ship both.**

---

### P8 — Load More, not infinite scroll
**Measured:** Totême's grid declares `data-pagination-type="LOAD_MORE"`. Bloomingdale's ME uses "Load More" for its New In carousel overflow. Depict's grid study notes only ~8% of the top 50 US e-commerce sites use Load More — it is a minority pattern, which is precisely why it doesn't read as mass-market.

**Why it works:** infinite scroll destroys the footer (where the brand story, atelier, and care instructions live — the trust surface for a bespoke garment) and makes the catalogue feel endless, i.e. cheap. Load More says *the collection is finite and curated*.

**For Lirisha:** 24 items initially, Load More, footer always reachable. Show the count (`٢٤ من ٦٢` — but see §3 on numerals; use `24 من 62`).

---

### P9 — A light, low-ceilinged type scale
**Measured — Totême's complete type scale, extracted from their utility classes:**

| class | size | line-height | weight |
|---|---|---|---|
| `fz-12_160` | 12px | 160% | 300 |
| `fz-14_145` | 14px | 145% | 300 |
| `fz-14_150` | 14px | 150% (+.01em) | 300 |
| `fz-14_155` | 14px | 155% | 300 |
| `fz-16_150` | 16px | 150% | 300 |
| `fz-18_125` | 18px | 125% | 300 |
| `fz-20_125` / `fz-20_150` | 20px | 125% / 150% | 300 |
| `fz-24_125` | 24px | 125% | 300 |
| `fz-28_120` | 28px | 115% | 300 |
| `fz-32_120` | 32px | 120% | 300 |
| `fz-40_115` | 40px | 115% | 300 |

Cecilie Bahnsen's is even tighter: **11 / 13 / 15 / 20px**, with `letter-spacing: .03em`–`.05em` on the small label sizes.

**Read that again.** The largest type token on a site selling €4,500 dresses is **40px**, every single weight is **300**, and maximum tracking is **0.01em** on body. There is no `font-weight: 700` in the scale at all. Meanwhile line-height *increases* as size decreases (115% at 40px → 160% at 12px), which is the inverse of most design systems and is what makes small caption text feel airy rather than dense.

**For Lirisha:** cap the Latin display at 40px and the Arabic display at ~48px (Arabic needs more size for equivalent optical weight — see §3). Use exactly two weights.

---

### P10 — Fluid units, not breakpoint jumps
**Measured (Totême):**
```css
--u: clamp(1px, .04px + .0667vw, 1.4px);
--s2: calc(var(--u)*2);  --s4 … --s8 --s10 --s12 --s13 --s16 --s24
--s32 --s40 --s48 --s64 --s72 --s80 --s96 --s102 --s142 --s160;
font-size: calc(var(--u)*14);
```
`--u` equals exactly 1px at a 1500px viewport, floors at 1px below ~1440px, and ceilings at 1.4px above ~2100px. So the entire system — type, spacing, header height, gutters — scales as one organism between 1500px and 2100px, then stops.

Serotoninn (Awwwards E-commerce Honors, Jul 2026; SOTD Aug 2026) does the same more bluntly: `:root { font-size: 2.6667vw }` on mobile, `1.302vw` on desktop — a fully fluid rem base.

**Why it works:** on a 27" display a fixed-px luxury site looks like a postage stamp of content in a sea of margin. `--u` makes the whole page grow proportionally, so the 5:7 crop stays imposing at 2560px.

**For Lirisha:** copy `--u` verbatim. It's the single cleverest line of CSS in the sample and it costs nothing.

---

### P11 — One easing, short durations
**Measured:**
- **Serotoninn:** exactly **one** easing curve in a 106 KB stylesheet — `cubic-bezier(.75, 0, .25, 1)`, used 23 times. Durations: `.3s`, `.4s`, `.4s .4s` (staggered), `.5s`, `.6s`, `.7s`, `.8s`.
- **Totême:** `transition: opacity .3s ease` ×17, `transform .3s ease` ×9, `.2s ease-out` ×3, `.15s`; plus two named curves — `--Carousel_Ease: cubic-bezier(.25,1,.5,1)` and `--Menu_Slide_Ease: cubic-bezier(.16,1,.3,1)`.
- **Cecilie Bahnsen:** `.15s`, `.2s`, `.25s` only.

**Why it works:** a shared curve makes unrelated elements feel like one material. Amateur sites use `ease`, `ease-in-out`, `linear` and three bezier curves in the same viewport, and the result reads as assembled from plugins.

**For Lirisha:** **three tokens, no more.**
```
--ease:        cubic-bezier(.25, 1, .5, 1);   /* Totême's carousel curve — quick out, long settle */
--ease-drawer: cubic-bezier(.16, 1, .3, 1);   /* Totême's menu curve, for panels */
--dur-fast: 150ms;  --dur: 300ms;  --dur-slow: 600ms;
```
Image crossfade `--dur`; drawer slide `--dur-slow` with `--ease-drawer`; hover opacity `--dur-fast`.

---

### P12 — Hairlines, zero radius, zero shadow
**Measured (Totême):** `--Border_Width: .5px`. `border-radius: 0` appears 8×; `50%` 12× (circular controls only); `5px`/`4px`/`10px`/`50px` appear a handful of times, all in third-party/cookie-banner code. Box-shadow: `none` ×3, and every other instance is an **inset ring** — `inset 0 0 0 1px var(--Color_Background-primary)`, `inset 0 0 0 1.5px var(--Color_Text-primary)`, `inset 0 0 0 2px`. There is **not one drop shadow** in the file. Cecilie Bahnsen's only real shadow is `0 1px 2px #0000000d` — 5% black at 1px, i.e. invisible.

**Why it works:** drop shadows imply depth, and depth implies "app". A luxury commerce page is a printed page — objects sit *on* it, not *above* it. And 0.5px hairlines (which render as a true sub-pixel line on any 2× display) look like the rule on a lookbook spread; 1px #ddd looks like a form.

**For Lirisha:** `--radius: 0` everywhere except circular controls (`50%`) and the country/currency pill. Borders `0.5px solid var(--line)`. Elevation is expressed by **backdrop-blur + 95% opaque ivory**, never by shadow.

---

## 2. What luxury does that mass-market doesn't

These are the concrete, measurable deltas. Each is falsifiable against a live site.

**1. No compare-at price. Anywhere.**
Every single product in Totême's PLP payload carries `compareAtPrice: "0.0"`. Modanisa's homepage markup, by contrast, ships classes named `flash-deals-`, `DiscountCampaign`, `DiscountText`, and `Badge`. That's the whole difference in one grep. A strikethrough price is a statement that the first price was fiction.

**2. A 40px type ceiling and a single light weight.**
Totême's largest token is 40px/115%/weight 300. Cheap stores use 64–96px bold heroes. Big bold type is how you compensate for weak photography.

**3. Whitespace budget is spent *between* products, not around the page.**
Totême desktop: `--Site_Margin: 32px` (page edge) but `--Grid_Gutter: 64px` (between columns). Depict's mainstream best-practice recommends 24–32px between cards. Totême runs **double the mainstream maximum** between products while keeping page margins modest — so the content block is wide and the products are isolated. That inversion (tight to the edge, loose between items) is the luxury signature. Depict also cites a jewellery test where doubling card spacing raised revenue per shopper ~50%.

**4. Crop discipline: 5:7 / 4:5, never 1:1, never mixed.**
Three of three luxury sites measured; zero exceptions within a grid.

**5. Hover is `opacity: .6` and nothing else.**
No lift, no scale, no shadow, no border colour change, no "QUICK ADD" slab.

**6. Two colours.** Awwwards documents Brunello Cucinelli's AI e-commerce (SOTD Jul 2026, jury: Design 7.27 / Usability 7.02 / Creativity 7.2 / Content 7.33) as running a **two-colour palette: `#F1EDE7` and `#282828`.** Warm sand and warm charcoal. That's the entire palette of a €1B house's flagship digital experience.

**7. No social proof furniture on the merchandise.**
AbayaButh's homepage carries five star-rated testimonials ("I received my order Abaya was gorgeous l love it") and a phone number in the header. Cecilie Bahnsen's equivalent slot reads: *"Nestled in a secluded courtyard, our new space invites you to discover collections, craftsmanship, and quiet beauty."* Neither is wrong for its market; only one is Lirisha's market.

**8. No urgency.**
AbayaButh: *"UK CUSTOMERS - PLEASE SELECT GUARANTEED SATURDAY DELIVERY TO RECEIVE IN TIME FOR EID"*, in a banner, in caps. Totême: the drawer set includes `comingSoon`, `preorder`, `backInStock` — scarcity handled as *service*, calmly, in a drawer.

**9. Load More, not infinite scroll.** (~8% adoption among top-50 US retailers.)

**10. Descriptive, unexcited product names.** "Belted suede bucket bag brown." Not "✨ LUXURY Premium Dubai Abaya 2026 NEW ✨".

**11. Logical properties as a house standard.** Totême's 254 KB stylesheet contains `margin-inline` ×137, `padding-inline` ×176, `inset-inline` ×143, `text-align: start` ×46 — and **zero** occurrences of `margin-left`, `margin-right`, `padding-left`, or `text-align: left`. Cecilie Bahnsen, by comparison, still has 21 `margin-left` and 8 `text-align: left`. This is a maturity marker — and for an Arabic-first build it's not stylistic, it's structural (see §3).

---

## 3. Arabic / RTL specifics

### 3.1 Typeface pairing — verified available and self-hostable

All of the following were confirmed live against `fonts.googleapis.com/css2` with Arabic **and** Latin subsets present, and all are SIL Open Font License (self-hosting and commercial use permitted).

**Recommended pairing:**

| Role | Family | Weights | Arabic subset | Latin subset |
|---|---|---|---|---|
| **Display / headings / nav** | **Reem Kufi** | variable 400–700 | **8.9 KB** | 12.1 KB |
| **Body / UI / product data** | **IBM Plex Sans Arabic** | 200,300,400,500,600,700 | 42.8 KB | 19.2 KB |
| **Latin partner** | **IBM Plex Sans** | 300/400 | — | — |

**Why this pair.** Reem Kufi is a modern geometric Kufi — architectural, high-waisted, minimal contrast. It is the closest free equivalent to the custom Kufi wordmarks used by Gulf luxury houses, and it does *not* look like a system font. Its Arabic subset is **8.9 KB**, which is remarkable and means you can preload it with no LCP cost. IBM Plex Sans Arabic is the only Google Fonts Arabic family with a **metrically-designed Latin sibling from the same foundry** (IBM Plex Sans), which satisfies the cardinal bilingual rule — *pair Latin and Arabic designed by the same team, or the proportions will fight*. Reem Kufi does ship a Latin subset, but its Latin is a secondary design; use Plex Sans for Latin, always.

**Alternative display face, if the brand wants a couture/heritage register rather than a modern one:** **Amiri** — a revival of the Bulaq Press Naskh, genuinely beautiful at 40px+. Cost: its Arabic subset is **108.5 KB**, 5.5× its own Latin subset and 12× Reem Kufi. If you use Amiri, `preload` only the 400 weight, use it *only* for the H1 and collection titles, and never for UI.

**Explicitly rejected, with reasons:**
- **Cairo** — the most-used Arabic webfont in existence. Correct, competent, and instantly reads "template". Same problem the guides flag with Arial Arabic: "overused, generic."
- **Noto Kufi Arabic** — this is the UAE Government Design System's *primary* body face. It will make a luxury abaya site feel like a ministry portal.
- **Alexandria** — the UAE DS *secondary*. Same objection.
- **Aref Ruqaa** — gorgeous Ruqaa, but a display-only calligraphic face; unusable below ~32px and wrong for navigation.
- **Tajawal** — good, tiny (8.9 KB), very "GCC startup". Keep as a fallback in the stack, not as the brand face.

**The stack:**
```css
--font-display: "Reem Kufi", "Noto Kufi Arabic", "Tajawal", sans-serif;
--font-body:    "IBM Plex Sans Arabic", "IBM Plex Sans", "Tajawal",
                system-ui, sans-serif;
```
Preload `Reem Kufi 400/500` Arabic subset + `IBM Plex Sans Arabic 400` Arabic subset. Everything `font-display: swap`. Arabic webfonts run 2–5× the byte weight of Latin equivalents (confirmed above: Amiri 108.5 KB vs 19.5 KB), so this matters on Libyan mobile networks.

### 3.2 Numerals — the answer for Lirisha is **Western digits (0–9)**

Not a judgement call. Per Wikipedia's survey of contemporary usage: *"In the Maghreb, only Western Arabic numerals are commonly used today."* **Libya is Maghreb.** Eastern Arabic-Indic (٠١٢٣) is standard in Egypt, Sudan, and parts of the Levant/Gulf, but a Libyan-facing store rendering `١٢٥٠ د.ل` will read as foreign, not as authentic. The UAE — a likely secondary market — uses both, with Western increasingly favoured. And the universal rule from every RTL guide: **never mix the two systems on one page.**

**Then there is a live trap I verified empirically.** `Intl.NumberFormat` does not do what you expect:

```
new Intl.NumberFormat('ar-LY').format(1250)   →  "1.250"      ← dot = thousands separator
new Intl.NumberFormat('ar-EG').format(1250)   →  "١٬٢٥٠"      ← silently Arabic-Indic
new Intl.NumberFormat('ar-SA').format(1250)   →  "١٬٢٥٠"      ← silently Arabic-Indic
new Intl.NumberFormat('ar-AE').format(1250)   →  "1,250"
Intl.NumberFormat('ar-LY').resolvedOptions().numberingSystem  →  "latn"
Intl.NumberFormat('ar-EG').resolvedOptions().numberingSystem  →  "arab"
```

Two bugs waiting to happen: `ar-EG`/`ar-SA` flip your prices to Arabic-Indic without warning, and `ar-LY` uses **European separators** (`1.250` for one thousand two hundred fifty) plus **three decimal places** for LYD, giving `‏1.250,000 د.ل.‏`.

**Use exactly this, pinned, for every price on the site:**
```js
const price = new Intl.NumberFormat('ar-u-nu-latn', {
  style: 'currency', currency: 'LYD',
  minimumFractionDigits: 0, maximumFractionDigits: 0
});
price.format(1250);   // "‏1,250 د.ل.‏"
```
`ar-u-nu-latn` (bare `ar`, forced Latin numbering) gives comma grouping and Western digits regardless of the visitor's region. Note the output is wrapped in **U+200F RIGHT-TO-LEFT MARK** literals — do not strip them, and do not build the string by concatenation; use `formatToParts` if you need to style the currency symbol separately.

Also: set `font-variant-numeric: tabular-nums` on all prices so the grid's price column doesn't jitter between rows.

### 3.3 Line-height, letter-spacing, size

| | Latin (Totême's measured values) | **Arabic (recommended)** |
|---|---|---|
| Display 40–48px | 115% | **130–135%** |
| Heading 24–32px | 120–125% | **135–140%** |
| Body 16px | 150% | **170–180%** |
| Caption 12–14px | 155–160% | **175–185%** |
| letter-spacing body | +0.01em | **exactly 0** |
| letter-spacing labels | +0.03 to +0.05em | **exactly 0** |

**Line-height:** Arabic needs 1.7–1.85 for body (vs 1.5–1.6 Latin) and 1.3–1.4 for headings (vs 1.1–1.2). Arabic letterforms extend both below the baseline and above the cap line in ways Latin does not, and tashkeel (diacritics) need vertical clearance even when you don't set them, because *some* text will carry them.

**Letter-spacing: zero. Always. Non-negotiable.** Arabic is a connected script; tracking breaks the ligatures and the joins, producing text that looks broken rather than airy. This kills one of luxury design's favourite idioms — the tracked uppercase micro-label (`+0.08em`, 11px, `SHOP THE COLLECTION`). Arabic has **no uppercase, no small caps, and no italics.** You cannot get emphasis the way you do in Latin.

**Substitute idioms for Arabic emphasis, in order of preference:**
1. **Weight step** — IBM Plex Sans Arabic 400 → 600 (never 700+ for labels; it gets muddy at 12px).
2. **Colour step** — `--ink` → `--muted`.
3. **A 0.5px hairline rule** above or below the label (`border-block-start`), which does the work that tracking does in Latin.
4. **Size step** with generous `margin-block`.

**Size:** Arabic reads comfortably at 1–2px *smaller* than the equivalent Latin for a given optical weight in Plex Sans Arabic — but only for body. At display sizes the reverse applies: Kufi display needs **more** size than a Latin grotesque to carry equivalent presence, because the counters are open and the strokes are monolinear. So: **Latin display 40px ↔ Arabic display 48px** for the same visual weight; **Latin body 16px ↔ Arabic body 16px** (Plex Arabic runs slightly large). Mobile minimum 16px regardless — below that tashkeel becomes mush, and iOS zooms form inputs.

### 3.4 RTL mirroring gotchas — the ones that will actually bite

**a) Logical properties from line one.** `margin-inline-start/end`, `padding-inline-*`, `inset-inline-*`, `border-inline-*`, `text-align: start/end`, `block-size`/`inline-size`. Totême's zero-physical-property stylesheet is the proof this is achievable at production scale. If you write `margin-left` even once, you own an RTL bug forever.

**b) Carousels are the #1 breakage.** A slider that moves with `translateX(-100%)` scrolls the wrong way in RTL. Fix with a direction variable rather than a JS branch:
```css
:root       { --dir:  1; }
[dir="rtl"] { --dir: -1; }
.track { transform: translateX(calc(var(--dir) * var(--i) * -100%)); }
```
Also: `element.scrollLeft` is **negative** in RTL in Firefox/Safari and positive-decreasing in Chrome — never read it directly. Use `scroll-snap-type: inline mandatory` with `scrollIntoView({ inline: 'start' })`, which is direction-aware. Swiper has multiple long-standing RTL issues (cards effect unsupported in RTL; dynamic RTL switching broken) — prefer native CSS scroll-snap for the PDP gallery and the New Arrivals rail.

**c) Drawer direction naming.** Even Totême, with otherwise perfect logical CSS, names its drawers `drw-Drawer-fromRight` / `-fromLeft`. Don't inherit that. Name yours `--from-inline-end` / `--from-inline-start` and animate with `inset-inline-end` so the cart drawer enters from the correct side without a code branch. **In RTL, the cart drawer should enter from the left** (inline-end), because the cart icon lives at the inline-end of the header.

**d) Icon mirroring is per-icon, not blanket.** A global `transform: scaleX(-1)` on all icons is the classic failure. **Mirror:** back/forward chevrons, breadcrumb separators, "next image" arrows, progress/loading bars (which fill right→left in RTL), sliders, undo/redo. **Do not mirror:** the search magnifier, checkmarks, the bag/basket, the heart, the logo, play/pause, clocks (clocks stay clockwise), and anything with an implied right-handed grip.

**e) Force LTR on bidi-hostile fields.** Email, phone, URL, password, SKU, coupon code, and card number inputs all need `dir="ltr"` even inside an RTL document — otherwise the cursor jumps and punctuation lands on the wrong end. On the inputs use `text-align: start`, **not** `text-align: right`, so a user typing Latin doesn't get right-aligned Latin.

**f) Wrap embedded Latin.** Brand names, order numbers, and sizes inside Arabic sentences go in `<bdi>` or `<span dir="ltr">`, or the trailing punctuation migrates. Use `dir="auto"` on any user-generated string.

**g) Set direction once.** `<html lang="ar" dir="rtl">`. Never per-element.

**h) The F-pattern flips.** Arabic scanning starts top-inline-end. The logo goes top-**right**; primary nav flows right; the "hero" half of a split editorial block belongs on the **right**. And in campaign photography, a model looking or walking *into* the page should face **left** in RTL — mirror-flip campaign crops where the composition has directional flow, or brief the photographer for it.

**i) Text expansion.** Arabic UI strings often run longer than English equivalents. Never set fixed widths on buttons or nav items; use `min-inline-size` + `padding-inline`.

---

## 4. Concrete design tokens

### 4.1 Palette

Anchored to Brunello Cucinelli's documented `#F1EDE7` / `#282828`, warm-shifted from Totême's measured neutral ramp (`#f6f5f3 → #ebeae8 → #dfdedb → #9e9d9b → #767676 → #6b6b6b → #5a5a5a → #414141 → #1e1e1e → #161616 → #090909`). All contrast ratios below are computed, not estimated.

```css
:root{
  /* — Grounds ————————————————————————— */
  --ivory:      #FBF9F5;  /* page. Warmer than Totême's #f6f5f3 */
  --sand:       #F1EDE7;  /* surface. Cucinelli's exact value */
  --linen:      #E7E1D7;  /* surface-2: drawer bodies, editorial blocks */

  /* — Line ———————————————————————————— */
  --line:       #DDD6C9;  /* 0.5px hairline, default */
  --line-strong:#2A2724;  /* the "active/selected" rule */

  /* — Ink ————————————————————————————— */
  --ink:        #1A1815;  /* headings.        16.85:1 on ivory */
  --charcoal:   #2A2724;  /* body.            14.12:1 on ivory */
  --ink-2:      #57504A;  /* secondary.        7.53:1 on ivory */
  --muted:      #6E665C;  /* captions, meta.   5.37:1 on ivory */
  --muted-2:    #8C8378;  /* disabled only.    3.55:1 — large text / UI only */

  /* — Gold: three values, three jobs, no others ———— */
  --gold:       #A9884E;  /* rules, dividers, icon strokes. 3.16:1 on ivory
                             → NEVER body text. AA-large / non-text only */
  --gold-text:  #8A6E3C;  /* the only gold allowed as text. 4.56:1 on ivory ✓AA */
  --gold-light: #C9A96A;  /* gold ON dark only. 6.62:1 on charcoal ✓AA,
                             7.90:1 on ink ✓AA */

  /* — Semantic, used almost never ————————————— */
  --error:      #A33B33;  /* desaturated, warm. Not #c50c1e */
  --success:    #4A6B4F;
}
```

**Justification.** Cucinelli proves the two-colour thesis at scale — sand plus charcoal, nothing else, on an Awwwards SOTD. The neutral ramp gives you nine usable steps without introducing a second hue, exactly as Totême does. **Gold is deliberately constrained to three values with three assigned jobs, because gold is the single fastest way to make an abaya store look cheap** — it is used at large area fills, as gradients, and as text on every mass-market site in the category. Here it appears only as: (1) a 0.5px rule under a section label, (2) the hairline that marks the active filter chip, (3) the wordmark and footer on the charcoal ground. Its measured 3.16:1 on ivory makes the "not for text" rule enforceable rather than a matter of taste. No gradient tokens exist in this system. No gold gradient. Ever.

Dark mode: not recommended for a fashion PLP — inverting the ground changes the perceived colour of every garment photograph. If required, invert to `--ink` ground with `--sand` text and `--gold-light` accents; keep product imagery on a `--sand` card so the goods are never judged against black.

### 4.2 Type scale

Built on Totême's measured `--u` unit, so the whole page scales fluidly 1440→2100px and then stops.

```css
:root{
  --u: clamp(1px, .04px + .0667vw, 1.4px);   /* = 1px @1500vw, caps at 1.4px */
}
```

| Token | rem | px @1500 | line-height (AR) | weight | use |
|---|---|---|---|---|---|
| `--t-micro` | 0.6875 | 11 | 1.85 | 400 | legal, size-chart cells |
| `--t-label` | 0.75 | 12 | 1.80 | 500 | nav, filter chips, breadcrumbs, price on card |
| `--t-body-s` | 0.875 | 14 | 1.75 | 400 | product name on card, drawer body |
| `--t-body` | 1.0 | 16 | 1.75 | 400 | PDP description, editorial paragraphs |
| `--t-body-l` | 1.125 | 18 | 1.70 | 400 | PDP price, lead paragraph |
| `--t-h4` | 1.25 | 20 | 1.50 | 500 | PDP title, drawer titles |
| `--t-h3` | 1.5 | 24 | 1.45 | 500 | section headings |
| `--t-h2` | 2.0 | 32 | 1.40 | 500 | collection titles |
| `--t-h1` | 2.5 | 40 | 1.35 | 500 | page titles |
| `--t-display` | 3.0 | 48 | 1.30 | 400 | hero only, Reem Kufi |

**Justification.** Sizes 11–40 map 1:1 onto Totême's measured tokens (11/12/14/16/18/20/24/28/32/40) and Cecilie Bahnsen's 11/13/15/20. The only addition is `--t-display: 48px`, which exceeds Totême's 40px ceiling **solely because Arabic Kufi needs the extra size to match a Latin grotesque optically** (§3.3). Every line-height is raised from Totême's Latin values by roughly +0.2 to meet the 1.7–1.85 body / 1.3–1.4 heading requirement for Arabic. Weights are **400 and 500 only** — Totême's entire scale is weight 300; Plex Sans Arabic at 300 is too thin for Arabic joins (the guides warn explicitly against thin Arabic faces), so 400 is our "light" and 500 our "emphasis". **600 and 700 exist in the font and are not in the design system.**

Latin fallback sizes run one step down where mixed (Latin 40 where Arabic is 48).

### 4.3 Spacing scale

Totême's `--s*` ladder, trimmed of the values they use twice:

```css
--s-2:2;  --s-4:4;  --s-8:8;  --s-12:12; --s-16:16; --s-24:24;
--s-32:32; --s-40:40; --s-48:48; --s-64:64; --s-80:80; --s-96:96; --s-160:160;
/* each as calc(var(--u) * N) */
```

Layout constants, following the measured luxury inversion (tight page margin, loose product gutter):

```css
--page-margin:  16px;                /* mobile */
--page-margin:  calc(var(--u)*32);   /* ≥1024px — Totême's exact value */
--container:    1320px;              /* Totême's --Grid_Container */
--grid-gutter:  calc(var(--u)*64);   /* Totême's desktop gutter, 2× the
                                        mainstream 24–32px recommendation */
--card-gap-y:   calc(var(--u)*80);   /* vertical > horizontal: rows breathe */
--img-to-text:  8px;                 /* Totême's .prd-CardMini_Body margin */
--header-h:     calc(var(--u)*72);   /* Totême: 64px mobile / 72u desktop */
--drawer-pad:   calc(var(--u)*32);
--section-gap:  calc(var(--u)*160);  /* between homepage sections */
```

Whitespace ratio target, stated as a rule you can check in review: **on the gallery at 3-up desktop, the empty space between two product images should be visibly wider than the gap between an image and the page edge.** That single inversion is what separates a lookbook grid from a catalogue grid, and it is measurable (64px gutter vs 32px margin).

### 4.4 Radius, borders, shadow, motion

```css
/* Radius — Totême: border-radius:0 is the dominant value; 50% for circles only */
--radius:        0;
--radius-circle: 50%;
--radius-pill:   999px;  /* permitted on exactly ONE element:
                            the country/currency selector */

/* Borders — Totême's --Border_Width: .5px */
--border:  0.5px solid var(--line);
--border-strong: 0.5px solid var(--line-strong);

/* Shadow — Totême's file contains zero drop shadows */
--shadow:       none;
--ring:         inset 0 0 0 1px var(--ink);     /* selection / focus */
--ring-subtle:  inset 0 0 0 0.5px var(--line);
--elevation:    /* not a shadow — a material */
  background: rgba(251,249,245,.95);
  backdrop-filter: blur(34px);                  /* Totême's exact blur value */

/* Motion */
--dur-fast: 150ms;  --dur: 300ms;  --dur-slow: 600ms;
--ease:        cubic-bezier(.25, 1, .5, 1);     /* Totême --Carousel_Ease */
--ease-drawer: cubic-bezier(.16, 1, .3, 1);     /* Totême --Menu_Slide_Ease */

/* Direction */
--dir:  1;               /* [dir="rtl"] { --dir: -1 } */
```

**Justification.** `--radius: 0` is the measured majority in both Totême and Cecilie Bahnsen (whose only radii are `4px` and third-party code). `0.5px` borders come straight from Totême's `--Border_Width` and render as a true hairline on any 2× display, which is what a printed rule looks like. Zero drop shadows is not an aesthetic preference — it is the observed state of a 254 KB production stylesheet from a house selling €16,000 leather jackets. `blur(34px)` at 95% ivory is Totême's drawer treatment, and it replaces both the shadow and the black scrim.

Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important } }` — the sticky hero degrades correctly on its own since it uses no JS.

---

## 5. Three reference layouts

RTL-first throughout: "start" = right, "end" = left.

### 5.1 Home page

**1 · Announcement rail** — `--header-h` 48px, ground `--sand`, `--t-label` 12px/500, `--charcoal`. One sentence, rotating on a 6s interval with `opacity --dur --ease` crossfade (no slide — slide needs direction handling). Content: shipping to Libya + GCC, or the current collection name. **Never a discount or a countdown.** Dismissible; the dismissal persists in `localStorage`.

**2 · Header** — transparent over the hero, `--ivory` after scroll. Totême's pattern: `.hd-Banner-hasScrolled:not(:hover, .hd-Banner-hasScrolledUp) { transform: translateY(-100%) }` — hide on scroll-down, reveal on scroll-up or hover. Layout in RTL: wordmark at inline-start (right), nav center or beside it, utilities (search · account · wishlist · bag) at inline-end (left). Nav labels, `--t-label`, weight 500, `letter-spacing: 0`: **عبايات · بشوت · جلابيات · المجموعات · الأتيليه**. Hover: `opacity: .6`, `--dur-fast`, guarded by `@media (hover:hover)`.

**3 · Hero** — `block-size: 100svh`, sticky-reveal per P1. One image, 2:3 or full-bleed, a single abaya on a single model, shot with hem visible. Overlay: wordmark is *not* repeated here (it's in the header); instead one line at `--t-display` 48px Reem Kufi 400 in `--ivory` (or `--ink` if the image is light), and one text CTA — **`اكتشفي المجموعة`** — underlined with a 0.5px `--gold` rule that extends on hover via `transform: scaleX()` from `transform-origin: right` (RTL). No box button. No second CTA. No dots.

**4 · New arrivals rail** — horizontal scroll, CSS `scroll-snap-type: inline mandatory`, 5:7 cards, 2.2 visible on mobile / 4.2 on desktop (the partial card is the affordance — no arrows needed on touch). Section label above, `--t-h3` 24px, inline-start aligned, with a 0.5px `--gold` rule spanning the container width beneath it. Section top margin `--section-gap`.

**5 · Editorial break — "الأتيليه"** — 16:10 image, full-bleed, ground `--linen`. Two lines of copy at `--t-body` 16/1.75 in `--ink-2`, max 52 characters per line (Arabic measure runs shorter than Latin's 66). This is where the Libyan-craft story lives — hand embroidery, the atelier, the cut. It is the section that justifies the price, and it belongs above the fold-and-a-half, not in the footer.

**6 · Category triptych** — three 5:7 tiles at `--grid-gutter` 64px, `عبايات` / `بشوت` / `شيلات`. Label overlays bottom-inline-start in `--ivory` with no scrim; if the image can't carry white text, re-shoot rather than adding a gradient.

**7 · Occasion edit** — 2-up 4:5, `للمناسبات` / `للعروس`. Per the modest-fashion roundups, occasion is the dominant intent axis in this category (Aab navigates by everyday/occasion/workwear; Annah Hariri runs dedicated wedding collection pages). Give it a homepage slot.

**8 · Footer** — ground `--ink`, text `--sand`, wordmark and section rules in `--gold-light` (7.90:1, passes AA). Four columns → single column below 768px. Newsletter: one input with a `border-block-end: 0.5px solid` only, no box, `text-align: start`, `dir="auto"` so a Latin email address doesn't reverse; submit is an inline-end chevron mirrored for RTL. Below: WhatsApp contact and a Libyan phone number in a `<span dir="ltr">` — the localization guides flag visible phone/WhatsApp as a material trust factor in MENA, and it does not compromise the aesthetic if it lives in the footer rather than the header (contrast AbayaButh, which puts the phone number in the header).

---

### 5.2 Gallery / collection page

**1 · Header strip** — three-column grid mirroring Totême's PLP:
`[ breadcrumbs — inline-start ] [ view-switch — center ] [ فلترة button — inline-end ]`
all at `--t-label` 12px. The filter button opens a drawer; it is a text button with a 0.5px underline that retracts on hover (`transform: none` on hover, per Totême's `.clc-ProductGrid_FilterButton:hover:before`). No icon.

**2 · Collection intro** — optional, one line. Collection name at `--t-h1` 40px Reem Kufi, one sentence at `--t-body` `--ink-2`, both inline-start aligned. Then `--s-64` of nothing.

**3 · Active facets row** — removable chips, `--s-8` gap wrapping (`margin-block-start: 8px; margin-inline-end: 8px`, negative-margin trick on the container to kill the first row's offset). Chip: `--t-label`, `--border`, `--radius: 0`, ×-glyph at inline-end. Plus **`مسح الكل`** at the end. Chips only render when facets are applied — the row is absent otherwise, no reserved empty space.

**4 · The grid** — `grid-template-columns: repeat(var(--cols), minmax(0,1fr))`; `--cols` is 2 mobile / 3 desktop by default, driven by the view-switch (1↔2 mobile, 2↔3 desktop). `column-gap: var(--grid-gutter)` (64px), `row-gap: var(--card-gap-y)` (80px).

**Card anatomy, at rest:**
```
┌──────────────┐  5:7 image (padding-block-start: 140%)
│              │  object-fit: cover
│              │
└──────────────┘
  8px gap
  عباية حرير مطرزة — رملي      --t-body-s / 14 / 400 / --charcoal
  1,250 د.ل                    --t-label / 12 / 500 / --muted, tabular-nums
```
**On hover** (`@media (hover:hover)` only): image 2 crossfades in at `opacity --dur --ease`; a hairline pagination row of 0.5px dashes fades in at the image's bottom-inline-start; colourway dots fade in beneath the price. Card link feedback: `opacity: .6`. **No quick-add. No wishlist heart on the card** — put the wishlist on the PDP only; a heart on every card in a 60-piece collection is app furniture.

**5 · Editorial interruption** — after row 2 and row 5, drop a full-width 16:10 campaign block spanning all columns (`grid-column: 1 / -1`) on `--linen`. Totême does this with `.clc-Promotion`, which has its own hover image swap. It breaks the catalogue rhythm and re-asserts that this is a house, not a marketplace.

**6 · Load More** — centered text button, `--t-label`, 0.5px underline, `عرض المزيد`, with the count beneath in `--muted`: `24 من 62` (Western digits, per §3.2). Footer reachable.

**7 · Filter drawer** — enters from inline-end (left in RTL), `inline-size: min(420px, 100vw)`, `--elevation` (95% ivory + `blur(34px)`), `--ease-drawer` at `--dur-slow`. Sticky header with the facet-group name and a close ×. Groups as accordions, each header `padding: 15px var(--drawer-pad)` with `border-block-end: var(--border)`. Checkbox rows: `margin-inline-end: 10px` on the box, hover `background: var(--sand); opacity: .6`. Live counts beside each value. Footer of the drawer: `عرض النتائج (١٨)` → `عرض النتائج (18)`.

---

### 5.3 Product page

**1 · Layout** — two columns. Cecilie Bahnsen's measured PDP grid is `grid-template-columns: 48% minmax(0, 1fr)`. Take the same shape but mirror it: **media column at inline-start (right, ~55%), info column at inline-end (left, ~45%, `position: sticky; inset-block-start: calc(var(--header-h) + 24px)`)**. Below 900px it stacks: media first, info second.

**2 · Media column** — a *vertical stack*, not a carousel. Four to six images at 5:7, stacked with `--s-8` between them, and the page simply scrolls. This is the single most effective luxury PDP pattern and it sidesteps every RTL carousel bug in §3.4(b). Shot order for an abaya: (1) full-length front, 2:3; (2) full-length back — non-negotiable for abayas, where the back panel and sleeve fall are the design; (3) three-quarter in motion; (4) fabric macro at 4:5; (5) embroidery/detail macro; (6) closure/cuff. Add a thin sticky thumbnail rail at the inline-start edge of the media column on desktop (0.5px separators, active thumb marked with `--ring`).

**3 · Info column, in order:**

- Breadcrumb, `--t-micro`, `--muted`.
- Product name, `--t-h4` 20px / weight 500 / `--ink`. Colour in the name per P5.
- Price, `--t-body-l` 18px, `--muted`, `tabular-nums`, formatted with the pinned `Intl` config from §3.2. **No compare-at, no "was", no % badge.**
- One-sentence descriptor, `--t-body` 16/1.75, `--ink-2`, max ~52 Arabic characters per line.
- **Colourway swatches** — circular, `--radius-circle`, 24px, `--ring-subtle` at rest, `--ring` when selected. Each navigates to that colourway's own URL (P5).
- **Size** — a row of text buttons, `--border`, `--radius: 0`, 44×44px minimum touch target. Unavailable sizes: `--muted-2` with a 0.5px diagonal, still clickable → opens the `backInStock` drawer.
- **Length** — abaya-specific and the most important field on this page. A second row: 54″ / 56″ / 58″ / 60″ (`dir="ltr"` on the numerals), plus a **`تفصيل حسب الطلب`** (made-to-measure) option that opens a drawer, mirroring Cecilie Bahnsen's "Made to order" and Hanayen's "Regular / Custom" fit field.
- **`دليل المقاسات`** — a text link with 0.5px underline, opens the `sizeGuide` drawer. Include model height and the garment's own measurements per size — Aab publishes model height and fabric weight, and ASIYAM publishes UK + international measurement charts; in a category where fit is the #1 return driver, this is the highest-ROI content on the page.
- **Add to bag** — full-width, `--ink` ground, `--ivory` text, `--radius: 0`, `--t-label` weight 500, `min-block-size: 52px`. Hover: `opacity: .8` (not a colour change). This is the only filled button on the entire site.
- **Wishlist** — text link beneath, not an icon button.
- **Detail accordions**, 0.5px separators, closed by default: **التفاصيل** (fabric composition, lining, closure, embroidery technique, made-in) · **القياسات** · **العناية** (care) · **الشحن والإرجاع**. Follow the Aab/ASIYAM standard: fabric weight, opacity/coverage notes, and construction detail — these are the fields modest-fashion customers actually read, and they are also what let you charge a luxury price.

**4 · Below the fold** — one full-bleed 16:9 campaign frame of the same garment styled in context (Inayah's editorial-in-context approach), then **`نسّقيها مع`** — a 4-up 5:7 row of the sheila / inner / bisht that completes the look, styled identically to the PLP card. Aab's "as photographed" cross-sell and Voile Chic's mix-and-match merchandising both anchor on this.

**5 · Related** — `قد يعجبكِ أيضاً`, 4-up 5:7, same card component. Then the footer.

**6 · Add-to-bag response** — cart drawer slides in from inline-end, `--ease-drawer`, `--dur-slow`, with the added line item at the top. It does **not** navigate. Drawer contents: line items (5:7 thumbs), quantity steppers, subtotal, one shipping line, one CTA. No upsell carousel, no "you might also like", no progress-to-free-shipping bar.

---

## 6. Anti-patterns — what makes an abaya store look cheap

**Imagery**
1. **Square (1:1) product crops.** The category's original sin. It amputates the hem of a floor-length garment. Every luxury site measured uses 5:7 or 4:5; none uses 1:1.
2. **Mixed aspect ratios in one grid** — some cards 1:1, some 3:4, some with white letterboxing. Ragged rows are the loudest amateur signal there is.
3. **Ghost-mannequin or flat-lay abayas.** An abaya has no shape off a body. Flat-lay reads wholesale.
4. **Composite hero images** — two photos side by side, or a photo with text baked into the JPEG.
5. **Watermarks on product photography.**
6. **Inconsistent backgrounds** across the grid (studio grey, studio white, outdoor, phone snapshot).

**Typography**
7. **Cairo everywhere.** The most-used Arabic webfont on the internet, and instantly legible as a template.
8. **Applying `letter-spacing` to Arabic.** Breaks ligatures. It is the single most common Arabic typography error and it makes text look corrupted, not elegant.
9. **Bold everything** — 700-weight Arabic at 14px is mud. Totême's entire scale is weight 300.
10. **A 72–96px bold hero headline.** Totême's ceiling is 40px.
11. **Body line-height at 1.4–1.5 for Arabic.** Correct for Latin, cramped for Arabic. Needs 1.7–1.85.
12. **Faux-calligraphy display fonts for UI.** Aref Ruqaa, Rakkas, Blaka etc. are beautiful at 60px in a wordmark and unreadable in navigation.
13. **Mixing Arabic-Indic and Western numerals on the same page**, or shipping `Intl.NumberFormat('ar-EG')` prices to Libyan customers.

**Commerce noise**
14. **`-40%` badges, strikethrough prices, "SALE" corner ribbons.** Totême's catalogue is 100% `compareAtPrice: "0.0"`.
15. **Countdown timers and "only 2 left!" scarcity.**
16. **Star ratings and review counts on product cards.**
17. **Homepage testimonial carousels** with first names and five gold stars.
18. **A "QUICK ADD" slab appearing over the product image on hover.**
19. **Trust-badge strips** — padlocks, "100% SECURE", "MONEY-BACK GUARANTEE", credit-card logo rows above the fold.
20. **Free-shipping progress bars** in the cart drawer.
21. **Exit-intent popups and spin-to-win wheels.**
22. **A phone number in the header in large type** (footer + WhatsApp is right; header is Groupon).

**Surface & motion**
23. **Rounded corners on product cards.** `border-radius: 12px` says SaaS dashboard.
24. **Drop shadows on cards.** Totême's 254 KB stylesheet contains zero.
25. **Gold gradients.** Any `linear-gradient` involving gold. Gold is a hairline and a wordmark, nothing else.
26. **Large gold fills** — gold buttons, gold headers, gold-on-black hero panels.
27. **Hover states that scale, lift, or change colour.** The luxury vocabulary is `opacity: .6`.
28. **Multiple easing curves.** Serotoninn ships one, 23 times.
29. **Scroll-triggered fade-up on every element.** Reveal animations belong on section-level blocks or nowhere.
30. **Auto-rotating hero carousels with dots.**
31. **Black scrims under overlay text.** Use `--elevation` (95% ivory + `blur(34px)`) or fix the photograph.

**RTL-specific**
32. **A blanket `transform: scaleX(-1)` on all icons** — flips the logo, the search glass, and the checkmark.
33. **An LTR-authored site with `dir="rtl"` bolted on**, so the carousel scrolls backwards and the drawer enters from the wrong side.
34. **Machine-translated microcopy and validation messages.** Cited as the leading cause of Arabic form abandonment. Every string — including "Add to bag", "Out of stock", and error text — must be written by a native speaker, in Libyan-appropriate MSA.
35. **`text-align: right` instead of `text-align: start`** on inputs, which breaks the moment a user types a Latin email.
36. **A campaign photograph with directional flow pointing out of the page** in RTL — the model walking or looking toward the left edge instead of into the layout.

---

## Sources

- [Awwwards — Fashion websites](https://www.awwwards.com/websites/fashion/)
- [Awwwards — E-commerce winners](https://www.awwwards.com/websites/winner_category_ecommerce/)
- [Awwwards — E-commerce](https://www.awwwards.com/websites/e-commerce/)
- [Awwwards — Fashion collection](https://www.awwwards.com/awwwards/collections/fashion/)
- [Awwwards — Luxury websites](https://www.awwwards.com/websites/luxury/)
- [Awwwards — Brunello Cucinelli AI E-com (SOTD, jury scores, `#F1EDE7`/`#282828`)](https://www.awwwards.com/sites/brunello-cucinelli-ai-e-com)
- [Totême](https://www.toteme-studio.com/) — `theme.css`, `/collections/all` markup (tokens, 5:7 crop, view-switch, drawers, type scale, logical properties)
- [Cecilie Bahnsen](https://ceciliebahnsen.com/) — `app.css` (4:5 crop, 11/13/15/20px scale, PDP grid)
- [Khaite](https://www.khaite.com/) — `aspect-ratio: 5/7`
- [The Row](https://www.therow.com/)
- [Serotoninn](https://serotoninn.com/) — `main.css` (single easing curve, fluid rem base)
- [Roland Mouret — ready-to-wear](https://www.rolandmouret.com/collections/ready-to-wear?grid=3)
- [Sutton Commerce — 10 Best Modest Fashion Shopify Stores](https://www.suttoncommerce.co.uk/blog/best-modest-fashion-shopify-stores)
- [Hanayen](https://hanayen.com/) · [AbayaButh](https://abayabuth.com/) · [Abadia](https://shop.abadia.me/) · [Modanisa](https://www.modanisa.com/en/)
- [Ounass UAE](https://www.ounass.ae/) · [Bloomingdale's UAE](https://www.bloomingdales.ae/)
- [Depict — 10 Best Practices for Fashion Store Product Grid Design](https://depict.ai/resources/blog/10-best-practices-for-fashion-store-product-grid-design)
- [Baymard — Luxury Goods ecommerce research](https://baymard.com/research/luxury-goods)
- [Voxire — Arabic RTL Typography for Web Design: 2026 Guide](https://voxire.com/blog/arabic-rtl-typography-web-design-2026/)
- [Crawlix — Auditing RTL Layouts in 2026](https://crawlix.app/blog/rtl-website-audit/)
- [GLDS — Arabic Typography Best Practices](https://gaellelamirault.com/blog/arabic-typography-best-practices)
- [UAE Design System 2.0 — Typography](https://designsystem.gov.ae/guidelines/typography)
- [ExtraDigital — Arabic Web Design: UX, RTL and Cultural Considerations](https://www.extradigital.co.uk/articles/design/elements-arabic-web-design/)
- [H Locke — Working with Arabic in UX](https://hlockeux.substack.com/p/working-with-arabic-in-ux-2c74383fc463)
- [Code Guru — Best Arabic Script for the Web](https://codeguru.ae/blog/fonts-and-readability-best-arabic-script-for-the-web/)
- [Wikipedia — Eastern Arabic numerals](https://en.wikipedia.org/wiki/Eastern_Arabic_numerals) (Maghreb/Libya = Western numerals only)
- [Google Fonts CSS2 API](https://fonts.googleapis.com/) — availability, weights, subsets and byte sizes verified live for Reem Kufi, IBM Plex Sans Arabic, Amiri, Tajawal, Alexandria, Noto Kufi Arabic, El Messiri, Aref Ruqaa, Marhey