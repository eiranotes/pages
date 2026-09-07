#!/usr/bin/env python3
"""Verify that every relative asset referenced by the site exists.

The site is served from a subpath (app.adeliedraw.com/adeliepages/), so every
local reference must stay relative. This gate fails on both missing files and
absolute-rooted paths that would break under a subpath.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent
REFERENCE = re.compile(r'(?:src|href)="([^"]+)"')
CSS_URL = re.compile(r'url\("?([^")]+)"?\)')
SKIP_PREFIXES = ("http://", "https://", "//", "#", "mailto:", "data:")


def check(path: Path, pattern: re.Pattern[str]) -> list[str]:
    problems: list[str] = []
    for raw in pattern.findall(path.read_text(encoding="utf-8")):
        ref = raw.split("?", 1)[0].split("#", 1)[0]
        if not ref or ref.startswith(SKIP_PREFIXES):
            continue
        if ref.startswith("/"):
            problems.append(f"{path.relative_to(SITE)}: absolute path {raw!r}")
            continue
        if not (path.parent / ref).resolve().exists():
            problems.append(f"{path.relative_to(SITE)}: missing {raw!r}")
    return problems


def main() -> int:
    problems: list[str] = []
    for html in sorted(SITE.rglob("*.html")):
        problems += check(html, REFERENCE)
    for css in sorted(SITE.rglob("*.css")):
        problems += check(css, CSS_URL)

    if problems:
        for problem in problems:
            print(problem, file=sys.stderr)
        return 1

    print("site: all relative references resolve")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
