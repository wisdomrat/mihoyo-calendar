// 受控精修概念图生成器 · refinement-opus5-01
// 只生成 docs/ 下的静态概念图，不触碰 src/ 生产代码。
// 数据来源：项目真实 src/data/characters.json（生日模式下 hsr 按首次实装日回落）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../../../..'); // -> 项目根
const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characters.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(HERE, 'manifest.json'), 'utf8'));
const localAvatar = Object.fromEntries(manifest.map((m) => [m.name, m.avatar]));

const GAMES = {
  genshin: { short: '原神', color: '#4a90e2' },
  hsr: { short: '星穹铁道', color: '#9d90ff' },
  zzz: { short: '绝区零', color: '#ff6b6b' },
  honkai3: { short: '崩坏3', color: '#ff8cc8' },
};

// 生日模式：星穹铁道无官方生日，恒用首次实装日（项目 calendar.ts 的真实规则）
const eventKey = (c) =>
  c.game === 'hsr'
    ? (/^\d{4}-\d{2}-\d{2}$/.test(c.releaseDate || '') ? c.releaseDate.slice(5) : null)
    : c.birthday || null;
const eventKind = (c) => (c.game === 'hsr' ? 'release' : 'birthday');

function eventsFor(filter) {
  const map = {};
  for (const c of chars) {
    if (filter && !filter(c)) continue;
    const k = eventKey(c);
    if (!k) continue;
    (map[k] ||= []).push(c);
  }
  // 稀有度高、有本地头像的排前面，保证前三个头像可显示
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => (localAvatar[b.name] ? 1 : 0) - (localAvatar[a.name] ? 1 : 0) || (b.rarity || 0) - (a.rarity || 0));
  }
  return map;
}

// ---------- 月网格（周一起始，恒定 6 行，保证网格尺寸稳定） ----------
function monthGrid(year, month /* 1-12 */) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // 周一=0
  const start = new Date(Date.UTC(year, month - 1, 1 - lead));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getTime() + i * 86400000);
    return {
      y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
      key: String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'),
      inMonth: d.getUTCMonth() + 1 === month,
    };
  });
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cut = (s, n) => (s.length > n ? s.slice(0, n) + '…' : s);

// 这几位在 CDN 上的「头像」其实是粉底名牌占位图（粉色圆盘 + 角色名文字），不是角色画像。
// 在 24–48px 下既不可读、也不像角色，还容易被误读成调试文字。
// 概念图对它们改用功能契约 3.3 要求的首字回退圆盘，顺便展示这个必须存在的状态。
const PLACEHOLDER_AVATAR = new Set(['李素裳', '雷电芽衣', '梅比乌斯']);
const av = (c) => (PLACEHOLDER_AVATAR.has(c.name) ? null : localAvatar[c.name]);

// ---------- 单元格 ----------
// 三档密度：1 位=大头像+名字 / 2–3 位=堆叠+数量 / 4+ 位=小头像+“+N”入口
function deskCell(day, list, opts = {}) {
  const cls = ['cell'];
  if (!day.inMonth) cls.push('out');
  if (opts.today) cls.push('today');
  if (opts.sel) cls.push('sel');
  const n = list.length;
  let body = '';
  let marks = '';
  if (day.inMonth && n) {
    const kinds = [...new Set(list.map(eventKind))];
    marks = `<span class="marks">${kinds.map((k) => `<i class="mk ${k}"></i>`).join('')}</span>`;
    const chip = (c, size) =>
      `<span class="av" style="--ring:${GAMES[c.game].color};width:${size}px;height:${size}px">` +
      (av(c) ? `<img src="assets/${av(c)}" alt="">` : `<b>${esc(c.name[0])}</b>`) + `</span>`;
    if (n === 1) {
      body = `<div class="stack s1">${chip(list[0], 48)}</div><div class="cap">${esc(cut(list[0].name, 5))}</div>`;
    } else if (n <= 3) {
      const step = 24;
      body = `<div class="stack s2" style="width:${34 + (n - 1) * step}px">` +
        list.map((c, i) => `<span class="slot" style="left:${i * step}px">${chip(c, 34)}</span>`).join('') +
        `</div><div class="cap">${esc(cut(list[0].name, 4))} 等${n}位</div>`;
    } else {
      const step = 17, shown = list.slice(0, 3);
      body = `<div class="stack s3" style="width:${24 + 2 * step + 4 + 30}px">` +
        shown.map((c, i) => `<span class="slot" style="left:${i * step}px">${chip(c, 24)}</span>`).join('') +
        `<span class="more" style="left:${24 + 2 * step + 4}px">+${n - 3}</span>` +
        `</div><div class="cap">共 ${n} 位</div>`;
    }
  }
  return `<div class="${cls.join(' ')}" style="left:${opts.x}px;top:${opts.y}px">
      <span class="dnum">${day.d}</span>${marks}${body}</div>`;
}

function mobCell(day, list, opts = {}) {
  const cls = ['mcell'];
  if (!day.inMonth) cls.push('out');
  if (opts.today) cls.push('today');
  const n = list.length;
  let body = '';
  if (day.inMonth && n) {
    const chip = (c, size) =>
      `<span class="av" style="--ring:${GAMES[c.game].color};width:${size}px;height:${size}px">` +
      (av(c) ? `<img src="assets/${av(c)}" alt="">` : `<b>${esc(c.name[0])}</b>`) + `</span>`;
    if (n === 1) body = `<div class="mstack" style="width:32px">${chip(list[0], 32)}</div>`;
    else if (n === 2) body = `<div class="mstack" style="width:44px">` + list.map((c, i) => `<span class="slot" style="left:${i * 18}px">${chip(c, 26)}</span>`).join('') + `</div>`;
    else if (n === 3) body = `<div class="mstack" style="width:45px">` + list.map((c, i) => `<span class="slot" style="left:${i * 13}px">${chip(c, 19)}</span>`).join('') + `</div>`;
    else body = `<div class="mstack" style="width:42px">` + list.slice(0, 3).map((c, i) => `<span class="slot" style="left:${i * 12}px">${chip(c, 18)}</span>`).join('') + `</div><div class="mmore">+${n - 3}</div>`;
  }
  return `<div class="${cls.join(' ')}" style="left:${opts.x}px;top:${opts.y}px"><span class="dnum">${day.d}</span>${body}</div>`;
}

// ---------- 共用样式 ----------
const BASE = `
*{margin:0;padding:0;box-sizing:border-box}
body{width:1440px;height:900px;overflow:hidden;position:relative;
  font-family:"Segoe UI","Microsoft YaHei",system-ui,sans-serif;
  color:#f5f4ee;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0}
.blob{position:absolute;border-radius:50%;filter:blur(64px)}
.rule{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.08)}
/* 顶栏 */
.brand{position:absolute;left:72px;top:34px}
.brand h1{font-size:20px;font-weight:600;letter-spacing:.5px}
.brand p{font-size:12px;color:#858aa4;margin-top:7px;letter-spacing:1.4px}
.bar{position:absolute;top:36px;height:36px;display:flex;align-items:center;gap:10px}
.seg{display:flex;height:36px;border:1px solid rgba(255,255,255,.16);border-radius:18px;overflow:hidden}
.seg b{display:flex;align-items:center;padding:0 15px;font-size:12.5px;font-weight:400;color:#9296b0}
.seg b.on{background:#f1f0ea;color:#141526;font-weight:600}
.search{display:flex;align-items:center;gap:8px;height:36px;padding:0 15px;width:180px;
  border:1px solid rgba(255,255,255,.16);border-radius:18px;font-size:12.5px;color:#7f849e}
.filterpill{display:flex;align-items:center;height:36px;border-radius:18px;
  border:1px solid rgba(255,255,255,.16);overflow:hidden}
.filterpill .sum{display:flex;align-items:center;gap:7px;padding:0 14px;font-size:12.5px;color:#b8bbcc}
.filterpill .sum i{width:6px;height:6px;border-radius:50%;background:#766cff}
.filterpill .act{display:flex;align-items:center;gap:7px;padding:0 14px;height:100%;
  border-left:1px solid rgba(255,255,255,.16);font-size:12.5px;color:#f5f4ee}
.filterpill .act.on{background:#f1f0ea;color:#141526;font-weight:600;border-left-color:transparent}
.badge{min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#ff715b;color:#180d0c;
  font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
.icobtn{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.16);
  display:flex;align-items:center;justify-content:center;font-size:15px;color:#b8bbcc}
/* 舞台 */
.stage{position:absolute;left:72px;top:136px;width:470px;height:720px;border-radius:26px;
  overflow:hidden;border:1px solid rgba(255,255,255,.18)}
.stage img.pt{position:absolute}
.scrim{position:absolute;inset:0}
.stage .tag{position:absolute;left:28px;top:26px;font-size:11px;letter-spacing:2.4px;color:#e9e7f5;opacity:.9}
.stage .fav{position:absolute;right:26px;top:24px;width:30px;height:30px;border-radius:50%;
  border:1px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:13px}
.stage .info{position:absolute;left:28px;right:28px;bottom:30px}
.stage .big{font-size:86px;line-height:.86;letter-spacing:-4px;font-weight:300}
.stage .sub{font-size:13px;letter-spacing:3px;color:#cfcbe4;margin-top:14px}
.stage .who{font-size:18px;margin-top:12px}
.stage .who span{color:#9a9db5;font-size:15px}
.also{display:flex;align-items:center;gap:8px;margin-top:16px;font-size:11.5px;color:#9a9db5}
.also .av{width:28px;height:28px}
/* 工作区 */
.work{position:absolute;left:590px;top:136px;width:778px;height:720px;border-radius:26px;
  background:rgba(17,20,38,.76);border:1px solid rgba(255,255,255,.14)}
.wh{position:absolute;left:28px;top:18px}
.wh .lbl{font-size:11px;letter-spacing:2.5px;color:#858aa4}
.wh .mon{font-size:36px;font-weight:300;letter-spacing:-.5px;margin-top:10px}
.wh .mon span{color:#777b9b}
.wcount{position:absolute;right:28px;top:60px;text-align:right;display:flex;gap:10px;align-items:baseline}
.wcount .a{font-size:11px;letter-spacing:1.8px;color:#7f849e}
.wcount .b{font-size:12px;color:#b8bbcc}
.nav{position:absolute;right:28px;top:18px;display:flex;align-items:center;gap:8px}
.nav .n{width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.18);
  display:flex;align-items:center;justify-content:center;font-size:14px;color:#c9ccdd}
.nav .today{height:32px;padding:0 16px;border-radius:16px;background:#f1f0ea;color:#141526;
  font-size:12.5px;font-weight:600;display:flex;align-items:center}
.wk{position:absolute;top:94px;left:28px;width:721px;display:flex}
.wk i{width:103px;text-align:center;font-size:11px;letter-spacing:1.4px;color:#7f849e;font-style:normal}
.grid{position:absolute;left:28px;top:116px;width:721px;height:552px}
.gl{position:absolute;background:rgba(255,255,255,.085)}
.cell{position:absolute;width:103px;height:92px;overflow:hidden}
.cell .dnum{position:absolute;left:11px;top:8px;font-size:13px;color:#dedde8;letter-spacing:.3px}
.cell.out{opacity:.32}
.cell.out .dnum{color:#7a7e97}
.cell.today .dnum{left:6px;top:5px;padding:3px 8px 4px;border-radius:11px;background:#f1f0ea;color:#141526;font-weight:600}
.cell.sel{border:1.5px solid rgba(245,244,238,.85);border-radius:12px}
.cell.sel .dnum{color:#f5f4ee;font-weight:600}
.marks{position:absolute;right:9px;top:12px;display:flex;gap:4px}
.mk{width:5px;height:5px;display:block}
.mk.birthday{border-radius:50%;background:#c9ccdd}
.mk.release{transform:rotate(45deg);background:#c9ccdd}
.stack{position:absolute;left:50%;transform:translateX(-50%);height:48px}
.stack.s1{top:23px;width:48px}
.stack.s2{top:29px;height:34px}
.stack.s3{top:34px;height:24px}
.slot{position:absolute;top:0}
.av{display:inline-block;border-radius:50%;overflow:hidden;position:relative;
  box-shadow:0 0 0 2px var(--ring),0 2px 8px rgba(0,0,0,.55);
  background:radial-gradient(125% 125% at 30% 24%,#2b2f4c,#161a2b);vertical-align:top}
.av img{width:100%;height:100%;object-fit:cover;display:block}
.av b{display:flex;width:100%;height:100%;align-items:center;justify-content:center;
  font-weight:600;color:#d3d6e6;font-size:13px}
.s1 .av b{font-size:19px}
.s2 .av b{font-size:14px}
.s3 .av b{font-size:10px}
.more{position:absolute;top:2px;height:20px;min-width:30px;padding:0 6px;border-radius:10px;
  background:rgba(245,244,238,.92);color:#141526;font-size:11px;font-weight:700;
  display:flex;align-items:center;justify-content:center}
.cap{position:absolute;left:4px;right:4px;bottom:4px;text-align:center;font-size:10px;line-height:12px;
  color:#a3a7bd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* 底部当天入口 */
.dock{position:absolute;left:28px;top:676px;width:721px;height:44px;border-radius:22px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  display:flex;align-items:center;padding:0 6px 0 13px;gap:11px}
.dock .av{width:30px;height:30px}
.dock .t{font-size:13px}
.dock .t span{color:#9296b0;font-size:12px}
.dock .go{margin-left:auto;height:32px;padding:0 15px;border-radius:16px;background:#f1f0ea;color:#141526;
  font-size:12px;font-weight:600;display:flex;align-items:center}
.legend{display:flex;align-items:center;gap:14px;font-size:11px;color:#7f849e}
.legend b{display:flex;align-items:center;gap:5px;font-weight:400}
.foot{position:absolute;left:72px;bottom:16px;font-size:10px;letter-spacing:2px;color:#5f6480}
`;

function page(title, css, bodyHtml, w = 1440, h = 900) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title>
<style>${BASE}${css}\nbody{width:${w}px;height:${h}px}</style></head><body>${bodyHtml}</body></html>`;
}

function gridLines() {
  let s = '';
  for (let r = 0; r <= 6; r++) s += `<i class="gl" style="left:0;top:${r * 92}px;width:721px;height:1px"></i>`;
  for (let c = 0; c <= 7; c++) s += `<i class="gl" style="left:${c * 103}px;top:0;width:1px;height:552px"></i>`;
  return s;
}

const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

fs.writeFileSync(path.join(HERE, '_base.css'), BASE);
export { BASE, page, gridLines, WEEK, monthGrid, eventsFor, deskCell, mobCell, GAMES, esc, av, localAvatar, chars };
