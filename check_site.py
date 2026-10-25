"""Validate every static page, its anchors, brand files and the generated cover flow."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
from urllib.parse import urlsplit, unquote
import hashlib
from build_site import catalog, load_covers
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
        if url.path.startswith('/pages/'):target=(PUBLIC/unquote(url.path[len('/pages/'):])).resolve()
        else:target=(path.parent/unquote(url.path)).resolve() if url.path else path
        assert target.is_relative_to(PUBLIC.resolve()),ref
        if target.is_dir(): target=(target/'index.html').resolve()
        assert target.is_file(),(path,ref)
        if url.fragment and target in pages:assert unquote(url.fragment) in pages[target].ids,(path,ref)
for path in [*PUBLIC.glob('*.css'),*(PUBLIC/'brand').glob('*.css')]:
    for ref in re.findall(r"url\(['\"]?([^)'\"]+)",path.read_text()):assert (path.parent/ref).is_file(),ref
brand=json.loads((PUBLIC/'brand/MANIFEST.json').read_text())
for name,digest in brand['files'].items():
    assert hashlib.sha256((PUBLIC/'brand'/name).read_bytes()).hexdigest()==digest,('Edited vendored brand file; sync from adelie-web-design',name)
for path,page in pages.items():
    assert path.name=='404.html' or 'aria-current="page">Apps</a>' in path.read_text(),('Brand bar missing',path)
main=(PUBLIC/'index.html').read_text()
assert main.split('<!-- CATALOG START -->\n')[1].split('\n<!-- CATALOG END -->')[0]==catalog(load_covers()),'Rebuild stale main catalogue'
assert not (PUBLIC/'packs').exists() and not (PUBLIC/'assets/catalog').exists(),'Per-sticker pages are withdrawn'
print(f'PASS: {len(pages)} pages; links, images, fonts, anchors, brand copy and generated cover flow')
