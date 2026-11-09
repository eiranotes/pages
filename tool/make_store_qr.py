"""Make the store QR code: https://app.adeliedraw.com/pages/get/ with the app icon's penguin disc.

The disc is cut from the app's committed icon (assets/branding/adelie_app_icon.png, read with
`git show` like sync_pack_covers.py): the white circle, the penguin and a thin ring of the icon blue.
Modules under the disc are left out rather than painted over; error correction H covers them.
Writes qr/<name>.png and .svg, then decodes the PNG at several sizes to prove it scans.
The overseas shop QR (app.adeliedraw.com/shop/, served by eiranotes.github.io) uses the same style:
  python3 tool/make_store_qr.py --url https://app.adeliedraw.com/shop/ --name adelie-draw-shop

Needs segno, Pillow and zxing-cpp (dev only, e.g. a /tmp venv). Not deployed: qr/ is outside public/.
Another logo: --logo a transparent PNG; modules are left out along its silhouette (plus MARGIN).
Usage: python3 tool/make_store_qr.py [--url URL --name NAME] [--logo PNG --logo-ratio R --ink HEX]
                                     [--app PATH] [--ref REF]
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
SCALE = 120              # px per module in the PNG (5400 px for the app QR)
LOGO_RATIO = 0.30        # logo width / symbol width
MARGIN = 0.6             # white gap around the logo, modules
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


def custom_logo(path):
    """A transparent image, padded to a centred square; its silhouette decides which modules go."""
    img = Image.open(path).convert('RGBA')
    img = img.crop(img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
    side = max(img.size)
    square = Image.new('RGBA', (side, side))
    square.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    return square


def layout(url, logo_img, ratio):
    """Leave out every module the logo (grown by MARGIN modules) touches, so no cut modules show."""
    qr = segno.make(url, error='h', micro=False, boost_error=False)
    n = len(qr.matrix)
    logo, k = ratio * n, 20
    canvas = Image.new('L', (n * k, n * k))
    size = round(logo * k)
    canvas.paste(logo_img.getchannel('A').resize((size, size), Image.LANCZOS), ((n * k - size) // 2,) * 2)
    grow = 2 * round(MARGIN * k) + 1
    canvas = canvas.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(grow))
    dark = [(col, row) for row, line in enumerate(qr.matrix) for col, bit in enumerate(line)
            if bit & 1 and not canvas.crop((col * k, row * k, (col + 1) * k, (row + 1) * k)).getextrema()[1]]
    return qr, n, logo, dark


def png(logo_img, n, logo, dark, ink, scale=SCALE):
    side = (n + 2 * BORDER) * scale
    img = Image.new('RGB', (side, side), 'white')
    draw = ImageDraw.Draw(img)
    for col, row in dark:
        x, y = (col + BORDER) * scale, (row + BORDER) * scale
        draw.rectangle((x, y, x + scale - 1, y + scale - 1), fill=ink)
    d = round(logo * scale)
    at = (side - d) // 2
    scaled = logo_img.resize((d, d), Image.LANCZOS)
    img.paste(scaled, (at, at), scaled)
    return img


def svg(logo_img, n, logo, dark, url, ink):
    side = n + 2 * BORDER
    path = ''.join(f'M{col + BORDER} {row + BORDER}h1v1h-1z' for col, row in dark)
    buf = io.BytesIO()
    logo_img.save(buf, 'PNG', optimize=True)
    href = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    at = (side - logo) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {side} {side}" shape-rendering="crispEdges">'
            f'<title>{url}</title><rect width="{side}" height="{side}" fill="#fff"/>'
            f'<path fill="{ink}" d="{path}"/>'
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
    parser.add_argument('--logo', type=Path, help='transparent image instead of the app icon disc')
    parser.add_argument('--logo-ratio', type=float, default=LOGO_RATIO)
    parser.add_argument('--ink', default=INK)
    parser.add_argument('--scale', type=int, default=SCALE, help='PNG px per module')
    args = parser.parse_args()
    logo_img = custom_logo(args.logo) if args.logo else penguin_disc(args.app, args.ref, 2 * DISC[2])
    qr, n, logo, dark = layout(args.url, logo_img, args.logo_ratio)
    OUT.mkdir(exist_ok=True)
    img = png(logo_img, n, logo, dark, args.ink, args.scale)
    img.save(OUT / f'{args.name}.png', optimize=True)
    (OUT / f'{args.name}.svg').write_text(svg(logo_img, n, logo, dark, args.url, args.ink))
    print(f'{args.url} -> version {qr.version}-{qr.error}, {n}x{n} modules, logo {logo:.1f} modules, {img.width}px PNG')
    check(img, args.url)


if __name__ == '__main__':
    main()
