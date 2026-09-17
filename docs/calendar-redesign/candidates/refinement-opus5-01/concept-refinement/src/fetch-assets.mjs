// 下载概念图所需的真实头像 / 立绘。slug 必须唯一：
// 部分角色 id 是中文（如 李素裳、梅比乌斯），旧写法清掉非 ASCII 后会塌成同名文件互相覆盖。
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../../../..');
const OUT = path.join(HERE, 'assets');
fs.mkdirSync(OUT, { recursive: true });

const chars = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characters.json'), 'utf8'));
const byName = Object.fromEntries(chars.map((c) => [c.name, c]));

const NEED = ['柏妮思', '伊涅芙', '洛恩', '李素裳', '埃洛伊', '迪希雅', '遐蝶', '夏洛蒂', '闲云', '猫又',
  '雷电芽衣', '雷之律者', '始源之律者', '无限·噬界之蛇', '魈', '砂金', '苍角', '夜兰', '卡齐娜',
  '希格莉德', '白术', '三月七', '丹恒', '姬子', '迪卢克', '梅比乌斯', '那刻夏',
  '行秋', '芙宁娜', '欧洛伦', '辛焱', '早柚', '优菈', '纳西妲', '枫原万叶', '菲林斯'];
const PORTRAITS = ['魈', '纳西妲'];

const used = new Set();
function slugFor(c, i) {
  let base = (c.id || '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  if (!base || base === c.game) base = `${c.game}-${i}`;
  let s = base, n = 2;
  while (used.has(s)) s = `${base}-${n++}`;
  used.add(s);
  return s;
}

const dl = (url, dest) => new Promise((res, rej) => {
  https.get(url, (r) => {
    if (r.statusCode !== 200) return rej(new Error(`${r.statusCode} ${url}`));
    const f = fs.createWriteStream(dest);
    r.pipe(f);
    f.on('finish', () => f.close(() => res()));
  }).on('error', rej);
});

const missing = NEED.filter((n) => !byName[n]);
if (missing.length) console.log('角色不存在:', missing.join(','));

const manifest = [];
for (let i = 0; i < NEED.length; i++) {
  const c = byName[NEED[i]];
  if (!c) continue;
  const slug = slugFor(c, i);
  const rec = {
    name: c.name, id: c.id, slug, game: c.game, birthday: c.birthday,
    releaseDate: c.releaseDate || null, rarity: c.rarity || null,
    element: c.element || null, weapon: c.weapon || null, region: c.region || null,
  };
  if (c.avatar) {
    const f = `${slug}-a.webp`;
    try { await dl(c.avatar, path.join(OUT, f)); rec.avatar = f; }
    catch (e) { console.log('头像失败', c.name, e.message); }
  }
  if (PORTRAITS.includes(c.name) && c.portrait) {
    const f = `${slug}-p.webp`;
    try { await dl(c.portrait, path.join(OUT, f)); rec.portrait = f; }
    catch (e) { console.log('立绘失败', c.name, e.message); }
  }
  manifest.push(rec);
}
fs.writeFileSync(path.join(HERE, 'manifest.json'), JSON.stringify(manifest, null, 1));

const files = new Set(fs.readdirSync(OUT));
const bad = manifest.filter((m) => (m.avatar && !files.has(m.avatar)) || (m.portrait && !files.has(m.portrait)));
console.log(`记录 ${manifest.length} 条，文件 ${files.size} 个，缺失 ${bad.length} 条`);
if (bad.length) console.log('缺:', bad.map((b) => b.name).join(','));
