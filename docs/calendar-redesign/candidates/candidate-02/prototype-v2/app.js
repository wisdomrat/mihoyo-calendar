/* ============================================================
   角色纪念日墙 · candidate-02 原型 V2 · 交互逻辑
   隔离实现：不导入生产组件；仅使用 data.js（真实数据快照）
   ============================================================ */
'use strict';

/* ---------- 静态元数据（来自 src/utils/calendar.ts 的允许读取） ---------- */
const GAME_META = {
  genshin: { name: '原神', short: '原神', color: '#4a90e2' },
  hsr: { name: '崩坏：星穹铁道', short: '星穹铁道', color: '#9d90ff' },
  zzz: { name: '绝区零', short: '绝区零', color: '#ff6b6b' },
  honkai3: { name: '崩坏3', short: '崩坏3', color: '#ff8cc8' },
};
const GAME_ORDER = ['genshin', 'hsr', 'zzz', 'honkai3'];
const NO_BIRTHDAY_GAMES = new Set(['hsr']);      // 星穹铁道无官方生日，恒用实装
const NO_RELEASE_GAMES = new Set(['honkai3']);    // 崩坏3 暂无实装数据，回落生日
const WDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const LS = {
  chars: 'wall-proto-characters-v1',
  prefs: 'wall-proto-prefs-v1',
  filters: 'wall-proto-filters-v1',
  favs: 'wall-proto-favs-v1',
};

/* ---------- 数据底座 ---------- */
const AFF_MAP = new Map(WALL_DATA.affiliations.map((a) => [a.id, a]));
let customChars = loadJSON(LS.chars, []);
let allCharacters = mergeChars(WALL_DATA.characters, customChars);

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function mergeChars(base, custom) {
  const map = new Map(base.map((c) => [c.id, c]));
  for (const c of custom) map.set(c.id, { ...(map.get(c.id) || {}), ...c });
  return [...map.values()];
}

/* ---------- 状态 ---------- */
const state = {
  anchor: { y: 2026, m: 8 },            // 当前月（1-12）
  view: 'month',                          // month | week
  mode: 'birthday',                       // birthday | release
  density: 'card',                        // avatar | card | compact
  weekStart: 1,                           // 0=周日 1=周一
  motion: true,
  themeFollow: true,
  selectedGames: [...GAME_ORDER],
  filters: { gameFilters: {}, showMissingInfo: true, favOnly: false },
  focusGame: 'genshin',                   // 筛选面板当前聚焦的游戏
  selectedDate: null,                     // 'YYYY-MM-DD'
  sceneCharId: null,
  portraitOnly: false,
  portraitPref: false,                    // 立绘偏好：进入详情默认只看立绘
  pinnedAff: '',                          // dev 钉住的上下文
  favs: new Set(loadJSON(LS.favs, [])),
  pop: null,                              // filter | search | prefs | add | jump | null
  searchHl: 0,
  editingId: null,
  lastSync: null,
};
for (const g of GAME_ORDER) state.filters.gameFilters[g] = { elements: [], rarities: [], weapons: [], regions: [] };
/* 恢复持久化偏好（容错缺字段） */
{
  const savedPrefs = loadJSON(LS.prefs, {});
  if (['avatar', 'card', 'compact'].includes(savedPrefs.density)) state.density = savedPrefs.density;
  if (savedPrefs.weekStart === 0 || savedPrefs.weekStart === 1) state.weekStart = savedPrefs.weekStart;
  if (savedPrefs.motion === false) { state.motion = false; document.documentElement.classList.add('nofx'); }
  if (savedPrefs.themeFollow === false) state.themeFollow = false;
  if (savedPrefs.mode === 'release' || savedPrefs.mode === 'birthday') state.mode = savedPrefs.mode;
  const savedFilters = loadJSON(LS.filters, {});
  if (savedFilters.filters && typeof savedFilters.filters === 'object') {
    for (const g of GAME_ORDER) {
      const incoming = savedFilters.filters.gameFilters?.[g] || {};
      state.filters.gameFilters[g] = {
        elements: Array.isArray(incoming.elements) ? incoming.elements : [],
        rarities: Array.isArray(incoming.rarities) ? incoming.rarities : [],
        weapons: Array.isArray(incoming.weapons) ? incoming.weapons : [],
        regions: Array.isArray(incoming.regions) ? incoming.regions : [],
      };
    }
    state.filters.showMissingInfo = savedFilters.filters.showMissingInfo !== false;
  }
  if (savedFilters.favOnly) state.filters.favOnly = true;
}

/* ---------- 日期工具 ---------- */
const pad = (n) => String(n).padStart(2, '0');
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = new Date();
const TODAY_STR = ymd(TODAY);

function effectiveMode(game, mode) {
  if (NO_BIRTHDAY_GAMES.has(game)) return 'release';
  if (NO_RELEASE_GAMES.has(game)) return 'birthday';
  return mode;
}
function dateKeyOf(c, mode) {
  const m = effectiveMode(c.game, mode);
  if (m === 'release') {
    const k = (c.releaseDate || '').slice(5);
    return /^\d{2}-\d{2}$/.test(k) ? k : null;
  }
  return /^\d{2}-\d{2}$/.test(c.birthday || '') ? c.birthday : null;
}
/* 闰年映射：02-29 在非闰展示年落到 02-28，并保留提示（不误导） */
function keyForYear(key, year) {
  if (key === '02-29' && !isLeap(year)) return { key: '02-28', shifted: true };
  return { key, shifted: false };
}
function buildEventMap(chars, mode, year) {
  const map = new Map();
  for (const c of chars) {
    const raw = dateKeyOf(c, mode);
    if (!raw) continue;
    const { key, shifted } = keyForYear(raw, year);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ c, shifted });
  }
  return map;
}
function monthCells(y, m, weekStart) {
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() - weekStart + 7) % 7;
  const start = new Date(y, m - 1, 1 - lead);
  const total = lead + daysInMonth(y, m);
  const rows = Math.ceil(total / 7) * 7;
  const cells = [];
  for (let i = 0; i < rows; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ d, out: d.getMonth() !== m - 1 });
  }
  return cells;
}
function weekOf(dateStr, weekStart) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const cur = new Date(y, m - 1, d);
  const off = (cur.getDay() - weekStart + 7) % 7;
  const out = [];
  for (let i = 0; i < 7; i++) out.push(new Date(y, m - 1, d - off + i));
  return out;
}

/* ---------- 过滤（语义与 src/utils/characterData.ts 一致） ---------- */
function filteredChars() {
  const f = state.filters;
  return allCharacters.filter((c) => {
    if (!state.selectedGames.includes(c.game)) return false;
    if (f.favOnly && !state.favs.has(c.id)) return false;
    if (!f.showMissingInfo && (!c.element || !c.weapon || !c.region)) return false;
    const gf = f.gameFilters[c.game] || {};
    if (gf.elements?.length && (!c.element || !gf.elements.includes(c.element))) return false;
    if (gf.rarities?.length && (!c.rarity || !gf.rarities.includes(c.rarity))) return false;
    if (gf.weapons?.length && (!c.weapon || !gf.weapons.includes(c.weapon))) return false;
    if (gf.regions?.length && (!c.region || !gf.regions.includes(c.region))) return false;
    return true;
  });
}
function activeFilterCount() {
  let n = 0;
  for (const g of GAME_ORDER) {
    const gf = state.filters.gameFilters[g];
    n += gf.elements.length + gf.rarities.length + gf.weapons.length + gf.regions.length;
  }
  if (state.filters.favOnly) n += 1;
  return n;
}

/* ---------- DOM 助手 ---------- */
const $ = (sel) => document.querySelector(sel);
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function imgWithFallback(src, cls, fallText, fallCls) {
  if (!src) return fallBlock(fallCls || cls, fallText);
  const img = el('img', cls);
  img.alt = '';
  img.src = src;
  img.addEventListener('error', () => { img.replaceWith(fallBlock(fallCls || cls, fallText)); }, { once: true });
  return img;
}
function fallBlock(cls, text) {
  // standin 类（lead/port）保持原样；其余尺寸由上下文选择器决定，空类回退到通用 avfall
  const fallback = /lead|port/.test(cls || '') ? cls : (cls ? cls + ' avfall' : 'avfall');
  return el('span', fallback, text || '?');
}
function toast(msg, ms = 2600) {
  const t = el('div', 'toast', msg);
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), ms);
}

/* ---------- Context Theme System ----------
   优先级：角色一幕 > 立板 > 钉住的演示上下文 > 中性。
   themeFollow 关闭 → 只保留钉住态，选择变化不触发材质切换。 */
let themeTimer = null;
function resolveContextAff() {
  if (!state.themeFollow) return state.pinnedAff;
  if (state.sceneCharId) {
    const c = allCharacters.find((x) => x.id === state.sceneCharId);
    if (c) return c.aff;
  }
  if (state.selectedDate && boardRosterCache.length) {
    const lead = boardRosterCache.find((r) => r.c.portrait) || boardRosterCache[0];
    return lead.c.aff;
  }
  return state.pinnedAff;
}
function applyTheme() {
  const affId = resolveContextAff();
  const html = document.documentElement;
  if (!affId) {
    html.removeAttribute('data-aff');
    html.removeAttribute('data-game');
    html.dataset.ink = '3';
    html.style.removeProperty('--aff-key');
    html.style.removeProperty('--aff-accent');
    html.style.removeProperty('--aff-deep');
    $('#wallMark').textContent = '';
  } else {
    const a = AFF_MAP.get(affId);
    if (!a) return;
    html.dataset.aff = affId;
    html.dataset.game = a.game;
    html.dataset.ink = String(a.ink);
    html.style.setProperty('--aff-key', a.colors.key);
    html.style.setProperty('--aff-accent', a.colors.accent);
    html.style.setProperty('--aff-deep', a.colors.deep);
    $('#wallMark').textContent = `${a.name}\n${a.nameEn}`;
  }
  syncDevstrip();
}
/* 连续快速切换防抖：200ms 内只落位最终态 */
function requestTheme() {
  if (!state.motion || document.documentElement.classList.contains('nofx')) { applyTheme(); return; }
  clearTimeout(themeTimer);
  themeTimer = setTimeout(applyTheme, 120);
}

/* ---------- 渲染：缘 ---------- */
function renderEdge() {
  const { y, m } = state.anchor;
  $('#edgeCoord').textContent = state.view === 'month' ? `${y}年 · ${m}月` : `${y}年 · ${m}月 · 周`;
  document.querySelectorAll('[data-act="view"]').forEach((b) => b.classList.toggle('on', b.dataset.view === state.view));
  document.querySelectorAll('[data-act="mode"]').forEach((b) => b.classList.toggle('on', b.dataset.mode === state.mode));
}

/* ---------- 渲染：月视图 ---------- */
let boardRosterCache = [];
function renderMonth() {
  const chars = filteredChars();
  const evMap = buildEventMap(chars, state.mode, state.anchor.y);
  const grid = $('#grid');
  grid.innerHTML = '';
  const wd = $('#wdays');
  wd.innerHTML = '';
  for (let i = 0; i < 7; i++) wd.appendChild(el('div', 'wday', WDAYS[(state.weekStart + i) % 7]));

  const density = window.matchMedia('(max-width: 420px)').matches ? 'compact' : state.density;
  let monthEvents = 0;
  for (const { d, out } of monthCells(state.anchor.y, state.anchor.m, state.weekStart)) {
    const key = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const evs = evMap.get(key) || [];
    if (!out) monthEvents += evs.length;
    const cell = el('div', 'cell d-' + density + (out ? ' out' : '') + (ymd(d) === TODAY_STR ? ' today' : '') + (state.selectedDate === ymd(d) ? ' sel' : ''));
    cell.tabIndex = 0;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `${d.getMonth() + 1}月${d.getDate()}日${evs.length ? '，' + evs.length + '位角色' : ''}`);
    cell.dataset.date = ymd(d);
    cell.appendChild(el('span', 'num', String(d.getDate())));

    if (evs.length) {
      if (density === 'compact') {
        if (evs.length > 1) {
          cell.appendChild(el('span', 'count', `×${evs.length}`));
        } else {
          const t = el('div', 'ticks');
          t.appendChild(el('span', 'tick'));
          cell.appendChild(t);
        }
      } else {
        const ticks = el('div', 'ticks');
        const shown = Math.min(evs.length, 5);
        for (let i = 0; i < shown; i++) ticks.appendChild(el('span', 'tick'));
        if (evs.length > 5) ticks.appendChild(el('span', 'tick cap'));
        cell.appendChild(ticks);
        if (density === 'avatar') {
          const first = evs[0].c;
          cell.appendChild(imgWithFallback(first.avatar, 'firstav', first.name[0]));
        } else {
          const rows = el('div', 'crows');
          for (const { c } of evs.slice(0, 2)) {
            const row = el('div', 'crow');
            row.appendChild(imgWithFallback(c.avatar, '', c.name[0]));
            row.appendChild(el('span', '', c.name));
            rows.appendChild(row);
          }
          cell.appendChild(rows);
        }
      }
      if (evs.length > 2 && density === 'card') cell.appendChild(el('span', 'more', `+${evs.length - 2}`));
    }
    cell.addEventListener('click', () => openDate(ymd(d), evs.length > 0));
    cell.addEventListener('keydown', (e) => { if (e.key === 'Enter') openDate(ymd(d), evs.length > 0); });
    grid.appendChild(cell);
  }
  const calm = $('#calm');
  const noGames = state.selectedGames.length === 0;
  $('#emptygames').hidden = !noGames;
  calm.hidden = noGames || monthEvents > 0;
  $('#calmD').textContent = activeFilterCount() > 0 || state.filters.favOnly
    ? '当前范围内没有事件。试试清除范围。'
    : '这个月在当前日期语义下没有事件。';
  monthview().hidden = noGames;
}
function monthview() { return $('#monthview'); }

/* ---------- 渲染：周视图 ---------- */
function renderWeek() {
  const chars = filteredChars();
  const evMap = buildEventMap(chars, state.mode, state.anchor.y);
  const wrap = $('#weekcols');
  wrap.innerHTML = '';
  const anchorDate = state.selectedDate || TODAY_STR;
  for (const d of weekOf(anchorDate, state.weekStart)) {
    const key = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const evs = evMap.get(key) || [];
    const col = el('div', 'wcol' + (ymd(d) === TODAY_STR ? ' today' : '') + (state.selectedDate === ymd(d) ? ' sel' : ''));
    const head = el('div', 'whead');
    head.appendChild(el('div', 'wnum', String(d.getDate())));
    head.appendChild(el('div', 'wd', `${WDAYS[d.getDay()]} · ${d.getMonth() + 1}月`));
    col.appendChild(head);
    const list = el('div', 'wlist');
    if (!evs.length) list.appendChild(el('div', 'wquiet', '无事件'));
    for (const { c, shifted } of evs) {
      const row = el('div', 'wrow');
      row.style.setProperty('--gcolor', GAME_META[c.game].color);
      row.appendChild(imgWithFallback(c.avatar, '', c.name[0]));
      const mid = el('div', 'wname', c.name);
      mid.title = c.name;
      row.appendChild(mid);
      row.appendChild(el('span', 'wtag', `${GAME_META[c.game].short} · ${effectiveMode(c.game, state.mode) === 'release' ? '实装' : '生日'}${shifted ? ' · 闰日' : ''}`));
      row.addEventListener('click', () => openScene(c.id));
      list.appendChild(row);
    }
    col.appendChild(list);
    col.addEventListener('click', (e) => {
      if (e.target.closest('.wrow')) return;
      openDate(ymd(d), evs.length > 0);
    });
    wrap.appendChild(col);
  }
}

/* ---------- 渲染：立板 ---------- */
function openDate(dateStr, hasEvents) {
  const boardWasOpen = !$('#board').hidden && $('#board').classList.contains('open');
  const changed = state.selectedDate !== dateStr;
  state.selectedDate = dateStr;
  closePops();
  if (changed) renderAll();
  if (!hasEvents) { closeBoard(); return; }
  if (!boardWasOpen) {
    renderBoard();
    $('#board').hidden = false;
    // 立板材质在内容就位后再切换，避免空壳先换皮
    $('#board').classList.add('open');
    requestTheme();
  }
}
function renderBoard() {
  const chars = filteredChars();
  const [y, m, d] = state.selectedDate.split('-').map(Number);
  const key = `${pad(m)}-${pad(d)}`;
  const evs = buildEventMap(chars, state.mode, y).get(key) || [];
  boardRosterCache = evs;
  const lead = evs.find((e) => e.c.portrait) || evs[0];
  const leadBox = $('#boardLead');
  leadBox.innerHTML = '';
  if (lead) {
    leadBox.appendChild(lead.c.portrait
      ? imgWithFallback(lead.c.portrait, '', lead.c.name, 'lead-standin')
      : fallBlock('lead-standin', lead.c.name));
  }
  const affBox = $('#boardAff');
  affBox.innerHTML = '';
  if (lead) {
    const a = AFF_MAP.get(lead.c.aff);
    affBox.appendChild(el('h2', 'board-aff-name', a.name));
    affBox.appendChild(el('div', 'board-aff-en', a.nameEn));
    affBox.appendChild(el('div', 'board-aff-tag', a.tagline));
    if (a.fallback) affBox.appendChild(el('span', 'board-aff-fallback', '游戏级主题 · 阵营待细分'));
  }
  $('#boardTag').textContent = `${y}年${m}月${d}日 · ${evs.length} 位角色`;
  const roster = $('#boardRoster');
  roster.innerHTML = '';
  for (const { c, shifted } of evs) {
    const row = el('button', 'rrow');
    row.appendChild(imgWithFallback(c.avatar, '', c.name[0]));
    const mid = el('div', 'rmid');
    mid.appendChild(el('span', 'rname', c.name));
    mid.appendChild(el('span', 'rmeta', `${GAME_META[c.game].short} · ${AFF_MAP.get(c.aff)?.name || ''}${shifted ? ' · 闰年按2月28日' : ''}`));
    row.appendChild(mid);
    row.appendChild(el('span', 'rtag', effectiveMode(c.game, state.mode) === 'release' ? '实装纪念' : '生日'));
    const fav = el('span', 'rfav' + (state.favs.has(c.id) ? ' on' : ''), state.favs.has(c.id) ? '♥' : '♡');
    fav.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(c.id); });
    row.appendChild(fav);
    row.addEventListener('click', () => openScene(c.id));
    roster.appendChild(row);
  }
}
function closeBoard() {
  $('#board').classList.remove('open');
  setTimeout(() => { if (!$('#board').classList.contains('open')) $('#board').hidden = true; }, state.motion ? 280 : 0);
  boardRosterCache = [];
  requestTheme();
}
function shiftBoard(delta) {
  const [y, m, d] = state.selectedDate.split('-').map(Number);
  const nd = new Date(y, m - 1, d + delta);
  state.anchor = { y: nd.getFullYear(), m: nd.getMonth() + 1 };
  state.selectedDate = ymd(nd);
  renderAll();
  const chars = filteredChars();
  const key = `${pad(nd.getMonth() + 1)}-${pad(nd.getDate())}`;
  const evs = buildEventMap(chars, state.mode, nd.getFullYear()).get(key) || [];
  if (evs.length) { renderBoard(); requestTheme(); }
  else closeBoard();
}

/* ---------- 渲染：角色一幕 ---------- */
function openScene(charId) {
  state.sceneCharId = charId;
  state.portraitOnly = state.portraitPref;
  renderScene();
  $('#scene').hidden = false;
  requestTheme();
}
function renderScene() {
  const c = allCharacters.find((x) => x.id === state.sceneCharId);
  if (!c) return;
  const scene = $('#scene');
  scene.classList.toggle('portraitonly', state.portraitOnly);
  $('#sceneStep').textContent = state.portraitOnly ? '仅看立绘 · Esc 返回' : '角色 · 纪念日墙';
  const port = $('#scenePort');
  port.innerHTML = '';
  port.appendChild(c.portrait
    ? imgWithFallback(c.portrait, '', c.name, 'port-standin')
    : fallBlock('port-standin', c.name));
  const floatBtn = el('button', 'scene-close-float', '✕');
  floatBtn.setAttribute('aria-label', '退出仅看立绘');
  floatBtn.addEventListener('click', closeScene);
  port.appendChild(floatBtn);

  const body = $('#sceneBody');
  body.innerHTML = '';
  const a = AFF_MAP.get(c.aff);
  body.appendChild(el('h1', 'scene-name', c.name));
  body.appendChild(el('div', 'scene-nameEn', c.nameEn));
  const affline = el('div', 'scene-affline');
  affline.append(`${GAME_META[c.game].name} · ${a.name} `);
  affline.appendChild(el('small', '', `「${a.tagline}」${a.fallback ? ' · 游戏级主题' : ''}`));
  body.appendChild(affline);

  const labels = WALL_DATA.filterLabels[c.game];
  const chips = el('div', 'fchips');
  const push = (k, v) => { if (v) { const f = el('span', 'fchip'); f.append(k + ' '); f.appendChild(el('b', '', String(v))); chips.appendChild(f); } };
  push('稀有度', c.rarity ? '★'.repeat(c.rarity) : '');
  push(labels.elements, c.element);
  push(labels.weapons, c.weapon);
  push(labels.regions, c.region);
  body.appendChild(chips);

  const em = effectiveMode(c.game, state.mode);
  if (em === 'birthday') {
    const [mm, dd] = c.birthday.split('-').map(Number);
    body.appendChild(el('div', 'scene-date', `${mm}月${dd}日 · 生日`));
    body.appendChild(el('div', 'scene-full', `每年重复 · 展示年按 ${state.anchor.y} 年映射`));
  } else {
    const [yy, mm, dd] = (c.releaseDate || '').split('-').map(Number);
    body.appendChild(el('div', 'scene-date', `${mm}月${dd}日 · 实装纪念日`));
    body.appendChild(el('div', 'scene-full', c.releaseDate ? `首次实装：${yy}年${mm}月${dd}日（${state.anchor.y - yy} 周年）` : '实装日期缺失'));
  }
  if (NO_BIRTHDAY_GAMES.has(c.game)) body.appendChild(el('div', 'scene-empty', '星穹铁道没有可靠官方生日，本角色恒显示实装纪念日。'));
  if (NO_RELEASE_GAMES.has(c.game) && state.mode === 'release') body.appendChild(el('div', 'scene-empty', '崩坏3 缺少完整实装数据，已回落到生日。'));
  if (!c.portrait) body.appendChild(el('div', 'scene-empty', '该角色暂无立绘，展示材质替身。'));

  const acts = el('div', 'scene-acts');
  const favBtn = el('button', 'act' + (state.favs.has(c.id) ? ' on' : ''), state.favs.has(c.id) ? '♥ 已收藏' : '♡ 收藏');
  favBtn.addEventListener('click', () => { toggleFav(c.id); renderScene(); });
  acts.appendChild(favBtn);
  const icsBtn = el('button', 'act', '导出单角色 ICS');
  icsBtn.addEventListener('click', () => downloadIcs([c], `${c.name}-${em}.ics`));
  acts.appendChild(icsBtn);
  const poBtn = el('button', 'act', state.portraitOnly ? '退出仅看立绘' : '仅看立绘');
  poBtn.addEventListener('click', () => { state.portraitOnly = !state.portraitOnly; renderScene(); });
  acts.appendChild(poBtn);
  const editBtn = el('button', 'act', '编辑');
  editBtn.addEventListener('click', () => openAddForm(c));
  acts.appendChild(editBtn);
  const backBtn = el('button', 'act primary', '返回当日名单');
  backBtn.addEventListener('click', closeScene);
  acts.appendChild(backBtn);
  body.appendChild(acts);
}
function closeScene() {
  state.sceneCharId = null;
  state.portraitOnly = false;
  $('#scene').hidden = true;
  requestTheme();
}

/* ---------- 收藏 ---------- */
function toggleFav(id) {
  if (state.favs.has(id)) state.favs.delete(id); else state.favs.add(id);
  saveJSON(LS.favs, [...state.favs]);
  renderAll();
  if (!$('#scene').hidden) renderScene();
}

/* ---------- 筹码条 ---------- */
function renderChips() {
  const box = $('#chips');
  box.innerHTML = '';
  const chips = [];
  if (state.selectedGames.length < 4) {
    for (const g of state.selectedGames) chips.push({ label: GAME_META[g].short, clear: () => toggleGame(g) });
  }
  for (const g of GAME_ORDER) {
    const gf = state.filters.gameFilters[g];
    for (const dim of ['elements', 'rarities', 'weapons', 'regions']) {
      for (const v of gf[dim]) chips.push({ label: `${GAME_META[g].short}·${v}`, clear: () => { gf[dim] = gf[dim].filter((x) => x !== v); persistFilters(); renderAll(); } });
    }
  }
  if (state.filters.favOnly) chips.push({ label: '只看收藏', clear: () => { state.filters.favOnly = false; persistFilters(); renderAll(); } });
  box.hidden = chips.length === 0;
  for (const ch of chips) {
    const chip = el('span', 'chip');
    chip.appendChild(el('b', '', ch.label));
    const x = el('button', 'chip-x', '✕');
    x.setAttribute('aria-label', '移除 ' + ch.label);
    x.addEventListener('click', ch.clear);
    chip.appendChild(x);
    box.appendChild(chip);
  }
  if (chips.length > 1) {
    const all = el('button', 'chipbtn', '清除全部');
    all.addEventListener('click', clearAllFilters);
    box.appendChild(all);
  }
}
function clearAllFilters() {
  for (const g of GAME_ORDER) state.filters.gameFilters[g] = { elements: [], rarities: [], weapons: [], regions: [] };
  state.filters.favOnly = false;
  state.filters.showMissingInfo = true;
  state.selectedGames = [...GAME_ORDER];
  persistFilters();
  renderAll();
}
function persistFilters() {
  saveJSON(LS.filters, { filters: state.filters, favOnly: state.filters.favOnly });
}

/* ---------- 命令坞 ---------- */
function renderDock() {
  const box = $('#dockGames');
  box.innerHTML = '';
  for (const g of GAME_ORDER) {
    const b = el('button', 'gamebtn' + (state.selectedGames.includes(g) ? ' on' : ''));
    b.style.setProperty('--gcolor', GAME_META[g].color);
    b.appendChild(el('span', 'gdot'));
    b.appendChild(el('span', '', GAME_META[g].short));
    b.setAttribute('aria-pressed', String(state.selectedGames.includes(g)));
    b.addEventListener('click', () => toggleGame(g));
    box.appendChild(b);
  }
  const n = activeFilterCount();
  $('#btnFilter').textContent = n > 0 ? `筛选·${n}` : '筛选';
  $('#btnFilter').classList.toggle('on', n > 0);
  $('#btnDensity').textContent = { avatar: '头像', card: '卡', compact: '紧' }[state.density];
}
function toggleGame(g) {
  const i = state.selectedGames.indexOf(g);
  if (i >= 0) state.selectedGames.splice(i, 1); else state.selectedGames.push(g);
  state.selectedGames = GAME_ORDER.filter((x) => state.selectedGames.includes(x));
  persistFilters();
  renderAll();
}

/* ---------- 筛选面板 ---------- */
function renderFilterPanel() {
  const body = $('#filterBody');
  body.innerHTML = '';
  const g = state.focusGame;
  const gf = state.filters.gameFilters[g];
  $('#filterCount').textContent = `${allCharacters.length} → ${filteredChars().length} 位`;
  const games = el('div', 'fgames');
  for (const id of GAME_ORDER) {
    const b = el('button', 'fval gamebtn' + (state.selectedGames.includes(id) ? ' on' : '') + (id === g ? ' on' : ''));
    b.style.setProperty('--gcolor', GAME_META[id].color);
    b.textContent = GAME_META[id].short;
    b.addEventListener('click', () => {
      if (state.focusGame !== id) { state.focusGame = id; renderFilterPanel(); return; }
      toggleGame(id);
      renderFilterPanel();
    });
    games.appendChild(b);
  }
  body.appendChild(games);
  const labels = WALL_DATA.filterLabels[g];
  const options = optionsForGame(g);
  const sec = (key, label, values) => {
    if (!values.length) return;
    const s = el('div', 'fsec');
    s.appendChild(el('div', 'fsec-h', label));
    const vs = el('div', 'fvals');
    for (const v of values) {
      const on = gf[key].includes(v);
      const b = el('button', 'fval' + (on ? ' on' : ''), String(v));
      b.addEventListener('click', () => {
        gf[key] = on ? gf[key].filter((x) => x !== v) : [...gf[key], v];
        persistFilters();
        renderAll();
        renderFilterPanel();
      });
      vs.appendChild(b);
    }
    s.appendChild(vs);
    body.appendChild(s);
  };
  sec('elements', labels.elements, options.elements);
  // rarities 内部存数字，显示为星号
  if (options.rarities.length) {
    const s = el('div', 'fsec');
    s.appendChild(el('div', 'fsec-h', '稀有度'));
    const vs = el('div', 'fvals');
    for (const v of options.rarities) {
      const on = gf.rarities.includes(v);
      const b = el('button', 'fval' + (on ? ' on' : ''), '★'.repeat(v));
      b.addEventListener('click', () => {
        gf.rarities = on ? gf.rarities.filter((x) => x !== v) : [...gf.rarities, v];
        persistFilters();
        renderAll();
        renderFilterPanel();
      });
      vs.appendChild(b);
    }
    s.appendChild(vs);
    body.appendChild(s);
  }
  sec('weapons', labels.weapons, options.weapons);
  sec('regions', labels.regions, options.regions);
  // 信息不全的角色开关（3.4 能力）
  const missRow = el('label', 'ffav');
  const mcb = el('input');
  mcb.type = 'checkbox';
  mcb.checked = state.filters.showMissingInfo;
  mcb.addEventListener('change', () => { state.filters.showMissingInfo = mcb.checked; persistFilters(); renderAll(); renderFilterPanel(); });
  missRow.appendChild(mcb);
  missRow.appendChild(el('span', '', '显示信息不全的角色'));
  body.appendChild(missRow);
  const favRow = el('label', 'ffav');
  const cb = el('input');
  cb.type = 'checkbox';
  cb.checked = state.filters.favOnly;
  cb.addEventListener('change', () => { state.filters.favOnly = cb.checked; persistFilters(); renderAll(); renderFilterPanel(); });
  favRow.appendChild(cb);
  favRow.appendChild(el('span', '', '只看收藏'));
  body.appendChild(favRow);
}
function optionsForGame(g) {
  const o = { elements: [], rarities: [], weapons: [], regions: [] };
  for (const c of allCharacters.filter((c) => c.game === g)) {
    if (c.element && !o.elements.includes(c.element)) o.elements.push(c.element);
    if (c.rarity && !o.rarities.includes(c.rarity)) o.rarities.push(c.rarity);
    if (c.weapon && !o.weapons.includes(c.weapon)) o.weapons.push(c.weapon);
    if (c.region && !o.regions.includes(c.region)) o.regions.push(c.region);
  }
  o.elements.sort(); o.rarities.sort((a, b) => b - a); o.weapons.sort(); o.regions.sort();
  return o;
}

/* ---------- 搜索 ---------- */
function openSearch(prefill = '') {
  openPop('search');
  const input = $('#searchInput');
  input.value = prefill;
  state.searchHl = 0;
  renderSearch();
  setTimeout(() => input.focus(), 30);
}
function searchAll(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const fields = (c) => [
    ['name', c.name], ['nameEn', c.nameEn], ['game', GAME_META[c.game]?.name],
    ['birthday', c.birthday], ['element', c.element], ['weapon', c.weapon], ['region', c.region],
  ];
  return allCharacters
    .map((c, i) => {
      let score = 0; const hits = [];
      for (const [f, v] of fields(c)) {
        if (!v) continue;
        const s = String(v).toLowerCase();
        if (s.includes(q)) {
          score = Math.max(score, (f === 'name' || f === 'nameEn') ? 2 : 1);
          hits.push(f);
        }
      }
      return { c, score, hits, i };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, 8);
}
function renderSearch() {
  const box = $('#searchResults');
  box.innerHTML = '';
  const q = $('#searchInput').value;
  const rs = searchAll(q);
  if (!q.trim()) { box.appendChild(el('div', 'shint', '输入中英文名 / 游戏 / 属性 / 武器 / 地区 / 生日（如 08-10）。搜索不受当前筛选限制。')); return; }
  if (!rs.length) { box.appendChild(el('div', 'shint', '没有匹配的角色。')); return; }
  rs.forEach((r, idx) => {
    const row = el('button', 'srow' + (idx === state.searchHl ? ' hl' : ''));
    row.appendChild(imgWithFallback(r.c.avatar, '', r.c.name[0]));
    const mid = el('div', 'rmid');
    mid.appendChild(el('span', 'sname', `${r.c.name} · ${r.c.nameEn}`));
    mid.appendChild(el('span', 'smeta', `${GAME_META[r.c.game].short} · ${dateKeyOf(r.c, state.mode) || '无有效日期'}`));
    row.appendChild(mid);
    row.appendChild(el('span', 'shit', r.hits.slice(0, 2).join('/')));
    row.addEventListener('click', () => gotoCharacter(r.c));
    box.appendChild(row);
  });
}
function gotoCharacter(c) {
  const key = dateKeyOf(c, state.mode) || dateKeyOf(c, 'birthday') || dateKeyOf(c, 'release');
  if (!key) { toast('该角色当前没有可定位的有效日期'); return; }
  const [mm, dd] = key.split('-').map(Number);
  // 定位到最近一次（今天之前用今年，之后的月日用明年）
  const pastThisYear = (mm < TODAY.getMonth() + 1 || (mm === TODAY.getMonth() + 1 && dd <= TODAY.getDate()));
  const y = pastThisYear ? TODAY.getFullYear() : TODAY.getFullYear() + 1;
  const placed = keyForYear(key, y).key;
  state.anchor = { y, m: mm };
  state.selectedDate = `${y}-${placed}`;
  state.view = 'month';
  closePops();
  renderAll();
  openDate(state.selectedDate, true);
  openScene(c.id);
}

/* ---------- 偏好面板 ---------- */
function renderPrefs() {
  const body = $('#prefsBody');
  body.innerHTML = '';
  const row = (label, control) => {
    const r = el('div', 'prow');
    r.appendChild(el('span', '', label));
    r.appendChild(control);
    body.appendChild(r);
  };
  const seg = (values, current, onPick) => {
    const s = el('div', 'seg');
    for (const [val, lab] of values) {
      const b = el('button', val === current ? 'on' : '', lab);
      b.addEventListener('click', () => onPick(val));
      s.appendChild(b);
    }
    return s;
  };
  row('显示密度', seg([['avatar', '头像'], ['card', '卡'], ['compact', '紧凑']], state.density, (v) => { state.density = v; persistPrefs(); renderAll(); renderPrefs(); }));
  row('一周起点', seg([[0, '周日'], [1, '周一']], state.weekStart, (v) => { state.weekStart = v; persistPrefs(); renderAll(); renderPrefs(); }));
  row('日期语义', seg([['birthday', '生日'], ['release', '实装']], state.mode, (v) => { state.mode = v; persistPrefs(); renderAll(); renderPrefs(); }));
  row('仅看立绘（隐藏信息侧栏）', seg([[true, '开'], [false, '关']], state.portraitPref, (v) => { state.portraitPref = v; persistPrefs(); if (!$('#scene').hidden) { state.portraitOnly = v; renderScene(); } renderPrefs(); }));
  row('动效（reduced-motion）', seg([[true, '开'], [false, '关']], state.motion, (v) => { state.motion = v; document.documentElement.classList.toggle('nofx', !v); persistPrefs(); renderPrefs(); }));
  row('上下文跟随选中角色', seg([[true, '跟随'], [false, '关闭']], state.themeFollow, (v) => { state.themeFollow = v; persistPrefs(); applyTheme(); renderPrefs(); }));
  const sync = el('div', 'prow');
  sync.appendChild(el('span', '', '更新已发布数据'));
  const sb = el('button', 'chipbtn primary', '检查更新');
  sb.addEventListener('click', demoSync);
  sync.appendChild(sb);
  body.appendChild(sync);
  const syncInfo = el('div', 'prow');
  syncInfo.appendChild(el('span', 'psync', state.lastSync ? `最后更新：${state.lastSync}` : '尚未更新过（原型使用内置快照）'));
  body.appendChild(syncInfo);
  const exp1 = el('div', 'prow');
  exp1.appendChild(el('span', '', '导出'));
  const exb = el('div', '');
  const b1 = el('button', 'chipbtn', '全部 JSON');
  b1.addEventListener('click', exportJSON);
  const b2 = el('button', 'chipbtn', 'ICS（当前范围）');
  b2.addEventListener('click', () => downloadIcs(filteredChars(), 'mihoyo-anniversaries.ics'));
  exb.append(b1, ' ', b2);
  exp1.appendChild(exb);
  body.appendChild(exp1);
}
function persistPrefs() {
  saveJSON(LS.prefs, {
    density: state.density, weekStart: state.weekStart, motion: state.motion,
    themeFollow: state.themeFollow, portraitPref: state.portraitPref, mode: state.mode,
  });
}

/* ---------- 同步演示（真实反馈路径：进度→结果/失败） ---------- */
function demoSync() {
  const row = $('#syncrow');
  row.hidden = false;
  const steps = ['正在检查已发布数据…', '正在尝试 ./data/characters.json …'];
  let i = 0;
  row.textContent = steps[0];
  const t = setInterval(() => {
    i += 1;
    if (i < steps.length) { row.textContent = steps[i]; return; }
    clearInterval(t);
    fetch('./data/characters.json?t=' + Date.now(), { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        row.textContent = `更新完成：共 ${data.length} 个角色。`;
        state.lastSync = new Date().toLocaleString('zh-CN');
        setTimeout(() => { row.hidden = true; renderPrefs(); }, 2400);
      })
      .catch(() => {
        row.textContent = '已发布数据不可用，继续使用本地内置数据。';
        toast('同步失败：已发布数据不可用');
        setTimeout(() => { row.hidden = true; renderPrefs(); }, 3200);
      });
  }, 900);
}

/* ---------- 导出 ---------- */
function exportJSON() {
  downloadBlob(JSON.stringify(allCharacters, null, 2), 'application/json', `mihoyo-characters-${TODAY_STR}.json`);
  toast('已导出全部角色 JSON');
}
function downloadIcs(chars, filename) {
  const valid = chars.filter((c) => dateKeyOf(c, state.mode));
  if (!valid.length) { toast('当前范围内没有可导出的有效日期'); return; }
  const esc = (v) => String(v || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const y = state.anchor.y;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//candidate-02 wall prototype//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const c of valid) {
    const em = effectiveMode(c.game, state.mode);
    const key = keyForYear(dateKeyOf(c, state.mode), y).key;
    const [mm, dd] = key.split('-');
    lines.push('BEGIN:VEVENT',
      `UID:${esc(c.id)}-${em}@wall-proto`,
      `DTSTAMP:${y}0101T000000Z`,
      `DTSTART;VALUE=DATE:${y}${mm}${dd}`,
      `SUMMARY:${esc(c.name)}${em === 'release' ? '实装纪念日' : '生日'} - ${GAME_META[c.game].name}`,
      'RRULE:FREQ=YEARLY', 'TRANSP:TRANSPARENT', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  downloadBlob(lines.join('\r\n') + '\r\n', 'text/calendar', filename);
  toast(`已导出 ${valid.length} 个事件`);
}
function downloadBlob(text, type, filename) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- 添加/编辑 + JSON 导入 ---------- */
function openAddForm(editing = null) {
  closePops(false);
  state.pop = 'add';
  $('#popAdd').hidden = false;
  state.editingId = editing ? editing.id : null;
  $('#addTitle').textContent = editing ? `编辑 · ${editing.name}` : '添加角色';
  const body = $('#addBody');
  body.innerHTML = '';
  const frm = el('div', 'frm');
  const field = (label, key, value, opts = {}) => {
    const lab = el('label', opts.full ? 'full' : '');
    lab.appendChild(el('span', '', label));
    let input;
    if (opts.type === 'select') {
      input = el('select');
      for (const [v, t] of opts.options) { const op = el('option', '', t); op.value = v; input.appendChild(op); }
      input.value = value || opts.options[0][0];
    } else {
      input = el('input');
      input.type = opts.type || 'text';
      input.value = value || '';
      input.placeholder = opts.placeholder || '';
    }
    input.dataset.key = key;
    lab.appendChild(input);
    frm.appendChild(lab);
    return input;
  };
  field('中文名 *', 'name', editing?.name);
  field('英文名', 'nameEn', editing?.nameEn);
  field('游戏 *', 'game', editing?.game, { type: 'select', options: GAME_ORDER.map((g) => [g, GAME_META[g].name]) });
  field('生日（MM-DD）', 'birthday', editing?.birthday, { placeholder: '08-10' });
  field('实装日期（YYYY-MM-DD）', 'releaseDate', editing?.releaseDate, { placeholder: '2021-08-10' });
  field('稀有度', 'rarity', editing?.rarity ? String(editing.rarity) : '', { type: 'select', options: [['', '—'], ['5', '★★★★★'], ['4', '★★★★']] });
  field('元素 / 属性', 'element', editing?.element);
  field('武器 / 命途 / 特性', 'weapon', editing?.weapon);
  field('地区 / 阵营', 'region', editing?.region);
  field('头像 URL', 'avatar', editing?.avatar, { full: true });
  const avLab = el('label', 'full');
  avLab.appendChild(el('span', '', '头像预览 / 本地图片'));
  const avBox = el('div', 'frmav');
  const avPrev = imgWithFallback(editing?.avatar, '', '?');
  avBox.appendChild(avPrev);
  const fileInput = el('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    avPrev.replaceWith(imgWithFallback(url, '', '?'));
    frm.querySelector('[data-key="avatar"]').value = '(本地图片)';
  });
  avBox.appendChild(fileInput);
  avLab.appendChild(avBox);
  frm.appendChild(avLab);

  const save = el('button', 'act primary full', editing ? '保存修改' : '添加角色');
  save.style.gridColumn = '1 / -1';
  save.addEventListener('click', () => {
    const get = (k) => frm.querySelector(`[data-key="${k}"]`)?.value.trim() || '';
    const name = get('name');
    const game = get('game');
    const birthday = get('birthday');
    if (!name || !game || !/^\d{2}-\d{2}$/.test(birthday)) { toast('请填写中文名、游戏和有效生日（MM-DD）'); return; }
    const data = {
      name, nameEn: get('nameEn'), game, birthday,
      releaseDate: /^\d{4}-\d{2}-\d{2}$/.test(get('releaseDate')) ? get('releaseDate') : undefined,
      rarity: Number(get('rarity')) || undefined,
      element: get('element'), weapon: get('weapon'), region: get('region'),
      avatar: get('avatar'), portrait: editing?.portrait,
      aff: undefined,
    };
    if (state.editingId) {
      const idx = customChars.findIndex((c) => c.id === state.editingId);
      const base = allCharacters.find((c) => c.id === state.editingId) || {};
      const merged = { ...base, ...data, id: state.editingId };
      merged.aff = resolveAffLocal(merged).id;
      if (idx >= 0) customChars[idx] = merged; else customChars.push(merged);
      toast('已保存修改');
    } else {
      const c = { ...data, id: `manual-${Date.now().toString(36)}`, source: 'manual', updatedAt: new Date().toISOString() };
      c.aff = resolveAffLocal(c).id;
      customChars.push(c);
      toast('已添加角色');
    }
    saveJSON(LS.chars, customChars);
    allCharacters = mergeChars(WALL_DATA.characters, customChars);
    closePops();
    renderAll();
    if (state.sceneCharId) renderScene();
  });
  frm.appendChild(save);
  body.appendChild(frm);

  const imp = el('div', 'fsec');
  imp.appendChild(el('div', 'fsec-h', 'JSON 导入（单对象或数组）'));
  const ta = el('textarea', 'full');
  ta.rows = 4;
  ta.placeholder = '[{"name":"…","game":"genshin","birthday":"08-10", …}]';
  ta.style.gridColumn = '1 / -1';
  const impBtn = el('button', 'act', '解析并导入');
  const impInfo = el('span', 'psync', '');
  impBtn.addEventListener('click', () => {
    try {
      let arr = JSON.parse(ta.value);
      arr = Array.isArray(arr) ? arr : [arr];
      let added = 0, updated = 0;
      for (const raw of arr) {
        if (!raw?.name || !raw?.game || !raw?.birthday) continue;
        const c = { ...raw, id: raw.id || `manual-${Date.now().toString(36)}-${added}`, source: 'manual', updatedAt: new Date().toISOString() };
        c.aff = resolveAffLocal(c).id;
        const idx = customChars.findIndex((x) => x.id === c.id || x.name === c.name);
        if (idx >= 0) { customChars[idx] = c; updated += 1; } else { customChars.push(c); added += 1; }
      }
      saveJSON(LS.chars, customChars);
      allCharacters = mergeChars(WALL_DATA.characters, customChars);
      impInfo.textContent = `新增 ${added} / 更新 ${updated}`;
      renderAll();
    } catch {
      impInfo.textContent = 'JSON 解析失败：请检查格式。';
    }
  });
  imp.append(ta, impBtn, ' ', impInfo);
  body.appendChild(imp);
}
function resolveAffLocal(c) {
  const GS = { '蒙德': 'genshin-mondstadt', '璃月': 'genshin-liyue', '稻妻': 'genshin-inazuma', '须弥': 'genshin-sumeru', '挪德卡莱': 'genshin-sumeru', '枫丹': 'genshin-fontaine', '纳塔': 'genshin-natlan', '至冬': 'genshin-snezhnaya', '坎瑞亚': 'genshin-khaenriah' };
  const ZS = { '狡兔屋': 'zzz-cunning-hares', '维多利亚家政': 'zzz-victoria-housekeeping', '白祇重工': 'zzz-belobog', '卡吕冬之子': 'zzz-sons-of-calydon', '对空六课': 'zzz-section-6', '治安局·刑侦特勤组': 'zzz-criminal-investigation', '防卫军·奥波勒斯小队': 'zzz-obol-squad', '云岿山': 'zzz-mountain-cloud', '怪啖屋': 'zzz-hollow-special-operations', '坎卜斯黑枝': 'zzz-obsidian', '妄想天使': 'zzz-wildfire', '罗斯凯利法·外务筹策局': 'zzz-rosskelieff', '天琴座': 'zzz-lyra', '反舌鸟': 'zzz-mockingbird', '达识结社': 'zzz-academia', '治安局·都市秩序部': 'zzz-pubsec-public-order' };
  const r = (c.region || '').trim();
  let id;
  if (c.game === 'genshin') id = GS[r] || 'genshin-other';
  else if (c.game === 'zzz') id = ZS[r] || 'zzz-other';
  else if (c.game === 'hsr') id = 'hsr-other';
  else if (c.game === 'honkai3') id = 'honkai3-other';
  else id = 'genshin-other';
  return AFF_MAP.get(id);
}

/* ---------- 跳转面板 ---------- */
function renderJump() {
  const body = $('#jumpBody');
  body.innerHTML = '';
  const yr = el('div', 'fsec');
  yr.appendChild(el('div', 'fsec-h', '年'));
  const ys = el('div', 'fvals');
  for (const y of [2024, 2025, 2026, 2027, 2028]) {
    const b = el('button', 'fval' + (state.anchor.y === y ? ' on' : ''), String(y));
    b.addEventListener('click', () => { state.anchor.y = y; renderAll(); renderJump(); });
    ys.appendChild(b);
  }
  yr.appendChild(ys);
  body.appendChild(yr);
  const ms = el('div', 'fsec');
  ms.appendChild(el('div', 'fsec-h', '月'));
  const mg = el('div', 'jgrid');
  for (let m = 1; m <= 12; m++) {
    const b = el('button', 'jm' + (state.anchor.m === m ? ' on' : ''), `${m}月`);
    b.addEventListener('click', () => { state.anchor.m = m; closePops(); renderAll(); });
    mg.appendChild(b);
  }
  ms.appendChild(mg);
  body.appendChild(ms);
  if (state.anchor.m === 2 && !isLeap(state.anchor.y)) {
    body.appendChild(el('div', 'scene-empty', `${state.anchor.y} 年非闰年：2月29日的纪念日按 2月28日 展示（详情中保留说明）。`));
  }
}

/* ---------- 面板管理（互斥升起） ---------- */
function openPop(name) {
  closePops(false);
  state.pop = name;
  const map = { filter: '#popFilter', search: '#popSearch', prefs: '#popPrefs', add: '#popAdd', jump: '#popJump' };
  $(map[name]).hidden = false;
  if (name === 'filter') renderFilterPanel();
  if (name === 'prefs') renderPrefs();
  if (name === 'jump') renderJump();
  if (name === 'add') openAddForm();
}
function closePops(rerender = true) {
  state.pop = null;
  for (const id of ['#popFilter', '#popSearch', '#popPrefs', '#popAdd', '#popJump']) $(id).hidden = true;
  if (rerender) renderAll();
}

/* ---------- devstrip ---------- */
function syncDevstrip() {
  const current = document.documentElement.dataset.aff || '';
  document.querySelectorAll('#devstrip button').forEach((b) => b.classList.toggle('on', b.dataset.dev === current));
}

/* ---------- 总渲染 ---------- */
function renderAll() {
  renderEdge();
  renderChips();
  renderDock();
  monthview().hidden = state.view !== 'month' || state.selectedGames.length === 0;
  $('#weekview').hidden = state.view !== 'week' || state.selectedGames.length === 0;
  if (state.view === 'month') renderMonth(); else renderWeek();
  applyTheme();
}

/* ---------- 事件绑定 ---------- */
function bind() {
  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) {
      // 点击墙面空白关闭浮层（不关闭立板）
      if (state.pop && e.target.closest('.wall')) closePops();
      return;
    }
    switch (act) {
      case 'prev': {
        if (state.view === 'month') {
          state.anchor.m -= 1;
          if (state.anchor.m < 1) { state.anchor.m = 12; state.anchor.y -= 1; }
        } else {
          const [y, m, d] = (state.selectedDate || TODAY_STR).split('-').map(Number);
          const nd = new Date(y, m - 1, d - 7);
          state.anchor = { y: nd.getFullYear(), m: nd.getMonth() + 1 };
          state.selectedDate = ymd(nd);
        }
        renderAll(); break;
      }
      case 'next': {
        if (state.view === 'month') {
          state.anchor.m += 1;
          if (state.anchor.m > 12) { state.anchor.m = 1; state.anchor.y += 1; }
        } else {
          const [y, m, d] = (state.selectedDate || TODAY_STR).split('-').map(Number);
          const nd = new Date(y, m - 1, d + 7);
          state.anchor = { y: nd.getFullYear(), m: nd.getMonth() + 1 };
          state.selectedDate = ymd(nd);
        }
        renderAll(); break;
      }
      case 'today':
        state.anchor = { y: TODAY.getFullYear(), m: TODAY.getMonth() + 1 };
        state.selectedDate = TODAY_STR;
        renderAll();
        break;
      case 'jump': openPop('jump'); break;
      case 'view': state.view = e.target.closest('[data-view]').dataset.view; renderAll(); break;
      case 'mode': state.mode = e.target.closest('[data-mode]').dataset.mode; persistPrefs(); renderAll(); break;
      case 'boardClose': closeBoard(); break;
      case 'boardPrev': shiftBoard(-1); break;
      case 'boardNext': shiftBoard(1); break;
      case 'sceneBack': case 'sceneClose': closeScene(); break;
      case 'openFilter': state.pop === 'filter' ? closePops() : openPop('filter'); break;
      case 'openSearch': state.pop === 'search' ? closePops() : openSearch(); break;
      case 'openPrefs': state.pop === 'prefs' ? closePops() : openPop('prefs'); break;
      case 'openAdd': openAddForm(); break;
      case 'density': {
        const order = ['avatar', 'card', 'compact'];
        state.density = order[(order.indexOf(state.density) + 1) % 3];
        persistPrefs(); renderAll(); break;
      }
      case 'closePops': closePops(); break;
      case 'clearAll': clearAllFilters(); if (state.pop === 'filter') renderFilterPanel(); break;
      case 'gotoBusy': state.anchor = { y: 2026, m: 8 }; renderAll(); break;
    }
  });

  // 空游戏态的快速恢复按钮
  const egb = $('#emptygameBtns');
  for (const g of GAME_ORDER) {
    const b = el('button', 'gamebtn');
    b.style.setProperty('--gcolor', GAME_META[g].color);
    b.appendChild(el('span', 'gdot'));
    b.appendChild(el('span', '', GAME_META[g].name));
    b.addEventListener('click', () => toggleGame(g));
    egb.appendChild(b);
  }

  $('#devstrip').addEventListener('click', (e) => {
    const b = e.target.closest('[data-dev]');
    if (!b) return;
    state.pinnedAff = b.dataset.dev;
    requestTheme();
  });

  $('#searchInput').addEventListener('input', () => { state.searchHl = 0; renderSearch(); });
  $('#searchInput').addEventListener('keydown', (e) => {
    const rs = searchAll(e.target.value);
    if (e.key === 'ArrowDown') { e.preventDefault(); state.searchHl = Math.min(state.searchHl + 1, rs.length - 1); renderSearch(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); state.searchHl = Math.max(state.searchHl - 1, 0); renderSearch(); }
    else if (e.key === 'Enter' && rs[state.searchHl]) { e.preventDefault(); gotoCharacter(rs[state.searchHl].c); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.pop) closePops();
      else if (!$('#scene').hidden) closeScene();
      else if (!$('#board').hidden) closeBoard();
      return;
    }
    if (e.key === '/' && !state.pop && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      openSearch();
    }
  });
  window.addEventListener('resize', () => { renderAll(); });
}

/* ---------- URL 参数（供截图脚本驱动状态） ---------- */
function applyShotParams() {
  const p = new URLSearchParams(location.search);
  if (p.get('aff') != null) state.pinnedAff = p.get('aff');
  if (p.get('view')) state.view = p.get('view');
  if (p.get('mode')) state.mode = p.get('mode');
  if (p.get('density')) state.density = p.get('density');
  if (p.get('games') === 'none') state.selectedGames = [];
  if (p.get('games')) state.selectedGames = p.get('games').split(',').filter((g) => GAME_ORDER.includes(g));
  if (p.get('freg')) state.filters.gameFilters[p.get('fgame') || 'genshin'].regions = p.get('freg').split('|');
  if (p.get('fel')) state.filters.gameFilters[p.get('fgame') || 'genshin'].elements = p.get('fel').split('|');
  if (p.get('frar')) state.filters.gameFilters[p.get('fgame') || 'genshin'].rarities = p.get('frar').split('|').map(Number);
  if (p.get('focus')) state.focusGame = p.get('focus');
  if (p.get('fmiss') === 'hide') state.filters.showMissingInfo = false;
  if (p.get('missingInfo') === '1') state.filters.showMissingInfo = false;
  if (p.get('nofx') === '1') { state.motion = false; document.documentElement.classList.add('nofx'); }
  renderAll();
  if (p.get('date')) {
    const [y] = p.get('date').split('-').map(Number);
    state.anchor.y = y;
    const has = buildEventMap(filteredChars(), state.mode, y).has(p.get('date').slice(5));
    openDate(p.get('date'), has);
  }
  if (p.get('char')) openScene(p.get('char'));
  if (p.get('po') === '1' && state.sceneCharId) { state.portraitOnly = true; renderScene(); }
  if (p.get('panel')) openPop(p.get('panel'));
  if (p.get('q') != null) openSearch(p.get('q'));
}

/* ---------- 启动 ---------- */
bind();
renderAll();
applyShotParams();
if (new URLSearchParams(location.search).get('dbg')) {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;background:#000;color:#0f0;font:13px/1.45 monospace;padding:8px;white-space:pre-wrap;';
  const R = (el) => Math.round(el.getBoundingClientRect().width);
  const wall = document.getElementById('wall');
  const mv = document.getElementById('monthview');
  const grid = document.getElementById('grid');
  const stage = wall.parentElement;
  const app = stage.parentElement;
  const cells = grid.children;
  d.textContent = [
    `IW ${innerWidth} app ${R(app)} stage ${R(stage)}`,
    `wall ${R(wall)} mv ${R(mv)} grid ${R(grid)}`,
    `csW grid ${getComputedStyle(grid).width}`,
    `cols ${getComputedStyle(grid).gridTemplateColumns}`,
    `cell0 ${R(cells[0])} cell6 ${R(cells[6])}`,
    `wallCS w ${getComputedStyle(wall).width} pad ${getComputedStyle(wall).padding}`,
  ].join('\n');
  document.body.appendChild(d);
}
window.__wallReady = true;
