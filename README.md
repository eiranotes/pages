# Adelie Pages showcase

Independent app introduction designed around Adelie Draw digital stationery.
The original app and eiranotes/pages website remain unchanged.

Run `python3 -m http.server 8876 --directory public`.
Validate `python3 check_site.py` and `node --check public/app.js`.
GitHub Actions publishes only `public/`. No package installation or build step.

Design: white pressed paper, #123F8D indigo, LINE Seed Sans KR, 2px control radii.
Existing brand artwork supplies color; no generated art or simulated app screenshots.
Pack links and sticker previews support mouse, touch, and native keyboard activation.
Images are WebP derivatives. LINE Seed fonts include their full original OFL notice.

This is an app introduction, not an app release. Store links are not available.
See docs for scope and checks. Artwork remains owned by Adelie Draw; no reuse license is granted.

## Catalogue publishing

`content/packs.json` explicitly lists the web packs and every sticker. There is no automatic
scan of the app's production folders. Add a named pack and its web assets intentionally,
then run `python3 build_site.py` and `python3 check_site.py`. Commit the generated
`public/index.html` catalogue region and `public/packs/*.html` along with their inputs.
The checker rejects stale rendered content, missing images and unlisted detail pages.

Use 240px transparent WebP thumbnails and previews no larger than 960px. Keep exact
names, membership and source hashes in `QA/catalog-provenance.json`. Do not put masters,
source-only packs or private approval records in `public/`. Adding a web pack does not
change app integration, store products or rights status.

The collection is a 3/2/1-column grid with search, topic filtering and six-at-a-time
expansion. Each pack gets a standalone URL. Sticker links work without JS; JS opens
an accessible native dialog with previous/next, Escape, and focus return.

To reproduce the 18-pack scale check, run `python3 tool/build_qa_fixture.py`, serve the
repository root locally and open `QA/catalog-scale.html`. The fixture is never deployed:
GitHub Actions only uploads `public/`.

The LINE Seed WOFF2 files reuse the Korean-inclusive subsets published by eiranotes/pages.
Their source URLs and hashes are in ASSET_SOURCES.json; the original OFL stays bundled.
See [three-site audit](docs/THREE_SITE_ANALYSIS.md) for the design comparison and contract.
