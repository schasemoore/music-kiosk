# Architecture

No build step. `index.html` loads `js/vendor/qrcode.js` then `js/app.js`
(plain IIFE, no modules). `js/app.js` fetches `data/content.json` at runtime
and renders everything from it — there is no other data source.

## Boot sequence

1. `fetch("data/content.json")` → `initApp(content)` (js/app.js:60-73)
2. `initApp` destructures `{ department, cta, idleTimeoutMs, splashIntervalMs, galleryCaptions, splash, areas, logo }` and wires the global `[data-cta-url]` / `[data-cta-label]` elements (header button, ticket buttons, preview-modal apply button)
3. Calls `renderHub()`, `renderSlideshow()`, `renderEqualizer()` ×2, `setActiveView("hub")`, `resetIdle()`

## js/app.js function map

| Function | Line | Does |
|---|---|---|
| `icon(name)` | 15 | Returns an inline `<svg>` for one of the 8 icon keys (falls back to `ensemble`) |
| `probeImage(src)` / `probeVideo(src)` | 39 / 49 | Promise\<bool\>: does this media file actually load? Drives every placeholder-vs-real-media decision in the app |
| `initApp(content)` | 73 | Everything below is nested inside this closure |
| `renderHub()` | 92 | Builds the 8 `.area-tile` divs on the home "stage". Each tile = `.tile-open` button (opens preview) + `.tile-cta` anchor (direct apply link, sits on top, not nested) |
| `renderEqualizer(container, count)` | 132 | Generates the animated bar-graph strip (header + attract screen); pure CSS animation, JS only randomizes per-bar timing |
| `galleryCard(kind, src, caption, posterSrc)` | 146 | One photo/video card for the full area page's gallery wall; opens the simple single-item `#lightbox` on click |
| `buildMediaList(area)` / `resolveMediaList(items)` | 177 / 189 | Collects hero+photos+video into one list, then filters to only the ones that actually load (via probe*) |
| `renderPreviewCarousel(area, items)` | 196 | Builds the swipeable carousel inside the tile-tap preview modal (dots + prev/next), or a single themed fallback slide if `items` is empty |
| `openPreview(id)` / `closePreview()` | 257 / 277 | Show/hide `#area-preview` (the tile-tap lightbox). `openPreview` also wires `#preview-learn-more`'s onclick to `closePreview(); showArea(id)` |
| `showArea(id)` | 289 | Builds the full scrolling area page: `.area-hero` (full-bleed photo/video + overlaid text) + `.gallery-wall` + ticket CTA |
| `renderQR(container, url)` | 351 | Renders an SVG QR code via the vendored `qrcode()` global |
| `openLightbox` / `closeLightbox` | 365 / 373 | The simple single photo/video lightbox used by gallery cards on the full area page (different from the tile-preview modal) |
| `setActiveView(name)` | 385 | Toggles `.active` on `#view-hub` / `#view-area` — this is the only "router" in the app |
| `renderSlideshow` / `goToSlide` / `start/stopSlideshow` | 404-440 | The splash/attract screen's Ken Burns crossfade slideshow, driven by `content.splash` |
| `goHomeAndAttract()` / `resetIdle()` | 449 / 458 | Idle timer: any touch/click/keydown resets a timeout; on expiry, closes everything and shows `#attract` |

## Two different "lightboxes" — don't conflate them

- **`#lightbox`** — simple, single photo or video, opened from gallery cards on the full area page (`showArea`'s gallery-wall). One image/video, a close button, nothing else.
- **`#area-preview`** — the richer tile-tap modal from the home screen. Has a multi-item carousel, facts list, and two buttons ("More about this program" → `showArea`, "Apply now" → external link). CSS class prefix `.preview-*`. Do not merge these two components — they serve different points in the flow (home-screen quick-look vs. in-page media zoom).

## Key DOM ids (index.html)

`view-hub`, `view-area`, `program-list` (hub tile grid), `area-content` (full page container), `attract` / `splash-slideshow` / `attract-caption` (idle screen), `lightbox` / `lightbox-body`, `area-preview` / `preview-panel` / `preview-media` / `preview-name` / `preview-tagline` / `preview-facts` / `preview-learn-more` (tile preview modal), `eq-strip-hub` / `eq-strip-attract` (equalizer bars), `dept-name` / `hero-title` / `hero-sub` (header + hub hero text, set from `content.department`).

## Data flow for a click

`tile-open click` → `openPreview(id)` → resolves media → `renderPreviewCarousel` → user taps **More about this program** → `closePreview()` + `showArea(id)` → `setActiveView("area")`. Idle timeout or the header logo both call `closePreview()` + `closeLightbox()` before going home — if you add a third overlay, wire it into `goHomeAndAttract()` and the `brand-home` click handler too, or it'll stay stuck open behind the hub.
