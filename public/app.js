'use strict';

// All published content remains available without JavaScript.
document.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });

// App Store links point at the Korean storefront. Swap in the visitor's storefront from the first
// browser language that names (or implies, e.g. "ja" → JP) a region; Apple sends storefronts
// it does not run to the US store.
const appStoreLinks = document.querySelectorAll('a[data-app-store]');
if (appStoreLinks.length && typeof Intl.Locale === 'function') {
  let storefront = null;
  for (const tag of navigator.languages || [navigator.language]) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (region && /^[A-Z]{2}$/.test(region)) { storefront = region.toLowerCase(); break; }
    } catch { /* ignore malformed language tags */ }
  }
  if (storefront && storefront !== 'kr') {
    appStoreLinks.forEach(link => { link.href = link.href.replace('apps.apple.com/kr/', `apps.apple.com/${storefront}/`); });
  }
}

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
