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
