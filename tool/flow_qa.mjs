// QA for the drifting pack-cover section: screenshots per width, motion/pause/toggle checks,
// reduced-motion fallback, console errors, and a short frame sequence for review.
// Usage: node tool/flow_qa.mjs <outdir>. Serves public/ locally; Chrome and its profile are removed at the end.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'QA', 'pack-flow'));
mkdirSync(OUT, { recursive: true });
const PROFILE = path.join(OUT, '.chrome-profile');
const SYSTEM_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HEADLESS_SHELL = path.join(process.env.HOME, 'Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const CHROME = process.env.CHROME_BIN || (existsSync(HEADLESS_SHELL) ? HEADLESS_SHELL : SYSTEM_CHROME);
const PORT = 8797, DEBUG = 9347;

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', path.join(ROOT, 'public')], { stdio: 'ignore' });
const chrome = spawn(CHROME, [...(CHROME === SYSTEM_CHROME ? ['--headless=new'] : []), `--remote-debugging-port=${DEBUG}`,
  `--user-data-dir=${PROFILE}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const cleanup = () => {
  try { chrome.kill('SIGTERM'); } catch {}
  try { server.kill('SIGTERM'); } catch {}
};
process.on('exit', cleanup);

let page;
for (let i = 0; i < 400 && !page; i++) {
  try { page = (await (await fetch(`http://127.0.0.1:${DEBUG}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
  if (!page) await sleep(150);
}
if (!page) throw new Error('no devtools page target');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map(); const problems = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') problems.push('exception: ' + m.params.exceptionDetails.exception?.description);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) problems.push('console: ' + JSON.stringify(m.params.args.map((a) => a.value)));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') problems.push('log: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
});
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) problems.push('qa: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result?.value; };
const shot = async (file, clip) => writeFileSync(file, Buffer.from((await send('Page.captureScreenshot', { format: 'jpeg', quality: 88, ...(clip ? { clip } : {}) })).data, 'base64'));
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });

const rowX = `[...document.querySelectorAll('.flow-row')].map(r => new DOMMatrix(getComputedStyle(r).transform).m41)`;
const results = [];

async function load(width, height, reduced, scale = 2) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: width < 640 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
  await send('Runtime.evaluate', { expression: 'window.__qaOld = true' });
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
  // The headless shell can be slow to commit a navigation; wait for the loaded document, not a fixed delay.
  let ready = false;
  for (let i = 0; i < 200 && !ready; i++) {
    await sleep(150);
    ready = (await send('Runtime.evaluate', { expression: `document.readyState === 'complete' && !!document.getElementById('pack-flow') && location.port === '${PORT}' && !window.__qaOld`, returnByValue: true })).result?.value === true;
  }
  if (!ready) throw new Error(`page not ready at ${width}px`);
  await sleep(400);
  await evaluate(`document.getElementById('collection').scrollIntoView({ block: 'start', behavior: 'instant' }); new Promise(r => setTimeout(r, 2200))`);
}

const ONLY = process.env.QA_ONLY; // e.g. QA_ONLY=pause runs just the pause checks
for (const [width, height] of ONLY ? [] : [[1440, 900], [1002, 800], [390, 844]]) {
  await load(width, height, false);
  const metrics = await evaluate(`(async () => {
    const a = ${rowX}; await new Promise(r => setTimeout(r, 1000)); const b = ${rowX};
    const flow = document.getElementById('pack-flow');
    const imgs = [...flow.querySelectorAll('img')];
    await Promise.race([Promise.all(imgs.map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 4000))]);
    return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      moving: a.map((x, i) => Math.round((b[i] - x) * 10) / 10), flowTop: Math.round(flow.getBoundingClientRect().top), offscreen: flow.classList.contains('is-offscreen'), visible: flow.classList.contains('is-visible'),
      covers: flow.querySelectorAll('.flow-cover:not([aria-hidden])').length, announced: [...flow.querySelectorAll('img[alt]:not([alt=""])')].length,
      broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length, coverWidth: Math.round(flow.querySelector('.flow-cover').getBoundingClientRect().width) };
  })()`);
  await shot(path.join(OUT, `flow-${width}.jpg`));
  results.push({ width, ...metrics });
}

// Pause behaviour at desktop width: toggle button, then hover. Judged by the drift animations'
// playState, because an idle headless page may not advance animation time between samples.
const rowStates = `[...document.querySelectorAll('.flow-row')].flatMap(r => r.getAnimations().filter(a => a.animationName === 'pack-drift').map(a => a.playState))`;
const allAre = (state) => `((s) => s.length === 2 && s.every(x => x === '${state}'))(${rowStates})`;
await load(1440, 900, false);
const pause = await evaluate(`(() => {
  const t = document.getElementById('flow-toggle');
  const runningAtStart = ${allAre('running')};
  t.click(); const pausedByToggle = ${allAre('paused')}; const label = t.textContent; const pressed = t.getAttribute('aria-pressed');
  t.click(); const resumed = ${allAre('running')};
  return { runningAtStart, pausedByToggle, label, pressed, resumed, labelAfter: t.textContent, toggleHidden: t.hidden };
})()`);
const box = await evaluate(`(() => { const r = document.querySelector('.flow-row').getBoundingClientRect(); return { x: innerWidth / 2, y: r.top + r.height / 2 }; })()`);
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x, y: box.y });
pause.pausedByHover = await evaluate(allAre('paused'));
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
pause.resumedAfterHover = await evaluate(allAre('running'));
results.push({ pause });

// Review frames at real speed: pause every animation and step its currentTime, so a slow
// headless browser still yields an exact 30 fps sequence (desktop 8 s, phone 6 s).
async function frames(name, width, height, scale, seconds) {
  await load(width, height, false, scale);
  // Replay the entrance: hide the rows, commit that style, then reveal them as the observer does.
  const scrolled = await evaluate(`(() => { const f = document.getElementById('pack-flow'); f.classList.remove('is-visible'); void f.offsetWidth;
    f.classList.add('is-visible'); return Math.round(document.getElementById('collection').getBoundingClientRect().top); })()`);
  if (scrolled < -2 || scrolled > 40) throw new Error(`collection not at top for ${name}: ${scrolled}`);
  await evaluate(`window.__start = new Map(document.getAnimations().map(a => [a, a.currentTime || 0])); document.getAnimations().forEach(a => a.pause())`);
  mkdirSync(path.join(OUT, name), { recursive: true });
  for (let f = 0; f < seconds * 30; f++) {
    await evaluate(`document.getAnimations().forEach(a => { a.pause(); a.currentTime = (window.__start.get(a) || 0) + ${(f * 1000 / 30).toFixed(3)}; })`);
    await shot(path.join(OUT, name, `f${String(f).padStart(4, '0')}.jpg`));
  }
}
if (!ONLY) {
  await frames('frames-1440', 1440, 900, 1, 8);
  await frames('frames-390', 390, 844, 2, 6);
}

// Reduced motion: no drift, single copy, no toggle.
await load(390, 844, true);
results.push({ reduced: await evaluate(`(async () => { const a = ${rowX}; await new Promise(r => setTimeout(r, 800)); const b = ${rowX};
  const flow = document.getElementById('pack-flow');
  return { still: a.every((x, i) => Math.abs(b[i] - x) < 0.5), shownCovers: [...flow.querySelectorAll('.flow-cover')].filter(c => getComputedStyle(c).display !== 'none').length,
    scrollable: flow.scrollWidth > flow.clientWidth, toggleHidden: document.getElementById('flow-toggle').hidden,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }; })()`) });
await shot(path.join(OUT, 'flow-390-reduced.jpg'));

results.push({ problems });
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
ws.close();
cleanup();
await sleep(800);
rmSync(PROFILE, { recursive: true, force: true });
