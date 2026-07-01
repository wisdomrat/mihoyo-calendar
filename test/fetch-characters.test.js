import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyImageRole,
  buildImageCandidates,
  extractImageCandidatesFromWikitext,
  mergeData,
  normalizeNanokaCharacter,
  parseBwikiWikitext,
} from '../scripts/fetch-characters.js';

test('parseBwikiWikitext extracts birthday and profile fields from Chinese infobox text', () => {
  const info = parseBwikiWikitext(`{{\u89d2\u8272\u4fe1\u606f
|\u751f\u65e5 = 2\u670829\u65e5
|\u82f1\u6587\u540d = Bennett
|\u5143\u7d20\u5c5e\u6027 = \u706b
|\u6b66\u5668\u7c7b\u578b = \u5355\u624b\u5251
|\u7a00\u6709\u5ea6 = 4\u661f
|\u5730\u533a = \u8499\u5fb7
}}`);

  assert.deepEqual(info, {
    birthday: '02-29',
    nameEn: 'Bennett',
    element: '\u706b',
    weapon: '\u5355\u624b\u5251',
    rarity: 4,
    region: '\u8499\u5fb7',
  });
});

test('extractImageCandidatesFromWikitext finds explicit avatar and file references', () => {
  const candidates = extractImageCandidatesFromWikitext(`{{\u89d2\u8272\u4fe1\u606f
|\u5934\u50cf = \u5b89\u67cf\u5934\u50cf.png
|\u7acb\u7ed8 = \u5b89\u67cf\u7acb\u7ed8.png
}}
[[\u6587\u4ef6:\u5b89\u67cf\u8bc1\u4ef6\u7167.png|thumb]]`);

  assert.deepEqual(candidates, [
    '\u5b89\u67cf\u5934\u50cf.png',
    '\u5b89\u67cf\u7acb\u7ed8.png',
    '\u5b89\u67cf\u8bc1\u4ef6\u7167.png',
  ]);
});

test('buildImageCandidates prefers page-provided images before generic filename guesses', () => {
  const candidates = buildImageCandidates('\u5b89\u67cf', [
    '\u5b89\u67cf\u5934\u50cf.png',
    '\u5b89\u67cf\u7acb\u7ed8.png',
  ]);

  assert.deepEqual(candidates.slice(0, 5), [
    '\u5b89\u67cf\u5934\u50cf.png',
    '\u5b89\u67cf\u7acb\u7ed8.png',
    '\u5b89\u67cf.png',
    '\u5b89\u67cf\u8bc1\u4ef6\u7167.png',
    '\u5b89\u67cf\u5168\u8eab.png',
  ]);
});

test('mergeData upgrades placeholder avatars without dropping existing characters', () => {
  const existing = [
    {
      id: 'amber-genshin',
      name: '\u5b89\u67cf',
      game: 'genshin',
      birthday: '08-10',
      avatar: 'https://ui-avatars.com/api/?name=A',
      source: 'manual',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];
  const fetched = [
    {
      id: 'amber-genshin',
      name: '\u5b89\u67cf',
      game: 'genshin',
      birthday: '08-10',
      avatar: 'https://wiki.biligame.com/ys/Special:FilePath/%E5%AE%89%E6%9F%8F%E5%A4%B4%E5%83%8F.png',
      nameEn: 'Amber',
      element: '\u706b',
      weapon: '\u5f13',
      region: '\u8499\u5fb7',
      source: 'wiki',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const merged = mergeData(existing, fetched);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].avatar, fetched[0].avatar);
  assert.equal(merged[0].source, 'manual');
  assert.equal(merged[0].nameEn, 'Amber');
});

test('mergeData does not add new fetched characters without birthdays', () => {
  const merged = mergeData([], [
    {
      id: 'nanoka-hsr-9999',
      name: 'New Character',
      nameEn: 'New Character',
      game: 'hsr',
      avatar: 'https://static.nanoka.cc/assets/hsr/avatarshopicon/9999.webp',
      source: 'nanoka',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);

  assert.equal(merged.length, 0);
});

test('classifyImageRole distinguishes square avatars from vertical portraits', () => {
  assert.equal(classifyImageRole({ width: 100, height: 100, url: 'https://example.com/avatar.webp' }), 'avatar');
  assert.equal(classifyImageRole({ width: 800, height: 1400, url: 'https://example.com/portrait.webp' }), 'portrait');
});

test('classifyImageRole uses path rules when dimensions are unavailable', () => {
  assert.equal(classifyImageRole({ url: 'https://zzz.honeyhunterworld.com/img/character/1011-char_icon_100.webp' }), 'avatar');
  assert.equal(classifyImageRole({ url: 'https://static.nanoka.cc/assets/zzz/IconRole01.webp' }), 'portrait');
});

test('normalizeNanokaCharacter stores ZZZ nanoka art as portrait and HoneyHunter thumbnail as avatar', () => {
  const character = normalizeNanokaCharacter('zzz', '1011', {
    icon: 'IconRole01',
    rank: 3,
    type: 2,
    element: 203,
    en: 'Anby',
    zh: '\u5b89\u6bd4',
  });

  assert.equal(character.avatar, 'https://zzz.honeyhunterworld.com/img/character/1011-char_icon_100.webp');
  assert.equal(character.portrait, 'https://static.nanoka.cc/assets/zzz/IconRole01.webp');
});

test('mergeData preserves and upgrades portrait artwork', () => {
  const merged = mergeData([
    {
      id: 'anby-zzz',
      name: '\u5b89\u6bd4',
      nameEn: 'Anby',
      game: 'zzz',
      birthday: '02-20',
      avatar: 'https://ui-avatars.com/api/?name=A',
      source: 'manual',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ], [
    {
      id: 'nanoka-zzz-1011',
      name: '\u5b89\u6bd4',
      nameEn: 'Anby',
      game: 'zzz',
      birthday: '',
      avatar: 'https://zzz.honeyhunterworld.com/img/character/1011-char_icon_100.webp',
      portrait: 'https://static.nanoka.cc/assets/zzz/IconRole01.webp',
      source: 'nanoka',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ]);

  assert.equal(merged[0].avatar, 'https://zzz.honeyhunterworld.com/img/character/1011-char_icon_100.webp');
  assert.equal(merged[0].portrait, 'https://static.nanoka.cc/assets/zzz/IconRole01.webp');
});

test('mergeData merges ZZZ short-name aliases into canonical manual records', () => {
  const merged = mergeData([
    {
      id: 'miyabi-zzz',
      name: '\u661f\u89c1\u96c5',
      nameEn: 'Miyabi',
      game: 'zzz',
      birthday: '04-03',
      avatar: 'https://ui-avatars.com/api/?name=M',
      source: 'manual',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '\u96c5-zzz',
      name: '\u96c5',
      nameEn: 'Hoshimi Miyabi',
      game: 'zzz',
      birthday: '06-19',
      avatar: 'https://zzz.honeyhunterworld.com/img/character/1091-char_icon_100.webp',
      portrait: 'https://static.nanoka.cc/assets/zzz/IconRole13.webp',
      source: 'nanoka',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ], []);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].name, '\u661f\u89c1\u96c5');
  assert.equal(merged[0].birthday, '06-19');
  assert.equal(merged[0].avatar, 'https://zzz.honeyhunterworld.com/img/character/1091-char_icon_100.webp');
  assert.equal(merged[0].portrait, 'https://static.nanoka.cc/assets/zzz/IconRole13.webp');
});

test('mergeData removes known invalid manual-only ZZZ records', () => {
  const merged = mergeData([
    {
      id: 'taiyin-zzz',
      name: '\u4e91\u5cbf\u5c71\u00b7\u6cf0\u97f3',
      nameEn: 'Taiyin',
      game: 'zzz',
      birthday: '10-10',
      avatar: 'https://ui-avatars.com/api/?name=T',
      source: 'manual',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ], []);

  assert.equal(merged.length, 0);
});