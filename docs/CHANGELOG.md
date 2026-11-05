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
