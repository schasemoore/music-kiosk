# Architecture

No build step. `index.html` loads `js/vendor/qrcode.js` then `js/app.js`
(plain IIFE, no modules). `js/app.js` fetches `data/content.json` at runtime
and renders everything from it — there is no other data source.

## Boot sequence

1. `fetch("data/content.json")` → `initApp(content)` (js/app.js:60-73)
2. `initApp` destructures `{ department, cta, idleTimeoutMs, splashIntervalMs, galleryCaptions, splash, areas, logo }` and wires the global `[data-cta-url]` / `[data-cta-label]` elements (header button, ticket buttons, preview-modal apply button)
3. Calls `renderHub()`, `buildAttractWall()`, `renderEqualizer()` ×2, `setActiveView("hub")`, `resetIdle()`

## js/app.js function map

Since v4 ("The Wall" — see `reference/decisions-log.md`), the hub is an
edge-to-edge poster wall, tile taps pop out into a full-frame overlay via a
FLIP animation, and the attract screen is a multi-panel cinematic collage
instead of a single slideshow. Since v4.1, the wall's layout (size + order)
and each area's preview playback mode are CMS fields, not hardcoded JS —
see `reference/content-schema.md`.

| Function | Line | Does |
|---|---|---|
| `ATTRACT_PANELS` | 17 | The attract screen's panel wall spans, keyed by panel index — a deliberately different span pattern from the hub wall's own (CMS-driven) layout, so it doesn't read as a rerun of the same grid |
| `icon(name)` | 25 | Returns an inline `<svg>` for one of the 8 icon keys (falls back to `ensemble`) |
| `prefersReducedMotion()` | 29 | Wraps `matchMedia("(prefers-reduced-motion: reduce)")` — checked by the FLIP pop-out, the attract wall's timers, and preview "slideshow" autoplay |
| `probeImage(src)` / `probeVideo(src)` | 52 / 62 | Promise\<bool\>: does this media file actually load? Drives every placeholder-vs-real-media decision in the app |
| `initApp(content)` | 86 | Everything below is nested inside this closure |
| `renderHub()` | 105 | Builds the 8 `.area-tile` divs on the wall, in `areas[]` order, each tagged `.size-normal` or `.size-large` per its `size` field (actual grid placement is pure CSS — `grid-auto-flow: dense` packs them). Each tile = `.tile-open` button (opens preview) + `.tile-cta` anchor (direct apply link, sits on top, not nested); each gets randomized `--drift-dur`/`--drift-delay` custom properties for the idle Ken Burns drift |
| `renderEqualizer(container, count)` | 150 | Generates the animated bar-graph strip (header + attract screen); pure CSS animation, JS only randomizes per-bar timing |
| `galleryCard(kind, src, caption, posterSrc)` | 164 | One photo/video card for the full area page's gallery wall; opens the simple single-item `#lightbox` on click |
| `buildMediaList(area)` / `resolveMediaList(items)` | 195 / 203 | Collects hero+photos+video into one list, then filters to only the ones that actually load (via probe*) |
| `stopPreviewAutoplay()` | 215 | Clears the preview overlay's auto-advance timer, if one is running — called on close and on any manual nav interaction |
| `renderPreviewCarousel(area, items)` | 224 | Builds the swipeable carousel inside the full-frame preview overlay (dots + prev/next), or a single themed fallback slide if `items` is empty. Reads `area.previewPlayback`: `"video"` reorders `items` to put a resolved video first; `"slideshow"` starts an auto-advance interval (stopped by any manual nav) |
| `createVisualClone(photoSrc, themeColor)` / `flipFly(fromRect, toRect, photoSrc, themeColor, onLanded)` | 304 / 320 | The pop-out mechanism: builds a fixed-position clone (photo or themed gradient) and animates its `transform` (a matrix, never width/height) from `fromRect` to `toRect` via the Web Animations API. Used by both `openPreview` (tile → fullscreen) and `closePreview` (fullscreen → tile) |
| `openPreview(id)` / `closePreview()` | 350 / 396 | Show/hide `#area-preview` (the full-frame pop-out). Reads the tapped tile's rect + current photo, flies a clone to fill the viewport, then reveals the real overlay once it lands (`.info-visible` staggers the facts/CTA in after). `openPreview` also wires `#preview-learn-more`'s onclick to `closePreview(); showArea(id)` |
| `showArea(id)` | 432 | Builds the full scrolling area page: `.area-hero` (full-bleed photo/video + overlaid text) + `.gallery-wall` + ticket CTA |
| `renderQR(container, url)` | 496 | Renders an SVG QR code via the vendored `qrcode()` global |
| `openLightbox` / `closeLightbox` | 510 / 518 | The simple single photo/video lightbox used by gallery cards on the full area page (different from the tile-preview overlay) |
| `setActiveView(name)` | 530 | Toggles `.active` on `#view-hub` / `#view-area` — this is the only "router" in the app |
| `buildImagePool()` | 562 | Pools every probed image the app knows about — `content.splash[]` plus every area's `hero`/`photos` — so the attract wall has variety without dedicated splash assets |
| `buildAttractWall()` | 574 | Async: probes the pool, shuffles it, distributes it across `ATTRACT_PANELS`, and renders the panel/slide markup into `#splash-slideshow`. Does not start the crossfade timers — see `startAttractWall` |
| `startAttractWall()` / `stopAttractWall()` | 608 / 626 | Start/stop each panel's independent crossfade `setInterval` (randomized period around `splashIntervalMs`). No-op under reduced motion |
| `startCaptionRotation()` / `stopCaptionRotation()` | 631 / 642 | Independent timer that rotates `#attract-caption` through `splash[].caption`, decoupled from which panel is showing which image |
| `goHomeAndAttract()` / `resetIdle()` | 651 / 660 | Idle timer: any touch/click/keydown resets a timeout; on expiry, closes everything, shows `#attract`, and starts the wall + caption rotation |

## Two different "lightboxes" — don't conflate them

- **`#lightbox`** — simple, single photo or video, opened from gallery cards on the full area page (`showArea`'s gallery-wall). One image/video, a close button, nothing else.
- **`#area-preview`** — the richer tile-tap pop-out from the home screen. Full-frame photo, a multi-item carousel, facts list, and two buttons ("More about this program" → `showArea`, "Apply now" → external link). CSS class prefix `.preview-*`. Do not merge these two components — they serve different points in the flow (home-screen quick-look vs. in-page media zoom).

## Key DOM ids (index.html)

`view-hub`, `view-area`, `program-list` (hub tile grid), `area-content` (full page container), `attract` / `splash-slideshow` / `attract-caption` (idle screen — `splash-slideshow` now holds several `.attract-panel` wrappers, not one slide track), `lightbox` / `lightbox-body`, `area-preview` / `preview-media` / `preview-name` / `preview-tagline` / `preview-facts` / `preview-learn-more` (tile preview pop-out — there is no `preview-panel` wrapper anymore, `preview-media`/`preview-info` are direct children of `area-preview`), `eq-strip-hub` / `eq-strip-attract` (equalizer bars), `dept-name` / `hero-title` / `hero-sub` (header + hub hero text, set from `content.department`).

## Data flow for a click

`tile-open click` → `openPreview(id)` reads the tile's rect + photo, `flipFly`s a clone to fill the viewport → once landed, reveals `#area-preview` and resolves media → `renderPreviewCarousel` → user taps **More about this program** → `closePreview()` (flies the clone back down to the tile) + `showArea(id)` → `setActiveView("area")`. Idle timeout or the header logo both call `closePreview()` + `closeLightbox()` before going home — if you add a third overlay, wire it into `goHomeAndAttract()` and the `brand-home` click handler too, or it'll stay stuck open behind the hub.
