"""Validate every static page, its anchors, and the explicit published catalogue."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
from urllib.parse import urlsplit, unquote
from build_site import catalog, detail
ROOT=Path(__file__).parent
PUBLIC=ROOT/'public'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=[]; self.h1=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='img':assert 'alt' in a, 'Image alt missing'
        for key in ('src','href'):
            if key in a:self.refs.append(a[key])
pages={}
for path in PUBLIC.rglob('*.html'):
    page=Page();page.feed(path.read_text());pages[path.resolve()]=page
    legal = path.parent.name in {'privacy','support','terms','data','info'}
    assert page.h1==(4 if legal else 1), (path,page.h1)
    assert len(page.ids)==len(set(page.ids)), path
for path,page in pages.items():
    for ref in page.refs:
        url=urlsplit(ref)
        if url.scheme or url.netloc:continue
        target=(path.parent/unquote(url.path)).resolve() if url.path else path
        assert target.is_relative_to(PUBLIC.resolve()),ref
        if target.is_dir(): target=(target/'index.html').resolve()
        assert target.is_file(),(path,ref)
        if url.fragment and target in pages:assert unquote(url.fragment) in pages[target].ids,(path,ref)
for path in PUBLIC.glob('*.css'):
    for ref in re.findall(r"url\(['\"]?([^)'\"]+)",path.read_text()):assert (path.parent/ref).is_file(),ref
packs=json.loads((ROOT/'content/packs.json').read_text())
assert len({p['slug'] for p in packs})==len(packs)
for pack in packs:
    assert (PUBLIC/'packs'/f"{pack['slug']}.html").read_text()==detail(pack), 'Rebuild stale detail page'
    for sticker in pack['stickers']:
        for key in ('thumb','image'):assert (PUBLIC/sticker[key]).is_file(),sticker[key]
main=(PUBLIC/'index.html').read_text()
assert main.split('<!-- CATALOG START -->\n')[1].split('\n<!-- CATALOG END -->')[0]==catalog(packs),'Rebuild stale main catalogue'
assert {p.name for p in (PUBLIC/'packs').glob('*.html')}=={f"{p['slug']}.html" for p in packs},'Unlisted detail page'
print(f'PASS: {len(pages)} pages, {len(packs)} packs, {sum(len(p["stickers"]) for p in packs)} stickers; links, images, fonts, anchors and generated content')
