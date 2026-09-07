'use strict';
const packs = {
 lemon: {main:'lemon-cake', accent:'lemon-pair', alt:'레몬 파운드 케이크 스티커', accentAlt:'레몬 조각 스티커', copy:'상큼한 레몬 한 조각, 달콤한 오후 한 장. 케이크와 레몬 모티프로 간식 사진 옆을 꾸미거나, 짧은 안부에 산뜻한 기분을 더해보세요.'},
 home: {main:'living-room', accent:'living-room', alt:'고양이와 아늑한 거실을 그린 홈스윗홈 스티커', accentAlt:'', copy:'느긋한 고양이와 함께, 집에서 보내는 하루. 포근한 집 안 풍경을 담은 그림으로 주말의 기록이나 나만의 작은 휴식 페이지를 꾸며보세요.'},
 fox: {main:'spring-fox', accent:'spring-blossom', alt:'봄여우 스티커', accentAlt:'봄꽃 스티커', copy:'작은 여우가 데려온, 내 페이지 위의 봄. 여우와 꽃 그림을 산책 사진이나 가벼운 메모에 곁들여, 오래 간직하고 싶은 봄날을 남겨보세요.'}
};
document.querySelectorAll('[data-pack]').forEach(button => {
 button.addEventListener('click', () => {
  const pack = packs[button.dataset.pack];
  document.querySelectorAll('[data-pack]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const main = document.getElementById('pack-main');
  const accent = document.getElementById('pack-accent');
  main.src = `assets/${pack.main}.webp`; main.alt = pack.alt;
  accent.src = `assets/${pack.accent}.webp`; accent.alt = pack.accentAlt; accent.hidden = button.dataset.pack === 'home';
  document.getElementById('pack-copy').textContent = pack.copy;
 });
});
