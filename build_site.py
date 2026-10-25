"""Render the main page's drifting pack-cover rows from content/pack_covers.json."""
import json
from html import escape as e
from pathlib import Path
ROOT=Path(__file__).parent

COPIES=2  # one row = the list twice; CSS moves it by exactly one copy for a seamless loop (one copy is wider than any screen)

def cover(c,copy):
    # Only the first copy is announced; the repeats exist for the loop and stay out of the a11y tree.
    alt=f"{c['name']} 표지" if copy==0 else ''
    foil=f'<span class="cover-foil" style="--foil:url({e(c["foil"])})"></span>' if c.get('foil') else ''
    return f'''<li class="flow-cover"{' aria-hidden="true"' if copy else ''}><img src="{e(c['cover'])}" width="480" height="600" alt="{e(alt)}" decoding="async">{foil}</li>'''

def flow_row(covers,direction):
    return f'''<ul class="flow-row" data-direction="{direction}" style="--count:{len(covers)}">{''.join(cover(c,k) for k in range(COPIES) for c in covers)}</ul>'''

def catalog(covers):
    half=(len(covers)+1)//2
    return f'''<section class="collection" id="collection" aria-labelledby="collection-title">
<div class="section-top wrap"><div><p class="eyebrow">The sticker collection</p><h2 id="collection-title">좋아하는 그림을,<br>한 팩씩 만나보세요.</h2></div><p>앱 안에는 다양한 스티커팩이 준비되어 있어요.<br>천천히 흘러가는 표지 사이에서 마음에 드는 그림을 찾아보세요.</p></div>
<div class="pack-flow" id="pack-flow" role="group" aria-label="Adelie Pages 팩 표지">
{flow_row(covers[:half],'left')}
{flow_row(covers[half:],'right')}
</div>
<div class="flow-foot wrap"><button type="button" class="flow-toggle" id="flow-toggle" aria-pressed="false" data-enhanced hidden>흐름 멈추기</button></div>
<p class="catalog-footnote wrap">개발 중인 앱에 담긴 팩 표지예요. 출시 때 구성은 달라질 수 있어요.</p>
</section>'''

def load_covers():
    covers=json.loads((ROOT/'content/pack_covers.json').read_text())['covers']
    assert covers and len({c['id'] for c in covers})==len(covers)
    for c in covers:
        for field in ('cover','foil'):
            if field in c:assert (ROOT/'public'/c[field]).is_file(),c[field]
    return covers

def build():
    covers=load_covers()
    path=ROOT/'public/index.html';s=path.read_text();start='<!-- CATALOG START -->';end='<!-- CATALOG END -->'
    assert start in s and end in s
    path.write_text(s.split(start)[0]+start+'\n'+catalog(covers)+'\n'+end+s.split(end)[1])
    print(f"Built {len(covers)} flowing covers")
if __name__=='__main__':build()
