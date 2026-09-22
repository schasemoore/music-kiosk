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
