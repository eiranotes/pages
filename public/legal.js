(() => {
  const supported = ['ko', 'en', 'ja', 'zh'];
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get('lang');
  const browser = (navigator.language || 'ko').toLowerCase();
  const inferred = browser.startsWith('ja')
    ? 'ja'
    : browser.startsWith('zh')
      ? 'zh'
      : browser.startsWith('en')
        ? 'en'
        : 'ko';
  const lang = supported.includes(explicit) ? explicit : inferred;

  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  document.querySelectorAll('[data-locale]').forEach((node) => {
    const active = node.dataset.locale === lang;
    node.hidden = !active;
    if (active) node.removeAttribute('aria-hidden');
    else node.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('[data-lang-link]').forEach((link) => {
    const active = link.dataset.langLink === lang;
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });

  document.querySelectorAll('[data-localized-path]').forEach((link) => {
    const path = link.dataset.localizedPath;
    if (path) link.href = `${path}?lang=${lang}`;
  });

})();
