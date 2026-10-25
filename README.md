# Adelie Pages

Independent app introduction designed around Adelie Draw digital stationery.
This repository is the canonical source deployed at https://app.adeliedraw.com/pages/.

Run `python3 -m http.server 8876 --directory public`.
Validate `python3 check_site.py` and `node --check public/app.js`.
GitHub Actions publishes only `public/`. No package installation or build step.

Design: shared Adelie web design (canonical repo `adelie-web-design`), vendored in `public/brand/`
(tokens, LINE Seed, woodfree paper, brand bar, footer, 404). Never edit `public/brand/` here; edit the
canonical and run its `tools/sync.py --write pages`. `check_site.py` rejects edited brand files.
Site CSS keeps legacy variable names as aliases of `--ad-*`; new rules use `--ad-*` directly.
Existing brand artwork supplies color; no generated art or simulated app screenshots.
Images are WebP derivatives. LINE Seed fonts include their full original OFL notice.

This is an app introduction, not an app release. Store links are not available.
See docs for scope and checks. Artwork remains owned by Adelie Draw; no reuse license is granted.

## Pack covers

The site does not publish individual stickers: no per-pack sticker pages, sticker grids or
enlarged previews, so the artwork is not offered in a copyable form. Do not add them back.

The main collection does not list packs. It shows the app's pack covers drifting in two
opposite rows, like the onboarding's closing scene. `content/pack_covers.json` holds the
covers (order, names, 480×600 WebP derivatives and app source SHA-256). When the app catalogue
changes, run `python3 tool/sync_pack_covers.py` (reads the app's committed `main` via git and skips
withdrawn packs), then rebuild. Motion
pauses on hover/focus, off screen and with the on-page toggle; `prefers-reduced-motion` gets a
still, scrollable row.

Run `node tool/flow_qa.mjs QA/<folder>` for the cover-flow check (widths, motion, pause,
reduced motion, console errors and a review frame sequence). GitHub Actions only uploads `public/`.

The LINE Seed WOFF2 files reuse the Korean-inclusive subsets published by eiranotes/pages.
Their source URLs and hashes are in ASSET_SOURCES.json; the original OFL stays bundled.
See [three-site audit](docs/THREE_SITE_ANALYSIS.md) for the design comparison and contract.
