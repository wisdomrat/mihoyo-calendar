// candidate-01 原型批量截图：一次跑完 10 个状态（3+ 视口 × 中性/阵营/弹窗/周视图）。
// 遵守协作约定：profile 放 tmpdir（绝不进项目目录）、captureScreenshot 加超时、
// 横向溢出用 documentElement.scrollWidth vs clientWidth 判断。
// 与 _local/shoot.mjs 的区别：这里拍的是隔离原型（file:// 直开），端口用 9334 避开生产的 9333。
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTO = 'file:///D:/work/coding/mihoyo-calendar/docs/calendar-redesign/candidates/candidate-01/prototype/index.html';
const PORT = 9334;
const OUT = 'D:\\work\\coding\\mihoyo-calendar\\docs\\calendar-redesign\\candidates\\candidate-01\\prototype\\shots';
const PROFILE = join(tmpdir(), 'mhy-c01-edge-profile');

// name / 视口 / 查询参数
const SHOTS = [
  { name: '01-1440-neutral-month',  w: 1440, h: 900,  mobile: false, q: 'state=neutral' },
  { name: '02-1440-liyue',          w: 1440, h: 900,  mobile: false, q: 'state=liyue' },
  { name: '03-1440-hares',          w: 1440, h: 900,  mobile: false, q: 'state=hares' },
  { name: '04-1440-liyue-modal',    w: 1440, h: 900,  mobile: false, q: 'state=liyue&modal=ganyu' },
  { name: '05-1440-neutral-week',   w: 1440, h: 900,  mobile: false, q: 'state=neutral&view=week' },
  { name: '06-768-neutral',         w: 768,  h: 1024, mobile: true,  q: 'state=neutral' },
  { name: '07-768-liyue',           w: 768,  h: 1024, mobile: true,  q: 'state=liyue' },
  { name: '08-390-neutral',         w: 390,  h: 844,  mobile: true,  q: 'state=neutral' },
  { name: '09-390-hares',           w: 390,  h: 844,  mobile: true,  q: 'state=hares' },
  { name: '10-360-neutral',         w: 360,  h: 800,  mobile: true,  q: 'state=neutral' },
];

mkdirSync(OUT, { recursive: true });

const edge = spawn(EDGE, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  '--window-size=1600,1200',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu',
], { stdio: 'ignore' });

// 等调试端口起来
let wsUrl = null;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(PROTO)}`, { method: 'PUT' });
    const j = await r.json();
    if (j.webSocketDebuggerUrl) { wsUrl = j.webSocketDebuggerUrl; break; }
  } catch { /* 端口还没起，继续轮询 */ }
  await sleep(250);
}
if (!wsUrl) { edge.kill(); throw new Error('Edge 调试端口没起来'); }

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let msgId = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
};
function send(method, params = {}, timeoutMs = 20000) {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return Promise.race([
    new Promise((resolve, reject) => pending.set(id, { resolve, reject })),
    sleep(timeoutMs).then(() => { throw new Error(`${method} 超时 ${timeoutMs}ms`); }),
  ]);
}

await send('Page.enable');
await send('Runtime.enable');

// 测量脚本：只回传结论。核心硬指标 = 页面级横向溢出（任务书 5.2 底线）。
const PROBE = `(() => {
  const d = document.documentElement;
  const q = s => document.querySelector(s);
  const cs = el => el ? getComputedStyle(el) : null;
  const visible = el => { if (!el) return '缺失'; const s = cs(el); return s.display === 'none' ? '隐藏' : '可见'; };
  const imgs = [...document.querySelectorAll('img')];
  return {
    实际URL: location.search,
    主题: cs(q('.app'))?.getPropertyValue('data-theme') || q('.app')?.dataset.theme,
    归属key: cs(q('.app'))?.getPropertyValue('--affil-key').trim() || '(未注入)',
    fx强度: cs(q('.app'))?.getPropertyValue('--fx-strength').trim(),
    侧栏: visible(q('.sidebar')),
    日历格数: document.querySelectorAll('.cell').length,
    有角色格: document.querySelectorAll('.cell.has').length,
    溢出chip: document.querySelectorAll('.more-chip').length,
    弹窗: visible(q('.dialog')),
    图片总数: imgs.length,
    图片失败数: imgs.filter(i => !i.complete || i.naturalWidth === 0).length,
    页面横向溢出: d.scrollWidth > d.clientWidth ? (d.scrollWidth - d.clientWidth) + 'px 溢出' : '无',
    页面高度: d.scrollHeight + ' / 视口 ' + d.clientHeight,
  };
})()`;

const report = [];
for (const s of SHOTS) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: s.w, height: s.h, deviceScaleFactor: 1, mobile: s.mobile,
  });
  await send('Page.navigate', { url: `${PROTO}?${s.q}` });
  // 等外部头像/立绘 CDN 稳定：首屏冷缓存时固定 sleep 会抢跑（01 号图曾拍到空环），
  // 改为轮询「未完成图片数」直到 0 或 8s 兜底；onerror 首字回退也在这段时间内落定。
  for (let t = 0; t < 16; t++) {
    await sleep(500);
    const r = await send('Runtime.evaluate', {
      expression: `[...document.querySelectorAll('img')].filter(i => !i.complete || i.naturalWidth === 0).length + (window.__bgImg && !window.__bgImg.complete ? 1 : 0)`,
      returnByValue: true,
    });
    if (r.result.value === 0) break;
  }
  await sleep(300);

  let probe = {};
  try {
    const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    probe = r.result.value;
  } catch (e) { probe = { probe错误: e.message }; }
  report.push({ 截图: s.name, 视口: `${s.w}x${s.h}`, ...probe });

  try {
    const shot = await send('Page.captureScreenshot', { format: 'png' }, 20000);
    writeFileSync(`${OUT}\\${s.name}.png`, Buffer.from(shot.data, 'base64'));
  } catch (e) {
    report[report.length - 1].截图结果 = '失败: ' + e.message;
  }
}

console.log(JSON.stringify(report, null, 2));

ws.close();
edge.kill();
await sleep(400);
try { rmSync(PROFILE, { recursive: true, force: true }); } catch { /* profile 偶尔被占用，不影响结果 */ }
