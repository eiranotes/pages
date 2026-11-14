# Status

Current facts only; overwrite when they change. Open work is in [TASKS](TASKS.md), rules in [DECISIONS](DECISIONS.md).
Last updated 2026-11-14.

## Site

- Live at https://app.adeliedraw.com/pages/ from `eiranotes/pages` (`main` push → Actions → `public/`).
- Pages: intro (`/`), store landing (`/get/`, noindex), app info (`/info/`), privacy, terms, data, support, 404.
- Intro: hero with the draggable sticker playground, drifting pack covers (43, app main 379638c8),
  page example, six App Store screenshots, FAQ, about. No individual sticker pages.
- Shared Adelie web design vendored in `public/brand/` (canonical repo `adelie-web-design`).

## Store links

- App Store (iOS, since 2026-11-06) and Google Play (Android, public listing confirmed 2026-11-14).
- Intro hero, FAQ and about each link both stores. App Store links follow the visitor's storefront
  by browser language (`app.js`); the Play link has no country (Play localises it).
- `/info/` (4 languages) links both stores; App Store fixed per block to kr/us/jp/cn, Play with `hl`.
- `/get/`: iPhone/iPad → App Store (storefront by language), Android → Google Play, other devices see
  both buttons in ko/en/ja/zh.

## QR

- `qr/adelie-pages-get.{png,svg}` encode https://app.adeliedraw.com/pages/get/ (app-icon disc, 5400 px).
  The image did not change when Android launched; the landing decides the store.
- `qr/adelie-draw-shop.{png,svg}` encode https://app.adeliedraw.com/shop/ (landing in eiranotes.github.io).
- `*-penguin.*` are an unused trial.

## Last QA (2026-11-14, Ego Lite, local)

`check_site.py` PASS (8 pages), `node --check` app.js/get.js. Hero at 1440/390 (no horizontal overflow),
about labels on one line at 390, `/get/` desktop ko. Redirects: Android ko → Play intent
(`com.android.vending`), iPhone ja → `apps.apple.com/jp`, iPhone en-US → `/us`. Both QR PNGs decode to
their URLs. Evidence: `QA/play-launch-20261114/` (not committed).
