"""Render public pack cards and detail pages from the explicit web publishing list."""
import json
from html import escape as e
from pathlib import Path
ROOT=Path(__file__).parent

def card(pack):
    images=''.join(f'<img src="{e(s["thumb"])}" width="240" height="240" alt="" loading="lazy">' for s in pack['stickers'][:3])
    search=' '.join([pack['name'],pack['english'],*pack['tags'],*(s['name'] for s in pack['stickers'])])
    return f'''<article class="pack-card" data-tags="{e('|'.join(pack['tags']))}" data-search="{e(search)}">
<a class="pack-link" href="packs/{e(pack['slug'])}.html"><div class="pack-art">{images}</div>
<div class="pack-title-row"><h3>{e(pack['name'])}</h3><span aria-hidden="true">↗</span></div>
<p class="pack-card-meta">스티커 {len(pack['stickers'])}개 <span>· {' / '.join(map(e,pack['tags'][:2]))}</span></p>
<p class="pack-card-action">전체 스티커 보기</p></a></article>'''

def catalog(packs):
    tags=list(dict.fromkeys(tag for p in packs for tag in p['tags']))
    filters='<button type="button" data-category="" aria-pressed="true">전체</button>'+''.join(f'<button type="button" data-category="{e(t)}" aria-pressed="false">{e(t)}</button>' for t in tags)
    return f'''<section class="collection wrap" id="collection" aria-labelledby="collection-title">
<div class="section-top"><div><p class="eyebrow">The sticker collection</p><h2 id="collection-title">좋아하는 그림을,<br>한 팩씩 만나보세요.</h2></div><p>팩을 열면 안에 담긴 스티커를 모두 볼 수 있어요.<br>마음에 드는 그림은 눌러서 더 가까이 살펴보세요.</p></div>
<div class="catalog-tools" data-enhanced hidden><div class="category-filters" role="group" aria-label="스티커팩 주제">{filters}</div><label class="catalog-search"><span>팩·스티커 찾기</span><input type="search" id="pack-search" placeholder="펭귄, 레몬, 고양이…" autocomplete="off"></label></div>
<div class="catalog-result"><p id="pack-result" role="status">{len(packs)}개의 스티커팩</p><span>아델리드로우의 디지털 문구</span></div>
<div class="pack-grid" id="pack-grid">{''.join(card(p) for p in packs)}</div>
<div class="catalog-empty" id="pack-empty" hidden><h3>찾는 그림이 아직 보이지 않네요.</h3><p>다른 단어로 찾아보거나 전체 팩을 둘러보세요.</p><button type="button" id="pack-reset" class="outline-button">전체 팩 보기</button></div>
<div class="catalog-more"><button type="button" id="pack-more" class="outline-button" hidden>팩 더 보기</button></div>
<p class="catalog-footnote">현재 소개 중인 스티커팩이에요. 새로운 컬렉션도 차근차근 선보일게요.</p>
</section>'''

def detail(p):
    thumbs=''.join(f'''<li class="sticker-cell" data-name="{e(s['name'])}"><a class="sticker-link" href="../{e(s['image'])}" data-name="{e(s['name'])}"><span class="sticker-thumb"><img src="../{e(s['thumb'])}" width="240" height="240" loading="lazy" alt=""></span><span>{e(s['name'])}</span></a></li>''' for s in p['stickers'])
    hero=''.join(f'<img src="../{e(s["image"])}" width="360" height="360" alt="{e(s["name"])}">' for s in p['stickers'][:3])
    example=f'<a class="text-link" href="{p["example"]}">이 팩으로 꾸민 페이지 보기 <span aria-hidden="true">↗</span></a>' if p.get('example') else ''
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(p['name'])} · Adelie Pages</title><meta name="description" content="{e(p['description'])}"><meta name="theme-color" content="#F8F8F8"><link rel="icon" href="../assets/app-icon.webp"><link rel="stylesheet" href="../style.css"><script src="../app.js" defer></script></head>
<body class="pack-page"><a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="header wrap"><a class="wordmark" href="../index.html" aria-label="Adelie Pages 처음으로"><img class="brand-icon" src="../assets/app-icon.webp" width="44" height="44" alt=""><span class="brand-type">Adelie Pages<small>by Adelie Draw</small></span></a><a class="return-link" href="../index.html#collection">← 모든 스티커팩</a></header>
<main id="main" class="wrap"><section class="pack-intro" aria-labelledby="pack-title"><div class="pack-intro-art">{hero}</div><div class="pack-intro-copy"><p class="eyebrow">{e(p['english'])}</p><h1 id="pack-title">{e(p['name'])}</h1><p class="detail-count">스티커 {len(p['stickers'])}개 <span>· {' / '.join(map(e,p['tags']))}</span></p><p class="pack-description">{e(p['description'])}</p><a class="button" href="#stickers">구성 스티커 둘러보기 <span aria-hidden="true">↓</span></a>{example}</div></section>
<section id="stickers" class="sticker-section" aria-labelledby="sticker-heading"><div class="sticker-heading"><div><p class="eyebrow">Every little piece</p><h2 id="sticker-heading">한 팩에 담긴 그림들.</h2><p>그림을 누르면 크게 볼 수 있어요.</p></div><label class="catalog-search" data-enhanced hidden><span>이 팩에서 찾기</span><input id="sticker-search" type="search" placeholder="스티커 이름 검색" autocomplete="off"></label></div><p id="sticker-result" class="sticker-result" role="status">전체 {len(p['stickers'])}개</p>
<ul class="sticker-grid">{thumbs}</ul><div id="sticker-empty" class="catalog-empty" hidden><p>검색한 이름의 스티커가 없어요.</p><button id="sticker-reset" type="button" class="outline-button">전체 스티커 보기</button></div></section>
<aside class="pack-ending"><p>이 그림으로 어떤 한 장을 만들고 싶나요?</p><p>Adelie Pages에서 사진과 글을 더해 나만의 페이지로 꾸며보세요. 앱은 출시 준비 중이에요.</p><a class="text-link" href="../index.html#inside">앱에서 꾸미는 방법 <span aria-hidden="true">↗</span></a></aside></main>
<dialog id="sticker-viewer" aria-labelledby="viewer-name"><div class="viewer-header"><span>Adelie Draw · {e(p['name'])}</span><button class="viewer-close" type="button" aria-label="스티커 확대 닫기" autofocus>닫기 ×</button></div><div class="viewer-art"><img id="viewer-image" alt=""><p id="viewer-error" hidden>이미지를 불러오지 못했어요. 닫은 뒤 다시 열어주세요.</p></div><div class="viewer-footer"><button id="viewer-prev" class="outline-button" type="button" aria-label="이전 스티커">←</button><div aria-live="polite"><h2 id="viewer-name"></h2><p id="viewer-position"></p></div><button id="viewer-next" class="outline-button" type="button" aria-label="다음 스티커">→</button></div></dialog>
<footer class="footer wrap"><a class="footer-brand" href="../index.html">Adelie Pages</a><div><p>그림은 아델리드로우. 페이지는 당신의 취향으로.</p><small>© Adelie Draw · <a href="../assets/OFL-LINESeedKR.txt">LINE Seed Sans KR / OFL</a></small></div></footer></body></html>'''

def build():
    packs=json.loads((ROOT/'content/packs.json').read_text())
    assert len({p['slug'] for p in packs})==len(packs)
    for p in packs:
        assert p['stickers'] and p['slug'].replace('-','').isalnum()
        assert len({s['id'] for s in p['stickers']})==len(p['stickers'])
        for s in p['stickers']:
            for field in ['thumb','image']:assert (ROOT/'public'/s[field]).is_file(),s[field]
        (ROOT/'public/packs'/f"{p['slug']}.html").write_text(detail(p))
    path=ROOT/'public/index.html';s=path.read_text();start='<!-- CATALOG START -->';end='<!-- CATALOG END -->'
    assert start in s and end in s
    path.write_text(s.split(start)[0]+start+'\n'+catalog(packs)+'\n'+end+s.split(end)[1])
    print(f"Built {len(packs)} packs / {sum(len(p['stickers']) for p in packs)} sticker entries")
if __name__=='__main__':build()
