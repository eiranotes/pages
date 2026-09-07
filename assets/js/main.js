/* Adelie Pages — introduction site
   Progressive enhancement only. The page is fully readable without JS. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var targets = document.querySelectorAll(
    ".hero-copy, .flow li, .gallery figure, .split-copy, .split-media, .packs li, .cards article, .status-list > div, .faq details"
  );
  if (!targets.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  targets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (Math.min(i % 6, 5) * 45) + "ms";
    observer.observe(el);
  });

  // Safety net: never leave content hidden if the observer never fires
  // (background tabs, prerender, unexpected layout).
  window.setTimeout(function () {
    targets.forEach(function (el) { el.classList.add("in"); });
    observer.disconnect();
  }, 2500);
})();
