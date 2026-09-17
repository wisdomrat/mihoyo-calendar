/* 探针：CDP 连 headless Edge，捕获页面错误并直接调用 openAddForm 取异常栈 */
import { spawn } from 'child_process';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9223;
const PROFILE = 'C:/Users/Administrator/AppData/Local/Temp/edge-probe-02';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const child = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--user-data-dir=${PROFILE}`, '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--window-size=1440,900', 'about:blank',
], { stdio: 'pipe' });

async function wsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch { }
    await sleep(500);
  }
  throw new Error('no CDP');
}

const ws = new WebSocket(await wsUrl());
let nextId = 1;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Runtime.exceptionThrown') {
    console.log('[page]', m.method, JSON.stringify(m.params).slice(0, 500));
  }
};
await new Promise((r) => { ws.onopen = r; });
const send = (method, params = {}) => {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((r) => pending.set(id, r));
};

await send('Runtime.enable');
await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.addEventListener('error', (e) => { window.__err = (e.message + ' @ ' + e.filename + ':' + e.lineno); });`,
});
await send('Page.navigate', { url: 'http://localhost:8765/index.html?panel=add&_=' + Date.now() });
await sleep(6000);

const probe = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    err: window.__err || null,
    kids: document.getElementById('addBody').children.length,
    popHidden: document.getElementById('popAdd').hidden,
  })`,
  returnByValue: true,
});
console.log('state', probe.result.result.value);

const call = await send('Runtime.evaluate', {
  expression: `(() => { try { openAddForm(); return 'ok kids=' + document.getElementById('addBody').children.length; } catch (e) { return 'THROW ' + (e.stack || e); } })()`,
  returnByValue: true,
});
console.log('call ', call.result.result.value);

ws.close();
child.kill();
