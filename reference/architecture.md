# Architecture

No build step. `index.html` loads `js/vendor/qrcode.js` then `js/app.js`
(plain IIFE, no modules). `js/app.js` fetches `data/content.json` at runtime
and renders everything from it — there is no other data source.

## Boot sequence

1. `fetch("data/content.json")` → `initApp(content)` (js/app.js:60-73)
2. `initApp` destructures `{ department, cta, idleTimeoutMs, splashIntervalMs, galleryCaptions, splash, areas, logo, luckyManStudio }` and wires the global `[data-cta-url]` / `[data-cta-label]` elements (header button, ticket buttons, preview-modal apply button)
3. Calls `renderHub()`, `renderEqualizer()` ×2, `setActiveView("hub")`, then adds `.active` to `#attract` **synchronously** (before the wall's images are even probed, so there's no flash of the bare hub grid) and kicks off `buildAttractWall().then(goHomeAndAttract)` — the kiosk boots straight to the attract/slideshow screen, not the hub; see `reference/decisions-log.md`. `resetIdle()` is not called at boot — only once the user's first interaction dismisses attract does the idle-return timer get armed.

## js/app.js function map

Since v4 ("The Wall" — see `reference/decisions-log.md`), the hub is an
edge-to-edge poster wall, tile taps pop out into a full-frame overlay via a
FLIP animation, and the attract screen is a multi-panel cinematic collage
instead of a single slideshow. Since v4.1, the wall's layout (size + order),
each area's preview playback mode, and each area's Apply button/link are
all CMS fields, not hardcoded JS — see `reference/content-schema.md`.

| Function | Line | Does |
|---|---|---|
| `ATTRACT_PANELS` | 17 | The attract screen's panel wall spans, keyed by panel index — a deliberately different span pattern from the hub wall's own (CMS-driven) layout, so it doesn't read as a rerun of the same grid |
| `icon(name)` | 25 | Returns an inline `<svg>` for one of the 8 icon keys (falls back to `ensemble`) |
| `prefersReducedMotion()` | 29 | Wraps `matchMedia("(prefers-reduced-motion: reduce)")` — checked by the FLIP pop-out, the attract wall's timers, and preview "slideshow" autoplay |
| `probeImage(src)` / `probeVideo(src)` | 53 / 63 | Promise\<bool\>: does this media file actually load? Drives every placeholder-vs-real-media decision in the app |
| `initApp(content)` | 87 | Everything below is nested inside this closure |
| `resolveCta(area)` | 108 | Returns `{ url, label }`, preferring `area.cta.url`/`area.cta.label` and falling back to the site-wide `cta`. Used by `renderHub`, `openPreview`, and `showArea` so a tile/preview/page/QR all agree on where "Apply" goes for that area |
| `renderHub()` | 115 | Builds the 8 `.area-tile` divs on the wall, in `areas[]` order, each tagged `.size-normal` or `.size-large` per its `size` field (actual grid placement is pure CSS — `grid-auto-flow: dense` packs them). Each tile is a single `.tile-open` button — no separate Apply control anymore, just a decorative `.tile-arrow` span inside it (see `reference/decisions-log.md`); each gets randomized `--drift-dur`/`--drift-delay` custom properties for the idle Ken Burns drift |
| `renderEqualizer(container, count)` | 165 | Generates the animated bar-graph strip (header + attract screen); pure CSS animation, JS only randomizes per-bar timing |
| `galleryCard(kind, src, caption, posterSrc)` | 179 | One photo/video card for the full area page's gallery wall; opens the simple single-item `#lightbox` on click |
| `buildMediaList(area)` / `resolveMediaList(items)` | 210 / 218 | Collects hero+photos+video into one list, then filters to only the ones that actually load (via probe*) |
| `stopPreviewAutoplay()` | 230 | Clears the preview overlay's auto-advance timer, if one is running — called on close and on any manual nav interaction |
| `renderPreviewCarousel(area, items)` | 239 | Builds the swipeable carousel inside the full-frame preview overlay (dots + prev/next), or a single themed fallback slide if `items` is empty. Reads `area.previewPlayback`: `"video"` reorders `items` to put a resolved video first; `"slideshow"` starts an auto-advance interval (stopped by any manual nav) |
| `createVisualClone(photoSrc, themeColor)` / `flipFly(fromRect, toRect, photoSrc, themeColor, onLanded)` | 365 / 381 | The pop-out mechanism: builds a fixed-position clone (photo or themed gradient) and animates its `transform` (a matrix, never width/height) from `fromRect` to `toRect` via the Web Animations API. `fromRect`/`toRect` almost never share an aspect ratio (a tile vs. the full viewport), so `flipFly` also runs a `requestAnimationFrame` loop that counter-scales the clone's inner image every frame by the exact reciprocal of the outer animation's own current eased scale — without it the photo visibly squishes/stretches during the flight; see `reference/decisions-log.md` for why this has to be a per-frame rAF loop and not a second `.animate()` call. Used by both `openPreview`/`openStudio` (tile → fullscreen) and `closePreview`/`closeStudio` (fullscreen → tile) |
| `openPreview(id)` / `closePreview()` | 365 / 414 | Show/hide `#area-preview` (the full-frame pop-out). Reads the tapped tile's rect + current photo, flies a clone to fill the viewport, then reveals the real overlay once it lands (`.info-visible` staggers the facts/CTA in after; `#preview-apply`'s href/text set from `resolveCta`). `openPreview` also wires `#preview-learn-more`'s onclick to `closePreview(); showArea(id)` |
| `showArea(id)` | 450 | Builds the full scrolling area page: `.area-hero` (full-bleed photo/video + overlaid text) + `.gallery-wall` + ticket CTA (button + QR both from `resolveCta`) |
| `renderRichText(md)` | ~475 | Tiny escape-then-reintroduce markdown→HTML converter (bold/italic/links/paragraphs only) for hotspot body text — not a general parser, see `reference/content-schema.md` |
| `layoutStudioFrame()` | ~495 | Sets `#studio-frame`'s inline `aspect-ratio` to match the loaded studio photo's natural dimensions, so it letterboxes like `object-fit:contain` while staying a real box hotspots can be positioned against with plain `left`/`top` percentages |
| `renderHotspots(studio)` / `closeAllHotspots()` | ~515 / ~505 | Builds the hotspot marker DOM from `luckyManStudio.hotspots`, wires each trigger to toggle `.open` (closing any other open one first — accordion-style, one at a time) |
| `openStudio()` / `closeStudio()` | ~535 / ~565 | The Lucky Man Studio tile's open/close — same `flipFly` pop-out as `openPreview`/`closePreview`, but reveals `#studio-view` (photo + hotspots) instead of the carousel/facts/Apply preview. Photo + hotspots are painted into the still-hidden overlay *before* the pop-out starts (mirrors `openPreview`'s hand-off trick) so nothing flashes in empty once the clone lands |
| `renderQR(container, url)` | 513 | Renders an SVG QR code via the vendored `qrcode()` global |
| `openLightbox` / `closeLightbox` | 527 / 535 | The simple single photo/video lightbox used by gallery cards on the full area page (different from the tile-preview overlay) |
| `setActiveView(name)` | 547 | Toggles `.active` on `#view-hub` / `#view-area` — this is the only "router" in the app |
| `buildImagePool()` | 579 | Pools every probed image the app knows about — `content.splash[]` plus every area's `hero`/`photos` — so the attract wall has variety without dedicated splash assets |
| `buildAttractWall()` | 591 | Async: probes the pool, shuffles it, distributes it across `ATTRACT_PANELS`, and renders the panel/slide markup into `#splash-slideshow`. Does not start the crossfade timers — see `startAttractWall` |
| `startAttractWall()` / `stopAttractWall()` | 625 / 643 | Start/stop each panel's independent crossfade `setInterval` (randomized period around `splashIntervalMs`). No-op under reduced motion |
| `startCaptionRotation()` / `stopCaptionRotation()` | 648 / 659 | Independent timer that rotates `#attract-caption` through `splash[].caption`, decoupled from which panel is showing which image |
| `goHomeAndAttract()` / `resetIdle()` | 676 / 685 | Idle timer: any press/touch/key resets a timeout (deliberately not `mousemove` — see `reference/decisions-log.md`); on expiry, closes everything, shows `#attract`, and starts the wall + caption rotation. `goHomeAndAttract` is also called directly by the hidden logo double-click below |

## Two different "lightboxes" — don't conflate them

- **`#lightbox`** — simple, single photo or video, opened from gallery cards on the full area page (`showArea`'s gallery-wall). One image/video, a close button, nothing else.
- **`#area-preview`** — the richer tile-tap pop-out from the home screen. Full-frame photo, a multi-item carousel, facts list, and two buttons ("More about this program" → `showArea`, "Apply now" → external link). CSS class prefix `.preview-*`. Do not merge these two components — they serve different points in the flow (home-screen quick-look vs. in-page media zoom).

## Key DOM ids (index.html)

`view-hub`, `view-area`, `program-list` (hub tile grid), `area-content` (full page container), `attract` / `splash-slideshow` / `attract-caption` (idle screen — `splash-slideshow` now holds several `.attract-panel` wrappers, not one slide track), `lightbox` / `lightbox-body`, `area-preview` / `preview-media` / `preview-name` / `preview-tagline` / `preview-facts` / `preview-learn-more` / `preview-apply` (tile preview pop-out — there is no `preview-panel` wrapper anymore, `preview-media`/`preview-info` are direct children of `area-preview`; `preview-apply` has no `data-cta-url`/`data-cta-label` — `openPreview` sets its href/text directly from `resolveCta(area)` every time), `eq-strip-hub` / `eq-strip-attract` (equalizer bars), `dept-name` / `hero-title` / `hero-sub` (header + hub hero text, set from `content.department`).

`studio-tile` / `studio-tile-open` (the Lucky Man Studio hub tile — built in `renderHub()` alongside the `areas[]` tiles but not one of them, no `data-area` attribute), `studio-view` / `studio-frame` / `studio-photo` / `hotspot-layer` (the full-photo + hotspots pop-out) / `studio-eyebrow` / `studio-name` / `studio-tagline` / `studio-close`.

The `[data-cta-url]`/`[data-cta-label]` attribute-based wiring in `initApp` now only ever matches the header's Apply button — it runs once, before `renderHub`/`showArea` populate anything else, so it was never actually reaching the ticket button even before the `resolveCta` per-area override existed (the tile itself never had a `data-cta-*` element to begin with, and now has no Apply control at all — see `reference/decisions-log.md`). Don't add these attributes to a new element expecting the global wiring to reach it after the fact; wire it explicitly like `openPreview`/`showArea` do instead.

## Data flow for a click

`tile-open click` → `openPreview(id)` reads the tile's rect + photo, `flipFly`s a clone to fill the viewport → once landed, reveals `#area-preview` and resolves media → `renderPreviewCarousel` → user taps **More about this program** → `closePreview()` (flies the clone back down to the tile) + `showArea(id)` → `setActiveView("area")`. Idle timeout and the header logo both call `closePreview()` + `closeStudio()` + `closeLightbox()` before going home — this is the "third overlay" case the note below used to warn about; `openStudio`/`closeStudio` (Lucky Man Studio's pop-out) are wired into both already. If you add a fourth overlay, wire it into `goHomeAndAttract()` and the `brand-home` click handler too, or it'll stay stuck open behind the hub.

**Hidden staff reset**: `#brand-home` also has a `dblclick` listener that calls `goHomeAndAttract()` directly — double-clicking/double-tapping the logo forces the attract screen up immediately instead of waiting out `idleTimeoutMs`. Not surfaced anywhere in the UI; see `reference/decisions-log.md` for why.
