# Deployment & accounts

**This file describes state as of 2026-09-22 — verify before trusting
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

Not yet confirmed connected as of the last check-in. To connect:
**Add new site → Import an existing project → GitHub → `music-kiosk`**.
Build command blank, publish directory `.` (set in `netlify.toml`).

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

## Local dev server

```bash
python3 -m http.server 5173
```
from the project root. **Don't suggest `npx serve`** — this machine's npm
cache is owned by root (`EACCES` on `~/.npm/_cacache`) and fails; not worth
re-diagnosing, just use Python's server.

## Font licensing — don't re-introduce this problem

Auburn's real fonts (Sweet Sans Pro, Davis Sans) are loaded correctly via
Auburn's own Adobe Fonts/Typekit kit (see `reference/design-system.md`).
Earlier drafts briefly used font files downloaded from **fonnts.com** and
**befonts.com** (the latter explicitly labeled "Personal Use Only") — both
unauthorized font-mirror sites. Those files were deleted and never
committed to git. **Do not re-download fonts from third-party mirror
sites** for this project; if the Typekit kit ever needs replacing, get a
fresh kit ID from Auburn's Creative Cloud/brand office instead.
