'use strict';

// QR landing (/pages/get/). Phones go straight to their store; anything else sees the choices.
// app.js runs first and has already pointed a[data-app-store] at the visitor's storefront.
// Android redirects only once get/index.html carries an a[data-play-store] link.
(() => {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const store = ios ? document.querySelector('a[data-app-store]')
    : /Android/.test(ua) ? document.querySelector('a[data-play-store]') : null;
  if (store) { window.location.replace(store.href); return; }

  const text = {
    en: { title: 'Get Adelie Pages', platforms: 'Available for iPhone and iPad.', appStore: 'Download on the App Store', play: 'Get it on Google Play', android: 'The Android version is in testing.', intro: 'About the app' },
    ja: { title: 'Adelie Pagesを入手', platforms: 'iPhoneとiPadで使えます。', appStore: 'App Storeでダウンロード', play: 'Google Playで手に入れよう', android: 'Android版はテスト中です。', intro: 'アプリについて' },
    zh: { title: '获取 Adelie Pages', platforms: '适用于 iPhone 和 iPad。', appStore: '在 App Store 下载', play: '在 Google Play 下载', android: 'Android 版本正在测试中。', intro: '了解应用' },
  };
  const lang = (navigator.language || 'ko').toLowerCase().slice(0, 2);
  const strings = text[lang];
  if (!strings) return;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  document.title = strings.title;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = strings[node.dataset.i18n]; });
})();
