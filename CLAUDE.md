# Auburn Music Department Kiosk — index

Touchscreen booth kiosk. Plain HTML/CSS/JS, no build step, no framework.
Content lives in `data/content.json`, editable by hand or via Decap CMS at
`/admin`. Deployed via GitHub (`schasemoore/music-kiosk`) → Netlify.

**Read a `reference/*.md` file below before editing in that area — it has
exact line numbers, field lists, and hard-won gotchas that are faster than
re-deriving from the source.**

| File | Read it when you're... |
|---|---|
| `reference/architecture.md` | Editing `js/app.js` or `index.html` structure — function map, render flow, DOM ids |
| `reference/design-system.md` | Touching colors, fonts, or CSS — official Auburn tokens, section line numbers, component classes |
| `reference/content-schema.md` | Adding/editing an area, splash slide, or any `data/content.json` field |
| `reference/deployment.md` | Git/GitHub/Netlify/Decap CMS setup, credentials, current deploy status |
| `reference/decisions-log.md` | Something seems like an odd choice — check here before "fixing" it |

## Fast facts (no file needed for these)

- **Areas**: brass, woodwind-percussion, voice, piano, commercial-music,
  composition-technology, music-education, bands-ensembles (8 total, in
  `data/content.json` → `areas`).
- **Colors**: exactly Auburn's 8 official brand colors, one per area. Never
  introduce a new hex — see `reference/design-system.md` for the list.
- **Fonts**: Sweet Sans Pro (headlines) + Davis Sans (body), via Auburn's own
  Typekit kit (`use.typekit.net/wfy5sib.css`). Only weights 400/700 exist.
- **Local dev server**: `python3 -m http.server 5173` from the project root
  (not `npx serve` — this machine's npm cache is broken). `/admin` needs a
  real Netlify deploy with Identity to actually log in; it 404-loops locally.
- **Git remote**: push over SSH alias `github-schasemoore` (see
  `reference/deployment.md` — this machine has two GitHub identities).
- **Browser-pane quirk**: after `resize_window` to a custom size, if the page
  renders squashed into a corner, toggle `preset: "desktop"` then back to the
  custom size — fixes it every time. Not an app bug.
