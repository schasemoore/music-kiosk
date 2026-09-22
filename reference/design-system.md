# Design system

Design language: the hub is "the wall" — an edge-to-edge asymmetric poster
wall (dark, saturated, no gaps or rounded corners, live equalizer). Tapping
a tile pops its photo out into a full-frame overlay (a FLIP animation, not
a boxed modal). The area page is media-led (info overlaid on photo/video,
not filed into separate sections). The idle/attract screen is a cinematic
multi-panel wall, not a single slideshow. See `reference/decisions-log.md`
for why it looks like this instead of earlier drafts (v1 → v2 "the stage" →
v3 tap-to-preview → v4 "the wall").

## Colors — Auburn's official 8, nothing else

Source: `ocm.auburn.edu/brand-center/colors.php`. Defined as CSS vars in
`css/styles.css` `:root` (lines 8-19) and duplicated as literal hex in
`data/content.json` per-area `theme` fields (Decap CMS's `select` widget in
`admin/config.yml` also hardcodes this same list — if you ever add a 9th
color, update all three places: `:root`, `content.json` values, and
`admin/config.yml`'s `&auburn-colors` YAML anchor).

| Name | Hex | Role | Used by |
|---|---|---|---|
| Auburn Blue | `#0b2341` | Primary | `--navy`; Music Education tile |
| Auburn Orange | `#e86100` | Primary | `--orange`; Bands & Ensembles tile (the flagship/spirit slot) |
| Bodda Getta Blue | `#0093d2` | Supporting | Woodwind & Percussion |
| Samford Brick Orange | `#cc4e0b` | Supporting | Voice |
| Campus Green | `#4e8020` | Supporting | Composition & Technology |
| Sunkissed Yellow | `#ffc044` | Supporting | `--amber` (equalizer bars, fact-list bullets); Brass |
| Never to Yield Teal | `#00a597` | Supporting | Commercial Music |
| Nova Brown | `#7a685b` | Supporting | Piano |

Non-brand tokens: `--cream #f5efe4` / `--paper #fbf8f2` (light surfaces),
`--ink #17140f` / `--ink-soft #5b564c` (text), `--line #ddd4c2` (hairlines).
`--navy-deep #061529` / `--navy-soft #16345e` are tints of Auburn Blue for
depth (hub background, gradients) — not separate brand colors.

Per-area color is applied via inline `style="--theme:<hex>"` on the
tile/hero/preview-panel, then read by CSS (`var(--theme, var(--navy))`) —
this is how one CSS ruleset colors 8 different tiles/pages.

## Fonts

Auburn's real, licensed typefaces, loaded via Auburn's own Adobe Fonts
(Typekit) kit: `<link rel="stylesheet" href="https://use.typekit.net/wfy5sib.css">`
in `index.html`.

- **Sweet Sans Pro** (`font-family: "sweet-sans-pro"`) — all headlines/display (`h1, h2, h3, .display`, `css/styles.css` ~line 49)
- **Davis Sans** (`font-family: "davis-sans"`) — body/UI text (`body`, ~line 43)
- **Only weights 400 and 700 exist in this kit.** No 500/600 — every
  `font-weight` in the CSS is 400 or 700. If a design calls for
  "semibold," use 700; don't add an intermediate value, it'll silently
  snap to the nearest available face anyway.
- If the Typekit kit ID (`wfy5sib`) ever stops resolving, get a fresh one
  from Auburn's Creative Cloud/brand office and swap the `<link>`.

## Logo

`assets/brand/auburn-logo.svg` — official Auburn horizontal informal
lockup, exact brand colors baked in. Used in the header (`.brand-logo`,
40px tall) and splash screen (`.brand-logo.lg`, 64px tall). Both `<img>`
tags' `src` get overwritten at runtime from `content.logo` (js/app.js:68) —
edit the logo via `data/content.json` / Decap CMS, not by replacing the SVG
file in place, unless you also want to change the default.

## CSS section map (`css/styles.css`)

| Lines | Section |
|---|---|
| 8-19 | `:root` tokens |
| 70-150 | Header, brand, buttons (`.btn`, `.btn-primary`, `.btn-outline`, `.btn-text`) |
| 152-177 | Equalizer strip (`.eq-strip`, `@keyframes eq-bounce`) |
| 199-380 | Hub wall / `.stage`, `.area-tile[data-area=...]` placement, `.tile-open`, `.tile-cta`, `@keyframes tile-drift` |
| 381-573 | Area detail page: `.area-hero`, `.fact-list`, `.gallery-wall`, `.gallery-card` |
| 574-655 | Ticket-stub CTA (`.ticket`, `.ticket-main`, `.ticket-stub`) — the perforated-ticket QR block |
| 656-686 | Footer (`.site-footer` — hidden on hub via `#view-hub.active ~ .site-footer { display: none }`) |
| 687-734 | Simple gallery lightbox (`.lightbox`) |
| 735-940 | Tile preview pop-out (`.preview-modal`, `.preview-media`, `.preview-slide`, `.preview-nav`, `.preview-dots`, `.preview-info`, `.pop-clone`) — no boxed panel; see "Pop-out" below |
| 941-1069 | Attract multi-panel wall (`.attract`, `.slideshow`, `.attract-panel`, `.panel-slide`, `@keyframes light-sweep`, `@keyframes pulse-prompt`) |
| 1070-1096 | Responsive breakpoints (1280px, 860px) |

## Component patterns worth knowing before you add a new one

- **Themed gradient fallback**: `background-image: linear-gradient(150deg, color-mix(in srgb, var(--theme) 60%, white 14%), var(--theme) 60%, color-mix(in srgb, var(--theme) 80%, black 35%))` — used on tiles, hero, preview media, gallery cards. Requires a modern Chromium (fine for a controlled kiosk browser + this dev environment); don't swap to a plain flat color without a reason.
- **Scrim-for-legibility**: any text sitting on a photo/gradient gets a `linear-gradient(0deg, rgba(0,0,0,.6) 0%, transparent 70%)` scrim behind it, not a solid box. See `.tile-scrim`, `.hero-scrim`, `.card-scrim`, `.preview-info`'s background.
- **Ghost icon**: a large, low-opacity (`0.14-0.16`) watermark of the area's own icon, positioned top-right, behind the scrim. Purely decorative texture — `.ghost-icon`, `.hero-ghost`.
- **Media-probe-then-upgrade**: nothing waits on a network request to render. Placeholder/gradient shows immediately; `probeImage`/`probeVideo` resolve async and swap in real media if it exists. Follow this pattern for any new media slot — never `await` a probe before first paint.

## The hub wall's CMS-driven layout (v4.1)

`.stage` is a 4-column CSS Grid with **zero gap and zero border-radius** —
tiles butt together like a poster wall, not a card grid — using
`grid-auto-flow: dense` and `grid-auto-rows: 1fr`. There is no hand-placed
per-area layout: each area's `size` field (`"normal"` = 1×1 cell, `"large"`
= 2×2 cells via `.area-tile.size-large`) plus its position in the
`areas[]` array (drag-reorderable in the CMS) is all the grid needs —
`dense` packing fills gaps automatically around whatever mix of sizes ends
up in whatever order. `.area-tile.size-large` also gets a bigger type scale
(its own `.tile-text`/`h3`/`.tagline` overrides). This replaced an earlier
hand-placed version keyed by `.area-tile[data-area="..."]` + a `WALL_LAYOUT`
map in `js/app.js` — don't reintroduce that pattern; the whole point of the
rewrite was letting a CMS editor change sizing/order without touching code.
See `reference/content-schema.md`'s "Hub wall layout" section for the
editor-facing behavior (including the trailing-gap caveat when a `"large"`
area isn't first).

At the 1280px/860px breakpoints, `.stage` just drops to 2 columns / 1
column — `.size-large`'s `span 2 / span 2` naturally becomes "full width"
at 2 columns, no override needed. At 1 column it's overridden to
`grid-column: span 1` (still `span 2` rows, so it stays tall) — **not**
`min-height`, which doesn't reliably grow its own auto-sized track (a
tile's children are all `position: absolute`, so it has no in-flow content
to size the track by) and can overflow into and overlap the row below.
This bit us once already; if a large tile ever looks too short or overlaps
its neighbor at a breakpoint, check for a stray `min-height` before adding
a `grid-row: span N` back.

## Tile pop-out (v4)

Tapping a tile doesn't fade in a boxed modal — the tile's own photo (or
themed gradient, if no photo has loaded yet) detaches from the wall and
grows to fill the screen. Mechanism (`js/app.js`: `createVisualClone`,
`flipFly`, `openPreview`, `closePreview`):

1. Read the tapped tile's `getBoundingClientRect()` and its current photo `src`.
2. Build a `position: fixed` clone sized/positioned to match that rect exactly, above everything else (`.pop-clone`, z-index 120).
3. Animate only the clone's `transform` (a `matrix(sx,0,0,sy,tx,ty)`, computed from the from/to rects) via the Web Animations API — never `width`/`height`, so the browser never re-layouts mid-flight.
4. On `animationfinish`, reveal `#area-preview` (already painted with the same photo, full-frame, so the hand-off is seamless) and remove the clone. Facts/CTA fade in ~0.35s later via the `.info-visible` class, not immediately — the photo should land before the text arrives.
5. Closing reverses this: a new clone flies from the fullscreen rect back down to the tile's current rect.

Under `prefers-reduced-motion: reduce`, both `openPreview` and `closePreview`
skip the clone entirely and just toggle `.active`/`.info-visible` (a plain
opacity crossfade via `.preview-modal`'s own `transition`).

Once landed, what plays inside the overlay is controlled per-area by the
CMS field `previewPlayback` (`reference/content-schema.md`): `"photo"`
(default, manual swipe), `"video"` (opens straight to the area's video,
autoplaying), or `"slideshow"` (auto-advances through every item on a
timer). This is handled entirely inside `renderPreviewCarousel`, not the
FLIP mechanism above — the pop-out animation itself doesn't know or care
what mode an area is in.

## Attract screen: multi-panel wall (v4)

`#splash-slideshow` holds several `.attract-panel` elements (positioned via
`ATTRACT_PANELS` in `js/app.js` — a fixed, deliberately different span
pattern from the hub wall's own CMS-driven layout, so it doesn't read as a
rerun of the same grid). Each panel gets its own subset of images — pooled from **both**
`content.splash[]` and every area's `hero`/`photos` (`buildImagePool`), not
just the splash slides — and crossfades through them on its own independent,
jittered timer (`startAttractWall`), so panels change out of sync with each
other rather than all at once. The one deliberate "come here" signal is the
pulsing `<p>` prompt (`@keyframes pulse-prompt`); the diagonal
`@keyframes light-sweep` on `.attract::after` is a quiet ambient accent on
top of that, not a second focal point. Both — plus each panel's own Ken
Burns drift — are disabled under `prefers-reduced-motion: reduce`.
