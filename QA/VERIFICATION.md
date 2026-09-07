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
