# Decisions log

Why things are the way they are — check here before "fixing" something that
was actually a deliberate call, and before re-treading ground already
covered.

## Idle detection doesn't count mouse movement, and there's a hidden reset

Two related interaction changes, both from the same conversation:

1. `resetIdle()` used to be wired to `mousemove` as well as
   `pointerdown`/`touchstart`/`keydown`. On the actual touchscreen kiosk
   that's harmless, but when testing/demoing on a laptop, just moving the
   cursor near the app counted as "using the kiosk" and kept it from ever
   going idle. User's framing: on a laptop, a "tap" should mean an actual
   **click**, not the mouse merely drifting across the screen. Fixed by
   dropping `mousemove` from the listener list (`js/app.js`, `resetIdle`'s
   wiring) — `pointerdown` alone already covers both a real screen touch and
   a real mouse click, so nothing was lost for the touchscreen case.
2. Added a way for staff to force the attract/splash screen up on demand,
   instead of waiting out `idleTimeoutMs` (90s by default) — useful for
   demos or to reset the kiosk between visitors without a settings menu.
   User's request was specifically for a *secret* trigger, not a visible
   button: double-click (laptop) / double-tap (touchscreen) the Auburn logo
   in the header (`#brand-home`) calls `goHomeAndAttract()` directly. It's
   a plain `dblclick` listener — nothing about it is announced in the UI,
   and it should stay that way; don't add a visible hint or label for it.

## Design direction (three iterations)

1. **v1 — "concert program"**: quiet two-column list, cream background,
   Fraunces serif, hairline rules. Rejected by the user as "too sterile,
   not visually appealing."
2. **v2 — "stage"**: dark navy hub, 8 saturated poster tiles (one color
   each), animated equalizer bar, Ken Burns splash slideshow, media-led
   area pages (info overlaid on photo/video instead of filed in separate
   sections). This landed well and is the current structure.
3. **v3 — tile interaction model**: tiles no longer link straight
   to the full page. Tap opens a preview modal (carousel + facts + two
   buttons); the full scrolling page is now an opt-in "learn more," reached
   only from inside the preview. User's stated reason: the site "still felt
   too much like a website" — the direct-link pattern read as browsing a
   website rather than using a kiosk app. Don't revert tiles to direct
   links to `showArea()` without re-asking.
4. **v4 — "the wall" (current)**: even with v3's interaction model, the
   user felt it "still looks too much like a website" — specifically the
   padded, equal-gap, rounded-corner 4-column card grid on the hub, and the
   tile-tap preview being a centered boxed dialog on a dim backdrop. Asked
   for full-frame pictures, a literal "popout" interaction, stronger
   purposeful animation, and more "wow factor" to draw people to the kiosk
   from across the room. Landed on: an edge-to-edge asymmetric poster wall
   for the hub (no gaps, no radius, `bands-ensembles` as a large flagship
   block — see `reference/design-system.md`'s "hub wall" section for the
   `WALL_LAYOUT` id-keyed placement map); tile taps now pop the tapped
   photo out into a full-frame overlay via a FLIP transform animation
   instead of fading in a boxed modal; the idle/attract screen became a
   cinematic multi-panel wall (several photos crossfading independently at
   once, pooled from every area's photos, not just the 5 splash slides)
   instead of one slide at a time. The v2/v3 decisions above weren't
   revisited — dark "stage" hub, tap-then-"learn more" flow, media-led area
   pages, Auburn's 8 colors, and Sweet Sans Pro/Davis Sans all carried
   forward unchanged; this was specifically about the hub/preview/attract
   surfaces still reading as generic web-card patterns.

Skills used for this project's design work: `frontend-design` (avoid
generic/templated AI aesthetics — the v1→v2 rationale, and again for v4's
plan) and `canvas-design`/`algorithmic-art`/`theme-factory` (bold palette
commitment, "living texture" via the equalizer, informed v2). All from the
official `anthropics/skills` GitHub repo, copied into `~/.claude/skills/`.

## Why `data/content.json`, not `data/content.js`

Original build used a plain JS file (`window.KIOSK_CONTENT = {...}`).
Switched to JSON + `fetch()` at runtime specifically so Decap CMS could
edit it — Decap only understands JSON/YAML/Markdown/TOML files, not
arbitrary JS modules. If you're tempted to move back to a `.js` config for
convenience, remember this breaks the CMS.

## Why Decap CMS (not a custom admin page)

User asked for "a lightweight management UI." Decap CMS is free,
open-source, git-based (no database/server to run), and purpose-built for
exactly this shape of site (static, GitHub + Netlify, one JSON file to
edit). A fully custom admin page was the explicit alternative considered
and declined.

## Why the tile CTA pill defaults to "Apply" not the configured `cta.label`

`cta.label` (default "Apply now") is used everywhere else. The tile's own
corner pill defaults to the shorter "Apply" because the full label didn't
fit without either enlarging the tile-text's reserved padding a lot
(crowding the name/tagline) or shrinking the pill's font past comfortable
tap-target size. Deliberate trade-off, not an oversight — if `cta.label`
changes to something even longer, this won't automatically break, since the
tile pill doesn't read from it at all.

Later addition: each area can now set its own `cta.url`/`cta.label`
override (`reference/content-schema.md`) — if an area sets a custom label,
the tile pill *does* show that (an editor asking for a specific label is
opting in, unlike the generic site-wide `cta.label`), but the "Apply"
fallback above is unchanged when no override is set. Same override cascades
to that area's preview overlay, full page, and QR code, so a program can be
pointed at its own application link without forking the whole flow.

## Colors are exactly Auburn's 8 official brand colors — no others

Pulled directly from `ocm.auburn.edu/brand-center/colors.php` (2 primary +
6 supporting). Earlier draft invented its own material-grounded palette
(brass=gold, voice=burgundy, etc.) before this research — that palette is
gone. The current 8-colors-to-8-areas mapping is arbitrary within "official
Auburn colors only," not grounded in instrument materials anymore. Don't
add a 9th color for a 9th area; reassign one of the 8 or ask the user which
existing area should share.

## Fonts: why not the files the user initially provided

User uploaded font files from Downloads (Davis Sans via fonnts.com, Kazimir
Text via befonts.com). Kazimir Text's license file explicitly said
"Personal Use Only"; both sites are known unauthorized font-mirror
distributors, not proper licensing, and this is a public university site.
Flagged directly to the user rather than silently using them. Resolution:
user later supplied Auburn's actual Adobe Fonts (Typekit) kit URL
(`use.typekit.net/wfy5sib.css`), which is the real, properly-licensed
source and is what's in use now. Also: the user originally said "Davis Sans
for headlines" but then corrected to "Sweet Sans Pro for headlines, Davis
Sans for body" once both were available via the real kit — current CSS
matches the correction, not the original ask.

## Browser-pane viewport bug (tooling note, not app note)

When testing this app in the Claude Code built-in browser pane, calling
`resize_window` to a custom size (e.g. 1600x900) sometimes renders the page
squashed into a small corner of the viewport despite `window.innerWidth`
correctly reporting the full size. Fix: call `resize_window` with
`preset: "desktop"` first, then immediately re-apply the custom size — this
has resolved it 100% of the time so far. Not a bug in this app's CSS/JS;
don't go debugging the kiosk's layout code if you see this.

## Git identity mismatch (tooling note)

This dev machine's default SSH key belongs to a different GitHub account
than the one that owns this repo. Full detail and the fix (a second SSH key
+ host alias) is in `reference/deployment.md` — noted here so future-me
doesn't re-diagnose "Permission denied (publickey)" from scratch.

## Where the real photos came from, and a CDN gotcha

All current photos in `assets/images/` (every area's `hero.jpg`/`1.jpg`/
`2.jpg`, all 5 splash slides) were pulled from cla.auburn.edu/music and its
news articles — the department's own site, reused for the department's own
kiosk. Sources, roughly: Symphonic Winds' Japan and Europe/NYC tours (bands,
piano, voice/choir), the Lucky Man Studio recording facility (commercial
music), a Composition/Tech news photo, a conducting photo (music education),
a Juilliard-bound trumpet grad (brass), and a percussion-class/saxophone
photo (woodwind & percussion). Skipped anything filename-tagged
`adobestock_*` — that's licensed stock Auburn pays for, not their own
photography, not ours to reuse.

**Gotcha**: Auburn's CMS image endpoint (`cla.auburn.edu/media/<id>/<file>
?width=N`) silently returns a corrupted/glitched JPEG for some source
images at some requested widths — same byte count every retry, so it's
server-side, not a transfer error. Always fetch the image with **no**
width/height query params (full original resolution) and resize locally
(`sips -s format jpeg -s formatOptions 82 --resampleWidth N in --out out.jpg`)
instead of trusting their resize endpoint. If you pull more photos from
this site later, check each one visually before committing — don't assume
a 200 response means a good image.

## Lucky Man Studio tile — a 9th tile that isn't a 9th "area"

User asked for a Lucky Man Studio section that's "unlike any other section"
— tapping it should open straight to a full photo of the studio with
tappable hotspots (equipment call-outs), not the usual
carousel/facts/Apply-button flow every area tile uses. A few implementation
calls worth recording:

- **Separate top-level `luckyManStudio` field, not a 9th `areas[]` entry.**
  Decap's `list` widget applies the same field set to every item, so adding
  `hotspots`/an open-flow-type flag to `areas[]` would've put an unused
  "Hotspots" list and other irrelevant fields on all 8 real areas' CMS forms.
  A dedicated top-level object gets its own clean CMS section instead. Cost:
  it doesn't participate in `areas[]`'s drag-to-reorder — it always renders
  as the last tile appended to the wall. Nobody's asked for it to be
  reorderable relative to the 8 areas; revisit if that changes.
- **Reused one of the 8 official colors (Auburn Blue) rather than adding a
  9th.** Flagged as the right call to make, not just defaulted into, by the
  "Colors are exactly Auburn's 8" decision above, which literally
  anticipated this exact situation ("reassign one of the 8 or ask the user
  which existing area should share"). Auburn Blue already belongs to Music
  Education; it's a CMS `select` field either way, so easy to change later.
- **Hotspot position is a numeric % field, not a click-to-place picker.**
  Decap doesn't ship a visual position-picker widget, and building a custom
  one means a compiled Preact/React control bundle — real scope, and out of
  step with this project's plain-JS/no-build-step constraint for what the
  user actually asked for (color customization + WYSIWYG body text, both of
  which Decap's stock widgets already cover). Staff eyeball the position as
  a 0-100 percentage and adjust by checking the kiosk. Revisit only if this
  turns out to be too fiddly in practice.
- **Hotspot body is Markdown, not raw HTML in content.json.** Decap's
  "markdown" widget (the WYSIWYG editor the user asked for) stores markdown
  source, not HTML — `js/app.js`'s `renderRichText()` is a small
  escape-first, then-reintroduce-bold/italic/links converter, not a full
  markdown library (no build step to pull one in via). Keeps hand-editing
  `content.json` directly safe and consistent with the CMS output, and
  avoids trusting raw HTML strings from a JSON file.
- **Default studio photo**: reused the existing Lucky Man Studio
  control-room shot already in the repo (`composition-technology`'s
  `2.jpg`, see the Box archive entry below), copied to its own
  `assets/images/lucky-man-studio/studio.jpg` — not moved, so
  `composition-technology` keeps its own copy untouched. Default hotspots
  (studio monitors, mixing console, synth, outboard gear rack) were placed
  by eye against that specific photo; if the photo is ever swapped via the
  CMS, the hotspot positions will need re-checking against the new image.

## Lucky Man Studio hotspots — follow-up pass: all-blue markers, backdrop card, real gear copy

Three changes after the initial build, in one pass:

- **All hotspot markers are Auburn Blue.** Initially each of the 4 default
  hotspots used a different one of the 8 official colors (varied per
  marker, echoing how each area tile gets its own color). User asked to
  make them all blue instead — a content/consistency call, not a technical
  one; the per-hotspot `color` CMS field is untouched, so any individual
  marker can still be set to a different color later if a program ever
  wants one to stand out.
- **Hotspot callouts got a translucent backdrop card**
  (`.callout-card` in `css/styles.css`) instead of relying on text-shadow
  alone for legibility. The line, title, and body all now sit inside one
  `rgba(6,16,33,.82)` rounded panel with `backdrop-filter: blur`. This is a
  deliberate departure from this app's usual "gradient scrim, never a solid
  box" rule for text-on-photo (`reference/design-system.md`'s
  "Scrim-for-legibility") — that rule is built for a full-width edge scrim
  (tile/hero text anchored to one edge); a hotspot callout can land
  anywhere in the middle of the photo over unpredictable content (a bright
  monitor, a cluttered rack), where a bounded card reads more reliably than
  a directional gradient would. Don't take this as license to add solid
  boxes elsewhere — it's specific to floating, arbitrarily-positioned
  callouts, not the app's general text-over-photo pattern.
- **Default hotspot copy was rewritten from the real
  [luckymanstudio.com](https://luckymanstudio.com) gear list** (its
  `/studio/` page has a full equipment inventory: mics, preamps, outboard,
  monitors, synths, etc.), not generic placeholder text. Specific calls:
  - **ATC SCM45** monitors — the site explicitly lists "ATC SCM 45 L, C, R
    monitors," and the photographed speaker (twin woofers flanking a
    coaxial tweeter/mid, horizontal orientation) matches an ATC center-
    channel design. Named with confidence.
  - **Arturia PolyBrute** — the site lists two PolyBrutes as the studio's
    only analog synth keyboards (Waldorf Iridium and Yamaha Montage are
    digital/hybrid). The photographed synth's dense knob/slider matrix and
    wood end-cheeks are consistent with it, so it's named directly.
  - **Mixing console** — deliberately kept generic ("hands-on console
    time... patched into the studio's outboard chain") rather than naming
    a specific console model. The compact control surface in the photo
    doesn't clearly match any single board on the site's gear list (which
    focuses on outboard/mic pres rather than naming a console model), and
    the room in the photo may not even be the flagship "Studio 1" the
    website describes in detail — better to describe the real workflow
    (patched into real Neve/SSL/API-style outboard, all genuinely on the
    gear list) than guess a model from a blurry photo.
  - **Outboard rack** — called out as including "vintage-style tube
    compressors modeled on the... Fairchild 670" rather than naming the
    exact rack unit, since the site lists a **Stam Audio 670** (an
    explicit Fairchild 670 recreation) and the photographed unit's twin
    large VU meters on a light faceplate are visually consistent with
    that style of compressor — accurate about the *kind* of gear without
    overclaiming a pixel-level ID on a low-res photo.
  If the studio photo is ever swapped, re-verify these against whatever
  equipment is actually visible — don't just carry the copy forward.

## Second archive pass — every area now has a full 3-photo set, all from Box

Follow-up to the pass above. Every area's gallery previously had `1.jpg`
and `2.jpg` declared in `content.json`, but for five areas (`brass`,
`woodwind-percussion`, `voice`, `composition-technology`, plus all of
`music-education`) the `2.jpg` file (and for music-education, `1.jpg` too)
didn't actually exist on disk — the app's 404-fallback was quietly hiding
the gap. `commercial-music` and `music-education` were also still on their
original web-sourced photos (no archive match had been found for them in
the prior pass).

Fixed by working directly from the Box archive
(`~/Library/CloudStorage/Box-Box/AU Department of Music Photo Archive`,
mounted as an extra working directory, not part of this git repo — nothing
in it was moved or deleted) instead of the website. Preferred each event's
`Public Photos`/`Public` subfolder where one existed — per-event folders
here are split `Public` (cleared for department use) vs `Master` (full raw
set, not necessarily cleared), matching the "Public folder = pre-cleared"
convention from the first pass. Picked recent (2024–2026) professional
Ryan English Photography shots over the older `Dept Photos [from admin
drive]` tree (2013–2018, uncleared, and explicitly not what "newer photos"
meant here).

- `commercial-music` hero/1/2: replaced entirely — Sonic Nation: Blues &
  Roots concert (March 2024), `Commercial Ensembles/Blues and Roots/.../
  Public Photos`.
- `music-education` hero/1/2: replaced entirely — hero and one gallery
  photo are the Feb. 2025 Honor Band host concert (a conducting shot and a
  brass-section shot, `Bands/Honor Bands/2025 | Feb. 28, Honor Band`); the
  other gallery photo is a phone-shot group photo from a 2025 summer
  outreach camp/workshop at Goodwin Hall (`Dept. Events/2025 LAaMM`) — no
  professional shoot exists for this area specifically, so this is the
  closest real match to "K-12 outreach" the archive has. Worth swapping if
  a dedicated Music Ed classroom/methods shoot ever gets added to the
  archive.
- `composition-technology` 2.jpg (new): Lucky Man Studio control-room shot,
  `Lucky Man Studio/2025 August OCM` (named "stock" in the archive —
  department-shot specifically for reuse like this).
- `brass` 2.jpg (new): Trumpet Ensemble concert, `Chamber Ensembles/Brass
  Ensembles/Trumpet/2022 | Trumpet Ensemble Concert/Public Photos`.
- `woodwind-percussion` 2.jpg (new): Percussion Ensemble & Steel Band,
  April 2026 — the most recent shoot in the whole archive, `Chamber
  Ensembles/Percussion Ensembles/2026 | Apr 8, .../Public`.
- `voice` 2.jpg (new): Fall Choral Concert, Nov. 2025, `Choirs/Choral
  Concerts/2025 | November 16, Fall Choral Concert/Public`.

No `content.json` changes were needed — the `photos` arrays already
referenced these exact `1.jpg`/`2.jpg` paths; only the files themselves
were missing or stale. Same `sips -s format jpeg -s formatOptions 82
--resampleWidth N` local-resize step as before (1600px for hero, 1200px
for gallery photos) — no CDN involved this time since the source was local
Box files, not a website.
