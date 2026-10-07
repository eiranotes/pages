/*
 * Adelie Draw web design system — shared progressive enhancement.
 * Canonical source: adelie-web-design/tokens/adelie-web.js
 * Vendored into each site as brand/adelie-web.js by tools/sync.py.
 *
 * Content is fully visible without this script. It only arms the "settle"
 * entrance for elements marked with data-ad-settle.
 */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll('[data-ad-settle]');
  if (!targets.length) return;
  root.classList.add('ad-js');

  var settle = function (el) { el.classList.add('is-settled'); };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      settle(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  targets.forEach(function (el, i) {
    if (!el.style.getPropertyValue('--ad-settle-turn')) {
      el.style.setProperty('--ad-settle-turn', (i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.3) + 'deg');
    }
    observer.observe(el);
  });

  var revealAll = function () { targets.forEach(settle); };
  window.addEventListener('beforeprint', revealAll);
  // Anchor jumps can skip the observer; never leave a section hidden.
  window.addEventListener('hashchange', function () { setTimeout(revealAll, 0); });
})();
