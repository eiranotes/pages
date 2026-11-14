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

App Store links (`a[data-app-store]`) default to https://apps.apple.com/kr/app/adelie-pages/id6822323315.
`public/app.js` swaps `kr` for the visitor's storefront from the first browser language with a region
(`Intl.Locale.maximize()`, so `ja` → `jp`, `zh-Hant` → `tw`); Apple sends unknown storefronts to `us`.
Canonical QR codes (decided 2026-11-09): the app-icon disc versions, `qr/adelie-pages-get.*` and
`qr/adelie-draw-shop.*`, so the app and shop codes match. The `*-penguin.*` files are an unused trial.
QR code: `qr/adelie-pages-get.{png,svg}` encode https://app.adeliedraw.com/pages/get/, which sends iOS to the
App Store (same storefront rule) and Android to Google Play (`a[data-play-store]`, live since 2026-11-14).
Google Play links (`a[data-play-store]`) sit next to the App Store links; no storefront rewrite.
Rebuild with `python3 tool/make_store_qr.py` (needs segno, Pillow, zxing-cpp in a dev venv).
`qr/adelie-draw-shop.*` is the overseas shop QR in the same style (`--url https://app.adeliedraw.com/shop/
--name adelie-draw-shop`); its landing lives in eiranotes.github.io (`shop/`: Japan → jp mall, else → en mall).
`*-penguin.*` use the user's wing-spread penguin (`qr/penguin-wings-logo.png`): `--logo qr/penguin-wings-logo.png
--logo-ratio 0.38 --ink '#273777'`. With `--logo`, modules are left out along the image's silhouette.
The app section shows the App Store screenshots (`public/assets/store/`, sources in ASSET_SOURCES.json).
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
