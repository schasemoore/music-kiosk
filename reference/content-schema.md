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
| `cta.url` | string (URL) | **Currently a placeholder** (`https://your-link-here.auburn.edu/apply`) — every Apply button and QR code on the whole site reads this one field |
| `cta.label` | string | Text on the full-size Apply buttons (the tile's own CTA pill is hardcoded "Apply" regardless — see `reference/design-system.md` tile section) |
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
  "icon": "brass",                                  // Must be one of the 8 keys below
  "theme": "#ffc044",                               // Must be one of the 8 official Auburn colors
  "description": "...",                             // 1-2 sentences, area page hero
  "facts": ["...", "...", "..."],                   // Short bullet list, no fixed count
  "hero": "assets/images/areas/brass/hero.jpg",      // Full-bleed hero photo (area page + tile background + preview modal if no other photo)
  "photos": ["assets/.../1.jpg", "assets/.../2.jpg"],// Gallery photos, any count including zero
  "video": "assets/video/areas/brass/reel.mp4",      // Optional gallery video clip
  "poster": "assets/images/areas/brass/poster.jpg"   // Video cover frame (shown before play)
}
```

Valid `icon` values (must match `ICONS` keys in `js/app.js:5-13`, each maps
to a hand-drawn inline SVG — there is no way to add a 9th icon without
editing `js/app.js` and `admin/config.yml`'s icon `select` options together):
`brass`, `woodwind`, `voice`, `piano`, `commercial`, `composition`,
`education`, `ensemble`.

**Any media path that 404s is handled gracefully** — the app shows a themed
placeholder instead of a broken image (see "media-probe-then-upgrade" in
`reference/design-system.md`). You never need to pre-create the asset
folders; dropping a file at the referenced path is enough, and removing a
`hero`/`photos`/`video` field (or leaving it unset) is equally safe — it
just falls back further down the chain (hero → first photo → gradient).

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
