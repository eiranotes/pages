'use strict';

// Hero playground: the loose hero stickers can be peeled off and stuck elsewhere
// on the desk. Without this script the hero is the same finished composition.
(() => {
  const art = document.querySelector('.hero-art');
  if (!art || !window.PointerEvent) return;
  const stickers = [
    [art.querySelector('.hero-flower'), '푸른 꽃 스티커'],
    [art.querySelector('.hero-pair'), '레몬 스티커'],
    [art.querySelector('.hero-penguin'), '펭귄 스티커'],
  ].filter(([el]) => el);
  if (!stickers.length) return;

  const tools = document.createElement('div');
  tools.className = 'play-tools';
  tools.innerHTML = '<p class="play-hint">스티커를 끌어서 붙여 보세요</p>'
    + '<button type="button" class="play-reset" hidden>처음 자리로</button>'
    + '<p class="ad-visually-hidden" role="status" aria-live="polite"></p>';
  art.append(tools);
  const hint = tools.querySelector('.play-hint');
  const reset = tools.querySelector('.play-reset');
  const status = tools.querySelector('[role=status]');
  art.classList.add('is-playable');

  const pos = new Map();
  let layer = 3;
  const place = (el, x, y) => {
    // Keep the sticker's centre inside the desk area.
    const a = art.getBoundingClientRect();
    const base = el.getBoundingClientRect();
    const [cx, cy] = pos.get(el) || [0, 0];
    const left = base.left - cx, top = base.top - cy;
    const minX = a.left - left - base.width / 2, maxX = a.right - left - base.width / 2;
    const minY = a.top - top - base.height / 2, maxY = a.bottom - top - base.height / 2;
    const nx = Math.min(maxX, Math.max(minX, x)), ny = Math.min(maxY, Math.max(minY, y));
    pos.set(el, [nx, ny]);
    el.style.translate = `${nx}px ${ny}px`;
  };
  const touched = () => { hint.hidden = true; reset.hidden = false; };
  const lift = el => { el.classList.add('is-lifted'); el.style.zIndex = ++layer; };
  const drop = (el, label) => {
    el.classList.remove('is-lifted');
    el.classList.add('is-stuck');
    setTimeout(() => el.classList.remove('is-stuck'), 320);
    status.textContent = `${label}를 붙였어요.`;
  };

  stickers.forEach(([el, label]) => {
    el.dataset.sticker = '';
    el.draggable = false;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-roledescription', '옮길 수 있는 스티커');
    el.setAttribute('aria-label', `${label} · 방향키로 옮기기`);

    let start = null;
    el.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      const [x, y] = pos.get(el) || [0, 0];
      start = { id: event.pointerId, px: event.clientX, py: event.clientY, x, y };
      lift(el);
    });
    el.addEventListener('pointermove', event => {
      if (!start || event.pointerId !== start.id) return;
      place(el, start.x + event.clientX - start.px, start.y + event.clientY - start.py);
      touched();
    });
    const end = event => {
      if (!start || event.pointerId !== start.id) return;
      start = null;
      drop(el, label);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', event => {
      const step = event.shiftKey ? 24 : 8;
      const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
      if (!move) return;
      event.preventDefault();
      const [x, y] = pos.get(el) || [0, 0];
      lift(el);
      place(el, x + move[0], y + move[1]);
      touched();
      drop(el, label);
    });
  });

  reset.addEventListener('click', () => {
    stickers.forEach(([el]) => { el.style.translate = ''; el.style.zIndex = ''; });
    pos.clear();
    reset.hidden = true;
    hint.hidden = false;
    status.textContent = '스티커를 처음 자리로 돌려놓았어요.';
    stickers[0][0].focus();
  });
})();
