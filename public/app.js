'use strict';

// Static links and all published content remain available without JavaScript.
const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
document.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });

const packGrid = document.getElementById('pack-grid');
if (packGrid) {
  const cards = Array.from(packGrid.querySelectorAll('.pack-card'));
  const search = document.getElementById('pack-search');
  const filters = Array.from(document.querySelectorAll('[data-category]'));
  const more = document.getElementById('pack-more');
  const result = document.getElementById('pack-result');
  const empty = document.getElementById('pack-empty');
  let category = '';
  let limit = 6;

  function render() {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    const matches = cards.filter(card => {
      const text = normalize(card.dataset.search);
      return (!category || card.dataset.tags.split('|').includes(category)) && terms.every(term => text.includes(term));
    });
    cards.forEach(card => { card.hidden = true; });
    matches.slice(0, limit).forEach(card => { card.hidden = false; });
    result.textContent = `${matches.length}개의 스티커팩${matches.length > limit ? ` · ${limit}개 표시` : ''}`;
    empty.hidden = matches.length !== 0;
    more.hidden = matches.length <= limit;
    more.textContent = `팩 더 보기 (${Math.min(6, Math.max(0, matches.length - limit))}개)`;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  }
  search.addEventListener('input', () => { limit = 6; render(); });
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category;
    limit = 6;
    render();
  }));
  more.addEventListener('click', () => {
    const previouslyVisible = cards.filter(card => !card.hidden);
    limit += 6;
    render();
    const firstNew = cards.find(card => !card.hidden && !previouslyVisible.includes(card));
    firstNew?.querySelector('a').focus();
  });
  document.getElementById('pack-reset').addEventListener('click', () => {
    search.value = '';
    category = '';
    limit = 6;
    render();
    search.focus();
  });
  render();
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
