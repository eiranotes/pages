'use strict';

// Static links and all published content remain available without JavaScript.
const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
document.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });

// Pack covers drift in two rows. Motion is decoration: it pauses off screen, on hover/focus,
// on request, and is replaced by a static scroller under prefers-reduced-motion (CSS).
const packFlow = document.getElementById('pack-flow');
if (packFlow) {
  document.documentElement.classList.add('js');
  const toggle = document.getElementById('flow-toggle');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncToggle = () => { toggle.hidden = reduce.matches; };
  syncToggle();
  reduce.addEventListener('change', syncToggle);
  toggle.addEventListener('click', () => {
    const paused = packFlow.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? '다시 흐르게' : '흐름 멈추기';
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) packFlow.classList.add('is-visible');
      packFlow.classList.toggle('is-offscreen', !entry.isIntersecting);
    }), { rootMargin: '0px 0px -12% 0px' }).observe(packFlow);
  } else {
    packFlow.classList.add('is-visible');
  }
}

const stickerSearch = document.getElementById('sticker-search');
if (stickerSearch) {
  const cells = Array.from(document.querySelectorAll('.sticker-cell'));
  function filterStickers() {
    const query = normalize(stickerSearch.value);
    cells.forEach(cell => { cell.hidden = !normalize(cell.dataset.name).includes(query); });
    const count = cells.filter(cell => !cell.hidden).length;
    document.getElementById('sticker-result').textContent = query ? `${cells.length}개 중 ${count}개` : `전체 ${count}개`;
    document.getElementById('sticker-empty').hidden = count !== 0;
  }
  stickerSearch.addEventListener('input', filterStickers);
  document.getElementById('sticker-reset').addEventListener('click', () => {
    stickerSearch.value = '';
    filterStickers();
    stickerSearch.focus();
  });
}

const viewer = document.getElementById('sticker-viewer');
if (viewer && typeof viewer.showModal === 'function') {
  const links = Array.from(document.querySelectorAll('.sticker-link'));
  const picture = document.getElementById('viewer-image');
  const previous = document.getElementById('viewer-prev');
  const next = document.getElementById('viewer-next');
  const error = document.getElementById('viewer-error');
  let selection = [];
  let index = 0;
  let opener = null;

  function showSticker() {
    const link = selection[index];
    error.hidden = true;
    picture.hidden = false;
    picture.alt = link.dataset.name;
    picture.src = link.href;
    document.getElementById('viewer-name').textContent = link.dataset.name;
    document.getElementById('viewer-position').textContent = `${index + 1} / ${selection.length}`;
    previous.disabled = index === 0;
    next.disabled = index === selection.length - 1;
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    selection = links.filter(item => !item.closest('.sticker-cell').hidden);
    index = selection.indexOf(link);
    showSticker();
    viewer.showModal();
    document.body.classList.add('viewer-open');
  }));
  previous.addEventListener('click', () => { if (index > 0) { index--; showSticker(); } });
  next.addEventListener('click', () => { if (index < selection.length - 1) { index++; showSticker(); } });
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    opener?.focus({ preventScroll: true });
  });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); index--; showSticker(); }
    if (event.key === 'ArrowRight' && index < selection.length - 1) { event.preventDefault(); index++; showSticker(); }
  });
  picture.addEventListener('error', () => { picture.hidden = true; error.hidden = false; });
}
