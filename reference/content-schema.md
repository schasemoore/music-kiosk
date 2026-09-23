# Content schema — `data/content.json`

This is the *only* data source (`js/app.js` fetches it at load; nothing is
hardcoded elsewhere except the icon SVGs and the Auburn color list — see
`reference/design-system.md`). Editable by hand or via Decap CMS at
`/admin` — both write the same file, in the same shape. If you change this
schema, `admin/config.yml` must change to match (field names are position-
matched, not validated against each other).

## Top-level fields

| Field | Type | Used for |
|---|---|---|
| `logo` | path | Header + splash-screen logo image |
| `department.name` | string | Header text ("Department of Music") |
| `department.heroTitle` / `heroSub` | string | Home screen headline + subhead |
| `cta.url` | string (URL) | **Currently a placeholder** (`https://your-link-here.auburn.edu/apply`) — the site-wide fallback every Apply button and QR code reads, unless an area sets its own `areas[].cta` override (below) |
| `cta.label` | string | Text on the full-size Apply buttons (preview overlay + full area page — the home screen tile itself has no Apply button, just a decorative arrow; see `reference/decisions-log.md`) |
| `idleTimeoutMs` | int | Ms of no touch before returning to the splash screen (currently 90000) |
| `splashIntervalMs` | int | Ms each splash slide stays up (currently 7000) |
| `galleryCaptions` | string[] | Cycled across each area's gallery photos in order (photo 1 → caption[0], photo 2 → caption[1], wraps if more photos than captions) |
| `splash` | array | Splash-screen slideshow slides |
| `areas` | array | The 8 home-screen tiles / area pages |

## `splash[]` item

```json
{ "media": "assets/images/splash/1.jpg", "theme": "#e86100", "caption": "..." }
```
`media` may be missing/404 — falls back to a themed gradient slide using
`theme`. `theme` must be one of Auburn's 8 official hex values (see
`reference/design-system.md`).

## `areas[]` item

```json
{
  "id": "brass",                                  // URL-safe key, unique, don't change once live (nothing else references it by index)
  "name": "Brass",                                 // Tile + page headline
  "tagline": "Trumpet, horn, trombone, ...",        // One line, shown on tile, preview, and page
  "size": "normal",                                 // "normal" or "large" — see "Hub wall layout" below
  "cta": { "url": "...", "label": "..." },          // Optional, both sub-fields optional — see "Apply button override" below
  "icon": "brass",                                  // Must be one of the 8 keys below
  "theme": "#ffc044",                               // Must be one of the 8 official Auburn colors
  "description": "...",                             // 1-2 sentences, area page hero
  "facts": ["...", "...", "..."],                   // Short bullet list, no fixed count
  "hero": "assets/images/areas/brass/hero.jpg",      // Full-bleed hero photo (area page + tile background + preview overlay if no other photo)
  "photos": ["assets/.../1.jpg", "assets/.../2.jpg"],// Gallery photos, any count including zero
  "video": "assets/video/areas/brass/reel.mp4",      // Optional gallery video clip
  "poster": "assets/images/areas/brass/poster.jpg",  // Video cover frame (shown before play)
  "previewPlayback": "photo"                        // "photo" | "video" | "slideshow" — see "Preview playback mode" below
}
```

Valid `icon` values (must match `ICONS` keys in `js/app.js:5-13`, each maps
to a hand-drawn inline SVG — there is no way to add a 9th icon without
editing `js/app.js` and `admin/config.yml`'s icon `select` options together):
`brass`, `woodwind`, `voice`, `piano`, `commercial`, `composition`,
`education`, `ensemble`.

### Hub wall layout: `size`

The home screen wall (`css/styles.css`'s `.stage`) is a 4-column CSS Grid
with `grid-auto-flow: dense` — there is no hand-placed per-area layout
anymore. Each area is either `"normal"` (1×1 cell) or `"large"` (2×2 cells,
plus a bigger type scale via `.area-tile.size-large`), and the grid packs
whatever mix you pick, in whatever order the `areas[]` array is in, without
gaps between normal tiles. **Order = array order** — reorder areas by
dragging them in the CMS's "Areas" list (or reordering the JSON array by
hand). More than one `"large"` area is fine; the packer handles it. The one
thing to know: if the total "cell count" (`4 × large-count + normal-count`)
isn't a multiple of 4, the last row ends with an empty gap — this is most
visible when a `"large"` area isn't first in the list, so if you want a
perfectly gap-free wall, put your large area(s) toward the top of the order.

### Apply button override: `cta`

Optional, and both `url` and `label` inside it are independently optional —
leave the whole field out, or leave either sub-field blank, to fall back to
the site-wide `cta.url`/`cta.label` at the top of this file. When set, it
overrides **everywhere this area's Apply link appears**: the "Apply now"
button in its full-screen preview overlay, and the "Apply now" button + QR
code on its full area page — both read the same resolved value
(`resolveCta(area)` in `js/app.js`), so a program can point at its own
application link without the preview and page disagreeing with each other.
The home screen tile itself has no Apply button (just a decorative arrow —
see `reference/decisions-log.md`), so this override doesn't touch the tile
at all.

### Preview playback mode: `previewPlayback`

Controls what happens when a visitor taps this area's tile and it pops out
full-screen:
- `"photo"` (default) — opens on the first photo, manual swipe through the rest.
- `"video"` — opens directly on this area's `video` (if it probes as real) and autoplays it, muted; silently behaves like `"photo"` if there's no working video.
- `"slideshow"` — auto-advances through every resolved item (photos + video) on a fixed timer, hands-free; stops advancing the moment a visitor manually swipes/taps a nav arrow or dot.

**Any media path that 404s is handled gracefully** — the app shows a themed
placeholder instead of a broken image (see "media-probe-then-upgrade" in
`reference/design-system.md`). You never need to pre-create the asset
folders; dropping a file at the referenced path is enough, and removing a
`hero`/`photos`/`video` field (or leaving it unset) is equally safe — it
just falls back further down the chain (hero → first photo → gradient).

## `luckyManStudio` (top-level, not part of `areas[]`)

```json
{
  "name": "Lucky Man Studio",
  "tagline": "Auburn's professional recording & production space",
  "size": "normal",                                  // "normal" or "large", same as an area — see "Hub wall layout" above
  "theme": "#0b2341",                                 // Must be one of Auburn's 8 official colors, same rule as areas
  "image": "assets/images/lucky-man-studio/studio.jpg",
  "hotspots": [
    {
      "x": 91,                                        // 0-100, % across the photo (0 = left edge, 100 = right edge)
      "y": 20,                                        // 0-100, % down the photo (0 = top edge, 100 = bottom edge)
      "color": "#0b2341",                             // One of Auburn's 8 official colors — the marker's dot/line color
      "title": "Studio Monitors",
      "body": "Near-field **studio monitors** give students..." // Markdown (bold/italic/links), not HTML — see below
    }
  ]
}
```

A single object, not a list — there's only one studio. It still renders as a
tile in `.stage` (appended after the 8 `areas[]` tiles, same `.area-tile`
markup, same `size`/`theme` rules), but tapping it is a completely different
flow from every area: no carousel, no facts list, no Apply button. It pops
(same FLIP mechanism, `openStudio`/`closeStudio` in `js/app.js`) straight to
the full photo with tappable hotspot markers over real equipment. See
`reference/design-system.md`'s "Lucky Man Studio" section for how the
photo-frame sizing and hotspot markers work, and
`reference/decisions-log.md` for why this is a separate top-level field
instead of a 9th `areas[]` entry.

**Hotspot `x`/`y` have no visual picker** — there's no way to click-to-place
a hotspot in the CMS, only numeric percentage fields. Open the photo, eyeball
the position, save, and check the kiosk (or the browser at `/`); adjust the
number and repeat. This was a deliberate scope call, not an oversight — see
`reference/decisions-log.md`.

**`body` is Markdown, not HTML** — written through Decap's WYSIWYG markdown
editor in the CMS (bold/italic/links only; anything fancier won't render).
`js/app.js`'s `renderRichText()` converts it to HTML client-side and escapes
everything else, so don't hand-write HTML tags into this field even when
editing `content.json` directly — they'll show up as literal text.

## Editing without the CMS

Just hand-edit `data/content.json` — it's plain JSON, no build step re-reads
it, only a browser refresh. Validate before committing:
```bash
python3 -c "import json; json.load(open('data/content.json')); print('valid')"
```

## Editing via Decap CMS (`admin/config.yml`)

One Decap "file collection" entry (`data/content.json`, `format: json`)
with nested `object`/`list` widgets mirroring the schema above. Notable
non-obvious bits if you touch `admin/config.yml`:
- `theme` fields (both splash and areas) share one YAML anchor
  `&auburn-colors` — edit the color list once, both places update.
- `facts` and `galleryCaptions` are bare `widget: list` with no `field:` —
  that's Decap's shorthand for "list of plain strings," matching the JSON
  array-of-strings shape. Don't add a `field:` to these or the JSON shape
  changes to array-of-objects and `js/app.js` breaks.
- `photos` uses `field: { widget: image }` (singular `field`, not `fields`)
  — that's Decap's shorthand for "list of a single widget type," also
  producing a flat array of strings, not objects.
- Full CMS activation steps (Netlify Identity + Git Gateway) are in
  `reference/deployment.md`.
