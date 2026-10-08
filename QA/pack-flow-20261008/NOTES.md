# Pack cover flow QA · 2026-10-08

Tool: `node tool/flow_qa.mjs QA/pack-flow-20261008` (Playwright headless shell, local `public/`).

- Covers: 32 from app main 895ccb61 via tool/sync_pack_covers.py (withdrawn melon parfait skipped).
- 1440 / 1002 / 390 px: horizontal overflow 0, 32 covers announced once (repeats hidden),
  broken images 0, rows drift in opposite directions (≈40 / 30 / 23 px/s), console errors 0.
- Pause: toggle pauses and resumes both rows (label and `aria-pressed` switch), hover pauses and
  leaving resumes. Judged by animation `playState`; an idle headless page may not advance animation
  time, so an earlier position-sampling version gave a false "not resumed".
  The final run (merged onto origin/main with the shared Adelie web design) checks playState and reported runningAtStart / pausedByToggle / resumed /
  pausedByHover / resumedAfterHover all true.
- Reduced motion (390 px): rows still, 32 covers (one copy), horizontally scrollable, toggle hidden.
- Review videos (kept outside git): `flow-1440.mp4` (8 s) and `flow-390.mp4` (6 s), rendered by stepping each animation's
  `currentTime` at 30 fps, so their speed matches the real page, including the row entrance.

Not covered: real iOS/Android devices, Safari/Firefox rendering of the CSS `mask` foil sweep.
