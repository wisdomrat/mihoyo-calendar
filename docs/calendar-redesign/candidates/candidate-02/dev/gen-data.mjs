/* 一次性生成脚本：产出 prototype-v2/js/data.js
   数据来源（均为 brief 6.1 允许读取）：
   - prototype-v2/data/characters.json（src/data/characters.json 的副本）
   - src/data/affiliations*.ts 中的阵营定义（下方为转录的纯数据） */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const here = new URL('.', import.meta.url); // dev/
const proto = new URL('../prototype-v2/', here);
const chars = JSON.parse(readFileSync(new URL('data/characters.json', proto), 'utf8'));

const AFFILIATIONS = [
  { id: 'genshin-mondstadt', game: 'genshin', name: '蒙德', nameEn: 'Mondstadt', tagline: '自由与风之都', ink: 3, colors: { key: '#5eb3d6', accent: '#74c2a8', deep: '#2d5a6b' } },
  { id: 'genshin-liyue', game: 'genshin', name: '璃月', nameEn: 'Liyue', tagline: '岩与契约之港', ink: 3, colors: { key: '#d4a553', accent: '#c8704a', deep: '#3d3027' } },
  { id: 'genshin-inazuma', game: 'genshin', name: '稻妻', nameEn: 'Inazuma', tagline: '永恒与雷鸣之国', ink: 1, colors: { key: '#9d7dd9', accent: '#e08bb0', deep: '#1a1428' } },
  { id: 'genshin-sumeru', game: 'genshin', name: '须弥', nameEn: 'Sumeru', tagline: '智慧与雨林', ink: 3, colors: { key: '#6fba72', accent: '#d9b65d', deep: '#2d4a34' } },
  { id: 'genshin-fontaine', game: 'genshin', name: '枫丹', nameEn: 'Fontaine', tagline: '正义与水之国', ink: 1, colors: { key: '#4a8fc7', accent: '#86c8e8', deep: '#1c2d42' } },
  { id: 'genshin-natlan', game: 'genshin', name: '纳塔', nameEn: 'Natlan', tagline: '战争与火之邦', ink: 1, colors: { key: '#e85a3a', accent: '#f4c542', deep: '#2b1612' } },
  { id: 'genshin-snezhnaya', game: 'genshin', name: '至冬', nameEn: 'Snezhnaya', tagline: '冰与无爱之国', ink: 1, colors: { key: '#a2c8dc', accent: '#6b89a8', deep: '#1a2433' } },
  { id: 'genshin-khaenriah', game: 'genshin', name: '坎瑞亚', nameEn: "Khaenri'ah", tagline: '失落的无神之国', ink: 1, colors: { key: '#5a6fa8', accent: '#8b7ba8', deep: '#1a1a26' } },
  { id: 'genshin-other', game: 'genshin', name: '提瓦特大陆', nameEn: 'Teyvat', tagline: '七神与冒险者', ink: 3, colors: { key: '#3d9b8f', accent: '#d3a24a', deep: '#3a2c12' } },
  { id: 'zzz-cunning-hares', game: 'zzz', name: '狡兔屋', nameEn: 'Cunning Hares', tagline: '街头佣兵事务所', ink: 1, colors: { key: '#8dff3d', accent: '#ffeb3b', deep: '#0d1a0f' } },
  { id: 'zzz-victoria-housekeeping', game: 'zzz', name: '维多利亚家政', nameEn: 'Victoria Housekeeping Co.', tagline: '奢华管家服务', ink: 1, colors: { key: '#b794f6', accent: '#f4d03f', deep: '#1a0f28' } },
  { id: 'zzz-belobog', game: 'zzz', name: '白祇重工', nameEn: 'Belobog Heavy Industries', tagline: '机械与建造', ink: 1, colors: { key: '#ffa726', accent: '#ffeb3b', deep: '#1c1410' } },
  { id: 'zzz-sons-of-calydon', game: 'zzz', name: '卡吕冬之子', nameEn: 'Sons of Calydon', tagline: '荒野飞车帮', ink: 1, colors: { key: '#ff5722', accent: '#ff9800', deep: '#1a0d0a' } },
  { id: 'zzz-section-6', game: 'zzz', name: '对空六课', nameEn: 'Section 6', tagline: '空洞调查科', ink: 1, colors: { key: '#42a5f5', accent: '#80deea', deep: '#0d1821' } },
  { id: 'zzz-criminal-investigation', game: 'zzz', name: '治安局·刑侦特勤组', nameEn: 'Criminal Investigation Special Response Team', tagline: '精英刑警', ink: 1, colors: { key: '#26a69a', accent: '#ffd54f', deep: '#0f1a18' } },
  { id: 'zzz-obol-squad', game: 'zzz', name: '防卫军·奥波勒斯小队', nameEn: 'Defense Force Obol Squad', tagline: '空洞前线', ink: 1, colors: { key: '#7e57c2', accent: '#ab47bc', deep: '#14101c' } },
  { id: 'zzz-mountain-cloud', game: 'zzz', name: '云岿山', nameEn: 'Yun Kuishan', tagline: '古典武道', ink: 3, colors: { key: '#66bb6a', accent: '#d4a574', deep: '#2c3e2f' } },
  { id: 'zzz-hollow-special-operations', game: 'zzz', name: '怪啖屋', nameEn: 'Hollow Special Operations Section 6', tagline: '拉面 × 情报', ink: 1, colors: { key: '#ff7043', accent: '#ffb74d', deep: '#1a0f0a' } },
  { id: 'zzz-obsidian', game: 'zzz', name: '坎卜斯黑枝', nameEn: 'Obsidian Division', tagline: '地下拳馆', ink: 1, colors: { key: '#ef5350', accent: '#ffa726', deep: '#1c0d0d' } },
  { id: 'zzz-wildfire', game: 'zzz', name: '妄想天使', nameEn: 'Wildfire', tagline: '朋克乐队', ink: 1, colors: { key: '#ec407a', accent: '#ab47bc', deep: '#1a0d14' } },
  { id: 'zzz-rosskelieff', game: 'zzz', name: '罗斯凯利法·外务筹策局', nameEn: 'Rosskelieff Foreign Affairs Bureau', tagline: '影子外交', ink: 1, colors: { key: '#5c6bc0', accent: '#9575cd', deep: '#0f1018' } },
  { id: 'zzz-lyra', game: 'zzz', name: '天琴座', nameEn: 'Lyra', tagline: '星际与未知', ink: 1, colors: { key: '#42a5f5', accent: '#ab47bc', deep: '#0a0e14' } },
  { id: 'zzz-mockingbird', game: 'zzz', name: '反舌鸟', nameEn: 'Mockingbird', tagline: '地下情报', ink: 1, colors: { key: '#78909c', accent: '#ffb74d', deep: '#0d1012' } },
  { id: 'zzz-academia', game: 'zzz', name: '达识结社', nameEn: 'Academia', tagline: '学者与真理', ink: 3, colors: { key: '#5e81ac', accent: '#d4a574', deep: '#2e3440' } },
  { id: 'zzz-pubsec-public-order', game: 'zzz', name: '治安局·都市秩序部', nameEn: 'Public Security Public Order Division', tagline: '街头巡警', ink: 1, colors: { key: '#42a5f5', accent: '#ffeb3b', deep: '#0d1418' } },
  { id: 'zzz-other', game: 'zzz', name: '新艾利都', nameEn: 'New Eridu', tagline: '最后的绿洲', ink: 1, colors: { key: '#ff6b35', accent: '#f4e04d', deep: '#0e0e11' } },
  { id: 'hsr-other', game: 'hsr', name: '星穹铁道', nameEn: 'Star Rail', tagline: '开拓群星之海', ink: 1, colors: { key: '#4a5fd9', accent: '#8ab4f8', deep: '#0c1020' }, fallback: true },
  { id: 'honkai3-other', game: 'honkai3', name: '崩坏世界', nameEn: 'Honkai Impact 3rd', tagline: '女武神的战场', ink: 1, colors: { key: '#e87bb0', accent: '#f4b8d4', deep: '#1f0f1a' }, fallback: true },
];

const GENSHIN_DIRECT = { 蒙德: 'genshin-mondstadt', 璃月: 'genshin-liyue', 稻妻: 'genshin-inazuma', 须弥: 'genshin-sumeru', 挪德卡莱: 'genshin-sumeru', 枫丹: 'genshin-fontaine', 纳塔: 'genshin-natlan', 至冬: 'genshin-snezhnaya', 坎瑞亚: 'genshin-khaenriah' };
const ZZZ_DIRECT = { 狡兔屋: 'zzz-cunning-hares', 维多利亚家政: 'zzz-victoria-housekeeping', 白祇重工: 'zzz-belobog', 卡吕冬之子: 'zzz-sons-of-calydon', 对空六课: 'zzz-section-6', '治安局·刑侦特勤组': 'zzz-criminal-investigation', '防卫军·奥波勒斯小队': 'zzz-obol-squad', 云岿山: 'zzz-mountain-cloud', 怪啖屋: 'zzz-hollow-special-operations', 坎卜斯黑枝: 'zzz-obsidian', 妄想天使: 'zzz-wildfire', '罗斯凯利法·外务筹策局': 'zzz-rosskelieff', 天琴座: 'zzz-lyra', 反舌鸟: 'zzz-mockingbird', 达识结社: 'zzz-academia', '治安局·都市秩序部': 'zzz-pubsec-public-order' };

function resolveAff(c) {
  const r = String(c.region || '').trim();
  if (c.game === 'genshin') return GENSHIN_DIRECT[r] || 'genshin-other';
  if (c.game === 'zzz') return ZZZ_DIRECT[r] || 'zzz-other';
  if (c.game === 'hsr') return 'hsr-other';
  if (c.game === 'honkai3') return 'honkai3-other';
  return 'genshin-other';
}
for (const c of chars) c.aff = resolveAff(c);

const FILTER_LABELS = {
  genshin: { elements: '元素', weapons: '武器', regions: '地区' },
  hsr: { elements: '属性', weapons: '命途', regions: '阵营' },
  zzz: { elements: '属性', weapons: '特性', regions: '阵营' },
  honkai3: { elements: '属性', weapons: '类型', regions: '组织' },
};
const GAMES = [
  { id: 'genshin', name: '原神', short: '原神' },
  { id: 'hsr', name: '崩坏：星穹铁道', short: '星穹铁道' },
  { id: 'zzz', name: '绝区零', short: '绝区零' },
  { id: 'honkai3', name: '崩坏3', short: '崩坏3' },
];

const out = `/* 自动生成（dev/gen-data.mjs）：真实角色数据 + 阵营定义快照，仅供隔离原型使用 */
window.WALL_DATA = ${JSON.stringify({ games: GAMES, affiliations: AFFILIATIONS, filterLabels: FILTER_LABELS, characters: chars }, null, 1)};
`;
writeFileSync(fileURLToPath(new URL('js/data.js', proto)), out, 'utf8');

const byAff = {};
for (const c of chars) byAff[c.aff] = (byAff[c.aff] || 0) + 1;
console.log('characters:', chars.length, 'affiliations:', AFFILIATIONS.length);
console.log('top affiliations:', Object.entries(byAff).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(' '));
