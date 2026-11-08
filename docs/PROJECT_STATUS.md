# Status · 2026-09-08

Independent stationery-led introduction implemented. Original app and site untouched.
Hero, drifting pack covers, page example, 30-second reel, current app captures and brand story. No individual sticker pages (removed 2026-10-25).
Static site; no third-party runtime dependencies, tracking, account forms, or fake download CTA.
Deployment: separate eiranotes/pages-showcase repository, public/ artifact only.
Verification and deployment evidence are recorded in QA/VERIFICATION.md.
Remaining: real store destination can be added when app launch is authorized.

Live: https://app.adeliedraw.com/pages-showcase/ (HTTPS 200, verified 2026-09-08 KST).

## Copy and brand refinement

Header now uses the existing penguin app icon and exact #123F8D wordmark.
Expanded collection use suggestions, editing/keeping/sharing descriptions and four native FAQ disclosures.
Verified local desktop, 320/390px overflow, keyboard FAQ activation and pack copy switching.

## Three-site synthesis and scalable catalogue

Compared Sol, Claude and the a78459f showcase against app tokens and current assets.
The showcase now has a searchable/filterable pack grid and separate static pack pages.
Current explicit web set: Lemon 25, Home Sweet Home 39, Spring Fox 35 (99 total).
Individual previews open in a native accessible dialog. Main app screenshots scroll
horizontally on phones. LINE Seed font payload reduced from 6.36MB to 0.87MB WOFF2.
Comparison and chosen contract: THREE_SITE_ANALYSIS.md. Original sites/app unchanged.

## Drifting pack covers · 2026-10-08

Collection section replaced: 32 app pack covers (app main 895ccb61, melon parfait withdrawn and skipped) drift in two rows (onboarding-style motion). Refresh with `python3 tool/sync_pack_covers.py`.
Search/filter/card grid code and CSS removed; the three published sticker detail pages (Lemon, Home Sweet Home, Spring Fox) stay linked in one line.
QA: tool/flow_qa.mjs (widths 1440/1002/390, motion, pause, reduced motion, console) → QA/pack-flow-20261008/.
Covers of packs still in app `internalReview` are published on the user's instruction (approval to be finalized).
The 2026-09-14 kiss-cut (KC 0020–0024) detail pages are not published; the user chose not to include them.

## App Store screenshots · 2026-11-06

App section uses six App Store review screenshots (ko iPhone v4; panel 05 skipped for catalogue numbers). Pack covers: 43 from app main 379638c8.
App Store links (hero button, FAQ, about) go to the Korean URL and are rewritten to the visitor's storefront by browser language.
/info/ release status (4 languages) links to the matching storefront: kr, us, jp, cn; last updated 2026-11-06.
QA (Ego Lite, 1440/834/390): no horizontal page overflow, no broken images, 43 announced covers, flow moves and pauses; storefront per language ko-KR→kr, ja→jp, en-US→us, en-GB→gb, zh-Hant→tw, zh-CN→cn, zh-HK→hk, fr-FR→fr, de→de → QA/store-shots-20261106/.

## Store QR · 2026-11-09

QR → https://app.adeliedraw.com/pages/get/ : iOS → App Store per storefront; Android → Play once linked (now "in testing"); desktop → choices.
QR files in qr/ (PNG 2250 px, SVG), made by tool/make_store_qr.py from the app icon; decode-checked down to 132 px.
QA (Ego Lite, local): desktop ko/ja text and storefront, iPhone ko/ja/en-US/zh-TW → apps.apple.com kr/jp/us/tw → itms-appss, iPadOS desktop UA → App Store, Android → stays with "in testing" → QA/get-redirect-20261109/.

