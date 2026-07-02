#!/usr/bin/env node
/** Multi-source character data fetcher. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_FILES = [
  path.join(ROOT_DIR, 'public', 'data', 'characters.json'),
  path.join(ROOT_DIR, 'src', 'data', 'characters.json'),
];

const U = {
  genshin: '\u539f\u795e',
  hsr: '\u5d29\u574f\uff1a\u661f\u7a79\u94c1\u9053',
  zzz: '\u7edd\u533a\u96f6',
  honkai3: '\u5d29\u574f3',
  roleCategory: '\u89d2\u8272',
};

const GAMES = {
  genshin: { name: U.genshin, nanokaHost: 'https://gi.nanoka.cc', nanokaGame: 'gi', honeyUrl: 'https://gensh.honeyhunterworld.com/fam_chars/?lang=CHS', honeyOrigin: 'https://gensh.honeyhunterworld.com', bwiki: 'wiki.biligame.com/ys', bwikiName: 'ys' },
  hsr: { name: U.hsr, nanokaHost: 'https://hsr.nanoka.cc', nanokaGame: 'hsr', honeyUrl: 'https://starrail.honeyhunterworld.com/characters/?lang=CN', honeyOrigin: 'https://starrail.honeyhunterworld.com', bwiki: 'wiki.biligame.com/sr', bwikiName: 'sr' },
  zzz: { name: U.zzz, nanokaHost: 'https://zzz.nanoka.cc', nanokaGame: 'zzz', honeyUrl: 'https://zzz.honeyhunterworld.com/agents/?lang=CN', honeyOrigin: 'https://zzz.honeyhunterworld.com', bwiki: 'wiki.biligame.com/zzz', bwikiName: 'zzz' },
  honkai3: { name: U.honkai3, bwiki: 'wiki.biligame.com/bh3', bwikiName: 'bh3' },
};

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  Accept: 'application/json, text/html, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

const SOURCE_PRIORITY = { existing: 0, manual: 1, bwiki: 2, honeyhunter: 3, nanoka: 4 };
const GI_ELEMENT = { Anemo: '\u98ce', Geo: '\u5ca9', Electro: '\u96f7', Dendro: '\u8349', Hydro: '\u6c34', Pyro: '\u706b', Cryo: '\u51b0' };
const GI_WEAPON = { WEAPON_SWORD_ONE_HAND: '\u5355\u624b\u5251', WEAPON_CLAYMORE: '\u53cc\u624b\u5251', WEAPON_POLE: '\u957f\u67c4\u6b66\u5668', WEAPON_BOW: '\u5f13', WEAPON_CATALYST: '\u6cd5\u5668' };
const HSR_ELEMENT = { Physical: '\u7269\u7406', Fire: '\u706b', Ice: '\u51b0', Thunder: '\u96f7', Wind: '\u98ce', Quantum: '\u91cf\u5b50', Imaginary: '\u865a\u6570' };
const HSR_PATH = { Warrior: '\u6bc1\u706d', Rogue: '\u5de1\u730e', Mage: '\u667a\u8bc6', Shaman: '\u540c\u8c10', Warlock: '\u865a\u65e0', Knight: '\u5b58\u62a4', Priest: '\u4e30\u9976', Memory: '\u8bb0\u5fc6' };
const ZZZ_ELEMENT = { 200: '\u7269\u7406', 201: '\u706b', 202: '\u51b0', 203: '\u7535', 204: '\u4ee5\u592a', 205: '\u70c8\u971c' };
const ZZZ_TYPE = { 1: '\u5f3a\u653b', 2: '\u51fb\u7834', 3: '\u5f02\u5e38', 4: '\u652f\u63f4', 5: '\u9632\u62a4', 6: '\u547d\u7834' };
const HONEY_VALUE_MAP = {
  pyro: '\u706b', hydro: '\u6c34', anemo: '\u98ce', electro: '\u96f7', dendro: '\u8349', cryo: '\u51b0', geo: '\u5ca9',
  bow: '\u5f13', catalyst: '\u6cd5\u5668', claymore: '\u53cc\u624b\u5251', polearm: '\u957f\u67c4\u6b66\u5668', sword: '\u5355\u624b\u5251',
  'physical-damage_type': '\u7269\u7406', 'fire-damage_type': '\u706b', 'ice-damage_type': '\u51b0', 'lightning-damage_type': '\u96f7', 'wind-damage_type': '\u98ce', 'quantum-damage_type': '\u91cf\u5b50', 'imaginary-damage_type': '\u865a\u6570',
  'destruction-class': '\u6bc1\u706d', 'the-hunt-class': '\u5de1\u730e', 'erudition-class': '\u667a\u8bc6', 'harmony-class': '\u540c\u8c10', 'nihility-class': '\u865a\u65e0', 'preservation-class': '\u5b58\u62a4', 'abundance-class': '\u4e30\u9976', 'remembrance-class': '\u8bb0\u5fc6',
  '1-class': '\u5f3a\u653b', '2-class': '\u51fb\u7834', '3-class': '\u5f02\u5e38', '4-class': '\u652f\u63f4', '5-class': '\u9632\u62a4', '6-class': '\u547d\u7834',
  '200-element': '\u7269\u7406', '201-element': '\u706b', '202-element': '\u51b0', '203-element': '\u7535', '204-element': '\u4ee5\u592a', '205-element': '\u70c8\u971c',
};

const CHARACTER_ALIAS_GROUPS = {
  hsr: [
    ['\u6258\u5e15', '\u6258\u5e15&\u8d26\u8d26', 'Topaz', 'Topaz & Numby'],
  ],
  zzz: [
    ['\u661f\u89c1\u96c5', '\u661f\u898b\u96c5', '\u96c5', 'Miyabi', 'Hoshimi Miyabi'],
    ['\u6d45\u7fbd\u60a0\u771f', '\u60a0\u771f', 'Harumasa', 'Asaba Harumasa'],
  ],
};
const INVALID_CHARACTER_ALIASES = {
  genshin: [['TPS旅行者', 'TPS Traveler', 'nanoka-genshin-10000134']],
  zzz: [['\u4e91\u5cbf\u5c71\u00b7\u6cf0\u97f3', 'Taiyin', 'taiyin-zzz']],
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const nowIso = () => new Date().toISOString();
const pad2 = value => String(value).padStart(2, '0');
function formatBirthday(month, day) { const m = Number(month); const d = Number(day); return Number.isInteger(m) && Number.isInteger(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31 ? `${pad2(m)}-${pad2(d)}` : ''; }
function decodeHtml(value = '') { return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#8217;/g, "'").replace(/\\\//g, '/').replace(/\\"/g, '"').replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))); }
function cleanProfileValue(value = '') { return decodeHtml(String(value || '').replace(/<!--[\\s\\S]*?-->/g, '').replace(/<[^>]+>/g, '')).replace(/\\{\\{.*?\\}\\}/g, '').trim(); }
function stripTags(value = '') { return cleanProfileValue(value); }
function unique(values) { const seen = new Set(); const result = []; for (const raw of values) { const value = String(raw || '').trim(); if (value && !seen.has(value)) { seen.add(value); result.push(value); } } return result; }
function isPlaceholderAvatar(avatar = '') { return !avatar || avatar.includes('ui-avatars.com'); }
function avatarScore(avatar = '') {
  if (!avatar) return 0;
  if (avatar.includes('ui-avatars.com')) return 1;
  if (avatar.includes('static.nanoka.cc/assets/zzz/IconRoleCircle')) return 5;
  if (avatar.includes('static.nanoka.cc/assets/zzz/IconRole')) return 2;
  if (avatar.includes('static.nanoka.cc')) return 5;
  if (avatar.includes('honeyhunterworld.com')) return 4;
  if (avatar.includes('wiki.biligame.com')) return 3;
  return 2;
}

export function classifyImageRole({ width, height, url = '' }) {
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    const ratio = width / height;
    if (ratio >= 0.82 && ratio <= 1.22) return 'avatar';
    if (ratio < 0.82) return 'portrait';
  }
  if (/static\.nanoka\.cc\/assets\/zzz\/IconRoleCircle/i.test(url)) return 'avatar';
  if (/honeyhunterworld\.com\/img\/character\/.+_icon_100\.webp/i.test(url)) return 'avatar';
  if (/static\.nanoka\.cc\/assets\/zzz\/IconRole/i.test(url)) return 'portrait';
  if (/avatar|head|icon_100|shopicon/i.test(url)) return 'avatar';
  if (/portrait|gacha|full|stand|\u7acb\u7ed8/i.test(url)) return 'portrait';
  return 'unknown';
}
function sourceScore(source = '') { return SOURCE_PRIORITY[source] ?? 0; }
function normalizeKeyPart(value = '') { return String(value || '').toLowerCase().replace(/[\s\u00b7\u30fb'"\u201c\u201d\u2018\u2019\u300c\u300d:\uff1a()\uff08\uff09\[\]_-]/g, '').trim(); }
function aliasPartsFor(game, parts) {
  const expanded = [...parts];
  for (const group of CHARACTER_ALIAS_GROUPS[game] || []) {
    const normalizedGroup = group.map(value => normalizeKeyPart(value));
    if (normalizedGroup.some(part => parts.includes(part))) expanded.push(...normalizedGroup);
  }
  return unique(expanded);
}
function canonicalNameFor(game, name, nameEn = '') {
  const parts = [name, nameEn].map(value => normalizeKeyPart(value)).filter(Boolean);
  for (const group of CHARACTER_ALIAS_GROUPS[game] || []) {
    const normalizedGroup = group.map(value => normalizeKeyPart(value));
    if (normalizedGroup.some(part => parts.includes(part))) return group[0];
  }
  return name;
}
function isInvalidCharacter(char) {
  const parts = [char.id, char.name, char.nameEn].map(value => normalizeKeyPart(value)).filter(Boolean);
  return (INVALID_CHARACTER_ALIASES[char.game] || []).some(group => group.map(value => normalizeKeyPart(value)).some(part => parts.includes(part)));
}
function characterKeys(char) {
  const parts = unique([char.name, char.nameEn].map(value => normalizeKeyPart(value)).filter(Boolean));
  const aliases = aliasPartsFor(char.game, parts);
  return unique(aliases.map(value => `${char.game}:${value}`).concat(char.id ? [`${char.game}:id:${normalizeKeyPart(char.id)}`] : []));
}
function generateDefaultAvatar(name, gameId) { const colors = { genshin: '4a90e2', hsr: '6b5ce7', zzz: 'ff6b6b', honkai3: 'ff8cc8' }; const initial = String(name || '?').charAt(0); return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${colors[gameId] || '999999'}&color=fff&size=256&font-size=0.5&bold=true`; }

async function fetchWithRetry(url, { retries = 3, timeoutMs = 20000, headers = {}, method = 'GET' } = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { method, headers: { ...FETCH_HEADERS, ...headers }, signal: controller.signal });
      clearTimeout(timer);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) { clearTimeout(timer); lastError = error; }
    if (attempt < retries) await sleep(500 * attempt);
  }
  throw lastError || new Error('fetch failed');
}
async function fetchText(url, options) { return (await fetchWithRetry(url, options)).text(); }
async function fetchJson(url, options) { return (await fetchWithRetry(url, options)).json(); }

export function parseBwikiWikitext(wikitext) {
  const info = {}; const text = String(wikitext || '');
  const birthdayPatterns = [/\|\s*\u751f\u65e5\s*[=\uff1d]\s*(\d{1,2})\s*\u6708\s*(\d{1,2})\s*\u65e5/, /\|\s*\u751f\u65e5\s*[=\uff1d]\s*(\d{1,2})\u6708(\d{1,2})\u65e5/, /\u751f\u65e5\s*[=\uff1d]\s*(\d{1,2})\u6708(\d{1,2})\u65e5/, /\|\s*\u751f\u65e5\s*[=\uff1d]\s*(\d{1,2})[./](\d{1,2})/];
  for (const pattern of birthdayPatterns) { const match = text.match(pattern); if (match) { info.birthday = formatBirthday(match[1], match[2]); break; } }
  const fields = [
    ['nameEn', [/\|\s*\u82f1\u6587\u540d\u79f0\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u82f1\u6587\u540d\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*name_en\s*[=\uff1d]\s*([^\n|]+)/i]],
    ['element', [/\|\s*\u5143\u7d20\u5c5e\u6027\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u5c5e\u6027\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u5143\u7d20\s*[=\uff1d]\s*([^\n|]+)/]],
    ['weapon', [/\|\s*\u6b66\u5668\u7c7b\u578b\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u547d\u9014\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u7279\u6027\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u6b66\u5668\s*[=\uff1d]\s*([^\n|]+)/]],
    ['region', [/\|\s*\u6240\u5c5e\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u9635\u8425\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u5730\u533a\s*[=\uff1d]\s*([^\n|]+)/, /\|\s*\u52bf\u529b\s*[=\uff1d]\s*([^\n|]+)/]],
  ];
  for (const [field, patterns] of fields) for (const pattern of patterns) { const match = text.match(pattern); if (match) { info[field] = stripTags(match[1]).replace(/\{\{.*?\}\}/g, '').trim(); break; } }
  for (const pattern of [/\|\s*\u7a00\u6709\u5ea6\s*[=\uff1d]\s*(\d)\s*\u661f/, /\|\s*\u7a00\u6709\u5ea6\s*[=\uff1d]\s*(\d)/, /\|\s*\u661f\u7ea7\s*[=\uff1d]\s*(\d)/]) { const match = text.match(pattern); if (match) { info.rarity = Number(match[1]); break; } }
  return info;
}

export function extractImageCandidatesFromWikitext(wikitext) {
  const text = String(wikitext || ''); const candidates = [];
  const patterns = [/\|\s*(?:\u5934\u50cf|\u89d2\u8272\u5934\u50cf|\u7acb\u7ed8|\u8bc1\u4ef6\u7167|\u56fe\u7247|\u56fe\u50cf)\s*[=\uff1d]\s*([^\n|{}<>]+?\.(?:png|jpg|jpeg|webp))/gi, /\[\[(?:\u6587\u4ef6|File|file|Image|image):([^\]|]+?\.(?:png|jpg|jpeg|webp))/g];
  for (const pattern of patterns) { let match; while ((match = pattern.exec(text))) candidates.push(stripTags(match[1]).replace(/^File:/i, '').trim()); }
  return unique(candidates);
}

export function buildImageCandidates(charName, explicitCandidates = []) {
  return unique([...explicitCandidates, `${charName}.png`, `${charName}\u8bc1\u4ef6\u7167.png`, `${charName}\u5168\u8eab.png`, `${charName}\u5934\u50cf.png`, `${charName}\u7acb\u7ed8.png`, `${charName}.jpg`, `${charName}.webp`]);
}

async function getBwikiImage(charName, bwikiName, wikitext = '') {
  const explicit = extractImageCandidatesFromWikitext(wikitext);
  for (const imgName of buildImageCandidates(charName, explicit).slice(0, explicit.length ? 4 : 2)) {
    const url = `https://wiki.biligame.com/${bwikiName}/Special:FilePath/${encodeURIComponent(imgName)}`;
    try { const response = await fetchWithRetry(url, { retries: 1, timeoutMs: 8000 }); if ((response.headers.get('content-type') || '').startsWith('image/')) return url; } catch {}
  }
  return null;
}

function stripImageExtension(name = '') {
  return String(name || '').replace(/\.(png|jpg|jpeg|webp)$/i, '');
}

function isHonkai3StigmaImageName(name = '') {
  return /[（(](上|中|下)[）)]/.test(name) || /圣痕|stigma/i.test(name);
}

export function selectBwikiRoleImages(charName, images = []) {
  const normalizedName = String(charName || '').trim();
  const candidates = images
    .map(image => ({ ...image, name: String(image.name || '').trim(), url: String(image.url || '').trim() }))
    .filter(image => image.name && image.url && image.name.startsWith(normalizedName));
  const avatar = candidates.find(image => stripImageExtension(image.name) === `${normalizedName}头像`)
    || candidates.find(image => image.name.includes('头像') && !isHonkai3StigmaImageName(image.name));
  const portrait = candidates.find(image => stripImageExtension(image.name) === `${normalizedName}立绘`)
    || candidates.find(image => image.name.includes('立绘') && !image.name.includes('头像') && !isHonkai3StigmaImageName(image.name))
    || candidates.find(image => stripImageExtension(image.name) === normalizedName && !image.name.includes('头像'));

  return {
    avatar: avatar?.url || '',
    portrait: portrait?.url || '',
  };
}

async function getBwikiRoleImages(charName, bwikiName) {
  const url = `https://wiki.biligame.com/${bwikiName}/api.php?action=query&list=allimages&aiprefix=${encodeURIComponent(charName)}&ailimit=30&aiprop=url|mime|size&format=json`;
  try {
    const data = await fetchJson(url, { retries: 1, timeoutMs: 10000, headers: { Referer: 'https://wiki.biligame.com/' } });
    return selectBwikiRoleImages(charName, data?.query?.allimages || []);
  } catch {
    return { avatar: '', portrait: '' };
  }
}

function normalizeCharacter(char) {
  const rawName = String(char.name || char.nameEn || '').trim();
  const nameEn = String(char.nameEn || rawName).trim();
  const name = canonicalNameFor(char.game, rawName, nameEn);
  return { ...char, id: String(char.id || `${name}-${char.game}`).trim(), name, nameEn, birthday: char.birthday || '', avatar: char.avatar || generateDefaultAvatar(name, char.game), rarity: char.rarity ? Number(char.rarity) : undefined, element: cleanProfileValue(char.element), weapon: cleanProfileValue(char.weapon), region: cleanProfileValue(char.region), source: char.source || 'existing', updatedAt: char.updatedAt || nowIso() };
}
function mergeCharacter(existing, incoming) {
  const merged = { ...existing }; const existingManual = existing.source === 'manual';
  if (avatarScore(incoming.avatar) > avatarScore(existing.avatar)) merged.avatar = incoming.avatar;
  if (incoming.portrait && incoming.portrait !== existing.portrait) merged.portrait = incoming.portrait;
  const incomingHasTrustedBirthday = incoming.birthday && incoming.birthday !== '??-??' && !['existing', 'manual'].includes(incoming.source);
  if (incomingHasTrustedBirthday && (isPlaceholderAvatar(existing.avatar) || !merged.birthday || merged.birthday === '??-??')) merged.birthday = incoming.birthday;
  else if ((!merged.birthday || merged.birthday === '??-??') && incoming.birthday) merged.birthday = incoming.birthday;
  if ((!merged.nameEn || normalizeKeyPart(merged.nameEn) === normalizeKeyPart(merged.name)) && incoming.nameEn) merged.nameEn = incoming.nameEn;
  if (!merged.name && incoming.name) merged.name = incoming.name;
  for (const field of ['element', 'weapon', 'region']) if (!merged[field] && incoming[field]) merged[field] = incoming[field];
  if (!merged.rarity && incoming.rarity) merged.rarity = incoming.rarity;
  if (!existingManual && sourceScore(incoming.source) > sourceScore(merged.source)) merged.source = incoming.source;
  if (!existingManual && incoming.id && sourceScore(incoming.source) >= sourceScore(existing.source)) merged.id = existing.id || incoming.id;
  merged.updatedAt = incoming.updatedAt || nowIso();
  return normalizeCharacter(merged);
}
export function mergeData(existing, newChars) {
  const records = []; const keyToIndex = new Map();
  function add(raw) {
    const char = normalizeCharacter(raw); if (!char.game || !char.name || isInvalidCharacter(char)) return;
    const keys = characterKeys(char); const existingIndex = keys.map(key => keyToIndex.get(key)).find(index => index !== undefined);
    if (existingIndex === undefined) { if (!char.birthday && !['existing', 'manual'].includes(char.source)) return; const index = records.length; records.push(char); for (const key of keys) keyToIndex.set(key, index); return; }
    records[existingIndex] = mergeCharacter(records[existingIndex], char); for (const key of characterKeys(records[existingIndex])) keyToIndex.set(key, existingIndex);
  }
  for (const char of existing || []) add({ source: 'existing', ...char });
  for (const char of newChars || []) add(char);
  return records.sort((a, b) => (a.game === b.game ? a.name.localeCompare(b.name, 'zh-Hans-CN') : a.game.localeCompare(b.game)));
}

function loadExistingData() { for (const dataPath of [...DATA_FILES].reverse()) { try { if (fs.existsSync(dataPath)) return JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (error) { console.warn(`Failed to read ${dataPath}: ${error.message}`); } } return []; }
function saveData(characters) { for (const dataPath of DATA_FILES) { fs.mkdirSync(path.dirname(dataPath), { recursive: true }); fs.writeFileSync(dataPath, `${JSON.stringify(characters, null, 2)}\n`, 'utf8'); console.log(`Saved ${path.relative(ROOT_DIR, dataPath)}`); } }
function nanokaCharacterUrl(html, gameKey) { return String(html || '').match(new RegExp(`https://static\\.nanoka\\.cc/${gameKey}/[^"' ]+/character\\.json`))?.[0] || null; }
function zzzRoleAssetUrl(iconName, prefix = 'IconRole') {
  const clean = String(iconName || '').trim().replace(/\.(png|webp|jpg|jpeg)$/i, '');
  const suffix = clean.match(/^IconRole(.+)$/i)?.[1];
  return suffix ? `https://static.nanoka.cc/assets/zzz/${prefix}${suffix}.webp` : '';
}
function genshinGachaPortraitUrl(iconName) {
  const clean = String(iconName || '').trim().replace(/\.(png|webp|jpg|jpeg)$/i, '');
  const suffix = clean.match(/^UI_AvatarIcon_(.+)$/i)?.[1];
  return suffix ? `https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_${suffix}.webp` : '';
}
export function normalizeNanokaCharacter(gameId, id, info) {
  if (gameId === 'genshin') { const character = normalizeCharacter({ id: `nanoka-genshin-${id}`, name: info.zh || info.en, nameEn: info.en || info.zh, game: gameId, birthday: Array.isArray(info.birth) ? formatBirthday(info.birth[0], info.birth[1]) : '', avatar: info.icon ? `https://static.nanoka.cc/assets/gi/${info.icon}.webp` : '', portrait: genshinGachaPortraitUrl(info.icon), rarity: info.rank === 'QUALITY_ORANGE' ? 5 : info.rank === 'QUALITY_PURPLE' ? 4 : undefined, element: GI_ELEMENT[info.element] || info.element || '', weapon: GI_WEAPON[info.weapon] || info.weapon || '', source: 'nanoka', updatedAt: nowIso() }); return isInvalidCharacter(character) ? null : character; }
  if (gameId === 'hsr') { const rarity = String(info.rank || '').match(/(\d)$/)?.[1]; return normalizeCharacter({ id: `nanoka-hsr-${id}`, name: info.zh || info.en, nameEn: info.en || info.zh, game: gameId, avatar: `https://static.nanoka.cc/assets/hsr/avatarshopicon/${id}.webp`, portrait: `https://static.nanoka.cc/assets/hsr/avatardrawcard/${id}.webp`, rarity: rarity ? Number(rarity) : undefined, element: HSR_ELEMENT[info.damageType] || info.damageType || '', weapon: HSR_PATH[info.baseType] || info.baseType || '', source: 'nanoka', updatedAt: nowIso() }); }
  if (gameId === 'zzz') return normalizeCharacter({ id: `nanoka-zzz-${id}`, name: info.zh || info.en, nameEn: info.en || info.zh, game: gameId, avatar: zzzRoleAssetUrl(info.icon, 'IconRoleCircle'), portrait: zzzRoleAssetUrl(info.icon), rarity: info.rank >= 4 ? 5 : info.rank >= 3 ? 4 : info.rank, element: ZZZ_ELEMENT[info.element] || '', weapon: ZZZ_TYPE[info.type] || '', source: 'nanoka', updatedAt: nowIso() });
  return null;
}
async function fetchFromNanoka(gameId, config) { if (!config.nanokaHost) return []; console.log(`\nFetching nanoka for ${config.name}...`); try { const html = await fetchText(config.nanokaHost, { retries: 2, timeoutMs: 20000 }); const url = nanokaCharacterUrl(html, config.nanokaGame); if (!url) throw new Error('character.json URL not found'); const data = await fetchJson(url, { retries: 2, timeoutMs: 20000 }); const chars = Object.entries(data).map(([id, info]) => normalizeNanokaCharacter(gameId, id, info)).filter(Boolean).filter(char => char.name && !/^\(.+\)/.test(char.name)); console.log(`  ${chars.length} records`); return chars; } catch (error) { console.warn(`  nanoka failed for ${gameId}: ${error.message}`); return []; } }
function extractTableRows(html) { return [...String(html || '').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(match => match[1]); }
function extractCells(row) { return [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(match => match[1]); }
function absoluteUrl(origin, src) { const clean = decodeHtml(src || '').trim(); if (!clean) return ''; return /^https?:\/\//i.test(clean) ? clean : `${origin}${clean.startsWith('/') ? '' : '/'}${clean}`; }
function normalizeHoneyValue(value) { return HONEY_VALUE_MAP[String(value || '').trim().toLowerCase()] || String(value || '').trim(); }
function normalizeHoneyCharacter(gameId, origin, cells) {
  if (cells.length < 3) return null; const imgSrc = cells[0].match(/src=["']([^"']+_100\.webp)["']/i)?.[1]; const imgAlt = cells[0].match(/alt=["']([^"']*)["']/i)?.[1]; const name = stripTags(cells[1]) || decodeHtml(imgAlt || ''); if (!name) return null;
  const href = cells[1].match(/href=["']([^"']+)/i)?.[1] || cells[0].match(/href=["']([^"']+)/i)?.[1] || name; const rarity = Number(stripTags(cells[2]).match(/\d/)?.[0] || 0) || undefined; const rsh = cells.map(cell => [...cell.matchAll(/<span class=["']rsh["']>(.*?)<\/span>/gi)].map(match => stripTags(match[1]))).flat();
  return normalizeCharacter({ id: `honey-${gameId}-${normalizeKeyPart(href)}`, name, nameEn: name, game: gameId, avatar: absoluteUrl(origin, imgSrc), rarity, weapon: normalizeHoneyValue(rsh[1]), element: normalizeHoneyValue(rsh[2]), source: 'honeyhunter', updatedAt: nowIso() });
}
async function fetchFromHoneyHunter(gameId, config) { if (!config.honeyUrl) return []; console.log(`\nFetching HoneyHunter for ${config.name}...`); try { const html = await fetchText(config.honeyUrl, { retries: 2, timeoutMs: 25000 }); const chars = unique(extractTableRows(html).map(row => normalizeHoneyCharacter(gameId, config.honeyOrigin, extractCells(row))).filter(Boolean).filter(char => char.avatar && char.avatar.includes('_100.webp')).map(char => JSON.stringify(char))).map(value => JSON.parse(value)); console.log(`  ${chars.length} records`); return chars; } catch (error) { console.warn(`  HoneyHunter failed for ${gameId}: ${error.message}`); return []; } }
async function fetchBwikiRevisions(config, titles) { const url = `https://${config.bwiki}/api.php?action=query&redirects=1&prop=revisions&rvprop=content&titles=${encodeURIComponent(titles.join('|'))}&format=json`; const data = await fetchJson(url, { retries: 2, timeoutMs: 25000, headers: { Referer: 'https://wiki.biligame.com/' } }); return Object.values(data?.query?.pages || {}); }
async function fetchFromBwiki(gameId, config) {
  console.log(`\nFetching BWIKI for ${config.name}...`);
  try { const listUrl = `https://${config.bwiki}/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(U.roleCategory)}&cmlimit=150&format=json`; const listData = await fetchJson(listUrl, { retries: 2, timeoutMs: 25000, headers: { Referer: 'https://wiki.biligame.com/' } }); const pages = (listData?.query?.categorymembers || []).filter(page => page.title && !page.title.includes(':') && !page.title.includes('\u5206\u7c7b') && !page.title.includes('\u6a21\u677f') && page.title.length < 32).slice(0, 150); if (!pages.length) return [];
    const characters = [];
    for (let i = 0; i < pages.length; i += 25) { let wikiPages = []; try { wikiPages = await fetchBwikiRevisions(config, pages.slice(i, i + 25).map(page => page.title)); } catch (error) { console.warn(`  BWIKI batch failed ${i + 1}: ${error.message}`); continue; }
      for (const wikiPage of wikiPages) { const title = wikiPage.title; const wikitext = wikiPage.revisions?.[0]?.['*'] || wikiPage.revisions?.[0]?.slots?.main?.['*'] || ''; const info = parseBwikiWikitext(wikitext); if (!info.birthday) continue; const roleImages = gameId === 'honkai3' ? await getBwikiRoleImages(title, config.bwikiName) : { avatar: '', portrait: '' }; const avatar = roleImages.avatar || (gameId === 'honkai3' ? roleImages.portrait : ''); characters.push(normalizeCharacter({ id: `bwiki-${gameId}-${title}`, name: title, nameEn: info.nameEn || title, game: gameId, birthday: info.birthday, avatar, portrait: roleImages.portrait, rarity: info.rarity, element: info.element, weapon: info.weapon, region: info.region, source: 'bwiki', updatedAt: nowIso() })); }
      await sleep(150);
    }
    console.log(`  ${characters.length} records with birthdays`); return characters;
  } catch (error) { console.warn(`  BWIKI failed for ${gameId}: ${error.message}`); return []; }
}
async function fetchAllSources() { const all = []; for (const [gameId, config] of Object.entries(GAMES)) { for (const result of [await fetchFromNanoka(gameId, config), await fetchFromBwiki(gameId, config), await fetchFromHoneyHunter(gameId, config)]) all.push(...result); await sleep(500); } return all; }
async function fetchHonkai3ImagesForExisting(existing) {
  const source = unique((existing || []).filter(char => char.game === 'honkai3' && char.name).map(char => JSON.stringify({ name: char.name, nameEn: char.nameEn, birthday: char.birthday, id: char.id })));
  const characters = [];
  if (!source.length) return characters;
  console.log(`\nFetching BWIKI images for existing ${GAMES.honkai3.name} records...`);
  for (const raw of source) {
    const char = JSON.parse(raw);
    const roleImages = await getBwikiRoleImages(char.name, GAMES.honkai3.bwikiName);
    const avatar = roleImages.avatar || roleImages.portrait || '';
    if (avatar || roleImages.portrait) {
      characters.push(normalizeCharacter({ id: `bwiki-honkai3-images-${normalizeKeyPart(char.id || char.name)}`, name: char.name, nameEn: char.nameEn || char.name, game: 'honkai3', birthday: char.birthday, avatar, portrait: roleImages.portrait, source: 'bwiki', updatedAt: nowIso() }));
    }
    await sleep(80);
  }
  console.log(`  ${characters.length} records with images`);
  return characters;
}
function printSummary(characters) { const byGame = {}; let withAvatar = 0; let withBirthday = 0; for (const char of characters) { byGame[char.game] = (byGame[char.game] || 0) + 1; if (!isPlaceholderAvatar(char.avatar)) withAvatar++; if (char.birthday && char.birthday !== '??-??') withBirthday++; } console.log(`\nTotal: ${characters.length} characters`); for (const [game, count] of Object.entries(byGame)) console.log(`  ${game}: ${count}`); console.log(`With images: ${withAvatar}/${characters.length}`); console.log(`With birthdays: ${withBirthday}/${characters.length}`); }
export async function main() { console.log('Fetching character data from multiple sources...'); const existing = loadExistingData().map(char => normalizeCharacter(char)); console.log(`Loaded ${existing.length} existing characters`); const fetched = await fetchAllSources(); fetched.push(...await fetchHonkai3ImagesForExisting(existing)); console.log(`\nFetched ${fetched.length} candidate records`); const merged = mergeData(existing, fetched); printSummary(merged); saveData(merged); }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error('Sync failed:', error); process.exitCode = 1; });
