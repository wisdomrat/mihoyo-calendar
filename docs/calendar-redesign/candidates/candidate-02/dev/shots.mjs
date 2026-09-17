/* 截图驱动：Edge headless 逐态捕获 prototype-v2
   桌面/平板（>=768）：--window-size 直截。
   手机（390/360）：headless Chromium 将 CSS 视口钳制到 >=~483px，--window-size 无法更小，
   故经 CDP Emulation.setDeviceMetricsOverride 设真实 390/360 视口后 Page.captureScreenshot。 */
import { execFileSync, spawn } from 'child_process';
import { writeFileSync } from 'fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:8765/index.html';
const OUT = 'D:/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-02/prototype-v2/shots/';
const PROFILE = 'C:/Users/Administrator/AppData/Local/Temp/edge-proto-02';
const PORT = 9222;

/* [文件名, 宽, 高, query, cdp?] */
const SHOTS = [
  ['01-month-neutral-1440', 1440, 900, ''],
  ['02-month-liyue-1440', 1440, 900, '?date=2026-08-26'],
  ['03-month-zzz-1440', 1440, 900, '?date=2026-07-30&aff=zzz-cunning-hares'],
  ['04-scene-1440', 1440, 900, '?char=amber-genshin'],
  ['05-week-1440', 1440, 900, '?view=week'],
  ['05b-filter-process-1440', 1440, 900, '?panel=filter&focus=genshin&fel=火'],
  ['06-tablet-768', 768, 1024, ''],
  ['07-mobile-neutral-390', 390, 844, '', 1],
  ['08-mobile-scene-390', 390, 844, '?char=anby-zzz', 1],
  ['09-narrow-360', 360, 800, '', 1],
  ['10-scene-portrait-1440', 1440, 900, '?char=amber-genshin&po=1'],
  ['11-month-mondstadt-1440', 1440, 900, '?date=2026-08-10'],
  ['12-fallback-hsr-1440', 1440, 900, '?date=2026-08-24'],
  ['13-noimage-1440', 1440, 900, '?char=bronya-zaychik-honkai3'],
  ['14-empty-games-1440', 1440, 900, '?games=none'],
  ['15-calm-month-1440', 1440, 900, '?games=genshin&fel=冰&freg=纳塔'],
  ['16-search-1440', 1440, 900, '?q=安'],
  ['17-density-avatar-1440', 1440, 900, '?density=avatar'],
  ['18-add-1440', 1440, 900, '?panel=add'],
  ['19-nofx-1440', 1440, 900, '?nofx=1&date=2026-08-26'],
  ['20-mobile-board-390', 390, 844, '?date=2026-08-18', 1],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpPageWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* 端口未起 */ }
    await sleep(500);
  }
  throw new Error('CDP not reachable');
}

function cdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };
  const ready = new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  return {
    ready,
    send(method, params = {}) {
      const id = nextId++;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((res) => pending.set(id, res));
    },
    close() { ws.close(); },
  };
}

async function runCdpShots(shots) {
  const child = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    `--user-data-dir=${PROFILE}`, '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, '--window-size=800,1000', 'about:blank',
  ], { stdio: 'pipe' });
  try {
    const wsUrl = await cdpPageWs();
    const cdp = cdpClient(wsUrl);
    await cdp.ready;
    await cdp.send('Page.enable');
    for (const [name, w, h, q] of shots) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: w, height: h, deviceScaleFactor: 1, mobile: true,
      });
      await cdp.send('Page.navigate', { url: BASE + (q || '?') + (q ? '&' : '') + `_=${Date.now()}` });
      await sleep(10000);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(OUT + name + '.png', Buffer.from(data, 'base64'));
      console.log('OK  ', name);
    }
    cdp.close();
  } finally {
    child.kill();
  }
}

for (const [name, w, h, q, cdp] of SHOTS) {
  if (cdp || (process.env.ONLY && name !== process.env.ONLY)) continue;
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    `--user-data-dir=${PROFILE}`, '--hide-scrollbars',
    `--window-size=${w},${h}`, '--timeout=12000',
    `--screenshot=${OUT}${name}.png`, BASE + q + (q ? '&' : '?') + '_=' + Date.now(),
  ];
  try {
    execFileSync(EDGE, args, { stdio: 'pipe', timeout: 90000 });
    console.log('OK  ', name);
  } catch (e) {
    console.log('FAIL', name, String(e.stderr || e).slice(0, 200));
  }
}

await runCdpShots(SHOTS.filter((s) => s[4] && (!process.env.ONLY || s[0] === process.env.ONLY)));
console.log('done');
