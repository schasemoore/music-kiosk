# Auburn University Department of Music — Booth Kiosk

A touchscreen kiosk web app for conference/recruiting booths. A moving splash
slideshow attracts visitors; the hub is a "stage" of saturated poster tiles
for each area; each area page is media-led (photo/video with information
overlaid directly on it, not filed away in separate sections); a ticket-style
QR/apply CTA closes every area. Non-technical staff edit all of it — tiles,
copy, colors, photos, video, the logo — through a CMS at `/admin`.

Plain HTML/CSS/JS, no build step, no framework — easy to run on any touchscreen
browser and cheap to host on Netlify.

## Structure

```
index.html              page shell (header, hub stage, area detail, footer, attract/splash screen)
css/styles.css           Auburn-branded styling, responsive, touch-first
js/app.js                fetches data/content.json, then renders + runs everything
js/vendor/qrcode.js       MIT-licensed QR generator (kazuhikoarase/qrcode-generator), vendored locally
data/content.json         ALL editable content — copy, colors, splash slides, areas, media paths, CTA link
admin/index.html          Decap CMS bootstrap page
admin/config.yml          Decap CMS schema — defines the edit form for data/content.json
assets/brand/             official Auburn logo (auburn-logo.svg)
assets/uploads/           where the CMS saves photos/video you upload through it
assets/images/splash/*    splash-slideshow photo placeholders (1.jpg – 5.jpg)
assets/images/areas/*     area hero + gallery photo placeholders
assets/video/areas/*      area video placeholders + poster images
```

## Branding — status and gaps

- **Colors**: exact official Auburn brand colors, pulled from
  `ocm.auburn.edu/brand-center/colors.php` — Auburn Blue `#0b2341` and Auburn
  Orange `#e86100` (primary), plus 6 supporting colors, one assigned to each
  of the 8 areas as its identity color. The CMS only lets you pick from these
  8 — don't introduce new hues in the raw JSON either.
- **Logo**: the official Auburn University horizontal informal logo
  (`assets/brand/auburn-logo.svg`), used in the header and on the splash
  screen, editable via the CMS. This is the university-wide mark — Auburn's
  Brand Center also has a Department of Music unit logo under "Unit Logos"
  (likely behind Auburn SSO) if you want that instead.
- **Fonts — real, via Auburn's Adobe Fonts (Typekit) kit**: `index.html` links
  `https://use.typekit.net/wfy5sib.css`, Auburn's own kit, which serves
  **Sweet Sans Pro** (headlines/display — `font-family: "sweet-sans-pro"`)
  and **Davis Sans** (body/UI text — `font-family: "davis-sans"`), set as the
  base fonts in `css/styles.css`.
  - The kit only includes Regular (400) and Bold (700) weights for both
    faces, no serif. Every `font-weight` in the CSS is 400 or 700 — don't
    introduce 500/600, they'll just fall back to the nearest available face.
  - If this kit ever stops resolving (e.g. a new kit ID), get a fresh one
    from Auburn's Creative Cloud/OCM brand office and swap the `<link>` in
    `index.html`.

## Editing content

Everything lives in **`data/content.json`** — either edit it directly, or
(recommended for non-technical staff) through the CMS at `/admin` once it's
set up (see below). Top-level fields:

- `logo` — path to the header/splash logo image.
- `department` — `name` (header text), `heroTitle` / `heroSub` (home screen
  headline + subhead).
- `cta` — `url` (currently a **placeholder**,
  `https://your-link-here.auburn.edu/apply` — replace with the real
  prospective-student form/apply link) and `label` (button text). Every QR
  code and button on the site reads from this one place.
  - Note: research turned up the department's real "Apply and Audition" page,
    `https://cla.auburn.edu/music/future-students/apply-and-audition/`, which
    links to Acceptd (`https://app.getacceptd.com/auburnmusic`) for the actual
    application. Confirm the right one with the department before going live.
- `idleTimeoutMs` / `splashIntervalMs` — how long until the kiosk returns to
  the splash screen, and how long each splash slide stays up (milliseconds).
- `galleryCaptions` — caption text cycled across each area's gallery photos.
- `splash` — the attract-screen slideshow slides (photo + theme color +
  caption). Add, remove, or reorder freely.
- `areas` — the 8 area tiles/pages, each with `name`, `tagline`, `icon`,
  `theme` color, `description`, `facts`, and media (`hero`, `photos`,
  `video`, `poster`). Add, remove, or reorder areas by editing this array —
  the hub grid and detail pages are generated from it automatically.

## Content-management UI (Decap CMS)

`/admin` is a [Decap CMS](https://decapcms.org) instance (free, open-source,
git-based) scoped to exactly one form: editing `data/content.json`. A staff
member logs in, edits fields (including add/remove/reorder for splash slides
and areas, with a real media picker for photos/video), clicks **Publish**,
and Decap commits the change straight to this GitHub repo — Netlify then
redeploys automatically. No database, no separate server.

**One-time setup**, after the site is on GitHub + Netlify (see below):

1. In the Netlify dashboard for this site: **Site configuration → Identity →
   Enable Identity**.
2. Under Identity → **Registration**, set it to **Invite only** (so random
   people can't self-register as editors).
3. Under Identity → **Services → Git Gateway**, click **Enable Git Gateway**.
   This is what lets Decap commit to GitHub on a logged-in user's behalf
   without each person needing their own GitHub account/token.
4. Under Identity, **Invite users** — enter each staff member's email. They
   get an email, set a password, and are dropped into `/admin`.
5. Done. From then on, staff go to `https://YOUR-SITE.netlify.app/admin`,
   log in, and edit content visually.

**Day to day**: editors don't need to know any of the above — just the
`/admin` URL and their login. Uploaded photos/video land in
`assets/uploads/`; typed fields (colors, icons) are dropdowns constrained to
Auburn's real options so the design can't drift off-brand by accident.

## Adding real photos & video without the CMS

You can also just drop files at the exact paths already referenced in
`data/content.json` — no code changes needed:

```
assets/images/splash/1.jpg … 5.jpg          splash slideshow
assets/images/areas/brass/hero.jpg          full-bleed area hero shot
assets/images/areas/brass/1.jpg, 2.jpg      gallery photos
assets/video/areas/brass/reel.mp4           gallery video clip
assets/images/areas/brass/poster.jpg        video cover frame
```

Until a file exists at a given path, the kiosk automatically shows a styled
placeholder in that area's color instead of a broken image, so real media can
be added gradually without breaking the layout. Recommended: hero/gallery
photos ~1600px wide, video clips 10–30s, muted-friendly (they autoplay muted
when opened), H.264 MP4.

## Running locally

Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed local URL in a browser. `/admin` will load and show
its schema/login screen, but won't actually authenticate until the site is
deployed to Netlify with Identity + Git Gateway enabled (see above).

## Deploying to Netlify

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command: leave blank. Publish directory: `.` (already set in
   `netlify.toml`).
4. Deploy. Every push to the connected branch redeploys automatically —
   including edits Decap CMS commits from `/admin`.
5. Then follow "Content-management UI" above to turn on the CMS.

## Running as a kiosk on the touchscreen

Point a Chromium/Chrome kiosk-mode browser at the deployed Netlify URL:

```bash
chrome --kiosk --incognito --noerrdialogs --disable-pinch --overscroll-history-navigation=0 https://YOUR-SITE.netlify.app
```

- `--disable-pinch` and `--overscroll-history-navigation=0` stop stray touch
  gestures from zooming or navigating away.
- The app already ignores page scroll/bounce and returns to the splash screen
  after `idleTimeoutMs` of inactivity, so it's safe to leave unattended
  between visitors.
- If the booth's internet connection is unreliable, note that the Sweet Sans
  Pro / Davis Sans fonts load from Adobe's Typekit CDN (`use.typekit.net`);
  everything else (QR generation, images placed locally) works fully offline
  once the page has loaded once — including `data/content.json`, which is
  fetched once and doesn't need the CMS or GitHub at runtime.
