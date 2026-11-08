# Decisions · 2026-09-08

User requested an independent introduction and deployment while preserving existing work.
Use a separate repository and Pages route; do not replace eiranotes/pages or site/sol.
Use active app colors and LINE Seed from the app contract. Native CSS and JS keep the
static introduction independent of app architecture and avoid new production dependencies.
Use only existing illustration derivatives, page examples and non-personal QA app captures.
Do not claim store availability, paid product pricing or planned cloud features.
Existing pack approvals and rights are not changed by this marketing implementation.

Header refinement: reuse the already-published app-icon.webp without recoloring artwork.
The wordmark uses the app indigo token. On narrow screens, navigation moves below the brand.
Detailed copy explains current on-device editing and image sharing; it does not promise cloud sync or downloadable templates.

## Store QR landing · 2026-11-09

User asked for one QR code that opens the right store on any phone, with the app icon's penguin in
the middle. The QR encodes `https://app.adeliedraw.com/pages/get/` (`public/get/`, noindex).
Path, not a subdomain: `app.adeliedraw.com` is the only name pointed at GitHub Pages; every other
`*.adeliedraw.com` (get/go/pages…) is caught by a cafe24 wildcard and lands on the shop, so a
subdomain needs a DNS change plus its own Pages repo for no gain (the QR stays version 5 either way).
`get.js` sends iPhone/iPad (including iPadOS desktop UA) to the App Store link `app.js` has already
moved to the visitor's storefront; Apple's page then opens the App Store app. Android redirects
only when the page carries `a[data-play-store]` (the Play URL is commented in place; Play returns 404
until release); until then Android and desktop see the choices in ko/en/ja/zh.
The country-less `apps.apple.com/app/id…` was rejected: Apple sends it to `us`.
QR art: no generated image. `tool/make_store_qr.py` cuts the white circle (with a thin ring of icon
blue) from the app's committed icon, leaves out the modules beneath it (error correction H) and
decodes the result at 132–2250 px. Outputs live in `qr/`, outside the deployed `public/`.

## App Store screenshots and release wording · 2026-11-06

User asked to replace the in-development app captures with the screenshots submitted to App Store
review. The app section now shows the Korean iPhone set (v4, MD5 equal to App Store Connect's
`APP_IPHONE_67` ko set) as one sideways-scrolling row of 660×1434 WebP derivatives. Panel 05
("아델리 오리지널 스티커 800+", "무료 팩 11종") is left out because the site keeps catalogue
numbers out of copy (2026-10-25 rule); the other six are used unchanged.
Release wording and store link: the iOS app is on sale in 175 territories (App Store Connect) and
its public page loads (checked kr/us/jp/tw/cn/gb/fr/de/hk, 2026-11-06 afternoon; it returned 404 that
morning). This supersedes "do not claim store availability". The hero's primary button, the FAQ
answer and the about label link to the user-given Korean URL; `app.js` rewrites the storefront from
the browser language so visitors land in their own country's store (Apple redirects storefronts it
does not run to `us`, so no allowlist is kept). Android is described as in testing; no Play link.
The /info/ page is static per language block, so its links are fixed to kr/us/jp/cn (zh block is zh-CN).
The privacy policy still calls the app "공개 준비 중"; legal text is left for a separate review.
Pack covers were resynced to app main 379638c8: 43 covers (stained glass sets v1/v2 replaced by
kc_0014–0024, stay home and food review added). No cover has a foil mask any more.

## No individual sticker pages · 2026-10-25

User asked to remove per-sticker viewing because it lets visitors copy the artwork. The three
pack pages (lemon, home, fox), their sticker thumbnails/previews, `content/packs.json` and the
sticker dialog are deleted; `check_site.py` fails if `public/packs/` or `public/assets/catalog/`
return. The main page shows only the drifting pack covers. This supersedes the earlier
"static page per pack" catalogue decision.

## Drifting pack covers · 2026-10-08

User asked to stop listing every pack and to let the app's pack covers flow like the onboarding
motion. The cover set is the app catalogue (`assets/catalogs/pack_catalog.json`) at a committed
ref, read with `git show` by `tool/sync_pack_covers.py` (default `main`; never a working tree,
whose branch other sessions may move). Packs with publication status `withdrawn` are skipped;
order follows the catalogue's sortOrder. First sync: app main 895ccb61, 33 packs, 32 shown.
`content/pack_covers.json` records each source path and SHA-256.
Covers are 480×600 WebP derivatives of the bundled originals; the v2 foil mask is reused for a
CSS foil sweep. The section is pure CSS animation (no library); each row repeats its covers twice
and moves by one copy for a seamless loop. Only the first copy is in the accessibility tree.
A pause control satisfies moving-content guidance (WCAG 2.2.2).
Publishing covers does not change pack approvals, rights status or store availability; most
packs are still `internalReview` in the app catalogue.
