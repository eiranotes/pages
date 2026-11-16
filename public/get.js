'use strict';

// QR landing (/pages/get/). Phones go straight to their store; anything else sees the choices.
// app.js runs first and has already pointed a[data-app-store] at the visitor's storefront.
(() => {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const store = ios ? document.querySelector('a[data-app-store]')
    : /Android/.test(ua) ? document.querySelector('a[data-play-store]') : null;
  if (store) { window.location.replace(store.href); return; }

  const text = {
    ko: { title: 'Adelie Pages 받기', platforms: 'iPhone·iPad와 Android에서 쓸 수 있어요.', appStore: 'App Store에서 받기', play: 'Google Play에서 받기', intro: '앱 소개 보기' },
    ja: { title: 'Adelie Pagesを入手', platforms: 'iPhone・iPadとAndroidで使えます。', appStore: 'App Storeでダウンロード', play: 'Google Playで手に入れよう', intro: 'アプリについて' },
    zh: { title: '获取 Adelie Pages', platforms: '适用于 iPhone、iPad 和 Android。', appStore: '在 App Store 下载', play: '在 Google Play 下载', intro: '了解应用' },
  };
  // The HTML is English; other languages are swapped in, and anything unlisted stays English.
  const lang = (navigator.language || 'en').toLowerCase().slice(0, 2);
  const strings = text[lang];
  if (!strings) return;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  document.title = strings.title;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = strings[node.dataset.i18n]; });
})();
