# Verification · 2026-09-08

- PASS: `python3 check_site.py`: asset/font references, internal anchors, unique IDs,
  single h1, img alt presence, all three collection image references.
- PASS: `node --check public/app.js`.
- Codex in-app browser: desktop hero checked visually; 390x844 hero checked;
  320x740 collection checked; 320 and 390 document scrollWidth equal viewport width.
- Click Home Sweet Home changed main image to living-room.webp.
- Enter on Spring Fox changed aria-pressed to true.
- Home collection hides the unrelated penguin accent; hero uses it as brand art.
- No broken loaded images or browser warning/error logs during the local run.
- A full-page browser capture produced stitching duplicates; excluded from visual
  evidence. Viewport captures and live DOM were used for verification.
- No physical-device or app-release checks: this task only changes the standalone site.

## Deployment

Actions run 34167129698 passed; HTTPS returned HTTP/2 200.
Live browser verified the correct heading and no broken loaded images.
URL: https://app.adeliedraw.com/pages-showcase/

## Copy and header refinement

PASS: static checker, JS syntax, diff whitespace check.
Desktop screenshot confirms app icon and indigo title; computed title color rgb(18,63,141).
320px and 390px document widths match the viewport; 320px header inspected visually.
Enter opens the saved-page FAQ; Spring Fox selection shows its expanded description.

## Three-site synthesis and catalogue

- Compared Sol local HTML/CSS/JS, Claude live HTML/CSS/JS and prior showcase a78459f.
  Reference screenshots and snapshot source are in comparison/; analysis is in docs.
- `python3 check_site.py`: PASS for four pages, three packs, 99 stickers, every local image/font/link,
  cross-page anchors, unique IDs and exact generated-data consistency.
- `node --check public/app.js`: PASS.
- Search 고양이 → one pack; combine 꽃·자연 → zero; reset → all three.
- 18-pack QA fixture: initial six, more → twelve, more → eighteen; unique query → one.
  Fixture generator is tracked; fixture output is ignored and outside public/.
- Lemon, Home and Fox open correct 25/39/35-member pages and their own enlarged artwork.
- Next updates image/name/count; first previous and last next disabled; Esc restores trigger focus.
- Sticker-name search empty state and reset work. Native links provide non-JS fallback.
- 390px main and detail: no horizontal document overflow, 2-column packs / 3-column stickers.
  320px main and detail: no horizontal document overflow. Mobile dialog inspected visually.
- Font subsets retain full Korean ranges according to upstream public README; 6.36MB → 0.87MB.
- The source export uses only exact currently showcased app pack members, with source hashes in
  catalog-provenance.json. No runtime catalog, source-only pack or app release changes.
- 768px pack/detail document widths match the viewport; main grid resolves to two 340px columns.
