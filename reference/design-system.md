# Design system

Design language: the hub is "the stage" (dark, saturated, poster tiles, live
equalizer). The area page is media-led (info overlaid on photo/video, not
filed into separate sections). See `reference/decisions-log.md` for why it
looks like this instead of earlier drafts.

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
| 199-333 | Hub / stage / `.area-tile`, `.tile-open`, `.tile-cta` |
| 335-531 | Area detail page: `.area-hero`, `.fact-list`, `.gallery-wall`, `.gallery-card` |
| 532-613 | Ticket-stub CTA (`.ticket`, `.ticket-main`, `.ticket-stub`) — the perforated-ticket QR block |
| 614-644 | Footer (`.site-footer` — hidden on hub via `#view-hub.active ~ .site-footer { display: none }`) |
| 645-692 | Simple gallery lightbox (`.lightbox`) |
| 693-893 | Tile preview modal (`.preview-modal`, `.preview-panel`, `.preview-slide`, `.preview-nav`, `.preview-dots`) |
| 895-980 | Attract/splash slideshow (`.attract`, `.slideshow`, `.slide`, `@keyframes kenburns`) |
| 982-1004 | Responsive breakpoints (1280px, 860px) |

## Component patterns worth knowing before you add a new one

- **Themed gradient fallback**: `background-image: linear-gradient(150deg, color-mix(in srgb, var(--theme) 60%, white 14%), var(--theme) 60%, color-mix(in srgb, var(--theme) 80%, black 35%))` — used on tiles, hero, preview media, gallery cards. Requires a modern Chromium (fine for a controlled kiosk browser + this dev environment); don't swap to a plain flat color without a reason.
- **Scrim-for-legibility**: any text sitting on a photo/gradient gets a `linear-gradient(0deg, rgba(0,0,0,.6) 0%, transparent 70%)` scrim behind it, not a solid box. See `.tile-scrim`, `.hero-scrim`, `.card-scrim`.
- **Ghost icon**: a large, low-opacity (`0.14-0.16`) watermark of the area's own icon, positioned top-right, behind the scrim. Purely decorative texture — `.ghost-icon`, `.hero-ghost`.
- **Media-probe-then-upgrade**: nothing waits on a network request to render. Placeholder/gradient shows immediately; `probeImage`/`probeVideo` resolve async and swap in real media if it exists. Follow this pattern for any new media slot — never `await` a probe before first paint.
