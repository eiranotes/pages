"""Generate an unpublished 18-pack stress fixture using the production renderer."""
import sys,json,copy
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from build_site import ROOT,catalog
source=json.loads((ROOT/'content/packs.json').read_text())
packs=[]
for i in range(18):
    pack=copy.deepcopy(source[i%len(source)])
    pack['name']=f"확장검수{i+1:02d} · {pack['name']}"
    packs.append(pack)
html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="../public/"><title>QA only: 18 packs</title><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head><body><h1>배포하지 않는 18팩 확장 검수</h1>'+catalog(packs)+'</body></html>'
(ROOT/'QA/catalog-scale.html').write_text(html)
print('QA-only scale fixture generated; serve repository root, not public/')
