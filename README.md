# Auburn University Department of Music — Booth Kiosk

A touchscreen kiosk web app for conference/recruiting booths. Visitors start on a
main menu, tap into one of the department's areas to see photos, a short video,
and a QR code / button linking to the prospective-student application.

Plain HTML/CSS/JS, no build step, no framework — easy to run on any touchscreen
browser and cheap to host on Netlify.

## Structure

```
index.html            page shell (header, hub grid, area detail, footer, attract screen)
css/styles.css         Auburn-branded styling (orange/navy), responsive, touch-first
js/app.js               rendering, navigation, idle/attract timer, lightbox, QR
js/vendor/qrcode.js     MIT-licensed QR generator (kazuhikoarase/qrcode-generator), vendored locally
data/content.js         ALL editable copy, area list, media paths, CTA link, idle timeout
assets/images/areas/*   photo placeholders — drop real JPG/PNG files here (see below)
assets/video/areas/*    video placeholders — drop real MP4 files + poster images here
```

## Editing content

Everything a booth staffer needs to change lives in **`data/content.js`**:

- `CTA_URL` — currently a **placeholder** (`https://your-link-here.auburn.edu/apply`).
  Replace with the real prospective-student form / apply link. The header button,
  every area's CTA button, and every QR code update automatically — nothing else
  to regenerate.
  - Note: while researching area names, the department's real "Apply and Audition"
    page was `https://cla.auburn.edu/music/future-students/apply-and-audition/`,
    which itself links to Acceptd (`https://app.getacceptd.com/auburnmusic`) for
    the actual application. Either could be the real `CTA_URL` — confirm with the
    department before going live.
- `AREAS` — array of the 8 areas currently shown (Brass; Woodwind & Percussion;
  Voice; Piano; Commercial Music; Composition & Technology; Music Education;
  Bands & Ensembles), each with `name`, `tagline`, `description`, `facts`, and
  media paths. Add/remove/reorder areas by editing this array — the grid and
  detail pages are generated from it automatically.
- `IDLE_TIMEOUT_MS` — how long (ms) with no touch before the kiosk returns to the
  home screen and shows the attract overlay. Defaults to 90 seconds.

## Adding real photos & videos

No code changes needed — just drop files at the exact paths already referenced
in `data/content.js`, e.g.:

```
assets/images/areas/brass/1.jpg
assets/images/areas/brass/2.jpg
assets/images/areas/brass/3.jpg
assets/video/areas/brass/reel.mp4
assets/images/areas/brass/poster.jpg   (video cover image)
```

Until a file exists at that path, the kiosk automatically shows a styled
placeholder tile instead of a broken image — so you can add real media
gradually, area by area, without breaking the layout. Recommended: photos
~1600px wide (4:3), video clips 10–30s, muted-friendly (they autoplay muted
when opened), H.264 MP4.

## Running locally

Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed local URL in a browser.

## Deploying to Netlify

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command: leave blank. Publish directory: `.` (already set in
   `netlify.toml`).
4. Deploy. Every push to the connected branch redeploys automatically.

## Running as a kiosk on the touchscreen

Point a Chromium/Chrome kiosk-mode browser at the deployed Netlify URL:

```bash
chrome --kiosk --incognito --noerrdialogs --disable-pinch --overscroll-history-navigation=0 https://YOUR-SITE.netlify.app
```

- `--disable-pinch` and `--overscroll-history-navigation=0` stop stray touch
  gestures from zooming or navigating away.
- The app already ignores page scroll/bounce and returns to the home screen
  after `IDLE_TIMEOUT_MS` of inactivity, so it's safe to leave unattended
  between visitors.
- If the booth's internet connection is unreliable, note that Google Fonts
  (Oswald / Source Sans 3) load from a CDN; everything else (QR generation,
  images placed locally) works fully offline once the page has loaded once.
