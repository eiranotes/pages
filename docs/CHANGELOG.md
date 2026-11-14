# Changelog

## 2026-09-08

Added stationery-led Korean introduction with real Adelie artwork, interactive collection
selector, example page, app screenshots and responsive typography. Added independent
GitHub Pages deployment with static validation. Preserved original app and website.

### More detailed introduction and app branding

Added the penguin app icon and indigo header title. Expanded all three collection descriptions,
page-making guidance and app captions; added four keyboard-accessible FAQ disclosures.

### Browse packs and individual stickers

Replaced the single-pack selector with a searchable, filterable collection grid. Added full
25/39/35-item pack pages, sticker-name search, individual enlargement and previous/next controls.
Refined heading spacing, shortened mobile app-gallery scrolling and switched LINE Seed to WOFF2.

## 2026-10-07 · Shared Adelie web design

- Adopted the shared design from `adelie-web-design`: brand bar (binder index tabs, Apps current), shared footer with penguin cameo, shared 404, `--ad-*` tokens with legacy aliases.
- Eyebrows are 12px / bold / indigo; hero and section headings use the shared type scale; page width follows the shared content width and gutter.
- Legal pages: shared tokens, brand bar per locale block, no text below 12px except the lock-up subtitle; the AA-failing `--quiet` grey now maps to `--ad-ink-3`.
- Hero playground: the flower, lemon and penguin stickers in the hero can be dragged (mouse/touch) or moved with arrow keys and stuck anywhere on the desk; "처음 자리로" restores the composition. Without JS the hero is unchanged.

## 2026-10-08

### Pack covers drift instead of a listed grid

The collection section no longer lists packs with search, topic filters and cards. The app's
32 pack covers (app main 895ccb61, withdrawn packs excluded) drift past in two opposite rows, as in the app onboarding's closing scene.
Covers tilt slightly like placed stickers, the Stained Glass Set v2 cover carries its own foil
sweep, and the rows slide in when the section enters view. Motion pauses on hover/focus,
off screen and with a "흐름 멈추기" button; reduced-motion readers get a still, scrollable row.
Per-pack sticker pages stay reachable from a single line of links below the covers.

## 2026-11-06

### App Store screenshots and current release wording

The "Inside Adelie Pages" section shows six of the App Store screenshots in one sideways-scrolling
row (about four at a time on desktop, a peek of the next panel on tablet and phone). The three
in-development captures and their gallery CSS are removed.
Copy no longer says the app is in development. The hero now leads with "App Store에서 받기"
(the sticker link becomes a text link beside it); the FAQ answer and the about label link to the
App Store too, each opening the visitor's own storefront by browser language. Android is in testing.
The app information page (/info/) replaces the September "preparing release" paragraph in all four
languages with an App Store link to that language's storefront (ko→kr, en→us, ja→jp, zh-CN→cn).
Pack covers resynced to the app catalogue: 43 covers.

## 2026-11-09 · Store QR

- New `/pages/get/` landing for the QR code: iPhone and iPad go straight to their country's App Store; Android will go to Google Play once the link is added; other devices see App Store, the Android status and the intro link in ko/en/ja/zh.
- `qr/adelie-pages-get.png` (2250 px) and `.svg` (vector modules) with the app icon's penguin disc in the centre; rebuild with `tool/make_store_qr.py`.
- Overseas shop QR `qr/adelie-draw-shop.png`/`.svg` in the same style, pointing at `app.adeliedraw.com/shop/` (Japan → jp.adeliedraw.com, others → en.adeliedraw.com). The tool takes `--url` and `--name`.
- Penguin variants `qr/adelie-pages-get-penguin.*` and `qr/adelie-draw-shop-penguin.*`: the user's wing-spread penguin in the centre, modules cleared along its outline, penguin navy #273777. The tool gained `--logo`, `--logo-ratio` and `--ink`; the icon-disc QRs were regenerated with the shared silhouette rule (same URLs, a few edge modules differ).
- Canonical QRs are the app-icon disc versions for both the app and the shop, now 5400/4920 px (`--scale`, default 120 px/module) with the disc at native icon resolution.

## 2026-11-14 · Google Play

- Google Play links next to every App Store link: hero button, FAQ answer, about label and /info/ (4 languages).
- Copy says the app runs on iPhone, iPad and Android; the "Android is in testing" lines are gone.
- `/get/` (the QR landing) now sends Android phones to Google Play and shows both store buttons, of equal width, elsewhere. The QR image is unchanged.
- Privacy policy (ko): "현재 공개 준비 중인 앱" → "현재 출시된 앱", matching the other languages. Effective date unchanged.
