'use strict';
const packs = {
 lemon: {main:'lemon-cake', accent:'lemon-pair', alt:'레몬 파운드 케이크 스티커', accentAlt:'레몬 조각 스티커', copy:'상큼한 레몬 한 조각, 달콤한 오후 한 장.'},
 home: {main:'living-room', accent:'living-room', alt:'고양이와 아늑한 거실을 그린 홈스윗홈 스티커', accentAlt:'함께 연출한 아델리 펭귄', copy:'느긋한 고양이와 함께, 집에서 보내는 하루.'},
 fox: {main:'spring-fox', accent:'spring-blossom', alt:'봄여우 스티커', accentAlt:'봄꽃 스티커', copy:'작은 여우가 데려온, 내 페이지 위의 봄.'}
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
