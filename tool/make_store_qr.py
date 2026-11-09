"""Make the store QR code: https://app.adeliedraw.com/pages/get/ with the app icon's penguin disc.

The disc is cut from the app's committed icon (assets/branding/adelie_app_icon.png, read with
`git show` like sync_pack_covers.py): the white circle, the penguin and a thin ring of the icon blue.
Modules under the disc are left out rather than painted over; error correction H covers them.
Writes qr/<name>.png and .svg, then decodes the PNG at several sizes to prove it scans.
The overseas shop QR (app.adeliedraw.com/shop/, served by eiranotes.github.io) uses the same style:
  python3 tool/make_store_qr.py --url https://app.adeliedraw.com/shop/ --name adelie-draw-shop

Needs segno, Pillow and zxing-cpp (dev only, e.g. a /tmp venv). Not deployed: qr/ is outside public/.
Usage: python3 tool/make_store_qr.py [--url URL --name NAME] [--app PATH] [--ref REF]
"""
import argparse
import base64
import io
import subprocess
from pathlib import Path

import segno
import zxingcpp
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'qr'
DEFAULT_APP = Path.home() / 'HermesWorkspace/project/Adelie Pages'
ICON = 'assets/branding/adelie_app_icon.png'
URL = 'https://app.adeliedraw.com/pages/get/'
INK = '#093488'          # the icon's background blue
BORDER = 4               # quiet zone, modules
SCALE = 50               # px per module in the PNG
LOGO_RATIO = 0.30        # disc diameter / symbol width
DISC = (1023, 1044, 886)  # centre x, centre y, radius on the 2048 px icon (white circle + blue ring)


def penguin_disc(app, ref, size):
    data = subprocess.run(['git', '-C', str(app), 'show', f'{ref}:{ICON}'], check=True, capture_output=True).stdout
    icon = Image.open(io.BytesIO(data)).convert('RGB')
    x, y, r = DISC
    disc = icon.crop((x - r, y - r, x + r, y + r)).resize((size, size), Image.LANCZOS)
    mask = Image.new('L', (size * 4, size * 4))
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    disc.putalpha(mask.resize((size, size), Image.LANCZOS))
    return disc


def layout(url):
    qr = segno.make(url, error='h', micro=False, boost_error=False)
    n = len(qr.matrix)
    logo = LOGO_RATIO * n
    clear = logo / 2 + 0.6     # keep a white gap around the disc
    c = n / 2
    dark = [(col, row) for row, line in enumerate(qr.matrix) for col, bit in enumerate(line)
            if bit & 1 and ((col + .5 - c) ** 2 + (row + .5 - c) ** 2) ** .5 > clear]
    return qr, n, logo, dark


def png(disc, n, logo, dark):
    side = (n + 2 * BORDER) * SCALE
    img = Image.new('RGB', (side, side), 'white')
    draw = ImageDraw.Draw(img)
    for col, row in dark:
        x, y = (col + BORDER) * SCALE, (row + BORDER) * SCALE
        draw.rectangle((x, y, x + SCALE - 1, y + SCALE - 1), fill=INK)
    d = round(logo * SCALE)
    at = (side - d) // 2
    img.paste(disc.resize((d, d), Image.LANCZOS), (at, at), disc.resize((d, d), Image.LANCZOS))
    return img


def svg(disc, n, logo, dark, url):
    side = n + 2 * BORDER
    path = ''.join(f'M{col + BORDER} {row + BORDER}h1v1h-1z' for col, row in dark)
    buf = io.BytesIO()
    disc.save(buf, 'PNG', optimize=True)
    href = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    at = (side - logo) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {side} {side}" shape-rendering="crispEdges">'
            f'<title>{url}</title><rect width="{side}" height="{side}" fill="#fff"/>'
            f'<path fill="{INK}" d="{path}"/>'
            f'<image xlink:href="{href}" x="{at:.3f}" y="{at:.3f}" width="{logo:.3f}" height="{logo:.3f}"/></svg>\n')


def check(img, url):
    for width in (img.width, 600, 240, 132):
        small = img.resize((width, width), Image.LANCZOS)
        for label, probe in (('sharp', small), ('blur', small.filter(ImageFilter.GaussianBlur(width / 400)))):
            found = [r.text for r in zxingcpp.read_barcodes(probe)]
            assert found == [url], (width, label, found)
    print(f'scan OK at {img.width}/600/240/132 px, sharp and blurred')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--app', type=Path, default=DEFAULT_APP)
    parser.add_argument('--ref', default='main')
    parser.add_argument('--url', default=URL)
    parser.add_argument('--name', default='adelie-pages-get')
    args = parser.parse_args()
    qr, n, logo, dark = layout(args.url)
    disc = penguin_disc(args.app, args.ref, 1024)
    OUT.mkdir(exist_ok=True)
    img = png(disc, n, logo, dark)
    img.save(OUT / f'{args.name}.png', optimize=True)
    (OUT / f'{args.name}.svg').write_text(svg(disc, n, logo, dark, args.url))
    print(f'{args.url} -> version {qr.version}-{qr.error}, {n}x{n} modules, disc {logo:.1f} modules, {img.width}px PNG')
    check(img, args.url)


if __name__ == '__main__':
    main()
