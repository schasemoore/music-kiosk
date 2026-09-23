# Deployment & accounts

**This file describes state as of 2026-09-23 — verify before trusting
anything time-sensitive (Netlify status, invite links, etc.). Update this
file whenever deployment state actually changes.**

## GitHub

- Repo: `schasemoore/music-kiosk` — https://github.com/schasemoore/music-kiosk
- Local remote uses an **SSH host alias**, not plain `github.com`:
  ```
  origin  git@github-schasemoore:schasemoore/music-kiosk.git
  ```
  This machine has two GitHub identities. The default SSH key
  (`~/.ssh/id_ed25519`) authenticates as a *different* account
  (`cmoore-glitch`), which has no access to this repo. A second key
  (`~/.ssh/id_ed25519_schasemoore`) was generated specifically for this repo
  and registered on the `schasemoore` GitHub account. `~/.ssh/config` has:
  ```
  Host github-schasemoore
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_schasemoore
    IdentitiesOnly yes
  ```
  **Always push/pull via the `github-schasemoore` alias**, not plain
  `git@github.com` — the latter will silently try the wrong key and fail
  with "Permission denied (publickey)." Sanity check:
  ```bash
  ssh -T git@github-schasemoore -o BatchMode=yes -o ConnectTimeout=5
  # should say: Hi schasemoore! You've successfully authenticated...
  ```
- Local git commit identity is **unset** (falls back to
  `chasemoore@<hostname>.local` autodetected by git). Commits so far carry
  that fallback identity — never changed since the user didn't ask to.
- History note: the GitHub-created repo started with just an MIT `LICENSE`
  file (independent history from the local project). Merged once via
  `git merge origin/main --allow-unrelated-histories` — already done, won't
  need repeating.

## Netlify

**Live as of 2026-09-23** — content edits made through `/admin` are landing on
`origin/main` as auto-generated commits (`Update Kiosk Content "content"`,
authored by the staff member's account, not a local identity), which only
happens when Netlify Identity + Git Gateway are working. (Earlier versions of
this file said Netlify wasn't confirmed connected; that's no longer true.)
Setup for reference: **Add new site → Import an existing project → GitHub →
`music-kiosk`**, build command blank, publish directory `.` (set in
`netlify.toml`).

**Gotcha — CMS commits diverge your local branch.** Because `/admin` commits
straight to `main`, a local branch can be behind `origin/main` without you
having pulled anything. Always `git fetch` and check `git status` before
pushing; if it says "diverged", merge `origin/main` (never force-push — that
would wipe out live CMS edits). The CMS rewrites `data/content.json` in its
own field order and pretty-printing, so a merge touching that file can look
scarier than it is; a purely additive local change (like adding
`luckyManStudio`) merges cleanly.

## Decap CMS (`/admin`) activation checklist

`/admin` will *load* on any static server (even `python3 -m http.server`
locally) but authentication only works once these are done on the live
Netlify site:

1. Site configuration → Identity → **Enable Identity**
2. Identity → Registration → **Invite only**
3. Identity → Services → Git Gateway → **Enable Git Gateway**
4. Identity → **Invite users** (send to each staff email)
5. Staff clicks the invite email link → sets password → lands in `/admin`

If asked "does /admin work yet" — check whether steps 1-3 are done on the
live Netlify dashboard (I can't check this myself, no Netlify access; ask
the user or have them screenshot Site configuration → Identity).

## Caching (`netlify.toml`)

`/assets/*` deliberately has **no** custom `Cache-Control` header — it falls
through to Netlify's own default (always-revalidate), same as
`index.html`/`css/styles.css`/`js/app.js` already get. It used to be
`public, max-age=31536000, immutable` (set in the very first commit, before
Decap CMS existed); once staff started editing photos in place through the
CMS — same path, new file content, not a renamed/hashed URL — that
`immutable` promise became actively wrong, and a browser that had visited
before could sit on a stale photo for up to a year after an edit while a
fresh/incognito browser always saw the update. Fixed by dropping the
override. `/js/vendor/*` (the vendored `qrcode.js`) keeps the long/immutable
cache — nothing there is ever hand-edited in place. See
`reference/decisions-log.md` for the full incident.

## Local dev server

```bash
python3 -m http.server 5173
```
from the project root. **Don't suggest `npx serve`** — this machine's npm
cache is owned by root (`EACCES` on `~/.npm/_cacache`) and fails; not worth
re-diagnosing, just use Python's server.

**Caching hazard on this server (not on Netlify):** `python3 -m http.server`
sends `Last-Modified` but no `Cache-Control`, so browsers apply heuristic
caching and can keep serving a stale `index.html` after you edit it. That is
worse than a stale look — if `index.html` (e.g. new element ids) goes out of
sync with a freshly-fetched `js/app.js`, `initApp` throws on a null element
and the boot error fallback wipes the whole page to a blank screen with only
"Couldn't load kiosk content". Hit this while testing the studio overlay
rework. Fix: hard-refresh (Cmd+Shift+R), load a cache-busting URL
(`/?v=2`), or test in a private window. `netlify.toml`'s headers don't apply
to this server at all. If this ever costs real time again, swap in a tiny
Python server that adds `Cache-Control: no-store` instead of using
`http.server` directly.

## Font licensing — don't re-introduce this problem

Auburn's real fonts (Sweet Sans Pro, Davis Sans) are loaded correctly via
Auburn's own Adobe Fonts/Typekit kit (see `reference/design-system.md`).
Earlier drafts briefly used font files downloaded from **fonnts.com** and
**befonts.com** (the latter explicitly labeled "Personal Use Only") — both
unauthorized font-mirror sites. Those files were deleted and never
committed to git. **Do not re-download fonts from third-party mirror
sites** for this project; if the Typekit kit ever needs replacing, get a
fresh kit ID from Auburn's Creative Cloud/brand office instead.
