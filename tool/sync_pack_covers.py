"""Mirror the app's pack covers into public/assets/covers/ and content/pack_covers.json.

Reads a committed ref of the Adelie Pages app (default: main) with `git show`, so the result does
not depend on whichever branch a working tree has checked out. Packs whose publication status is
`withdrawn` are skipped; order follows the app catalogue's sortOrder. Covers become 480x600 WebP;
a pack's `pack_cover_foil.webp` mask is mirrored too. Covers no longer listed are removed.

Usage: python3 tool/sync_pack_covers.py [--app PATH] [--ref REF]
"""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COVERS = ROOT / 'public/assets/covers'
DEFAULT_APP = Path.home() / 'HermesWorkspace/project/Adelie Pages'


def git_bytes(app, ref, path):
    return subprocess.run(['git', '-C', str(app), 'show', f'{ref}:{path}'], check=True, capture_output=True).stdout


def git_has(app, ref, path):
    return subprocess.run(['git', '-C', str(app), 'cat-file', '-e', f'{ref}:{path}'], capture_output=True).returncode == 0


def derive(data, target, quality):
    with tempfile.NamedTemporaryFile(suffix='.webp') as source:
        source.write(data)
        source.flush()
        subprocess.run(['magick', source.name, '-resize', '480x600', '-quality', str(quality),
                        '-define', 'webp:method=6', '-define', 'webp:alpha-quality=80', str(target)], check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--app', type=Path, default=DEFAULT_APP)
    parser.add_argument('--ref', default='main')
    args = parser.parse_args()
    commit = subprocess.run(['git', '-C', str(args.app), 'rev-parse', '--short', args.ref], check=True, capture_output=True, text=True).stdout.strip()
    items = json.loads(git_bytes(args.app, args.ref, 'assets/catalogs/pack_catalog.json'))['items']
    sha = lambda data: hashlib.sha256(data).hexdigest()
    COVERS.mkdir(parents=True, exist_ok=True)
    covers, skipped = [], []
    for item in sorted(items, key=lambda x: x['sortOrder']):
        if (item.get('publication') or {}).get('status') == 'withdrawn':
            skipped.append(item['packId'])
            continue
        source = item['coverImage']
        cover_id = source.split('/')[2]
        data = git_bytes(args.app, args.ref, source)
        target = COVERS / f'{cover_id}.webp'
        derive(data, target, 82)
        entry = {'id': cover_id, 'packId': item['packId'], 'name': item['displayName']['ko'],
                 'english': item['displayName'].get('en', ''), 'category': item['category'],
                 'cover': f'assets/covers/{cover_id}.webp', 'source': source,
                 'sourceSha256': sha(data), 'sha256': sha(target.read_bytes())}
        foil_source = source.replace('pack_cover.webp', 'pack_cover_foil.webp')
        if foil_source != source and git_has(args.app, args.ref, foil_source):
            foil_data = git_bytes(args.app, args.ref, foil_source)
            foil = COVERS / f'{cover_id}-foil.webp'
            derive(foil_data, foil, 80)
            entry.update(foil=f'assets/covers/{cover_id}-foil.webp', foilSource=foil_source,
                         foilSourceSha256=sha(foil_data), foilSha256=sha(foil.read_bytes()))
        covers.append(entry)
    keep = {Path(c[k]).name for c in covers for k in ('cover', 'foil') if k in c}
    for stale in COVERS.glob('*.webp'):
        if stale.name not in keep:
            stale.unlink()
    (ROOT / 'content/pack_covers.json').write_text(json.dumps({
        'note': 'Pack covers mirrored from the Adelie Pages app catalogue (assets/catalogs/pack_catalog.json) by tool/sync_pack_covers.py. Withdrawn packs are skipped.',
        'appRef': args.ref, 'appCommit': commit, 'skippedWithdrawn': skipped, 'covers': covers,
    }, ensure_ascii=False, indent=2) + '\n')
    print(f'{len(covers)} covers from {args.ref} ({commit}); skipped withdrawn: {", ".join(skipped) or "none"}')


if __name__ == '__main__':
    main()
