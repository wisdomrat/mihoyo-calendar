import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const directory = path.dirname(fileURLToPath(import.meta.url));
const phase = process.argv[2] || 'after';
assert.ok(['before', 'after'].includes(phase));
const output = path.join(directory, phase);
const url = process.env.CALENDAR_V2_URL || 'http://127.0.0.1:5173/mihoyo-calendar/?ui=v2';
const characters = [
  ['nahida', '纳西妲'], ['zhongli', '钟离'], ['raiden', '雷电将军'],
  ['furina', '芙宁娜'], ['jean', '琴'], ['mavuika', '玛薇卡'],
  ['ellen', '艾莲'], ['grace', '格莉丝'], ['nicole', '妮可'],
  ['kafka', '卡芙卡'], ['remielle', '蕾米埃尔'], ['elysia', '爱莉希雅'],
];
const heroNames = new Set(['nahida', 'zhongli', 'ellen', 'grace', 'kafka', 'remielle']);
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];
const records = [];
const stageShots = [];
const heroShots = [];

async function openPage(viewport) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('.v2-workspace').waitFor();
  return page;
}

async function selectCharacter(page, name) {
  await page.getByRole('button', { name: '搜索角色', exact: true }).click();
  await page.locator('input[type="search"]').fill(name);
  await page.locator('.character-search-result').filter({
    has: page.locator('.search-result-name', { hasText: new RegExp(`^${name}`) }),
  }).first().click();
  const detail = page.locator('.v2-detail-dialog[open]');
  await detail.waitFor();
  await loadedImages(detail);
  const detailBox = await detail.boundingBox();
  await detail.locator('.v2-detail-close').click();
  await detail.waitFor({ state: 'detached' });
  await loadedImages(page.locator('.v2-stage'));
  return detailBox;
}

async function loadedImages(locator) {
  await locator.locator('img').evaluateAll(images => Promise.all(images.map(image =>
    image.decode().catch(() => {}),
  )));
}

async function captureHero(page, id, name, viewport) {
  const before = await page.locator('.v2-stage').boundingBox();
  const month = await page.locator('.v2-month-title').textContent();
  await page.locator('.v2-stage-hit').click();
  const hero = page.locator('.v2-hero-dialog[open]');
  await hero.waitFor();
  await loadedImages(hero);
  assert.equal(await hero.locator('h2').textContent(), name);
  assert.equal(await page.locator('.v2-detail-dialog[open]').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden');
  const box = await hero.boundingBox();
  assert.deepEqual(box, { x: 0, y: 0, ...page.viewportSize() });
  const filename = `${viewport}-hero-${id}.png`;
  await page.screenshot({ path: path.join(output, filename), animations: 'disabled' });
  if (viewport === 'desktop') heroShots.push({ name, filename });
  const art = await hero.locator('.v2-hero-art').evaluate(element => ({
    loaded: element instanceof HTMLImageElement ? element.complete && element.naturalWidth > 0 : null,
    filter: getComputedStyle(element).filter,
    opacity: getComputedStyle(element).opacity,
  }));
  assert.notEqual(art.loaded, false);
  if (viewport === 'desktop') await page.keyboard.press('Escape');
  else await hero.locator('.v2-hero-close').click();
  await hero.waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '');
  assert.equal(await page.locator('.v2-month-title').textContent(), month);
  assert.deepEqual(await page.locator('.v2-stage').boundingBox(), before);
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('v2-stage-hit')), true);
  records.push({ viewport, id, hero: box, art });
}

async function contactSheet(shots, filename, columns, imageWidth) {
  const page = await browser.newPage({ viewport: { width: columns * (imageWidth + 16) + 16, height: 900 } });
  const tiles = await Promise.all(shots.map(async ({ name, filename: shot }) => {
    const base64 = (await fs.readFile(path.join(output, shot))).toString('base64');
    return `<figure><figcaption>${name}</figcaption><img src="data:image/png;base64,${base64}"></figure>`;
  }));
  await page.setContent(`<style>body{margin:0;padding:16px;background:#10131d;color:#e5e8ef;font:15px system-ui}main{display:grid;grid-template-columns:repeat(${columns},${imageWidth}px);gap:16px}figure{margin:0}figcaption{padding:0 0 8px}img{width:100%;display:block;border-radius:10px}</style><main>${tiles.join('')}</main>`);
  await loadedImages(page.locator('main'));
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
  await page.close();
}

try {
  const desktop = await openPage({ width: 1920, height: 1080 });
  for (const [id, name] of characters) {
    const detailBox = await selectCharacter(desktop, name);
    const stage = desktop.locator('.v2-stage');
    const filename = `desktop-stage-${id}.png`;
    await stage.screenshot({ path: path.join(output, filename), animations: 'disabled' });
    stageShots.push({ name, filename });
    const palette = await desktop.locator('.v2-workspace').evaluate(element => {
      const css = getComputedStyle(element);
      return Object.fromEntries(['start', 'mid', 'end', 'halo', 'fill', 'deep', 'accent'].map(key => [key, css.getPropertyValue(`--v2-${key}`).trim()]));
    });
    records.push({ viewport: 'desktop', id, stage: await stage.boundingBox(), detail: detailBox, palette });
    if (['nahida', 'zhongli', 'ellen'].includes(id)) {
      await desktop.screenshot({ path: path.join(output, `desktop-workspace-${id}.png`), animations: 'disabled' });
    }
    if (heroNames.has(id)) await captureHero(desktop, id, name, 'desktop');
    console.log(`${phase}: ${name}`);
  }
  await desktop.close();

  const mobile = await openPage({ width: 390, height: 844 });
  for (const [id, name] of characters.filter(([id]) => ['zhongli', 'ellen'].includes(id))) {
    const detailBox = await selectCharacter(mobile, name);
    records.push({ viewport: 'mobile', id, stage: await mobile.locator('.v2-stage').boundingBox(), detail: detailBox });
    await mobile.screenshot({ path: path.join(output, `mobile-workspace-${id}.png`), animations: 'disabled' });
    await captureHero(mobile, id, name, 'mobile');
  }
  await mobile.close();
  await contactSheet(stageShots, 'stages.png', 6, 250);
  await contactSheet(heroShots, 'heroes.png', 2, 640);

  if (phase === 'after') {
    const baseline = JSON.parse(await fs.readFile(path.join(directory, 'before', 'verification.json'), 'utf8'));
    for (const record of records.filter(record => record.stage)) {
      const previous = baseline.records.find(item => item.id === record.id && item.viewport === record.viewport && item.stage);
      assert.deepEqual(record.stage, previous.stage, `${record.id}: stage geometry`);
      assert.deepEqual(record.detail, previous.detail, `${record.id}: detail geometry`);
    }
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify({ phase, url, records, errors }, null, 2));
  console.log(`Saved ${records.length} records to ${output}`);
} finally {
  await browser.close();
}
