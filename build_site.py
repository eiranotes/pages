"""Render public pack cards and detail pages from the explicit web publishing list."""
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

def catalog(packs,covers):
    half=(len(covers)+1)//2
    details=' '.join(f'<a href="packs/{e(p["slug"])}.html">{e(p["name"])}</a>' for p in packs)
    return f'''<section class="collection" id="collection" aria-labelledby="collection-title">
<div class="section-top wrap"><div><p class="eyebrow">The sticker collection</p><h2 id="collection-title">좋아하는 그림을,<br>한 팩씩 만나보세요.</h2></div><p>앱 안에는 지금 {len(covers)}개의 팩이 준비되어 있어요.<br>천천히 흘러가는 표지 사이에서 마음에 드는 그림을 찾아보세요.</p></div>
<div class="pack-flow" id="pack-flow" role="group" aria-label="Adelie Pages 팩 표지 {len(covers)}개">
{flow_row(covers[:half],'left')}
{flow_row(covers[half:],'right')}
</div>
<div class="flow-foot wrap"><p class="flow-details"><span>스티커를 한 장씩 보기</span> {details}</p><button type="button" class="flow-toggle" id="flow-toggle" aria-pressed="false" data-enhanced hidden>흐름 멈추기</button></div>
<p class="catalog-footnote wrap">개발 중인 앱에 담긴 팩 표지예요. 출시 때 구성은 달라질 수 있어요.</p>
</section>'''

def detail(p):
    thumbs=''.join(f'''<li class="sticker-cell" data-name="{e(s['name'])}"><a class="sticker-link" href="../{e(s['image'])}" data-name="{e(s['name'])}"><span class="sticker-thumb"><img src="../{e(s['thumb'])}" width="240" height="240" loading="lazy" alt=""></span><span>{e(s['name'])}</span></a></li>''' for s in p['stickers'])
    hero=''.join(f'<img src="../{e(s["image"])}" width="360" height="360" alt="{e(s["name"])}">' for s in p['stickers'][:3])
    example=f'<a class="text-link" href="{p["example"]}">이 팩으로 꾸민 페이지 보기 <span aria-hidden="true">↗</span></a>' if p.get('example') else ''
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(p['name'])} · Adelie Pages</title><meta name="description" content="{e(p['description'])}"><meta name="theme-color" content="#F8F8F8"><link rel="icon" href="../assets/app-icon.webp"><link rel="preload" href="../brand/fonts/LINESeedKR-Rg.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="../brand/adelie-web.css"><link rel="stylesheet" href="../style.css"><script src="../brand/adelie-web.js" defer></script><script src="../app.js" defer></script></head>
<body class="pack-page"><a class="skip" href="#main">본문으로 건너뛰기</a>
<nav class="ad-brandbar" aria-label="Adelie Draw"><div class="ad-brandbar__inner"><ul class="ad-brandbar__list"><li><a class="ad-brandbar__tab ad-brandbar__home" href="https://adeliedraw.com/">Adelie Draw</a></li><li><a class="ad-brandbar__tab" href="https://info.adeliedraw.com/">Info</a></li><li><a class="ad-brandbar__tab" href="https://shop.adeliedraw.com/">Shop</a></li><li><a class="ad-brandbar__tab" href="https://app.adeliedraw.com/" aria-current="page">Apps</a></li></ul></div></nav>
<header class="header wrap"><a class="wordmark" href="../index.html" aria-label="Adelie Pages 처음으로"><img class="brand-icon" src="../assets/app-icon.webp" width="44" height="44" alt=""><span class="brand-type">Adelie Pages<small>by Adelie Draw</small></span></a><a class="return-link" href="../index.html#collection">← 모든 스티커팩</a></header>
<main id="main" class="wrap"><section class="pack-intro" aria-labelledby="pack-title"><div class="pack-intro-art">{hero}</div><div class="pack-intro-copy"><p class="eyebrow">{e(p['english'])}</p><h1 id="pack-title">{e(p['name'])}</h1><p class="detail-count">스티커 {len(p['stickers'])}개 <span>· {' / '.join(map(e,p['tags']))}</span></p><p class="pack-description">{e(p['description'])}</p><a class="button" href="#stickers">구성 스티커 둘러보기 <span aria-hidden="true">↓</span></a>{example}</div></section>
<section id="stickers" class="sticker-section" aria-labelledby="sticker-heading"><div class="sticker-heading"><div><p class="eyebrow">Every little piece</p><h2 id="sticker-heading">한 팩에 담긴 그림들.</h2><p>그림을 누르면 크게 볼 수 있어요.</p></div><label class="catalog-search" data-enhanced hidden><span>이 팩에서 찾기</span><input id="sticker-search" type="search" placeholder="스티커 이름 검색" autocomplete="off"></label></div><p id="sticker-result" class="sticker-result" role="status">전체 {len(p['stickers'])}개</p>
<ul class="sticker-grid">{thumbs}</ul><div id="sticker-empty" class="catalog-empty" hidden><p>검색한 이름의 스티커가 없어요.</p><button id="sticker-reset" type="button" class="outline-button">전체 스티커 보기</button></div></section>
<aside class="pack-ending" data-ad-settle><p>이 그림으로 어떤 한 장을 만들고 싶나요?</p><p>Adelie Pages에서 사진과 글을 더해 나만의 페이지로 꾸며보세요. 앱은 출시 준비 중이에요.</p><a class="text-link" href="../index.html#inside">앱에서 꾸미는 방법 <span aria-hidden="true">↗</span></a></aside></main>
<dialog id="sticker-viewer" aria-labelledby="viewer-name"><div class="viewer-header"><span>Adelie Draw · {e(p['name'])}</span><button class="viewer-close" type="button" aria-label="스티커 확대 닫기" autofocus>닫기 ×</button></div><div class="viewer-art"><img id="viewer-image" alt=""><p id="viewer-error" hidden>이미지를 불러오지 못했어요. 닫은 뒤 다시 열어주세요.</p></div><div class="viewer-footer"><button id="viewer-prev" class="outline-button" type="button" aria-label="이전 스티커">←</button><div aria-live="polite"><h2 id="viewer-name"></h2><p id="viewer-position"></p></div><button id="viewer-next" class="outline-button" type="button" aria-label="다음 스티커">→</button></div></dialog>
<footer class="ad-footer"><div class="ad-footer__inner"><div class="ad-footer__brand"><a class="ad-footer__mark" href="https://adeliedraw.com/">Adelie Draw</a><p>그림에서 시작해, 일상에서 쓰이는 문구로.</p></div><nav class="ad-footer__col" aria-label="Adelie Draw"><p class="ad-footer__label">ADELIE DRAW</p><a href="https://adeliedraw.com/">Home</a><a href="https://info.adeliedraw.com/">Info</a><a href="https://shop.adeliedraw.com/">Shop</a><a href="https://app.adeliedraw.com/">Apps</a></nav><nav class="ad-footer__col" aria-label="Adelie Pages"><p class="ad-footer__label">ADELIE PAGES</p><a href="../index.html#collection">스티커 구경하기</a><a href="../privacy/">개인정보처리방침</a><a href="../terms/">이용약관</a><a href="../support/">지원</a><a href="../data/">데이터 관리</a><a href="../info/">앱 정보</a></nav><div class="ad-footer__col"><p class="ad-footer__label">CONTACT</p><a href="https://www.instagram.com/adelie.draw/" rel="noopener">Instagram</a><a href="https://x.com/canvaswitch_" rel="noopener">X</a><a href="mailto:adeliedraw@gmail.com">adeliedraw@gmail.com</a></div></div><div class="ad-footer__base"><small>© 2026 Adelie Draw. All rights reserved.</small><small>그림은 아델리드로우. 페이지는 당신의 취향으로.</small><small><a href="../brand/fonts/OFL-LINESeedKR.txt">LINE Seed Sans KR · OFL</a></small></div><img class="ad-footer__penguin" src="../brand/resting-penguin.webp" width="240" height="240" alt="" loading="lazy" decoding="async"></footer></body></html>'''

def load_covers():
    covers=json.loads((ROOT/'content/pack_covers.json').read_text())['covers']
    assert covers and len({c['id'] for c in covers})==len(covers)
    for c in covers:
        for field in ('cover','foil'):
            if field in c:assert (ROOT/'public'/c[field]).is_file(),c[field]
    return covers

def build():
    packs=json.loads((ROOT/'content/packs.json').read_text())
    covers=load_covers()
    assert len({p['slug'] for p in packs})==len(packs)
    for p in packs:
        assert p['stickers'] and p['slug'].replace('-','').isalnum()
        assert len({s['id'] for s in p['stickers']})==len(p['stickers'])
        for s in p['stickers']:
            for field in ['thumb','image']:assert (ROOT/'public'/s[field]).is_file(),s[field]
        (ROOT/'public/packs'/f"{p['slug']}.html").write_text(detail(p))
    path=ROOT/'public/index.html';s=path.read_text();start='<!-- CATALOG START -->';end='<!-- CATALOG END -->'
    assert start in s and end in s
    path.write_text(s.split(start)[0]+start+'\n'+catalog(packs,covers)+'\n'+end+s.split(end)[1])
    print(f"Built {len(packs)} packs / {sum(len(p['stickers']) for p in packs)} sticker entries / {len(covers)} flowing covers")
if __name__=='__main__':build()
