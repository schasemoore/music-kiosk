# Decisions log

Why things are the way they are — check here before "fixing" something that
was actually a deliberate call, and before re-treading ground already
covered.

## Design direction (three iterations)

1. **v1 — "concert program"**: quiet two-column list, cream background,
   Fraunces serif, hairline rules. Rejected by the user as "too sterile,
   not visually appealing."
2. **v2 — "stage"**: dark navy hub, 8 saturated poster tiles (one color
   each), animated equalizer bar, Ken Burns splash slideshow, media-led
   area pages (info overlaid on photo/video instead of filed in separate
   sections). This landed well and is the current structure.
3. **v3 — tile interaction model** (current): tiles no longer link straight
   to the full page. Tap opens a preview modal (carousel + facts + two
   buttons); the full scrolling page is now an opt-in "learn more," reached
   only from inside the preview. User's stated reason: the site "still felt
   too much like a website" — the direct-link pattern read as browsing a
   website rather than using a kiosk app. Don't revert tiles to direct
   links to `showArea()` without re-asking.

Two skills were installed locally specifically for this project's design
work: `frontend-design` (avoid generic/templated AI aesthetics — the v1→v2
rationale) and `canvas-design`/`algorithmic-art`/`theme-factory` (bold
palette commitment, "living texture" via the equalizer, informed v2). All
from the official `anthropics/skills` GitHub repo, copied into
`~/.claude/skills/`.

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

## Why the tile CTA pill says "Apply" not the configured `cta.label`

`cta.label` (default "Apply now") is used everywhere else. The tile's own
corner pill hardcodes the shorter "Apply" because the full label didn't fit
without either enlarging the tile-text's reserved padding a lot (crowding
the name/tagline) or shrinking the pill's font past comfortable tap-target
size. Deliberate trade-off, not an oversight — if `cta.label` changes to
something even longer, this won't automatically break, since the tile pill
doesn't read from it at all.

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
