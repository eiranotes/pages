# Adelie Pages 소개 사이트

아델리드로우의 디지털 문구 앱 **Adelie Pages**를 소개하는 정적 페이지입니다.
GitHub Pages로 배포되며 주소는 `https://app.adeliedraw.com/pages/` 입니다.

앱 소스는 별도의 비공개 저장소(`eiranotes/AdeliePages`)에 있습니다.
이 저장소에는 공개해도 되는 소개용 자산만 둡니다.

## 구성

```
index.html                 단일 페이지 본문
assets/css/style.css       앱 디자인 계약(Pressed Paper)을 옮긴 스타일
assets/js/main.js          등장 애니메이션(점진적 향상, 없어도 동작)
assets/fonts/              LINE Seed Sans KR 서브셋 woff2 + OFL 원문
assets/img/screens/        실제 앱 화면 캡처
assets/img/packs/          현재 번들 팩 커버
assets/img/brand/          아이콘, 종이 질감, OG 이미지
check_links.py             상대 경로 자산 존재 검사
.nojekyll                  Jekyll 처리 비활성화
```

모든 참조는 **상대 경로**입니다. 하위 경로(`/pages/`)로 서비스되므로
`/assets/...` 같은 루트 절대 경로를 쓰면 깨집니다. `check_links.py`가 이를 막습니다.

## 로컬 확인

```bash
python3 -m http.server 4321
```

## 배포

`main`에 push하면 `.github/workflows/pages.yml`이 Pages로 배포합니다.
저장소 설정은 **Settings → Pages → Source: GitHub Actions** 입니다.

주소는 사용자 사이트(`eiranotes/eiranotes.github.io`)에 설정한 사용자 지정 도메인
`app.adeliedraw.com`을 따라갑니다. **이 저장소에는 CNAME 파일을 두지 않습니다.**
프로젝트 사이트 경로는 저장소 이름을 그대로 쓰므로, 저장소 이름을 바꾸면
`index.html`의 `canonical` / `og:url` / `og:image` 값도 함께 고쳐야 합니다.

## 내용 원칙

문구는 앱 저장소의 `PRODUCT.md`, `docs/PROJECT_STATUS.md`,
`assets/catalogs/pack_catalog.json`에서 확인된 사실만 사용합니다.

- 스토어 배포 전이므로 다운로드 배지나 스토어 링크를 넣지 않습니다.
- 팩 이름·개수·무료 여부는 현재 카탈로그 값과 일치시킵니다.
- 클라우드 동기화·백업·제공 템플릿 라이브러리는 미구현으로 명시합니다.
- 가격(일반 유료 팩 2,900원)은 확정이 아닌 계획으로 표기합니다.

출시 시점에 스토어 링크, 개인정보처리방침, 이용약관, 지원 창구를 추가합니다.

## 이미지 재생성

원본이 바뀌면 앱 저장소의 원본에서 다시 만듭니다. (`cwebp`, ImageMagick 필요)

```bash
cwebp -q 88 -resize 780 0 <QA/screenshots/...>.png -o assets/img/screens/<name>.webp
magick <cover>.png -resize 900x900^ -gravity center -extent 900x900 -quality 84 \
  assets/img/packs/<name>.webp
```

글꼴 서브셋(`fonttools` 필요, 한글 전 영역 포함):

```bash
pyftsubset <LINESeedKR-Bd.otf> \
  --output-file=assets/fonts/LINESeedKR-Bd.woff2 --flavor=woff2 \
  --layout-features='kern,liga,calt' --no-hinting --desubroutinize \
  --unicodes='U+0020-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20A9,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+25A0-25CF,U+3000-303F,U+1100-11FF,U+3130-318F,U+AC00-D7A3,U+FF01-FF60'
```

## 라이선스

사이트 코드는 자유롭게 참고하셔도 됩니다.
**이미지와 스티커·캐릭터 자산은 아델리드로우의 저작물이며 재사용을 허용하지 않습니다.**

글꼴은 LINE Seed Sans KR (© LY Corporation, SIL Open Font License 1.1)이며
원문은 `assets/fonts/OFL-LINESeedKR.txt`에 있습니다. 푸터의 저작권 표기를 지우지 않습니다.
